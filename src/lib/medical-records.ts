import { supabase } from './supabase';
import type { Database } from '@/types/database.types';

export type MedicalRecord = Database['public']['Tables']['medical_records']['Row'];
export type MedicalRecordInsert = Database['public']['Tables']['medical_records']['Insert'];
export type MedicalRecordUpdate = Database['public']['Tables']['medical_records']['Update'];

// Get medical records for a patient
export const getPatientMedicalRecords = async (patientId: string) => {
  const { data, error } = await supabase
    .from('medical_records')
    .select(`
      *,
      doctor:doctor_id (
        id,
        specialty,
        profiles:id (
          first_name,
          last_name
        )
      )
    `)
    .eq('patient_id', patientId)
    .order('record_date', { ascending: false });

  return { data, error };
};

// Get medical records for a doctor's patients
export const getDoctorMedicalRecords = async (doctorId: string) => {
  const { data, error } = await supabase
    .from('medical_records')
    .select(`
      *,
      patient:patient_id (
        id,
        first_name,
        last_name,
        date_of_birth,
        gender
      )
    `)
    .eq('doctor_id', doctorId)
    .order('record_date', { ascending: false });

  return { data, error };
};

// Get medical record by ID
export const getMedicalRecordById = async (id: string) => {
  const { data, error } = await supabase
    .from('medical_records')
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
      )
    `)
    .eq('id', id)
    .single();

  return { data, error };
};

// Create medical record
export const createMedicalRecord = async (record: MedicalRecordInsert) => {
  const { data, error } = await supabase
    .from('medical_records')
    .insert(record)
    .select()
    .single();

  if (data) {
    // Create notification for patient
    await supabase.from('notifications').insert({
      user_id: record.patient_id,
      title: 'New Medical Record',
      message: `A new medical record has been added to your profile.`,
      notification_type: 'medical_record',
      related_id: data.id,
    });
  }

  return { data, error };
};

// Update medical record
export const updateMedicalRecord = async (id: string, updates: MedicalRecordUpdate) => {
  const { data, error } = await supabase
    .from('medical_records')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

// Upload attachment to medical record
export const uploadMedicalRecordAttachment = async (
  recordId: string,
  file: File,
  patientId: string
) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${recordId}-${Math.random()}.${fileExt}`;
  const filePath = `medical-records/${patientId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('medical-records')
    .upload(filePath, file);

  if (uploadError) {
    return { error: uploadError };
  }

  const { data } = supabase.storage.from('medical-records').getPublicUrl(filePath);

  // Get current record
  const { data: record, error: recordError } = await getMedicalRecordById(recordId);

  if (recordError || !record) {
    return { error: recordError };
  }

  // Update record with new attachment URL
  const attachments = [...(record.attachments || []), data.publicUrl];

  const { data: updatedRecord, error: updateError } = await supabase
    .from('medical_records')
    .update({
      attachments,
      updated_at: new Date().toISOString(),
    })
    .eq('id', recordId)
    .select()
    .single();

  return { data: updatedRecord, error: updateError };
};

// Remove attachment from medical record
export const removeMedicalRecordAttachment = async (
  recordId: string,
  attachmentUrl: string
) => {
  // Get current record
  const { data: record, error: recordError } = await getMedicalRecordById(recordId);

  if (recordError || !record) {
    return { error: recordError };
  }

  // Update record with attachment removed
  const attachments = (record.attachments || []).filter(url => url !== attachmentUrl);

  const { data, error } = await supabase
    .from('medical_records')
    .update({
      attachments,
      updated_at: new Date().toISOString(),
    })
    .eq('id', recordId)
    .select()
    .single();

  // Try to remove the file from storage
  const path = attachmentUrl.split('/').slice(-2).join('/');
  await supabase.storage.from('medical-records').remove([path]);

  return { data, error };
}; 