import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';
import { doctorService } from './doctor.service';

export type Appointment = Database['public']['Tables']['appointments']['Row'];

export interface AppointmentWithDetails extends Appointment {
  doctor?: {
    id: number;
    name: string;
    specialty: string;
    image: string;
    hospital: string;
    consultation_fee: number;
  };
}

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
}

export enum AppointmentType {
  VIDEO = 'video',
  IN_CLINIC = 'in_clinic',
}

export interface CreateAppointmentData {
  doctorId: number;
  userId: string;
  appointmentDate: string;
  appointmentTime: string;
  type: AppointmentType;
  notes?: string;
}

class AppointmentService {
  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    try {
      // Check if the slot is available
      const availableSlots = await doctorService.getDoctorAvailableSlots(
        data.doctorId,
        data.appointmentDate
      );
      
      if (!availableSlots.includes(data.appointmentTime)) {
        throw new Error('This slot is no longer available. Please choose another time.');
      }
      
      // Create the appointment
      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert({
          user_id: data.userId,
          doctor_id: data.doctorId,
          appointment_date: data.appointmentDate,
          appointment_time: data.appointmentTime,
          status: AppointmentStatus.PENDING,
          type: data.type,
          notes: data.notes || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return appointment as Appointment;
    } catch (error: any) {
      console.error('Create appointment error:', error);
      throw error;
    }
  }
  
  async getUserAppointments(userId: string): Promise<AppointmentWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctor:doctor_id (
            id,
            name,
            specialty,
            image,
            hospital,
            consultation_fee
          )
        `)
        .eq('user_id', userId)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });
      
      if (error) throw error;
      
      return data as AppointmentWithDetails[];
    } catch (error) {
      console.error('Get user appointments error:', error);
      throw error;
    }
  }
  
  async getAppointmentById(id: number): Promise<AppointmentWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctor:doctor_id (
            id,
            name,
            specialty,
            image,
            hospital,
            consultation_fee
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data as AppointmentWithDetails;
    } catch (error) {
      console.error('Get appointment by ID error:', error);
      throw error;
    }
  }
  
  async updateAppointmentStatus(id: number, status: AppointmentStatus): Promise<void> {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Update appointment status error:', error);
      throw error;
    }
  }
  
  async rescheduleAppointment(
    id: number,
    newDate: string,
    newTime: string
  ): Promise<Appointment> {
    try {
      // Get the current appointment
      const { data: currentAppointment, error: getError } = await supabase
        .from('appointments')
        .select('doctor_id')
        .eq('id', id)
        .single();
      
      if (getError) throw getError;
      
      // Check if the new slot is available
      const availableSlots = await doctorService.getDoctorAvailableSlots(
        currentAppointment.doctor_id,
        newDate
      );
      
      if (!availableSlots.includes(newTime)) {
        throw new Error('This slot is no longer available. Please choose another time.');
      }
      
      // Update the appointment
      const { data, error } = await supabase
        .from('appointments')
        .update({
          appointment_date: newDate,
          appointment_time: newTime,
          status: AppointmentStatus.RESCHEDULED,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Appointment;
    } catch (error) {
      console.error('Reschedule appointment error:', error);
      throw error;
    }
  }
  
  async cancelAppointment(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: AppointmentStatus.CANCELLED,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Cancel appointment error:', error);
      throw error;
    }
  }
  
  // For admin use only
  async getDoctorAppointments(doctorId: number): Promise<AppointmentWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          user:user_id (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('doctor_id', doctorId)
        .order('appointment_date')
        .order('appointment_time');
      
      if (error) throw error;
      
      return data as AppointmentWithDetails[];
    } catch (error) {
      console.error('Get doctor appointments error:', error);
      throw error;
    }
  }
}

export const appointmentService = new AppointmentService(); 