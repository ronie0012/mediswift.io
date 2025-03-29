import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

interface Appointment {
  id: number;
  doctorId: number;
  doctorName: string;
  patientName: string;
  patientEmail: string;
  patientAge: string;
  patientPhone: string;
  symptoms: string;
  date: string;
  time: string;
  consultationType: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

interface AppointmentContextType {
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'status' | 'createdAt'>) => Promise<Appointment>;
  cancelAppointment: (id: number) => void;
  getAppointmentsByDoctor: (doctorId: number) => Appointment[];
  getAppointmentsByPatient: (patientName: string) => Appointment[];
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem('appointments');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading appointments from localStorage:', error);
      return [];
    }
  });

  const saveAppointments = (newAppointments: Appointment[]) => {
    try {
      setAppointments(newAppointments);
      localStorage.setItem('appointments', JSON.stringify(newAppointments));
    } catch (error) {
      console.error('Error saving appointments to localStorage:', error);
      toast.error('Failed to save appointment data');
    }
  };

  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'status' | 'createdAt'>) => {
    console.log('Adding appointment:', appointmentData);
    try {
      // Check for existing appointment with same doctor, date and time
      const existingAppointment = appointments.find(
        apt => 
          apt.doctorId === appointmentData.doctorId &&
          apt.date === appointmentData.date &&
          apt.time === appointmentData.time &&
          apt.status !== 'cancelled'
      );

      if (existingAppointment) {
        throw new Error('This time slot is already booked. Please select a different time.');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newAppointment: Appointment = {
        ...appointmentData,
        id: Date.now(),
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };

      console.log('Created new appointment:', newAppointment);

      const updatedAppointments = [...appointments, newAppointment];
      saveAppointments(updatedAppointments);
      
      toast.success('Appointment booked successfully!', {
        description: `Your appointment is confirmed for ${appointmentData.date} at ${appointmentData.time}`
      });

      return newAppointment;
    } catch (error) {
      console.error('Error in addAppointment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to book appointment');
      throw error;
    }
  };

  const cancelAppointment = (id: number) => {
    try {
      const updatedAppointments = appointments.map(apt =>
        apt.id === id ? { ...apt, status: 'cancelled' as const } : apt
      );
      saveAppointments(updatedAppointments);
      toast.success('Appointment cancelled successfully');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const getAppointmentsByDoctor = (doctorId: number) => {
    return appointments.filter(apt => apt.doctorId === doctorId);
  };

  const getAppointmentsByPatient = (patientName: string) => {
    return appointments.filter(apt => apt.patientName === patientName);
  };

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        addAppointment,
        cancelAppointment,
        getAppointmentsByDoctor,
        getAppointmentsByPatient,
      }}
    >
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