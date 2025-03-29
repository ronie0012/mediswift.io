import { supabase } from './supabase';
import type { Database } from '@/types/database.types';

export type Appointment = Database['public']['Tables']['appointments']['Row'];
export type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
export type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

// Get all appointments for a patient
export const getPatientAppointments = async (patientId: string) => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctor_id (
        id,
        specialty,
        hospital_affiliation,
        profiles:id (
          first_name,
          last_name,
          avatar_url
        )
      )
    `)
    .eq('patient_id', patientId)
    .order('appointment_date', { ascending: true });

  return { data, error };
};

// Get all appointments for a doctor
export const getDoctorAppointments = async (doctorId: string) => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:patient_id (
        id,
        first_name,
        last_name,
        avatar_url,
        phone
      )
    `)
    .eq('doctor_id', doctorId)
    .order('appointment_date', { ascending: true });

  return { data, error };
};

// Get single appointment by ID
export const getAppointmentById = async (id: string) => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctor_id (
        id,
        specialty,
        hospital_affiliation,
        profiles:id (
          first_name,
          last_name,
          avatar_url,
          phone
        )
      ),
      patient:patient_id (
        id,
        first_name,
        last_name,
        avatar_url,
        phone,
        gender,
        date_of_birth
      )
    `)
    .eq('id', id)
    .single();

  return { data, error };
};

// Create appointment
export const createAppointment = async (appointment: AppointmentInsert) => {
  const { data, error } = await supabase
    .from('appointments')
    .insert(appointment)
    .select()
    .single();

  // Create notification for patient
  if (data) {
    await supabase.from('notifications').insert({
      user_id: appointment.patient_id,
      title: 'Appointment Scheduled',
      message: `Your appointment has been scheduled for ${appointment.appointment_date} at ${appointment.start_time}.`,
      notification_type: 'appointment',
      related_id: data.id,
    });

    // Create notification for doctor
    await supabase.from('notifications').insert({
      user_id: appointment.doctor_id,
      title: 'New Appointment',
      message: `You have a new appointment scheduled for ${appointment.appointment_date} at ${appointment.start_time}.`,
      notification_type: 'appointment',
      related_id: data.id,
    });
  }

  return { data, error };
};

// Update appointment status
export const updateAppointmentStatus = async (
  id: string,
  status: Appointment['status']
) => {
  const { data, error } = await supabase
    .from('appointments')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  // Create notification based on status change
  if (data) {
    const statusMessages = {
      scheduled: 'rescheduled',
      in_progress: 'started',
      completed: 'been completed',
      cancelled: 'been cancelled',
    };

    await supabase.from('notifications').insert({
      user_id: data.patient_id,
      title: `Appointment ${statusMessages[status]}`,
      message: `Your appointment for ${data.appointment_date} has ${statusMessages[status]}.`,
      notification_type: 'appointment_status',
      related_id: data.id,
    });
  }

  return { data, error };
};

// Cancel appointment
export const cancelAppointment = async (id: string) => {
  return updateAppointmentStatus(id, 'cancelled');
};

// Check for appointment conflicts
export const checkForConflicts = async (
  doctorId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeAppointmentId?: string
) => {
  let query = supabase
    .from('appointments')
    .select('id')
    .eq('doctor_id', doctorId)
    .eq('appointment_date', date)
    .or(`start_time.lte.${endTime},end_time.gte.${startTime}`)
    .not('status', 'eq', 'cancelled');

  if (excludeAppointmentId) {
    query = query.not('id', 'eq', excludeAppointmentId);
  }

  const { data, error } = await query;

  return {
    hasConflicts: data && data.length > 0,
    error,
  };
};

// Get upcoming appointments
export const getUpcomingAppointments = async (userId: string, isDoctor = false) => {
  const fieldName = isDoctor ? 'doctor_id' : 'patient_id';
  
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctor_id (
        id,
        specialty,
        profiles:id (
          first_name,
          last_name,
          avatar_url
        )
      ),
      patient:patient_id (
        id,
        first_name,
        last_name,
        avatar_url,
        phone
      )
    `)
    .eq(fieldName, userId)
    .gte('appointment_date', new Date().toISOString().split('T')[0])
    .not('status', 'in', '("completed","cancelled")')
    .order('appointment_date', { ascending: true })
    .order('start_time', { ascending: true });

  return { data, error };
}; 