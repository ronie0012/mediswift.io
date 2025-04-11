import api from './api';
import { handleApiError, handleApiSuccess } from './errorHandling';

// Interfaces for Healthcare data types
interface Appointment {
  id?: number;
  doctor: number;
  patient: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status?: string;
  reason: string;
  notes?: string;
}

// Interface for creating appointments
interface CreateAppointmentData {
  doctor_id: number;
  patient_id?: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  reason: string;
  notes?: string;
}

interface Doctor {
  id?: number;
  user: any;
  specialization: any;
  license_number: string;
  years_of_experience: number;
  bio?: string;
  is_available: boolean;
}

interface Patient {
  id?: number;
  user: any;
  date_of_birth?: string;
  gender?: string;
  phone_number?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  blood_group?: string;
  allergies?: string;
  medical_conditions?: string;
}

interface MedicalRecord {
  id?: number;
  patient: number;
  doctor: number;
  appointment?: number;
  visit_date: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  prescription?: string;
  notes?: string;
  follow_up_date?: string;
}

interface Medication {
  id?: number;
  name: string;
  description?: string;
  dosage_instructions: string;
  side_effects?: string;
}

interface Prescription {
  id?: number;
  medical_record: number;
  medication: number;
  dosage: string;
  frequency: string;
  duration: string;
  special_instructions?: string;
}

interface Specialization {
  id?: number;
  name: string;
  description?: string;
}

// Healthcare Service API calls
export const healthcareService = {
  // Doctors
  getDoctors: async (params: any = {}) => {
    try {
      const response = await api.get('/healthcare/doctors/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      handleApiError(error, 'Failed to fetch doctors');
      throw error;
    }
  },

  getDoctor: async (id: number) => {
    try {
      const response = await api.get(`/healthcare/doctors/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching doctor ${id}:`, error);
      handleApiError(error, 'Failed to fetch doctor details');
      throw error;
    }
  },

  getCurrentDoctorProfile: async () => {
    try {
      const response = await api.get('/healthcare/doctors/me/');
      return response.data;
    } catch (error) {
      console.error('Error fetching current doctor profile:', error);
      handleApiError(error, 'Failed to fetch your doctor profile');
      throw error;
    }
  },

  getDoctorAppointments: async (id: number, params: any = {}) => {
    try {
      const response = await api.get(`/healthcare/doctors/${id}/appointments/`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointments for doctor ${id}:`, error);
      handleApiError(error, 'Failed to fetch doctor appointments');
      throw error;
    }
  },

  // Patients
  getPatients: async (params: any = {}) => {
    try {
      const response = await api.get('/healthcare/patients/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      handleApiError(error, 'Failed to fetch patients');
      throw error;
    }
  },

  getPatient: async (id: number) => {
    try {
      const response = await api.get(`/healthcare/patients/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching patient ${id}:`, error);
      handleApiError(error, 'Failed to fetch patient details');
      throw error;
    }
  },

  getCurrentPatientProfile: async () => {
    try {
      const response = await api.get('/healthcare/patients/me/');
      return response.data;
    } catch (error) {
      console.error('Error fetching current patient profile:', error);
      handleApiError(error, 'Failed to fetch your patient profile');
      throw error;
    }
  },

  updatePatientProfile: async (data: Partial<Patient>) => {
    try {
      const response = await api.patch('/healthcare/patients/me/', data);
      handleApiSuccess('Patient profile updated successfully');
      return response.data;
    } catch (error) {
      console.error('Error updating patient profile:', error);
      handleApiError(error, 'Failed to update patient profile');
      throw error;
    }
  },

  getPatientAppointments: async (id: number, params: any = {}) => {
    try {
      const response = await api.get(`/healthcare/patients/${id}/appointments/`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointments for patient ${id}:`, error);
      handleApiError(error, 'Failed to fetch patient appointments');
      throw error;
    }
  },

  // Appointments
  getAppointments: async (params: any = {}) => {
    try {
      const response = await api.get('/healthcare/appointments/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      handleApiError(error, 'Failed to fetch appointments');
      throw error;
    }
  },

  getAppointment: async (id: number) => {
    try {
      const response = await api.get(`/healthcare/appointments/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointment ${id}:`, error);
      handleApiError(error, 'Failed to fetch appointment details');
      throw error;
    }
  },

  createAppointment: async (data: CreateAppointmentData) => {
    try {
      // Make sure we have required fields
      if (!data.doctor_id) {
        throw new Error('doctor_id is required');
      }
      
      if (!data.patient_id) {
        throw new Error('patient_id is required');
      }
      
      // Convert from CreateAppointmentData to the format expected by the API
      const appointmentData = {
        doctor: data.doctor_id, // Backend expects 'doctor' field, not doctor_id
        patient: data.patient_id, // Backend expects 'patient' field, not patient_id
        appointment_date: data.appointment_date,
        start_time: data.start_time,
        end_time: data.end_time,
        reason: data.reason,
        notes: data.notes || ""
      };
      
      const response = await api.post('/healthcare/appointments/', appointmentData);
      handleApiSuccess('Appointment created successfully');
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      const apiError = error as any;
      // Log detailed error info
      if (apiError.response) {
        console.error('Error response data:', apiError.response.data);
        console.error('Error response status:', apiError.response.status);
      }
      handleApiError(error, 'Failed to create appointment');
      throw error;
    }
  },

  updateAppointment: async (id: number, data: Partial<Appointment>) => {
    try {
      const response = await api.patch(`/healthcare/appointments/${id}/`, data);
      handleApiSuccess('Appointment updated successfully');
      return response.data;
    } catch (error) {
      console.error(`Error updating appointment ${id}:`, error);
      handleApiError(error, 'Failed to update appointment');
      throw error;
    }
  },

  cancelAppointment: async (id: number) => {
    try {
      const response = await api.patch(`/healthcare/appointments/${id}/`, { status: 'cancelled' });
      handleApiSuccess('Appointment cancelled successfully');
      return response.data;
    } catch (error) {
      console.error(`Error cancelling appointment ${id}:`, error);
      handleApiError(error, 'Failed to cancel appointment');
      throw error;
    }
  },

  getUpcomingAppointments: async (params: any = {}) => {
    try {
      // First try the dedicated endpoint
      try {
        const response = await api.get('/healthcare/appointments/upcoming/', { params });
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        } else {
          console.warn('Upcoming appointments endpoint returned invalid data format');
          throw new Error('Invalid data format');
        }
      } catch (endpointError) {
        // If the specific endpoint fails, log and fall back gracefully
        console.warn('Upcoming appointments endpoint not available:', endpointError);
        
        // Fallback: Get all appointments and filter client-side
        const allAppointments = await api.get('/healthcare/appointments/', { params });
        
        if (!allAppointments.data || !Array.isArray(allAppointments.data)) {
          console.error('All appointments endpoint returned invalid data');
          return [];
        }
        
        // Create today date for comparison (set to start of day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filter appointments by date and status
        return allAppointments.data.filter((appointment: any) => {
          // Skip appointments with missing data
          if (!appointment || !appointment.appointment_date) {
            return false;
          }
          
          try {
            const appointmentDate = new Date(appointment.appointment_date);
            
            // Include appointments that are today or in the future
            // OR have an active status (scheduled or confirmed)
            return (
              appointmentDate >= today || 
              appointment.status === 'scheduled' || 
              appointment.status === 'confirmed'
            ) && appointment.status !== 'cancelled'; // Exclude cancelled appointments
          } catch (parseError) {
            console.error('Error parsing appointment date:', parseError);
            return false;
          }
        });
      }
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      // Don't show toast for this error to prevent UI disruption
      handleApiError(error, 'Failed to fetch upcoming appointments', false);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  },

  // Medical Records
  getMedicalRecords: async (params: any = {}) => {
    try {
      const response = await api.get('/healthcare/medical-records/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching medical records:', error);
      handleApiError(error, 'Failed to fetch medical records');
      throw error;
    }
  },

  getMedicalRecord: async (id: number) => {
    try {
      const response = await api.get(`/healthcare/medical-records/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching medical record ${id}:`, error);
      handleApiError(error, 'Failed to fetch medical record');
      throw error;
    }
  },

  createMedicalRecord: async (data: MedicalRecord) => {
    try {
      const response = await api.post('/healthcare/medical-records/', data);
      handleApiSuccess('Medical record created successfully');
      return response.data;
    } catch (error) {
      console.error('Error creating medical record:', error);
      handleApiError(error, 'Failed to create medical record');
      throw error;
    }
  },

  updateMedicalRecord: async (id: number, data: Partial<MedicalRecord>) => {
    try {
      const response = await api.patch(`/healthcare/medical-records/${id}/`, data);
      handleApiSuccess('Medical record updated successfully');
      return response.data;
    } catch (error) {
      console.error(`Error updating medical record ${id}:`, error);
      handleApiError(error, 'Failed to update medical record');
      throw error;
    }
  },

  getMedicalRecordPrescriptions: async (id: number) => {
    try {
      const response = await api.get(`/healthcare/medical-records/${id}/prescriptions/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching prescriptions for medical record ${id}:`, error);
      handleApiError(error, 'Failed to fetch prescriptions');
      throw error;
    }
  },

  // Medications
  getMedications: async (search: string = '') => {
    try {
      const params = search ? { search } : {};
      const response = await api.get('/healthcare/medications/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching medications:', error);
      handleApiError(error, 'Failed to fetch medications');
      throw error;
    }
  },

  getMedication: async (id: number) => {
    try {
      const response = await api.get(`/healthcare/medications/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching medication ${id}:`, error);
      handleApiError(error, 'Failed to fetch medication');
      throw error;
    }
  },

  // Prescriptions
  createPrescription: async (data: Prescription) => {
    try {
      const response = await api.post('/healthcare/prescriptions/', data);
      handleApiSuccess('Prescription created successfully');
      return response.data;
    } catch (error) {
      console.error('Error creating prescription:', error);
      handleApiError(error, 'Failed to create prescription');
      throw error;
    }
  },

  updatePrescription: async (id: number, data: Partial<Prescription>) => {
    try {
      const response = await api.patch(`/healthcare/prescriptions/${id}/`, data);
      handleApiSuccess('Prescription updated successfully');
      return response.data;
    } catch (error) {
      console.error(`Error updating prescription ${id}:`, error);
      handleApiError(error, 'Failed to update prescription');
      throw error;
    }
  },

  // Specializations
  getSpecializations: async (search: string = '') => {
    try {
      const params = search ? { search } : {};
      const response = await api.get('/healthcare/specializations/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching specializations:', error);
      handleApiError(error, 'Failed to fetch specializations');
      throw error;
    }
  },

  getSpecialization: async (id: number) => {
    try {
      const response = await api.get(`/healthcare/specializations/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching specialization ${id}:`, error);
      handleApiError(error, 'Failed to fetch specialization');
      throw error;
    }
  },
};

export default healthcareService;