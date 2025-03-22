import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const specialty = searchParams.get('specialty');
    const availableToday = searchParams.get('available_today');
    const videoConsultation = searchParams.get('video_consultation');
    const inClinic = searchParams.get('in_clinic');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'name';
    const order = searchParams.get('order') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '10');
    
    // Build the query
    let query = supabase
      .from('doctors')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (specialty) {
      query = query.eq('specialty', specialty);
    }
    
    if (availableToday === 'true') {
      query = query.eq('available_today', true);
    }
    
    if (videoConsultation === 'true') {
      query = query.eq('available_for_video', true);
    }
    
    if (inClinic === 'true') {
      query = query.eq('available_for_in_clinic', true);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,specialty.ilike.%${search}%,hospital.ilike.%${search}%`);
    }
    
    // Apply sorting
    if (sort && order) {
      query = query.order(sort, { ascending: order === 'asc' });
    }
    
    // Apply pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching doctors:', error);
      return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 });
    }
    
    // Return the result
    return NextResponse.json({
      doctors: data,
      totalCount: count,
      page,
      perPage,
      totalPages: Math.ceil((count || 0) / perPage)
    });
  } catch (error) {
    console.error('Error in GET /api/doctors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const body = await request.json();
    const {
      name,
      specialty,
      experience,
      consultation_fee,
      available_today,
      available_for_video,
      available_for_in_clinic,
      next_available,
      image,
      hospital,
      location,
      education,
      languages,
      available_slots
    } = body;
    
    // Validate required fields
    if (!name || !specialty || !experience || !consultation_fee || !hospital || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Insert the doctor
    const { data, error } = await supabase
      .from('doctors')
      .insert({
        name,
        specialty,
        experience,
        consultation_fee,
        available_today: available_today || false,
        available_for_video: available_for_video || false,
        available_for_in_clinic: available_for_in_clinic || false,
        next_available: next_available || '',
        image: image || '',
        hospital,
        location,
        education: education || '',
        languages: languages || ['English'],
        available_slots: available_slots || {},
        rating: 0,
        review_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating doctor:', error);
      return NextResponse.json(
        { error: 'Failed to create doctor' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ doctor: data });
  } catch (error) {
    console.error('Error in POST /api/doctors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check if user is admin
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }
    
    // Remove any fields that aren't allowed to be updated
    const { created_at, rating, review_count, ...validUpdates } = updates;
    
    // Update the doctor
    const { data, error } = await supabase
      .from('doctors')
      .update({
        ...validUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating doctor:', error);
      return NextResponse.json(
        { error: 'Failed to update doctor' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ doctor: data });
  } catch (error) {
    console.error('Error in PUT /api/doctors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check if user is admin
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }
    
    // Check if this doctor has any appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id')
      .eq('doctor_id', id)
      .limit(1);
    
    if (appointmentsError) {
      console.error('Error checking appointments:', appointmentsError);
      return NextResponse.json(
        { error: 'Failed to check if doctor has appointments' },
        { status: 500 }
      );
    }
    
    if (appointments && appointments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete doctor with existing appointments' },
        { status: 400 }
      );
    }
    
    // Delete the doctor
    const { error } = await supabase
      .from('doctors')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting doctor:', error);
      return NextResponse.json(
        { error: 'Failed to delete doctor' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/doctors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 