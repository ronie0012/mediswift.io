import { supabase } from './supabase';
import type { Database } from '@/types/database.types';

export type Prescription = Database['public']['Tables']['prescriptions']['Row'];
export type PrescriptionInsert = Database['public']['Tables']['prescriptions']['Insert'];
export type PrescriptionUpdate = Database['public']['Tables']['prescriptions']['Update'];

export type PrescriptionItem = Database['public']['Tables']['prescription_items']['Row'];
export type PrescriptionItemInsert = Database['public']['Tables']['prescription_items']['Insert'];

// Get prescriptions for patient
export const getPatientPrescriptions = async (patientId: string) => {
  const { data, error } = await supabase
    .from('prescriptions')
    .select(`
      *,
      doctor:doctor_id (
        id,
        specialty,
        profiles:id (
          first_name,
          last_name
        )
      ),
      prescription_items (*)
    `)
    .eq('patient_id', patientId)
    .order('issue_date', { ascending: false });

  return { data, error };
};

// Get prescriptions for doctor
export const getDoctorPrescriptions = async (doctorId: string) => {
  const { data, error } = await supabase
    .from('prescriptions')
    .select(`
      *,
      patient:patient_id (
        id,
        first_name,
        last_name
      ),
      prescription_items (*)
    `)
    .eq('doctor_id', doctorId)
    .order('issue_date', { ascending: false });

  return { data, error };
};

// Get prescription by ID with items
export const getPrescriptionById = async (id: string) => {
  const { data, error } = await supabase
    .from('prescriptions')
    .select(`
      *,
      doctor:doctor_id (
        id,
        specialty,
        profiles:id (
          first_name,
          last_name
        )
      ),
      patient:patient_id (
        id,
        first_name,
        last_name,
        date_of_birth,
        gender,
        phone,
        address,
        city,
        state,
        postal_code
      ),
      prescription_items (*)
    `)
    .eq('id', id)
    .single();

  return { data, error };
};

// Create prescription with items
export const createPrescription = async (
  prescription: PrescriptionInsert,
  items: Omit<PrescriptionItemInsert, 'prescription_id'>[]
) => {
  // Start a transaction
  const { data, error } = await supabase
    .from('prescriptions')
    .insert(prescription)
    .select()
    .single();

  if (error || !data) {
    return { data: null, error };
  }

  // Insert prescription items
  const prescriptionItems = items.map(item => ({
    ...item,
    prescription_id: data.id,
  }));

  const { error: itemsError } = await supabase
    .from('prescription_items')
    .insert(prescriptionItems);

  if (itemsError) {
    return { data, error: itemsError };
  }

  // Create notification for patient
  await supabase.from('notifications').insert({
    user_id: prescription.patient_id,
    title: 'New Prescription',
    message: 'You have a new prescription. Please check your prescriptions.',
    notification_type: 'prescription',
    related_id: data.id,
  });

  return { data, error: null };
};

// Update prescription status
export const updatePrescriptionStatus = async (
  id: string,
  status: Prescription['status']
) => {
  const { data, error } = await supabase
    .from('prescriptions')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

// Get active prescriptions
export const getActivePrescriptions = async (patientId: string) => {
  const { data, error } = await supabase
    .from('prescriptions')
    .select(`
      *,
      doctor:doctor_id (
        id,
        specialty,
        profiles:id (
          first_name,
          last_name
        )
      ),
      prescription_items (*)
    `)
    .eq('patient_id', patientId)
    .eq('status', 'active')
    .order('issue_date', { ascending: false });

  return { data, error };
}; 