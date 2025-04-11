import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
  patient_id: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  reason: string;
  notes?: string;
}

// Use this interface internally when patient_id is optional (before we set it)
export interface AppointmentFormData {
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
  addAppointment: (appointmentData: CreateAppointmentData | AppointmentFormData) => Promise<Appointment>;
  cancelAppointment: (id: number) => Promise<void>;
  getAppointmentById: (id: number) => Promise<Appointment | undefined>;
  refreshAppointments: () => Promise<void>;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load appointments when the component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchUpcomingAppointments();
    }
  }, [user]);

  // Helper function to ensure doctor data is properly structured
  const processAppointmentData = useCallback((data: Appointment[] | null | undefined): Appointment[] => {
    // Handle null/undefined data
    if (!data) return [];
    
    return data.map(appointment => {
      // Create a deep copy to avoid mutation issues
      const processedAppointment = { ...appointment };
      
      // Ensure all required properties exist
      if (!processedAppointment.id) processedAppointment.id = Math.floor(Math.random() * 10000);
      if (!processedAppointment.status) processedAppointment.status = 'scheduled';
      if (!processedAppointment.appointment_date) processedAppointment.appointment_date = new Date().toISOString().split('T')[0];
      if (!processedAppointment.start_time) processedAppointment.start_time = '09:00:00';
      if (!processedAppointment.end_time) processedAppointment.end_time = '09:30:00';
      if (!processedAppointment.reason) processedAppointment.reason = 'General checkup';
      if (!processedAppointment.created_at) processedAppointment.created_at = new Date().toISOString();
      if (!processedAppointment.updated_at) processedAppointment.updated_at = new Date().toISOString();
      
      // Handle case where doctor is just an ID
      if (typeof processedAppointment.doctor === 'number') {
        const doctorId = processedAppointment.doctor;
        processedAppointment.doctor = {
          id: doctorId,
          user: { first_name: "Loading", last_name: "..." },
          specialization: { name: "Loading..." }
        };
      } 
      // Handle case where doctor object exists but might be incomplete
      else if (processedAppointment.doctor && typeof processedAppointment.doctor === 'object') {
        // Ensure doctor has an id property
        if (!processedAppointment.doctor.id && processedAppointment.doctor.doctor_id) {
          processedAppointment.doctor.id = processedAppointment.doctor.doctor_id;
        }
        
        // Ensure doctor has a user property with name information
        if (!processedAppointment.doctor.user) {
          processedAppointment.doctor.user = { 
            first_name: processedAppointment.doctor.first_name || "Unknown", 
            last_name: processedAppointment.doctor.last_name || "Doctor" 
          };
        } else if (!processedAppointment.doctor.user.first_name && !processedAppointment.doctor.user.last_name) {
          processedAppointment.doctor.user.first_name = "Unknown";
          processedAppointment.doctor.user.last_name = "Doctor";
        }
        
        // Ensure doctor has a specialization property
        if (!processedAppointment.doctor.specialization) {
          processedAppointment.doctor.specialization = { 
            name: processedAppointment.doctor.specialty || "Specialty unknown" 
          };
        } else if (!processedAppointment.doctor.specialization.name) {
          processedAppointment.doctor.specialization.name = "Specialty unknown";
        }
      }
      // Handle case where doctor is missing entirely
      else if (!processedAppointment.doctor) {
        processedAppointment.doctor = {
          id: 0,
          user: { first_name: "Unknown", last_name: "Doctor" },
          specialization: { name: "Specialty unknown" }
        };
      }
      
      // Also handle patient data in the same way
      if (!processedAppointment.patient || typeof processedAppointment.patient === 'number') {
        const patientId = typeof processedAppointment.patient === 'number' 
          ? processedAppointment.patient 
          : 0;
        processedAppointment.patient = {
          id: patientId,
          user: { first_name: "Current", last_name: "Patient" }
        };
      }
      
      return processedAppointment;
    });
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await healthcareService.getAppointments();
      const processedData = processAppointmentData(data);
      
      // First update with the processed data to show something to the user quickly
      setAppointments(processedData);
      
      // Collect all doctor IDs that need to be fetched
      const doctorIdsToFetch = processedData
        .filter(appointment => appointment.doctor && 
                (typeof appointment.doctor === 'number' || 
                 (typeof appointment.doctor === 'object' && appointment.doctor.id)))
        .map(appointment => typeof appointment.doctor === 'number' ? 
             appointment.doctor : appointment.doctor.id);
      
      // Remove duplicates
      const uniqueDoctorIds = [...new Set(doctorIdsToFetch)];
      
      // Fetch all doctor details in parallel
      const doctorDetailsPromises = uniqueDoctorIds.map(doctorId => 
        healthcareService.getDoctor(doctorId)
          .catch(err => {
            console.error(`Error fetching details for doctor ${doctorId}:`, err);
            return null;
          })
      );
      
      const doctorDetails = await Promise.all(doctorDetailsPromises);
      
      // Create a map of doctor ID to doctor details for quick lookup
      const doctorMap = new Map();
      doctorDetails.forEach(doctor => {
        if (doctor && doctor.id) {
          doctorMap.set(doctor.id, doctor);
        }
      });
      
      // Update all appointments with doctor details in a single state update
      setAppointments(prevAppointments => 
        prevAppointments.map(apt => {
          const doctorId = typeof apt.doctor === 'number' ? 
                          apt.doctor : 
                          (apt.doctor && apt.doctor.id ? apt.doctor.id : null);
          
          if (doctorId && doctorMap.has(doctorId)) {
            return { ...apt, doctor: doctorMap.get(doctorId) };
          }
          return apt;
        })
      );
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments');
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUpcomingAppointments = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await healthcareService.getUpcomingAppointments();
      
      if (!data) {
        setAppointments([]);
        return;
      }
      
      if (!Array.isArray(data)) {
        console.error('Invalid appointments data format:', data);
        setError('Invalid data format received from server');
        setAppointments([]);
        return;
      }
      
      // Process appointments and fetch doctor details in parallel
      const processedAppointments = data.map(appointment => ({
        ...appointment,
        appointment_date: new Date(appointment.appointment_date).toISOString().split('T')[0],
        start_time: appointment.start_time,
        end_time: appointment.end_time,
      }));
      
      // Update appointments state quickly with processed data
      setAppointments(processedAppointments);
      
      // Fetch doctor details in parallel
      const doctorIds = [...new Set(processedAppointments.map(a => a.doctor))];
      const doctorPromises = doctorIds.map(id => 
        healthcareService.getDoctorDetails(id).catch(err => {
          console.error(`Error fetching doctor details for ID ${id}:`, err);
          return null;
        })
      );
      
      const doctorResults = await Promise.all(doctorPromises);
      const doctorMap = new Map(
        doctorResults
          .filter(Boolean)
          .map(doctor => [doctor.id, doctor])
      );
      
      // Update appointments with doctor details
      setAppointments(prevAppointments => 
        prevAppointments.map(appointment => ({
          ...appointment,
          doctor: doctorMap.get(appointment.doctor) || null
        }))
      );
      
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to fetch appointments';
      setError(errorMessage);
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const addAppointment = async (formData: AppointmentFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Create a new object to avoid modifying the original
      const appointmentData: CreateAppointmentData = {
        ...formData,
        // Default patient_id will be overridden if we can find a real one
        patient_id: formData.patient_id || 0
      };
      
      // Check if we need to set the patient_id (will be required if a doctor is creating an appointment)
      if (!formData.patient_id && user) {
        try {
          // Log the user for debugging
          console.log('Current user:', user);
          
          // First try to get patient profile through API
          const patientProfile = await healthcareService.getCurrentPatientProfile();
          console.log('Retrieved patient profile:', patientProfile);
          appointmentData.patient_id = patientProfile.id;
        } catch (err) {
          console.error('Error fetching patient profile:', err);
          
          // If that fails, try to determine patient_id from user data
          if (user && 'patient_id' in user) {
            console.log('Using patient_id from user object:', (user as any).patient_id);
            appointmentData.patient_id = (user as any).patient_id;
          } else if (user.id) {
            // Assume user.id could be the patient_id as fallback
            console.log('Using user.id as fallback for patient_id:', user.id);
            appointmentData.patient_id = user.id;
          } else {
            const errorMsg = 'Could not determine patient_id - Unable to book appointment';
            console.error(errorMsg);
            toast.error(errorMsg);
            throw new Error(errorMsg);
          }
        }
      }
      
      // Make sure we have a valid patient_id before proceeding
      if (!appointmentData.patient_id) {
        const errorMsg = 'Patient ID is required to book an appointment';
        console.error(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      // Log the final appointment data before sending
      console.log('Final appointment data being sent:', appointmentData);

      const newAppointment = await healthcareService.createAppointment(appointmentData);
      
      // Ensure we have a complete doctor object, not just an ID
      let updatedAppointment = { ...newAppointment };
      
      // Fetch the doctor details to ensure we have complete information
      if (newAppointment.doctor && typeof newAppointment.doctor === 'number') {
        try {
          const doctorDetails = await healthcareService.getDoctor(newAppointment.doctor);
          updatedAppointment.doctor = doctorDetails;
        } catch (err) {
          console.error(`Error fetching details for doctor ${newAppointment.doctor}:`, err);
          // Create a placeholder doctor object with the ID to prevent rendering issues
          updatedAppointment.doctor = {
            id: newAppointment.doctor,
            user: { first_name: "Loading", last_name: "..." },
            specialization: { name: "Loading..." }
          };
        }
      }
      
      // Update the appointments list with the new appointment
      setAppointments(prevAppointments => [...prevAppointments, updatedAppointment]);
      
      // Trigger a refresh of appointments to ensure we have the latest data
      setTimeout(() => {
        fetchUpcomingAppointments().catch(err => 
          console.error('Error refreshing appointments after booking:', err)
        );
      }, 1000);
      
      toast.success('Appointment booked successfully!', {
        description: `Your appointment is confirmed for ${appointmentData.appointment_date} at ${appointmentData.start_time}`
      });

      return updatedAppointment;
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

  const cancelAppointment = useCallback(async (id: number) => {
    try {
      await healthcareService.cancelAppointment(id);
      toast.success('Appointment cancelled successfully');
      await fetchUpcomingAppointments();
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to cancel appointment';
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchUpcomingAppointments]);

  const getAppointmentById = async (id: number) => {
    try {
      // First check if we already have the appointment in state
      const existingAppointment = appointments.find(apt => apt.id === id);
      if (existingAppointment) {
        // If the doctor information is complete, return the existing appointment
        if (existingAppointment.doctor && 
            typeof existingAppointment.doctor === 'object' && 
            existingAppointment.doctor.user && 
            existingAppointment.doctor.specialization) {
          return existingAppointment;
        }
        // Otherwise, we'll fetch it again to get complete information
      }
      
      // If not found in state or doctor info is incomplete, fetch it from the API
      const appointment = await healthcareService.getAppointment(id);
      
      // Process the appointment to ensure doctor data is properly structured
      let processedAppointment = processAppointmentData([appointment])[0];
      
      // Fetch doctor details if needed
      if (processedAppointment.doctor && 
          (typeof processedAppointment.doctor === 'number' || 
           (typeof processedAppointment.doctor === 'object' && processedAppointment.doctor.id))) {
        try {
          const doctorId = typeof processedAppointment.doctor === 'number' ? 
                          processedAppointment.doctor : 
                          processedAppointment.doctor.id;
                          
          const doctorDetails = await healthcareService.getDoctor(doctorId);
          processedAppointment.doctor = doctorDetails;
        } catch (err) {
          console.error(`Error fetching details for doctor:`, err);
          // We already have a placeholder from processAppointmentData, so no need to handle here
        }
      }
      
      // Update the appointments list with the fetched appointment
      setAppointments(prevAppointments => {
        const appointmentExists = prevAppointments.some(apt => apt.id === id);
        if (appointmentExists) {
          return prevAppointments.map(apt => apt.id === id ? processedAppointment : apt);
        } else {
          return [...prevAppointments, processedAppointment];
        }
      });
      
      return processedAppointment;
    } catch (error) {
      console.error('Error getting appointment:', error);
      toast.error('Failed to get appointment details');
      return undefined;
    }
  };

  const refreshAppointments = useCallback(async () => {
    await fetchUpcomingAppointments();
  }, [fetchUpcomingAppointments]);

  const value = useMemo(() => ({
    appointments,
    isLoading,
    error,
    fetchAppointments,
    fetchUpcomingAppointments,
    addAppointment,
    cancelAppointment,
    getAppointmentById,
    refreshAppointments
  }), [appointments, isLoading, error, fetchAppointments, fetchUpcomingAppointments, addAppointment, cancelAppointment, getAppointmentById, refreshAppointments]);

  return (
    <AppointmentContext.Provider value={value}>
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