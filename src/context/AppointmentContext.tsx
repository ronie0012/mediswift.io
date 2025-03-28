import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

interface Appointment {
  id: number;
  doctorId: number;
  doctorName: string;
  patientName: string;
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
  addAppointment: (appointment: Omit<Appointment, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  cancelAppointment: (id: number) => void;
  getAppointmentsByDoctor: (doctorId: number) => Appointment[];
  getAppointmentsByPatient: (patientName: string) => Appointment[];
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('appointments');
    return saved ? JSON.parse(saved) : [];
  });

  const saveAppointments = (newAppointments: Appointment[]) => {
    setAppointments(newAppointments);
    localStorage.setItem('appointments', JSON.stringify(newAppointments));
  };

  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'status' | 'createdAt'>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newAppointment: Appointment = {
      ...appointmentData,
      id: Date.now(),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    saveAppointments([...appointments, newAppointment]);
    
    toast.success('Appointment booked successfully!', {
      description: `Your appointment is confirmed for ${appointmentData.date} at ${appointmentData.time}`,
    });
  };

  const cancelAppointment = (id: number) => {
    const updatedAppointments = appointments.map(apt =>
      apt.id === id ? { ...apt, status: 'cancelled' as const } : apt
    );
    saveAppointments(updatedAppointments);
    toast.success('Appointment cancelled successfully');
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