import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  appointmentService, 
  Appointment, 
  AppointmentWithDetails,
  AppointmentStatus,
  AppointmentType,
  CreateAppointmentData
} from "@/services/appointment.service";
import { useAuth } from "./AuthContext";

interface AppointmentContextType {
  appointments: AppointmentWithDetails[];
  loadingAppointments: boolean;
  bookAppointment: (data: Omit<CreateAppointmentData, 'userId'>) => Promise<void>;
  cancelAppointment: (id: number) => Promise<void>;
  rescheduleAppointment: (id: number, newDate: string, newTime: string) => Promise<void>;
  refreshAppointments: () => Promise<void>;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      refreshAppointments();
    } else {
      setAppointments([]);
    }
  }, [user]);
  
  const refreshAppointments = async () => {
    if (!user) return;
    
    setLoadingAppointments(true);
    try {
      const userAppointments = await appointmentService.getUserAppointments(user.id);
      setAppointments(userAppointments);
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoadingAppointments(false);
    }
  };
  
  const bookAppointment = async (data: Omit<CreateAppointmentData, 'userId'>) => {
    if (!user) {
      toast.error("You must be logged in to book an appointment");
      throw new Error("User not authenticated");
    }
    
    try {
      await appointmentService.createAppointment({
        ...data,
        userId: user.id
      });
      
      toast.success("Appointment booked successfully!");
      await refreshAppointments();
    } catch (error: any) {
      console.error("Error booking appointment:", error);
      toast.error(error.message || "Failed to book appointment");
      throw error;
    }
  };
  
  const cancelAppointment = async (id: number) => {
    try {
      await appointmentService.cancelAppointment(id);
      toast.success("Appointment cancelled successfully");
      await refreshAppointments();
    } catch (error: any) {
      console.error("Error cancelling appointment:", error);
      toast.error("Failed to cancel appointment");
      throw error;
    }
  };
  
  const rescheduleAppointment = async (id: number, newDate: string, newTime: string) => {
    try {
      await appointmentService.rescheduleAppointment(id, newDate, newTime);
      toast.success("Appointment rescheduled successfully");
      await refreshAppointments();
    } catch (error: any) {
      console.error("Error rescheduling appointment:", error);
      toast.error(error.message || "Failed to reschedule appointment");
      throw error;
    }
  };
  
  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        loadingAppointments,
        bookAppointment,
        cancelAppointment,
        rescheduleAppointment,
        refreshAppointments
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error("useAppointments must be used within an AppointmentProvider");
  }
  return context;
}; 