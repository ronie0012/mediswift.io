
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppointmentWithDetails } from '@/types/models';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

interface AppointmentContextType {
  appointments: AppointmentWithDetails[];
  loading: boolean;
  error: string | null;
  fetchAppointments: () => Promise<void>;
  addAppointment: (appointment: Partial<AppointmentWithDetails>) => Promise<boolean>;
  updateAppointmentStatus: (id: number, status: string) => Promise<boolean>;
  cancelAppointment: (id: number) => Promise<boolean>;
  rescheduleAppointment: (id: number, date: string, timeSlot: string) => Promise<boolean>;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

interface AppointmentProviderProps {
  children: ReactNode;
}

export const AppointmentProvider = ({ children }: AppointmentProviderProps) => {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id, doctor_id, user_id, date, status, created_at, 
          symptoms, notes, time_slot, doctor:doctors(*)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      setAppointments(data as unknown as AppointmentWithDetails[]);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      setError(error.message);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const addAppointment = async (appointment: Partial<AppointmentWithDetails>): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to book an appointment');
      return false;
    }
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          doctor_id: appointment.doctor_id,
          date: appointment.date,
          time_slot: appointment.time_slot,
          status: 'upcoming',
          symptoms: appointment.symptoms,
          notes: appointment.notes || '',
        })
        .select();
      
      if (error) throw error;
      
      toast.success('Appointment booked successfully!');
      await fetchAppointments();
      return true;
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      setError(error.message);
      toast.error('Failed to book appointment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (id: number, status: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      toast.success(`Appointment ${status} successfully!`);
      await fetchAppointments();
      return true;
    } catch (error: any) {
      console.error(`Error updating appointment to ${status}:`, error);
      setError(error.message);
      toast.error(`Failed to update appointment status`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id: number): Promise<boolean> => {
    return updateAppointmentStatus(id, 'cancelled');
  };

  const rescheduleAppointment = async (id: number, date: string, timeSlot: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('appointments')
        .update({ 
          date,
          time_slot: timeSlot,
          status: 'rescheduled'
        })
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      toast.success('Appointment rescheduled successfully!');
      await fetchAppointments();
      return true;
    } catch (error: any) {
      console.error('Error rescheduling appointment:', error);
      setError(error.message);
      toast.error('Failed to reschedule appointment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppointmentContext.Provider value={{
      appointments,
      loading,
      error,
      fetchAppointments,
      addAppointment,
      updateAppointmentStatus,
      cancelAppointment,
      rescheduleAppointment
    }}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};
