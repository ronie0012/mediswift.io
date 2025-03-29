import { supabase } from './supabase';
import type { Database } from '@/types/database.types';

export type AmbulanceService = Database['public']['Tables']['ambulance_services']['Row'];
export type AmbulanceServiceInsert = Database['public']['Tables']['ambulance_services']['Insert'];
export type AmbulanceServiceUpdate = Database['public']['Tables']['ambulance_services']['Update'];

export type AmbulanceRequest = Database['public']['Tables']['ambulance_requests']['Row'];
export type AmbulanceRequestInsert = Database['public']['Tables']['ambulance_requests']['Insert'];
export type AmbulanceRequestUpdate = Database['public']['Tables']['ambulance_requests']['Update'];

// Get all ambulance services
export const getAllAmbulanceServices = async () => {
  const { data, error } = await supabase
    .from('ambulance_services')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  return { data, error };
};

// Get ambulance service by ID
export const getAmbulanceServiceById = async (id: string) => {
  const { data, error } = await supabase
    .from('ambulance_services')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
};

// Get ambulance services by location
export const getAmbulanceServicesByLocation = async (city: string, state: string) => {
  const { data, error } = await supabase
    .from('ambulance_services')
    .select('*')
    .eq('city', city)
    .eq('state', state)
    .eq('is_active', true)
    .order('name', { ascending: true });

  return { data, error };
};

// Create ambulance request
export const createAmbulanceRequest = async (request: AmbulanceRequestInsert) => {
  const { data, error } = await supabase
    .from('ambulance_requests')
    .insert(request)
    .select()
    .single();

  if (data) {
    // Create notification for patient
    await supabase.from('notifications').insert({
      user_id: request.patient_id,
      title: 'Ambulance Requested',
      message: 'Your ambulance request has been submitted and is pending confirmation.',
      notification_type: 'ambulance_request',
      related_id: data.id,
    });
  }

  return { data, error };
};

// Get ambulance request by ID
export const getAmbulanceRequestById = async (id: string) => {
  const { data, error } = await supabase
    .from('ambulance_requests')
    .select(`
      *,
      patient:patient_id (
        id,
        first_name,
        last_name,
        phone,
        gender
      ),
      service:service_id (
        id,
        name,
        contact_number
      )
    `)
    .eq('id', id)
    .single();

  return { data, error };
};

// Get ambulance requests for patient
export const getPatientAmbulanceRequests = async (patientId: string) => {
  const { data, error } = await supabase
    .from('ambulance_requests')
    .select(`
      *,
      service:service_id (
        id,
        name,
        contact_number
      )
    `)
    .eq('patient_id', patientId)
    .order('request_time', { ascending: false });

  return { data, error };
};

// Update ambulance request status
export const updateAmbulanceRequestStatus = async (
  id: string,
  status: AmbulanceRequest['status'],
  updates: Partial<AmbulanceRequestUpdate> = {}
) => {
  const { data, error } = await supabase
    .from('ambulance_requests')
    .update({
      status,
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (data) {
    // Create notification
    const statusMessages = {
      pending: 'is pending confirmation',
      accepted: 'has been accepted',
      en_route: 'is en route to your location',
      arrived: 'has arrived at your location',
      completed: 'has been completed',
      cancelled: 'has been cancelled',
    };

    await supabase.from('notifications').insert({
      user_id: data.patient_id,
      title: `Ambulance Request ${status.replace('_', ' ')}`,
      message: `Your ambulance request ${statusMessages[status]}.`,
      notification_type: 'ambulance_status',
      related_id: data.id,
    });

    // Update ambulance availability if accepted or completed
    if (status === 'accepted') {
      await supabase.rpc('update_ambulance_availability', {
        service_id: data.service_id,
        count: -1,
      });
    } else if (status === 'completed' || status === 'cancelled') {
      await supabase.rpc('update_ambulance_availability', {
        service_id: data.service_id,
        count: 1,
      });
    }
  }

  return { data, error };
};

// Cancel ambulance request
export const cancelAmbulanceRequest = async (id: string) => {
  return updateAmbulanceRequestStatus(id, 'cancelled');
};

// Calculate estimated fare
export const calculateEstimatedFare = async (
  serviceId: string,
  distanceKm: number
) => {
  const { data: service, error } = await getAmbulanceServiceById(serviceId);

  if (error || !service) {
    return { estimatedFare: 0, error };
  }

  const estimatedFare = service.base_fare + service.price_per_km * distanceKm;

  return {
    estimatedFare: parseFloat(estimatedFare.toFixed(2)),
    baseFare: service.base_fare,
    pricePerKm: service.price_per_km,
    error: null,
  };
}; 