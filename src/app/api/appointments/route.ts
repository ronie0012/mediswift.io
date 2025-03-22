import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if it's an admin request to get all appointments
    const searchParams = request.nextUrl.searchParams;
    const isAdminRequest = searchParams.get('admin') === 'true';
    
    if (isAdminRequest) {
      // Only admins can access all appointments
      const isUserAdmin = await isAdmin();
      if (!isUserAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      
      // Get query parameters for admin view
      const doctorId = searchParams.get('doctor_id');
      const status = searchParams.get('status');
      const startDate = searchParams.get('start_date');
      const endDate = searchParams.get('end_date');
      const page = parseInt(searchParams.get('page') || '1');
      const perPage = parseInt(searchParams.get('per_page') || '10');
      
      // Build the admin query
      let query = supabase
        .from('appointments')
        .select('*, doctors(name, specialty, image), users(name, email, phone)', { count: 'exact' });
      
      // Apply filters
      if (doctorId) {
        query = query.eq('doctor_id', doctorId);
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      if (startDate) {
        query = query.gte('appointment_date', startDate);
      }
      
      if (endDate) {
        query = query.lte('appointment_date', endDate);
      }
      
      // Apply pagination
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to);
      
      // Order by date (newest first)
      query = query.order('appointment_date', { ascending: false });
      
      // Execute the query
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Error fetching all appointments:', error);
        return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
      }
      
      // Return the result
      return NextResponse.json({
        appointments: data,
        totalCount: count,
        page,
        perPage,
        totalPages: Math.ceil((count || 0) / perPage)
      });
    } else {
      // Regular user can only see their own appointments
      // Get filters
      const status = searchParams.get('status');
      const page = parseInt(searchParams.get('page') || '1');
      const perPage = parseInt(searchParams.get('per_page') || '10');
      
      // Build the query
      let query = supabase
        .from('appointments')
        .select('*, doctors(name, specialty, image)', { count: 'exact' })
        .eq('user_id', user.id);
      
      if (status) {
        query = query.eq('status', status);
      }
      
      // Apply pagination
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to);
      
      // Order by date (newest first)
      query = query.order('appointment_date', { ascending: false });
      
      // Execute the query
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Error fetching user appointments:', error);
        return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
      }
      
      // Return the result
      return NextResponse.json({
        appointments: data,
        totalCount: count,
        page,
        perPage,
        totalPages: Math.ceil((count || 0) / perPage)
      });
    }
  } catch (error) {
    console.error('Error in GET /api/appointments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const {
      doctor_id,
      appointment_date,
      appointment_time,
      appointment_type,
      notes
    } = body;
    
    // Validate required fields
    if (!doctor_id || !appointment_date || !appointment_time || !appointment_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if the doctor exists
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('id, available_slots')
      .eq('id', doctor_id)
      .single();
    
    if (doctorError || !doctor) {
      console.error('Error checking doctor:', doctorError);
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }
    
    // Check if the time slot is available
    const availableSlots = doctor.available_slots || {};
    const dateSlotsArray = availableSlots[appointment_date] || [];
    
    if (!dateSlotsArray.includes(appointment_time)) {
      return NextResponse.json(
        { error: 'Selected time slot is not available' },
        { status: 400 }
      );
    }
    
    // Check if another appointment exists at the same time
    const { data: existingAppointment, error: existingAppointmentError } = await supabase
      .from('appointments')
      .select('id')
      .eq('doctor_id', doctor_id)
      .eq('appointment_date', appointment_date)
      .eq('appointment_time', appointment_time)
      .eq('status', 'CONFIRMED')
      .maybeSingle();
    
    if (existingAppointmentError) {
      console.error('Error checking existing appointments:', existingAppointmentError);
      return NextResponse.json(
        { error: 'Failed to check appointment availability' },
        { status: 500 }
      );
    }
    
    if (existingAppointment) {
      return NextResponse.json(
        { error: 'This time slot is already booked' },
        { status: 400 }
      );
    }
    
    // Create the appointment
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        user_id: user.id,
        doctor_id,
        appointment_date,
        appointment_time,
        appointment_type,
        notes: notes || null,
        status: 'CONFIRMED',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating appointment:', error);
      return NextResponse.json(
        { error: 'Failed to create appointment' },
        { status: 500 }
      );
    }
    
    // Update doctor's available slots
    const updatedSlots = { ...availableSlots };
    updatedSlots[appointment_date] = dateSlotsArray.filter(slot => slot !== appointment_time);
    
    const { error: updateError } = await supabase
      .from('doctors')
      .update({ available_slots: updatedSlots })
      .eq('id', doctor_id);
    
    if (updateError) {
      console.error('Error updating doctor slots:', updateError);
      // Don't return an error here, the appointment was already created
    }
    
    return NextResponse.json({ appointment: data });
  } catch (error) {
    console.error('Error in POST /api/appointments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { id, status, reschedule_data } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }
    
    // Get the appointment to check ownership
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (appointmentError || !appointment) {
      console.error('Error getting appointment:', appointmentError);
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    // Only the appointment owner or an admin can update it
    const isUserAdmin = await isAdmin();
    if (appointment.user_id !== user.id && !isUserAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Handle rescheduling
    if (reschedule_data) {
      const { appointment_date, appointment_time } = reschedule_data;
      
      if (!appointment_date || !appointment_time) {
        return NextResponse.json(
          { error: 'Date and time are required for rescheduling' },
          { status: 400 }
        );
      }
      
      // Check if the doctor exists and get available slots
      const { data: doctor, error: doctorError } = await supabase
        .from('doctors')
        .select('available_slots')
        .eq('id', appointment.doctor_id)
        .single();
      
      if (doctorError || !doctor) {
        console.error('Error checking doctor:', doctorError);
        return NextResponse.json(
          { error: 'Doctor not found' },
          { status: 404 }
        );
      }
      
      // Check if the new time slot is available
      const availableSlots = doctor.available_slots || {};
      const dateSlotsArray = availableSlots[appointment_date] || [];
      
      if (!dateSlotsArray.includes(appointment_time)) {
        return NextResponse.json(
          { error: 'Selected time slot is not available' },
          { status: 400 }
        );
      }
      
      // Check if another appointment exists at the new time
      const { data: existingAppointment, error: existingAppointmentError } = await supabase
        .from('appointments')
        .select('id')
        .eq('doctor_id', appointment.doctor_id)
        .eq('appointment_date', appointment_date)
        .eq('appointment_time', appointment_time)
        .eq('status', 'CONFIRMED')
        .not('id', 'eq', id)
        .maybeSingle();
      
      if (existingAppointmentError) {
        console.error('Error checking existing appointments:', existingAppointmentError);
        return NextResponse.json(
          { error: 'Failed to check appointment availability' },
          { status: 500 }
        );
      }
      
      if (existingAppointment) {
        return NextResponse.json(
          { error: 'This time slot is already booked' },
          { status: 400 }
        );
      }
      
      // Update the doctor's available slots
      const oldDate = appointment.appointment_date;
      const oldTime = appointment.appointment_time;
      
      // Add the old slot back to available slots
      const updatedSlots = { ...availableSlots };
      
      if (oldDate in updatedSlots) {
        updatedSlots[oldDate] = [...(updatedSlots[oldDate] || []), oldTime].sort();
      } else {
        updatedSlots[oldDate] = [oldTime];
      }
      
      // Remove the new slot from available slots
      updatedSlots[appointment_date] = dateSlotsArray.filter(slot => slot !== appointment_time);
      
      // Update the appointment
      const { data, error } = await supabase
        .from('appointments')
        .update({
          appointment_date,
          appointment_time,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error rescheduling appointment:', error);
        return NextResponse.json(
          { error: 'Failed to reschedule appointment' },
          { status: 500 }
        );
      }
      
      // Update doctor's available slots
      const { error: updateError } = await supabase
        .from('doctors')
        .update({ available_slots: updatedSlots })
        .eq('id', appointment.doctor_id);
      
      if (updateError) {
        console.error('Error updating doctor slots:', updateError);
        // Don't return an error here, the appointment was already updated
      }
      
      return NextResponse.json({ appointment: data });
    }
    
    // Handle status update
    if (status) {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating appointment status:', error);
        return NextResponse.json(
          { error: 'Failed to update appointment status' },
          { status: 500 }
        );
      }
      
      // If the appointment is cancelled, add the slot back to available slots
      if (status === 'CANCELLED') {
        const { data: doctor, error: doctorError } = await supabase
          .from('doctors')
          .select('available_slots')
          .eq('id', appointment.doctor_id)
          .single();
        
        if (!doctorError && doctor) {
          const availableSlots = doctor.available_slots || {};
          const appointmentDate = appointment.appointment_date;
          const appointmentTime = appointment.appointment_time;
          
          // Add the slot back to available slots
          const updatedSlots = { ...availableSlots };
          
          if (appointmentDate in updatedSlots) {
            updatedSlots[appointmentDate] = [...(updatedSlots[appointmentDate] || []), appointmentTime].sort();
          } else {
            updatedSlots[appointmentDate] = [appointmentTime];
          }
          
          // Update doctor's available slots
          await supabase
            .from('doctors')
            .update({ available_slots: updatedSlots })
            .eq('id', appointment.doctor_id);
        }
      }
      
      return NextResponse.json({ appointment: data });
    }
    
    return NextResponse.json(
      { error: 'No changes specified' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in PUT /api/appointments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 