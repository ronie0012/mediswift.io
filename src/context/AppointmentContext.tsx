import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import healthcareService from '../lib/healthcare.service';
import { useAuth } from './AuthContext';

// Update interface to match Django backend appointment structure
export interface Appointment {
  id: number;
  doctor: any;
  patient: any;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  reason: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Simplified interface for creating appointments
export interface CreateAppointmentData {
  doctor_id: number;
  patient_id?: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  reason: string;
  notes?: string;
}

interface AppointmentContextType {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
  fetchAppointments: () => Promise<void>;
  fetchUpcomingAppointments: () => Promise<void>;
  addAppointment: (appointmentData: CreateAppointmentData) => Promise<Appointment>;
  cancelAppointment: (id: number) => Promise<void>;
  getAppointmentById: (id: number) => Promise<Appointment | undefined>;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load appointments when the component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchUpcomingAppointments();
    }
  }, [user]);

  // Helper function to ensure doctor data is properly structured
  const processAppointmentData = useCallback((data: Appointment[]): Appointment[] => {
    return data.map(appointment => {
      // If doctor is just an ID, create a placeholder object
      if (typeof appointment.doctor === 'number') {
        // We'll keep the ID but add a placeholder structure
        const doctorId = appointment.doctor;
        appointment.doctor = {
          id: doctorId,
          user: { first_name: "Loading", last_name: "..." },
          specialization: { name: "Loading..." }
        };
      }
      return appointment;
    });
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await healthcareService.getAppointments();
      const processedData = processAppointmentData(data);
      setAppointments(processedData);
      
      // Batch doctor information fetching to reduce UI updates
      const doctorRequests = processedData
        .filter(appointment => appointment.doctor && appointment.doctor.id)
        .map(appointment => ({
          appointmentId: appointment.id,
          doctorId: appointment.doctor.id
        }));
      
      // Use Promise.all to fetch all doctor details in parallel
      if (doctorRequests.length > 0) {
        const doctorDetailsPromises = doctorRequests.map(request => 
          healthcareService.getDoctor(request.doctorId)
            .then(doctorDetails => ({ 
              appointmentId: request.appointmentId, 
              doctorDetails 
            }))
            .catch(err => {
              console.error(`Error fetching details for doctor ${request.doctorId}:`, err);
              return null;
            })
        );
        
        // Wait for all doctor details to be fetched
        const doctorResults = await Promise.all(doctorDetailsPromises);
        
        // Create a single state update with all doctor information
        setAppointments(prevAppointments => {
          const updatedAppointments = [...prevAppointments];
          doctorResults.forEach(result => {
            if (result) {
              const index = updatedAppointments.findIndex(apt => apt.id === result.appointmentId);
              if (index !== -1) {
                updatedAppointments[index] = { 
                  ...updatedAppointments[index], 
                  doctor: result.doctorDetails 
                };
              }
            }
          });
          return updatedAppointments;
        });
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments');
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUpcomingAppointments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await healthcareService.getUpcomingAppointments();
      const processedData = processAppointmentData(data);
      setAppointments(processedData);
      
      // Batch doctor information fetching to reduce UI updates
      const doctorRequests = processedData
        .filter(appointment => appointment.doctor && appointment.doctor.id)
        .map(appointment => ({
          appointmentId: appointment.id,
          doctorId: appointment.doctor.id
        }));
      
      // Use Promise.all to fetch all doctor details in parallel
      if (doctorRequests.length > 0) {
        const doctorDetailsPromises = doctorRequests.map(request => 
          healthcareService.getDoctor(request.doctorId)
            .then(doctorDetails => ({ 
              appointmentId: request.appointmentId, 
              doctorDetails 
            }))
            .catch(err => {
              console.error(`Error fetching details for doctor ${request.doctorId}:`, err);
              return null;
            })
        );
        
        // Wait for all doctor details to be fetched
        const doctorResults = await Promise.all(doctorDetailsPromises);
        
        // Create a single state update with all doctor information
        setAppointments(prevAppointments => {
          const updatedAppointments = [...prevAppointments];
          doctorResults.forEach(result => {
            if (result) {
              const index = updatedAppointments.findIndex(apt => apt.id === result.appointmentId);
              if (index !== -1) {
                updatedAppointments[index] = { 
                  ...updatedAppointments[index], 
                  doctor: result.doctorDetails 
                };
              }
            }
          });
          return updatedAppointments;
        });
      }
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      setError('Failed to load upcoming appointments');
      toast.error('Failed to load upcoming appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const addAppointment = async (appointmentData: CreateAppointmentData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Check if we need to set the patient_id (will be required if a doctor is creating an appointment)
      if (!appointmentData.patient_id && user) {
        try {
          const patientProfile = await healthcareService.getCurrentPatientProfile();
          appointmentData.patient_id = patientProfile.id;
        } catch (err) {
          console.error('Error fetching patient profile:', err);
          // If not a patient, this will fail but we'll continue and let the backend validate
        }
      }

      const newAppointment = await healthcareService.createAppointment(appointmentData);
      
      // Fetch the doctor details to ensure we have complete information
      if (newAppointment.doctor && typeof newAppointment.doctor === 'number') {
        try {
          const doctorDetails = await healthcareService.getDoctor(newAppointment.doctor);
          newAppointment.doctor = doctorDetails;
        } catch (err) {
          console.error(`Error fetching details for doctor ${newAppointment.doctor}:`, err);
        }
      }
      
      // Update the appointments list with the new appointment
      setAppointments(prevAppointments => [...prevAppointments, newAppointment]);
      
      toast.success('Appointment booked successfully!', {
        description: `Your appointment is confirmed for ${appointmentData.appointment_date} at ${appointmentData.start_time}`
      });

      return newAppointment;
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to book appointment';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelAppointment = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const canceledAppointment = await healthcareService.cancelAppointment(id);
      
      // Update the appointments list with the canceled appointment
      setAppointments(prevAppointments => 
        prevAppointments.map(apt => apt.id === id ? canceledAppointment : apt)
      );
      
      toast.success('Appointment cancelled successfully');
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to cancel appointment';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getAppointmentById = async (id: number) => {
    try {
      // First check if we already have the appointment in state
      const existingAppointment = appointments.find(apt => apt.id === id);
      if (existingAppointment) {
        return existingAppointment;
      }
      
      // If not, fetch it from the API
      const appointment = await healthcareService.getAppointment(id);
      
      // Fetch doctor details if needed
      if (appointment.doctor && typeof appointment.doctor === 'number') {
        try {
          const doctorDetails = await healthcareService.getDoctor(appointment.doctor);
          appointment.doctor = doctorDetails;
        } catch (err) {
          console.error(`Error fetching details for doctor ${appointment.doctor}:`, err);
        }
      }
      
      return appointment;
    } catch (error) {
      console.error('Error getting appointment:', error);
      toast.error('Failed to get appointment details');
      return undefined;
    }
  };

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        isLoading,
        error,
        fetchAppointments,
        fetchUpcomingAppointments,
        addAppointment,
        cancelAppointment,
        getAppointmentById,
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