import { useState, useEffect, useMemo, useCallback, useTransition, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppointments, Appointment, CreateAppointmentData } from "@/context/AppointmentContext";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Phone, 
  Search, 
  Filter, 
  ChevronDown, 
  X, 
  Check,
  FileText,
  MoreHorizontal,
  Calendar as CalendarIcon,
  LayoutGrid,
  List,
  AlertCircle
} from "lucide-react";
import { format, isAfter, isBefore, parseISO, startOfToday, isToday, isTomorrow, isThisWeek, isThisMonth } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define AppointmentStatus type since it's not exported from AppointmentContext
type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

// Define Doctor interface consistent with the rest of the app
interface Doctor {
  id: number;
  user?: {
    first_name: string;
    last_name: string;
    email?: string;
  };
  specialization?: {
    id?: number;
    name: string;
  };
  license_number?: string;
  years_of_experience?: number;
  bio?: string;
  is_available?: boolean;
  profile_image?: string;
  average_rating?: number;
  // Additional properties that might exist in the system
  name?: string;
  specialty?: string;
  first_name?: string;
  last_name?: string;
  specialties?: string[];
}

// Define a type that extends Appointment with additional fields needed for the API
type ExtendedAppointment = Appointment & {
  doctor_id?: number;
  patient_id?: number;
};

// Add this debug function at the top
const debugDoctorObject = (doctor: any, context: string = 'Unknown context'): void => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`Doctor Object Debug (${context})`);
    console.log('Doctor type:', typeof doctor);
    console.log('Doctor value:', doctor);
    
    if (typeof doctor === 'object' && doctor !== null) {
      console.log('Has user property:', 'user' in doctor);
      console.log('Has first_name:', doctor.first_name);
      console.log('Has last_name:', doctor.last_name);
      
      if (doctor.user) {
        console.log('User first_name:', doctor.user.first_name);
        console.log('User last_name:', doctor.user.last_name);
      }
      
      console.log('Has specialization:', 'specialization' in doctor);
      console.log('Has specialty:', 'specialty' in doctor);
    }
    console.groupEnd();
  }
};

// Improved helper function to get doctor name consistently
const getDoctorName = (doctor: any): string => {
  if (process.env.NODE_ENV === 'development') {
    console.group('getDoctorName');
    console.log('Doctor type:', typeof doctor);
    console.log('Doctor value:', doctor);
    console.groupEnd();
  }
  
  if (!doctor) return "Unknown Doctor";
  
  if (typeof doctor === 'object') {
    // Case 1: doctor has user with first and last name
    if (doctor.user?.first_name && doctor.user?.last_name) {
      return `Dr. ${doctor.user.first_name} ${doctor.user.last_name}`;
    }
    
    // Case 2: doctor has direct name property
    if (doctor.name) {
      return doctor.name;
    }
    
    // Case 3: doctor has direct first_name and last_name
    if (doctor.first_name && doctor.last_name) {
      return `Dr. ${doctor.first_name} ${doctor.last_name}`;
    }
  }
  
  if (typeof doctor === "number") {
    return `Doctor #${doctor}`;
  }
  
  return "Unknown Doctor";
};

// Improved helper function to get doctor specialty consistently
const getDoctorSpecialty = (doctor: any): string => {
  if (!doctor) return "Specialty unknown";
  
  if (typeof doctor === 'object') {
    if (doctor.specialization?.name) {
      return doctor.specialization.name;
    }
    if (doctor.specialty) {
      return doctor.specialty;
    }
    if (doctor.specialties?.[0]) {
      return doctor.specialties[0];
    }
  }
  
  return "Specialty unknown";
};

// Improved helper function to check if doctor data is still loading
const isDoctorLoading = (doctor: any): boolean => {
  if (!doctor) return true;
  
  if (typeof doctor === 'number') return true;
  
  if (typeof doctor === 'object') {
    // Check if we have the minimum required doctor information
    const hasUserInfo = doctor.user && (
      (doctor.user.first_name && doctor.user.last_name) ||
      doctor.name ||
      (doctor.first_name && doctor.last_name)
    );
    
    const hasSpecialization = doctor.specialization?.name || 
                            doctor.specialty ||
                            doctor.specialties?.length > 0;
    
    return !hasUserInfo || !hasSpecialization;
  }
  
  return true;
};

// Helper function to render doctor name with proper loading state
const renderDoctorName = (doctor: any) => {
  try {
    // First check for loading state
    if (!doctor) {
      console.warn('Doctor object is null or undefined');
      return <Skeleton className="h-5 w-32" />;
    }
    
    if (typeof doctor === 'number') {
      console.warn(`Doctor is just a number ID: ${doctor}`);
      return <>Doctor #{doctor}</>;
    }
    
    // For debugging - log doctor structure to help identify issues
    if (process.env.NODE_ENV === 'development') {
      console.group('Doctor Object in renderDoctorName');
      console.log('Type:', typeof doctor);
      console.log('Value:', doctor);
      if (typeof doctor === 'object') {
        console.log('Has user?', doctor.user !== undefined);
        console.log('User first_name:', doctor.user?.first_name);
        console.log('User last_name:', doctor.user?.last_name);
        console.log('Direct first_name:', doctor.first_name);
        console.log('Direct last_name:', doctor.last_name);
        console.log('Name:', doctor.name);
      }
      console.groupEnd();
    }
    
    // Now handle the actual doctor name rendering
    if (typeof doctor === 'object') {
      // Case 1: doctor has user with first and last name
      if (doctor.user && doctor.user.first_name && doctor.user.last_name) {
        return `Dr. ${doctor.user.first_name} ${doctor.user.last_name}`;
      }
      
      // Case 2: doctor has direct name property
      if (doctor.name) {
        return doctor.name;
      }
      
      // Case 3: doctor has direct first/last name
      if (doctor.first_name && doctor.last_name) {
        return `Dr. ${doctor.first_name} ${doctor.last_name}`;
      }
      
      // If we got here but none of the conditions matched, log details
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to extract doctor name from:', doctor);
      }
      
      // Return a default value instead of nothing
      return "Unknown Doctor";
    }
    
    // Fallback to display something rather than nothing
    return "Doctor";
  } catch (error) {
    console.error("Error rendering doctor name:", error);
    return "Doctor"; // Default fallback value in case of error
  }
};

// Helper function to render specialization
const renderSpecialization = (doctor: any) => {
  if (isDoctorLoading(doctor)) {
    return <Skeleton className="h-4 w-24" />;
  }
  
  return getDoctorSpecialty(doctor);
};

// Direct fix for mock appointments with doctor data
const createMockAppointment = (doctorId: number, date: string, startTime: string, endTime: string, reason: string) => {
  // Create a unique ID for the mock appointment (larger than 1,000,000 to distinguish from API appointments)
  const mockId = Date.now();
  
  // First create the appointment data that matches the Appointment type
  const appointment: Appointment = {
    id: mockId,
    doctor: {
      id: doctorId,
      user: {
        first_name: "Mock",
        last_name: "Doctor"
      },
      specialization: {
        name: "General Practice"
      }
    },
    patient: {
      id: 1,
      user: {
        first_name: "Current",
        last_name: "Patient"
      }
    },
    appointment_date: date,
    start_time: startTime,
    end_time: endTime,
    status: "scheduled" as const,
    reason: reason,
    notes: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Add the API fields to the object without TypeScript seeing them
  const mockAppointmentData = appointment as any;
  mockAppointmentData.doctor_id = doctorId;
  mockAppointmentData.patient_id = 1;
  
  // Return as Appointment for UI consumption
  return appointment;
};

// Add this function to save mock appointment with full doctor data
const saveMockAppointment = (appointment: any) => {
  try {
    // Get existing mock appointments
    const existingMockAppointments = JSON.parse(localStorage.getItem('mockAppointments') || '[]');
    
    // Create new mock appointment with proper doctor object structure
    let mockAppointment;
    
    if (typeof appointment.doctor === 'number') {
      // If only doctor ID is provided, create a proper structure
      mockAppointment = createMockAppointment(
        appointment.doctor,
        appointment.appointment_date,
        appointment.start_time,
        appointment.end_time,
        appointment.reason
      );
    } else {
      // If complete doctor object is provided, use it
      const extendedAppointment: ExtendedAppointment = {
        ...appointment,
        id: Date.now(), // Ensure a unique ID
        // Ensure patient property exists
        patient: appointment.patient || {
          id: 1,
          user: {
            first_name: "Current",
            last_name: "Patient"
          }
        }
      };
      
      // Ensure doctor_id and patient_id are set
      const extendedData = extendedAppointment as any;
      
      // Make sure doctor_id is set
      if (!extendedData.doctor_id) {
        extendedData.doctor_id = typeof extendedAppointment.doctor === 'number' 
          ? extendedAppointment.doctor 
          : (extendedAppointment.doctor?.id || 0);
      }
      
      // Make sure patient_id is set
      if (!extendedData.patient_id) {
        extendedData.patient_id = typeof extendedAppointment.patient === 'number'
          ? extendedAppointment.patient
          : (extendedAppointment.patient?.id || 1);
      }
      
      mockAppointment = extendedAppointment;
    }
    
    // Add to existing appointments
    const updatedMockAppointments = [...existingMockAppointments, mockAppointment];
    
    // Save back to localStorage
    localStorage.setItem('mockAppointments', JSON.stringify(updatedMockAppointments));
    
    return mockAppointment as Appointment;
  } catch (error) {
    console.error('Error saving mock appointment:', error);
    return null;
  }
};

// Direct access to localStorage for debugging
const getMockAppointmentsFromStorage = (): any[] => {
  try {
    const storedData = localStorage.getItem('mockAppointments');
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Error reading mock appointments:', error);
  }
  return [];
};

// Force save a test appointment (reliable test)
const forceAddTestAppointment = () => {
  try {
    // Generate data for tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Create a complete test appointment with all required fields
    const extendedAppointment: ExtendedAppointment = {
      id: Date.now(), // Unique ID using timestamp
      doctor: {
        id: 999,
        user: {
          first_name: "Test",
          last_name: "Doctor",
          email: "test@example.com"
        },
        specialization: {
          id: 1,
          name: "General Practice"
        },
        license_number: "TEST123",
        years_of_experience: 10,
        bio: "Test doctor for debugging",
        is_available: true,
        phone_number: "555-123-4567",
        address: "123 Test St, Test City",
        profile_image: null
      },
      patient: {
        id: 1,
        user: {
          first_name: "Current",
          last_name: "Patient",
          email: "patient@example.com"
        }
      },
      appointment_date: tomorrow.toISOString().split('T')[0],
      start_time: "09:00:00",
      end_time: "09:30:00",
      status: "scheduled" as AppointmentStatus,
      reason: "Test Appointment (Direct)",
      notes: "Created for testing appointment display",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add required API fields but don't include them in the type
    const savedAppointment = {
      ...extendedAppointment,
      doctor_id: extendedAppointment.doctor.id,
      patient_id: extendedAppointment.patient.id
    };
    
    // Get existing appointments or initialize empty array
    const existingAppointments = getMockAppointmentsFromStorage();
    
    // Add new appointment and save back to localStorage
    localStorage.setItem('mockAppointments', 
      JSON.stringify([...existingAppointments, savedAppointment])
    );
    
    console.log('Successfully added test appointment to localStorage');
    return extendedAppointment;
  } catch (error) {
    console.error('Error forcing test appointment:', error);
    return null;
  }
};

// Helper function to standardize doctor data structure for consistency
const standardizeDoctorData = (doctor: any): Doctor => {
  if (!doctor) {
    return {
      id: 0,
      user: {
        first_name: "Unknown",
        last_name: "Doctor"
      },
      specialization: {
        name: "General Practice"
      }
    } as Doctor;
  }
  
  // If doctor is just an ID, convert to object
  if (typeof doctor === 'number') {
    return {
      id: doctor,
      user: {
        first_name: "Doctor",
        last_name: `#${doctor}`
      },
      specialization: {
        name: "General Practice"
      }
    } as Doctor;
  }
  
  // Create a clean doctor object to avoid reference issues
  const cleanDoctor = { ...doctor } as Doctor;
  
  // Make sure it has an ID
  if (!cleanDoctor.id) {
    cleanDoctor.id = Math.floor(Math.random() * 1000) + 1;
  }
  
  // Ensure user property exists and is properly structured
  if (!cleanDoctor.user) {
    cleanDoctor.user = {
      first_name: doctor.first_name || "Unknown",
      last_name: doctor.last_name || "Doctor"
    };
  } else {
    // Create a new user object to avoid reference issues
    cleanDoctor.user = { 
      ...cleanDoctor.user,
      first_name: cleanDoctor.user.first_name || doctor.first_name || "Unknown",
      last_name: cleanDoctor.user.last_name || doctor.last_name || "Doctor"
    };
  }
  
  // Ensure specialization property exists
  if (!cleanDoctor.specialization) {
    cleanDoctor.specialization = {
      name: doctor.specialty || doctor.specialties?.[0] || "General Practice"
    };
  } else {
    // Create a new specialization object to avoid reference issues
    cleanDoctor.specialization = { 
      ...cleanDoctor.specialization,
      name: cleanDoctor.specialization.name || doctor.specialty || "General Practice"
    };
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Standardized doctor object:', cleanDoctor);
  }
  
  return cleanDoctor;
};

// Function to process an appointment object for consistent structure
const standardizeAppointmentData = (apt: any): Appointment => {
  const processedAppointment: Appointment = {
    id: apt.id || Math.floor(Math.random() * 10000) + 1,
    doctor: standardizeDoctorData(apt.doctor),
    patient: apt.patient || {
      id: 1,
      user: {
        first_name: "Current",
        last_name: "Patient"
      }
    },
    appointment_date: apt.appointment_date,
    start_time: apt.start_time,
    end_time: apt.end_time,
    status: apt.status as AppointmentStatus,
    reason: apt.reason || "General checkup",
    notes: apt.notes || "",
    created_at: apt.created_at || new Date().toISOString(),
    updated_at: apt.updated_at || new Date().toISOString()
  };
  
  // Add the API fields back to the processed appointment for possible API calls
  const extendedAppointment = processedAppointment as any;
  extendedAppointment.doctor_id = apt.doctor_id || 
                                (typeof apt.doctor === 'number' ? apt.doctor : apt.doctor?.id) || 
                                processedAppointment.doctor.id;
  extendedAppointment.patient_id = apt.patient_id || apt.patient?.id || 1;
  
  return processedAppointment;
};

const MyAppointments = () => {
  const { user } = useAuth();
  const { 
    appointments, 
    isLoading, 
    error: appointmentsError, 
    fetchAppointments,
    fetchUpcomingAppointments,
    cancelAppointment 
  } = useAppointments();
  const navigate = useNavigate();
  
  // Use useTransition to prevent UI blocking during updates
  const [isPending, startTransition] = useTransition();
  const [isLoadingTransition, startLoadingTransition] = useTransition();
  
  // Separate state for loading vs general page state
  const [pageState, setPageState] = useState({
    initialLoading: true,
    isDataLoaded: false,
    doctorsLoaded: false,
    isRefreshing: false,
    hasError: false
  });
  
  // Add refresh interval state
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // UI state
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [filterStatus, setFilterStatus] = useState<"all" | AppointmentStatus>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [error, setError] = useState<string | null>(null);
  
  // Dialog state
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelAppointmentId, setCancelAppointmentId] = useState<number | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Set a flag to avoid repeated API calls while fetching
  const isFetchingRef = useRef(false);
  
  // Add a function to safely update appointments that prevents flickering
  const safelyUpdateAppointments = useCallback((updatedAppointments: Appointment[]) => {
    // Don't update state if array is empty but we're still loading
    if (updatedAppointments.length === 0 && isLoading) {
      return;
    }
    
    // Add placeholders for doctor data if missing
    const safeAppointments = updatedAppointments.map(apt => {
      // Ensure doctor is an object to prevent rendering issues
      if (!apt.doctor || typeof apt.doctor === 'number') {
        return {
          ...apt,
          doctor: {
            id: typeof apt.doctor === 'number' ? apt.doctor : 0,
            user: {
              first_name: "Loading",
              last_name: "...",
            },
            specialization: {
              name: "Loading...",
            }
          }
        };
      }
      return apt;
    });
    
    setAllAppointments(safeAppointments);
    
    // Mark doctors as loaded if they all have proper data
    const allDoctorsLoaded = safeAppointments.every(apt => 
      apt.doctor && typeof apt.doctor === 'object' && 
      apt.doctor.user && apt.doctor.user.first_name && apt.doctor.user.last_name
    );
    
    if (allDoctorsLoaded) {
      setPageState(prev => ({
        ...prev,
        doctorsLoaded: true
      }));
    }
  }, [isLoading]);

  // Load appointments directly from localStorage (for component initialization)
  const directlyLoadAppointments = useCallback(() => {
    try {
      // Show loading state
      setPageState(prev => ({
        ...prev,
        isRefreshing: true
      }));
      
      // Get mock appointments from localStorage
      const storedMockAppointments = localStorage.getItem('mockAppointments');
      if (storedMockAppointments) {
        console.log('Loading appointments directly from localStorage');
        // Parse the stored data
        const parsedMockAppointments = JSON.parse(storedMockAppointments);
        console.log('Raw mock appointments:', parsedMockAppointments);
        
        // Process and standardize each appointment
        const processedAppointments = parsedMockAppointments.map((apt) => {
          console.log('Processing appointment:', apt);
          
          // Ensure doctor object is properly structured
          let doctor = apt.doctor;
          
          // If doctor is just an ID, convert to full object
          if (typeof doctor === 'number') {
            console.warn(`Converting doctor ID ${doctor} to full object`);
            doctor = {
              id: doctor,
              user: {
                first_name: "Doctor",
                last_name: `#${doctor}`
              },
              specialization: {
                name: "General Practice"
              }
            };
          } else if (!doctor) {
            console.warn('Doctor object is missing, creating placeholder');
            doctor = {
              id: 999,
              user: {
                first_name: "Unknown",
                last_name: "Doctor"
              },
              specialization: {
                name: "General Practice"
              }
            };
          } else {
            // Create a copy to avoid reference issues
            doctor = { ...doctor };
            
            // Ensure user property exists
            if (!doctor.user) {
              doctor.user = {
                first_name: doctor.first_name || "Unknown",
                last_name: doctor.last_name || "Doctor"
              };
            }
            
            // Ensure specialization exists
            if (!doctor.specialization) {
              doctor.specialization = {
                name: doctor.specialty || doctor.specialties?.[0] || "General Practice"
              };
            }
          }
          
          console.log('Processed doctor:', doctor);
          
          // Ensure appointment date is a string
          const appointment_date = typeof apt.appointment_date === 'string' 
            ? apt.appointment_date 
            : new Date(apt.appointment_date).toISOString().split('T')[0];
          
          return {
            ...apt,
            doctor,
            appointment_date
          };
        });
        
        // Filter by active tab (upcoming/past)
        const filteredAppointments = processedAppointments.filter((apt: Appointment) => {
          if (!apt.appointment_date || !apt.start_time) return false;
          
          try {
            const appointmentDate = new Date(`${apt.appointment_date}T${apt.start_time}`);
            const isPast = appointmentDate < new Date() || 
                          apt.status === "completed" || 
                          apt.status === "cancelled" || 
                          apt.status === "no_show";
                          
            return activeTab === "upcoming" ? !isPast : isPast;
          } catch (e) {
            console.error("Error parsing date for appointment:", apt, e);
            return false;
          }
        });
        
        // Log doctor information for each appointment to verify it's correct
        filteredAppointments.forEach((apt: Appointment) => {
          console.log(`Appointment ${apt.id} doctor:`, apt.doctor);
        });
        
        // Update state
        setAllAppointments(filteredAppointments);
        setPageState(prev => ({
          ...prev,
          isDataLoaded: true,
          initialLoading: false,
          isRefreshing: false
        }));
        
        toast.success(`Loaded ${filteredAppointments.length} appointments directly`);
      } else {
        // No appointments found in localStorage
        setPageState(prev => ({
          ...prev,
          isRefreshing: false
        }));
        toast.warning("No appointments found in localStorage");
      }
    } catch (e) {
      console.error("Error directly loading appointments:", e);
      toast.error("Failed to load appointments directly");
      setPageState(prev => ({
        ...prev,
        isRefreshing: false
      }));
    }
  }, [activeTab, setAllAppointments, setPageState]);

  // Function to load all appointments (API + mock)
  const loadAllAppointments = useCallback(async () => {
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    
    try {
      // Get the API appointments
      let apiAppointments = appointments || [];
      
      // Get mock appointments from localStorage
      let mockAppointments: Appointment[] = [];
      try {
        const storedMockAppointments = localStorage.getItem('mockAppointments');
        if (storedMockAppointments) {
          // Parse and standardize all appointments
          const parsedMockAppointments = JSON.parse(storedMockAppointments);
          console.log('Raw mock appointments from localStorage:', parsedMockAppointments);
          
          // Process all appointments with our standardization helper
          mockAppointments = parsedMockAppointments.map(standardizeAppointmentData);
          
          // Filter by tab (upcoming/past)
          mockAppointments = mockAppointments.filter((apt: Appointment) => {
            if (!apt.appointment_date || !apt.start_time) return false;
            
            try {
              const appointmentDate = new Date(`${apt.appointment_date}T${apt.start_time}`);
              const isPast = appointmentDate < new Date() || 
                            apt.status === "completed" || 
                            apt.status === "cancelled" || 
                            apt.status === "no_show";
                             
              return activeTab === "upcoming" ? !isPast : isPast;
            } catch (e) {
              console.error("Error parsing date for appointment:", apt, e);
              return false;
            }
          });
        }
      } catch (e) {
        console.error("Error loading mock appointments:", e);
      }
      
      // Standardize API appointments as well
      apiAppointments = apiAppointments.map(standardizeAppointmentData);
      
      // Combine API and mock appointments
      const combinedAppointments = [...apiAppointments, ...mockAppointments];
      console.log('Final combined appointments:', combinedAppointments);
      
      // Update the appointments state
      safelyUpdateAppointments(combinedAppointments);
      
      // Always update page state to indicate data is loaded and reset loading flags
      setPageState(prev => ({
        ...prev,
        isDataLoaded: true,
        initialLoading: false,
        isRefreshing: false,
        hasError: false
      }));
      
      // Update refresh time
      setLastRefresh(new Date());
      setError(null);
      
    } catch (err) {
      console.error("Error loading all appointments:", err);
      setError("Failed to load appointments. Please try again.");
      // Still reset loading flags on error
      setPageState(prev => ({
        ...prev,
        initialLoading: false,
        isRefreshing: false,
        isDataLoaded: true, // Mark as loaded even on error to prevent infinite loading state
        hasError: true
      }));
    } finally {
      isFetchingRef.current = false;
    }
  }, [appointments, activeTab, safelyUpdateAppointments, setError, setPageState]);

  // Function to refresh appointments data
  const refreshAppointments = useCallback((showLoading = false) => {
    if (showLoading) {
      setPageState(prev => ({
        ...prev,
        isRefreshing: true
      }));
    }
    
    // Set a timeout to ensure loading state is visible for at least a moment
    setTimeout(() => {
      loadAllAppointments().finally(() => {
        // Ensure we always set isRefreshing to false regardless of success/failure
        setPageState(prev => ({
          ...prev,
          isRefreshing: false
        }));
      });
    }, 500);
  }, [loadAllAppointments]);

  // Initial load effect
  useEffect(() => {
    let mounted = true;

    const initialLoad = async () => {
      if (!user) return;
      
      try {
        // Only set initialLoading if we're truly starting fresh
        if (!pageState.isDataLoaded && allAppointments.length === 0) {
          setPageState(prev => ({ 
            ...prev, 
            initialLoading: true, 
            hasError: false
          }));
        }
        
        // Load appropriate appointments based on active tab
        if (activeTab === "upcoming") {
          await fetchUpcomingAppointments();
        } else {
          await fetchAppointments();
        }
        
        if (mounted) {
          // Load all appointments (API + mock)
          await loadAllAppointments();
          
          // As a fallback, also directly load from localStorage if we have no appointments
          if (allAppointments.length === 0) {
            // Try direct loading as fallback
            directlyLoadAppointments();
          }
          
          // Always ensure we update initialLoading to false
          setPageState(prev => ({
            ...prev,
            initialLoading: false,
            isDataLoaded: true
          }));
        }
      } catch (error) {
        console.error('Error in initial load:', error);
        
        if (mounted) {
          // Even if API fails, try to load from localStorage
          directlyLoadAppointments();
          
          setError('API Loading failed. Loaded from local storage as fallback.');
          setPageState(prev => ({ 
            ...prev, 
            initialLoading: false,
            isDataLoaded: true,
            hasError: true
          }));
        }
      }
    };

    initialLoad();
    return () => { mounted = false; };
  }, [user, activeTab, fetchAppointments, fetchUpcomingAppointments, loadAllAppointments, directlyLoadAppointments, allAppointments, pageState.isDataLoaded]);

  // Set up periodic refresh
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(() => {
      refreshAppointments(false);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [user, refreshAppointments]);

  // Update when appointments change
  useEffect(() => {
    if (!pageState.initialLoading) {
      loadAllAppointments();
    }
  }, [appointments, loadAllAppointments, pageState.initialLoading]);

  // Refresh when tab changes
  useEffect(() => {
    if (!pageState.initialLoading && user) {
      refreshAppointments(true);
    }
  }, [activeTab, user, pageState.initialLoading, refreshAppointments]);

  // Enhanced filter and sort appointments
  const filteredAppointments = useMemo(() => {
    if (pageState.initialLoading) {
      return [];
    }
    
    return allAppointments
      .filter(appointment => {
        // First filter by tab (upcoming/past)
        if (!appointment.appointment_date || !appointment.start_time) return false;
        
        try {
        const appointmentDate = new Date(`${appointment.appointment_date}T${appointment.start_time}`);
        const isPast = appointmentDate < new Date() || 
                      appointment.status === "completed" || 
                      appointment.status === "cancelled" || 
                      appointment.status === "no_show";
        
        if (activeTab === "upcoming" && isPast) {
          return false;
        }
        
        if (activeTab === "past" && !isPast) {
            return false;
          }
        } catch (e) {
          console.error("Error filtering appointment:", appointment, e);
          return false;
        }
        
        // Then filter by status if needed
        if (filterStatus !== "all" && appointment.status !== filterStatus) {
          return false;
        }
        
        // Finally filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const doctorName = getDoctorName(appointment.doctor);
          const specialty = getDoctorSpecialty(appointment.doctor);
          
          return (
            doctorName.toLowerCase().includes(query) ||
            appointment.reason.toLowerCase().includes(query) ||
            appointment.appointment_date.includes(query) ||
            specialty.toLowerCase().includes(query)
          );
        }
        
        return true;
      })
      .sort((a, b) => {
        try {
        // Sort by appointment date and time
        const dateA = new Date(`${a.appointment_date}T${a.start_time}`);
        const dateB = new Date(`${b.appointment_date}T${b.start_time}`);
        
        // For upcoming, sort by closest first
        if (sortOrder === "newest") {
          return dateA.getTime() - dateB.getTime();
        } else {
          // For oldest first, reverse the order
          return dateB.getTime() - dateA.getTime();
          }
        } catch (e) {
          console.error("Error sorting appointments:", e);
          return 0;
        }
      });
  }, [allAppointments, activeTab, filterStatus, searchQuery, sortOrder, pageState.initialLoading]);

  // Group appointments by date for better organization
  const groupedAppointments = useMemo(() => {
    const today = startOfToday();
    const groups: Record<string, Appointment[]> = {
      today: [],
      tomorrow: [],
      thisWeek: [],
      thisMonth: [],
      future: []
    };

    if (activeTab === "upcoming") {
      filteredAppointments.forEach(appointment => {
        const appointmentDate = parseISO(appointment.appointment_date);
        
        if (isToday(appointmentDate)) {
          groups.today.push(appointment);
        } else if (isTomorrow(appointmentDate)) {
          groups.tomorrow.push(appointment);
        } else if (isThisWeek(appointmentDate)) {
          groups.thisWeek.push(appointment);
        } else if (isThisMonth(appointmentDate)) {
          groups.thisMonth.push(appointment);
        } else {
          groups.future.push(appointment);
        }
      });
    } 
    
    return groups;
  }, [filteredAppointments, activeTab]);

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelAppointmentId(appointment.id);
    setShowCancelDialog(true);
  };

  const confirmCancelAppointment = async () => {
    if (!cancelAppointmentId) return;
    
    setIsCancelling(true);
    try {
      const appointmentToCancel = allAppointments.find(apt => apt.id === cancelAppointmentId);
      
      if (!appointmentToCancel) {
        throw new Error("Appointment not found");
      }
      
      // Handle mock appointments
      if (appointmentToCancel.id > 1000000) {
        const mockAppointments = JSON.parse(localStorage.getItem('mockAppointments') || '[]');
        const updatedMockAppointments = mockAppointments.map((apt: Appointment) => 
          apt.id === appointmentToCancel.id ? { ...apt, status: 'cancelled' as const } : apt
        );
        localStorage.setItem('mockAppointments', JSON.stringify(updatedMockAppointments));
        
        // Update the local state immediately for better UX
        setAllAppointments(prev => 
          prev.map(apt => apt.id === appointmentToCancel.id ? { ...apt, status: 'cancelled' as const } : apt)
        );
        
        toast.success('Appointment cancelled successfully');
      } else {
        // Real API appointment
        await cancelAppointment(appointmentToCancel.id);
        
        // Refresh appointments to get updated data
        setTimeout(() => refreshAppointments(false), 500);
        
        toast.success('Appointment cancelled successfully');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
      setCancelAppointmentId(null);
    }
  };

  // Handle appointment rescheduling
  const handleReschedule = (appointmentId: number) => {
    navigate(`/reschedule-appointment/${appointmentId}`);
  };

  // Handle view details
  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsOpen(true);
  };

  // Render appointment status badge
  const renderStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    let label = status.charAt(0).toUpperCase() + status.slice(1);
    
    switch (status) {
      case "scheduled":
        variant = "secondary";
        break;
      case "confirmed":
        variant = "default";
        break;
      case "completed":
        variant = "outline";
        break;
      case "cancelled":
        variant = "destructive";
        break;
      case "no_show":
        variant = "destructive";
        label = "No Show";
        break;
    }
    
    return <Badge variant={variant}>{label}</Badge>;
  };

  // Render appointment card skeleton for loading state
  const renderAppointmentSkeleton = () => {
    return Array(3).fill(0).map((_, index) => (
      <Card key={`skeleton-${index}`} className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex justify-end space-x-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  };

  // Render empty state
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg bg-gray-50">
      <div className="rounded-full bg-primary/10 p-3 mb-4">
        <Calendar className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-medium mb-1">No appointments found</h3>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        {activeTab === "upcoming" 
          ? (
            searchQuery || filterStatus !== "all" 
              ? "No appointments match your current filters." 
              : "You don't have any upcoming appointments scheduled. Book a new appointment to get started."
          )
          : (
            searchQuery || filterStatus !== "all"
              ? "No past appointments match your current filters."
              : "You don't have any past appointments to view."
          )
        }
      </p>
      {activeTab === "upcoming" && !searchQuery && filterStatus === "all" && (
        <Button onClick={() => navigate("/book-appointment")}>
          <Calendar className="mr-2 h-4 w-4" />
          Book an Appointment
        </Button>
      )}
      {(searchQuery || filterStatus !== "all") && (
        <Button variant="outline" onClick={clearFilters}>
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );

  // Add clear filters function
  const clearFilters = () => {
    startTransition(() => {
      setFilterStatus("all");
      setSearchQuery("");
      setSortOrder("newest");
    });
  };

  // Render section header for grouped appointments
  const renderSectionHeader = (title: string, count: number) => {
    if (count === 0) return null;
    
    return (
      <div className="flex items-center mt-8 mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <Badge variant="outline" className="ml-2">{count}</Badge>
      </div>
    );
  };

  // Render appointment card for grid view
  const renderAppointmentCard = useCallback((appointment: Appointment) => {
    const appointmentDate = new Date(`${appointment.appointment_date}T${appointment.start_time}`);
    const formattedDate = format(appointmentDate, "EEEE, MMMM d, yyyy");
    const formattedStartTime = format(appointmentDate, "h:mm a");
    const endTimeDate = new Date(`${appointment.appointment_date}T${appointment.end_time}`);
    const formattedEndTime = format(endTimeDate, "h:mm a");
    
    // Debug the doctor object
    if (process.env.NODE_ENV === 'development') {
      console.group(`Rendering appointment card ${appointment.id}`);
      console.log('Appointment:', appointment);
      console.log('Doctor data:', appointment.doctor);
      console.groupEnd();
    }
    
    // Use direct rendering functions instead of helper functions
    // This ensures we don't have stale closures in the useCallback
    const isLoading = !appointment.doctor || 
                     typeof appointment.doctor === 'number' ||
                     (typeof appointment.doctor === 'object' && 
                     (!appointment.doctor.user || 
                      !appointment.doctor.user.first_name || 
                      !appointment.doctor.user.last_name));
    
    // Get doctor name directly
    let doctorName = "Unknown Doctor";
    let specialty = "Specialty unknown";
    
    if (appointment.doctor && typeof appointment.doctor === 'object') {
      if (appointment.doctor.user?.first_name && appointment.doctor.user?.last_name) {
        doctorName = `Dr. ${appointment.doctor.user.first_name} ${appointment.doctor.user.last_name}`;
      } else if (appointment.doctor.name) {
        doctorName = appointment.doctor.name;
      } else if (appointment.doctor.first_name && appointment.doctor.last_name) {
        doctorName = `Dr. ${appointment.doctor.first_name} ${appointment.doctor.last_name}`;
      }
      
      if (appointment.doctor.specialization?.name) {
        specialty = appointment.doctor.specialization.name;
      } else if (appointment.doctor.specialty) {
        specialty = appointment.doctor.specialty;
      } else if (appointment.doctor.specialties?.[0]) {
        specialty = appointment.doctor.specialties[0];
      }
    }
    
    // Get status color
    const getStatusColor = () => {
      switch(appointment.status) {
        case "confirmed": return "bg-green-50 border-green-200";
        case "scheduled": return "bg-blue-50 border-blue-200";
        case "completed": return "bg-purple-50 border-purple-200";
        case "cancelled": return "bg-red-50 border-red-200";
        case "no_show": return "bg-orange-50 border-orange-200";
        default: return "";
      }
    };
    
    // Calculate if appointment is today
    const isToday = format(appointmentDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
    
    // Calculate countdown
    const getTimeRemaining = () => {
      const now = new Date();
      const diffMs = appointmentDate.getTime() - now.getTime();
      
      if (diffMs <= 0) return null;
      
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diffDays > 0) {
        return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
      } else if (diffHours > 0) {
        return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
      } else {
        return `in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
      }
    };
    
    const timeRemaining = getTimeRemaining();
    
    return (
      <Card 
        key={appointment.id} 
        className={`mb-4 overflow-hidden border transition-all hover:shadow-md ${getStatusColor()}`}
      >
        {/* Top badge for upcoming today appointments */}
        {isToday && activeTab === "upcoming" && (
          <div className="bg-primary text-primary-foreground text-xs font-medium py-1 px-3 text-center">
            Today's Appointment {timeRemaining && `(${timeRemaining})`}
          </div>
        )}
        
        <CardHeader className="pb-2 pt-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {isLoading ? (
                <>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </>
              ) : (
                <>
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarFallback className="text-xs">
                        {doctorName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                      {typeof appointment.doctor === 'object' && 
                       appointment.doctor.profile_image && (
                        <AvatarImage src={appointment.doctor.profile_image} alt="Doctor" />
                      )}
                    </Avatar>
                    <CardTitle className="text-lg font-semibold">
                      {doctorName}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    {specialty}
                  </CardDescription>
                </>
              )}
            </div>
            <Badge 
              variant={
                appointment.status === "confirmed" ? "default" :
                appointment.status === "scheduled" ? "outline" :
                appointment.status === "completed" ? "secondary" :
                "destructive"
              }
              className="ml-2"
            >
              {appointment.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid gap-2">
            <div className="flex items-center text-sm">
              <Calendar className="mr-2 h-4 w-4 opacity-70" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="mr-2 h-4 w-4 opacity-70" />
              <span>{formattedStartTime} - {formattedEndTime}</span>
            </div>
            <div className="mt-2">
              <h4 className="text-sm font-medium">Reason for Visit</h4>
              <p className="text-sm opacity-90">{appointment.reason}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2 pb-4 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
            onClick={() => {
              setSelectedAppointment(appointment);
              setIsDetailsOpen(true);
            }}
          >
            <FileText className="mr-1 h-3 w-3" />
            Details
          </Button>
          
          {appointment.status !== "cancelled" && appointment.status !== "completed" ? (
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={() => handleCancelAppointment(appointment)}
            >
              <X className="mr-1 h-3 w-3" />
              Cancel
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => navigate("/book-appointment")}
            >
              <Calendar className="mr-1 h-3 w-3" />
              Book New
            </Button>
          )}
          
          {activeTab === "upcoming" && (appointment.status === "confirmed" || appointment.status === "scheduled") && (
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => {
                toast.success("Video call link copied to clipboard");
                navigator.clipboard.writeText("https://meet.mediswift.io/appointment/" + appointment.id);
              }}
            >
              <Video className="mr-1 h-3 w-3" />
              Join
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }, [setSelectedAppointment, setIsDetailsOpen, handleCancelAppointment, activeTab, navigate]);

  // Render appointment row for list view
  const renderAppointmentRow = useCallback((appointment: Appointment) => {
    const appointmentDate = new Date(`${appointment.appointment_date}T${appointment.start_time}`);
    const formattedDate = format(appointmentDate, "MMM d, yyyy");
    const formattedTime = format(appointmentDate, "h:mm a");
    
    return (
      <TableRow key={appointment.id}>
        <TableCell>
          <div className="font-medium">{renderDoctorName(appointment.doctor)}</div>
          <div className="text-sm text-muted-foreground">{renderSpecialization(appointment.doctor)}</div>
        </TableCell>
        <TableCell>
          <div className="font-medium">{formattedDate}</div>
          <div className="text-sm text-muted-foreground">{formattedTime}</div>
        </TableCell>
        <TableCell className="max-w-[200px] truncate" title={appointment.reason}>
          {appointment.reason}
        </TableCell>
        <TableCell>
          <Badge 
            variant={
              appointment.status === "confirmed" ? "default" :
              appointment.status === "scheduled" ? "outline" :
              appointment.status === "completed" ? "secondary" :
              "destructive"
            }
          >
            {appointment.status.replace('_', ' ')}
          </Badge>
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedAppointment(appointment);
                    setIsDetailsOpen(true);
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {appointment.status !== "cancelled" && appointment.status !== "completed" && (
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleCancelAppointment(appointment)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel Appointment
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  }, [setSelectedAppointment, setIsDetailsOpen, handleCancelAppointment]);

  // Render loading skeleton for grid view
  const renderCardSkeleton = useCallback(() => {
    return Array(3).fill(0).map((_, index) => (
      <Card key={`skeleton-card-${index}`} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="mt-2">
              <Skeleton className="h-4 w-1/3 mb-1" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <div className="flex justify-between w-full">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </CardFooter>
      </Card>
    ));
  }, []);

  // Render loading skeleton for list view
  const renderTableSkeleton = useCallback(() => {
    return Array(5).fill(0).map((_, index) => (
      <TableRow key={`skeleton-row-${index}`}>
        <TableCell>
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-4 w-24" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-20 mb-1" />
          <Skeleton className="h-4 w-16" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[180px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-20" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-8 w-8 rounded-full" />
        </TableCell>
      </TableRow>
    ));
  }, []);

  // Render appointment list with proper loading states
  const renderAppointmentList = () => {
    try {
      // If we have filtered appointments, always show them regardless of loading state
      // This prevents blank screen issues when appointments are available
      if (filteredAppointments.length > 0) {
        // Render appointments based on view mode
        if (viewMode === "grid") {
          if (activeTab === "upcoming") {
            // Group appointments for upcoming tab
            let hasAnyAppointments = false;
            
            const groupedRender = (
              <>
                {Object.entries(groupedAppointments).map(([group, appointments]) => {
                  if (appointments.length === 0) return null;
                  
                  hasAnyAppointments = true;
                  const groupTitle = 
                    group === "today" ? "Today" :
                    group === "tomorrow" ? "Tomorrow" :
                    group === "thisWeek" ? "This Week" :
                    group === "thisMonth" ? "This Month" : "Future";
                  
                  return (
                    <div key={group} className="mb-6">
                      {renderSectionHeader(groupTitle, appointments.length)}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {appointments.map(appointment => {
                          try {
                            return renderAppointmentCard(appointment);
                          } catch (error) {
                            console.error("Error rendering appointment card:", error, appointment);
                            return (
                              <Card key={appointment.id || "error"} className="p-4 bg-red-50 border-red-200">
                                <CardContent>
                                  <p>Error rendering appointment</p>
                                  <p className="text-xs mt-2">ID: {appointment.id}</p>
                                </CardContent>
                              </Card>
                            );
                          }
                        })}
                      </div>
                    </div>
                  );
                })}
              </>
            );
            
            return hasAnyAppointments ? groupedRender : renderEmptyState();
          } else {
            // Simple list for past appointments
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAppointments.map(appointment => {
                  try {
                    return renderAppointmentCard(appointment);
                  } catch (error) {
                    console.error("Error rendering appointment card:", error, appointment);
                    return (
                      <Card key={appointment.id || "error"} className="p-4 bg-red-50 border-red-200">
                        <CardContent>
                          <p>Error rendering appointment</p>
                          <p className="text-xs mt-2">ID: {appointment.id}</p>
                        </CardContent>
                      </Card>
                    );
                  }
                })}
              </div>
            );
          }
        } else {
          // List view
          return (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map(appointment => {
                  try {
                    return renderAppointmentRow(appointment);
                  } catch (error) {
                    console.error("Error rendering appointment row:", error, appointment);
                    return (
                      <TableRow key={appointment.id || "error"}>
                        <TableCell colSpan={5} className="text-red-500">
                          Error rendering this appointment (ID: {appointment.id})
                        </TableCell>
                      </TableRow>
                    );
                  }
                })}
              </TableBody>
            </Table>
          );
        }
      }
      
      // Show skeleton while any loading state is active (only show if no appointments are available)
      if (pageState.initialLoading || isLoadingTransition || pageState.isRefreshing) {
        return viewMode === "grid" ? renderCardSkeleton() : renderTableSkeleton();
      }

      // Show empty state when there are no appointments
      if (filteredAppointments.length === 0) {
        return renderEmptyState();
      }
      
      // This is a fallback that should never be reached
      return renderEmptyState();
    } catch (error) {
      console.error("Error in renderAppointmentList:", error);
      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Rendering Appointments</AlertTitle>
          <AlertDescription>
            There was an error displaying your appointments. Please try refreshing the page.
            <div className="mt-2">
              <Button onClick={() => window.location.reload()} size="sm" variant="outline">
                Refresh Page
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }
  };

  // Render refresh button
  const renderRefreshButton = () => (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => refreshAppointments(true)}
      disabled={pageState.isRefreshing}
      className="ml-2 relative"
    >
      {pageState.isRefreshing ? (
        <>
          <span className="opacity-0">
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </span>
          <svg 
            className="animate-spin h-4 w-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="ml-2">Refreshing...</span>
        </>
      ) : (
        <>
          <svg
            className="h-4 w-4 mr-1"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </>
      )}
    </Button>
  );

  // Render error display with retry button
  const renderError = () => (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
        <div>
          <h3 className="text-sm font-medium text-red-800">Error loading appointments</h3>
          <p className="text-sm text-red-700 mt-1">{error || appointmentsError || "An unknown error occurred"}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 text-red-700 border-red-300 hover:bg-red-50"
            onClick={() => refreshAppointments(true)}
          >
            Retry
          </Button>
        </div>
      </div>
    </div>
  );

  // Listen for appointment booking events
  useEffect(() => {
    const handleAppointmentBooked = (event: any) => {
      if (event.detail?.appointment) {
        const newAppointment = event.detail.appointment;
        
        // Save as mock if needed
        if (event.detail.isMock) {
          const mockAppointment = saveMockAppointment(newAppointment);
          if (mockAppointment) {
            // Immediately update UI with new appointment (cast to ensure type safety)
            setAllAppointments(prev => [...prev, mockAppointment as Appointment]);
            
            // Show success message
            toast.success('Appointment booked successfully');
          }
        } else {
          // Refresh appointments to get the latest data
          refreshAppointments(false);
        }
      }
    };
    
    // Listen for the custom event
    window.addEventListener('appointmentBooked', handleAppointmentBooked);
    
    return () => {
      window.removeEventListener('appointmentBooked', handleAppointmentBooked);
    };
  }, [refreshAppointments]);

  // Add a direct method to book mock appointments for testing
  const addTestAppointmentAndReload = () => {
    setPageState(prev => ({
      ...prev,
      isRefreshing: true
    }));
    
    const testAppointment = forceAddTestAppointment();
    if (testAppointment) {
      // Add to current state without waiting for refresh
      setAllAppointments(prev => [...prev, testAppointment as Appointment]);
      toast.success('Test appointment added successfully');
      
      // Reset the refreshing state
      setTimeout(() => {
        setPageState(prev => ({
          ...prev,
          isRefreshing: false
        }));
      }, 500);
    } else {
      toast.error('Failed to add test appointment');
      setPageState(prev => ({
        ...prev,
        isRefreshing: false
      }));
    }
  };

  // Debug function to inspect appointments data
  const debugAppointmentsData = () => {
    // Show processing state
    setPageState(prev => ({
      ...prev,
      isRefreshing: true
    }));
    
    console.group('Appointments Debug Info');
    console.log('All appointments count:', allAppointments.length);
    
    // Check each appointment for doctor data issues
    allAppointments.forEach((apt, index) => {
      console.group(`Appointment #${index + 1} (ID: ${apt.id})`);
      console.log('Doctor data:', apt.doctor);
      console.log('Doctor name result:', getDoctorName(apt.doctor));
      console.log('Doctor loading state:', isDoctorLoading(apt.doctor));
      console.log('Full appointment:', apt);
      console.groupEnd();
    });
    
    console.log('Page state:', pageState);
    console.log('Raw mock appointments:', getMockAppointmentsFromStorage());
    console.groupEnd();
    
    // Reset processing state after a short delay
    setTimeout(() => {
      setPageState(prev => ({
        ...prev,
        isRefreshing: false
      }));
      toast.success('Debug data logged to console (F12)');
    }, 500);
  };

  // Debug log to track state
  useEffect(() => {
    console.log('Current appointments state:', allAppointments);
    console.log('Raw mock appointments in localStorage:', getMockAppointmentsFromStorage());
  }, [allAppointments]);

  // Function to force a complete refresh of the page data
  const forceRefresh = () => {
    console.log('Force refreshing appointments page...');
    
    // Set loading state
    setPageState({
      initialLoading: false, // Don't use initialLoading to prevent blank screen
      isDataLoaded: false,
      doctorsLoaded: false,
      isRefreshing: true,
      hasError: false
    });
    
    // Timeout to ensure UI updates
    setTimeout(() => {
      // Try to directly load appointments first
      directlyLoadAppointments();
      
      // Then load API appointments after a short delay
      setTimeout(() => {
        if (activeTab === "upcoming") {
          fetchUpcomingAppointments().catch(console.error);
        } else {
          fetchAppointments().catch(console.error);
        }
        
        // Load all appointments to combine API and localStorage data
        loadAllAppointments();
      }, 300);
    }, 100);
    
    toast.success('Force refreshing all appointment data...');
  };

  // Add this after the tabs but before the filters
  const renderAppointmentStats = () => {
    // Skip if we're still loading or no appointments
    if (pageState.initialLoading || allAppointments.length === 0) {
      return null;
    }

    // Calculate statistics
    const totalAppointments = allAppointments.length;
    const upcomingCount = allAppointments.filter(apt => {
      const appointmentDate = new Date(`${apt.appointment_date}T${apt.start_time}`);
      const isPast = appointmentDate < new Date() || 
                      apt.status === "completed" || 
                      apt.status === "cancelled" || 
                      apt.status === "no_show";
      return !isPast;
    }).length;
    
    const completedCount = allAppointments.filter(apt => apt.status === "completed").length;
    const cancelledCount = allAppointments.filter(apt => apt.status === "cancelled").length;
    
    // Get next appointment
    const nextAppointment = allAppointments
      .filter(apt => {
        const appointmentDate = new Date(`${apt.appointment_date}T${apt.start_time}`);
        return appointmentDate > new Date() && apt.status !== "cancelled";
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.appointment_date}T${a.start_time}`);
        const dateB = new Date(`${b.appointment_date}T${b.start_time}`);
        return dateA.getTime() - dateB.getTime();
      })[0];
    
    return (
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 pb-4 px-4">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Appointments</p>
              <p className="text-3xl font-bold">{totalAppointments}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 pb-4 px-4">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm text-muted-foreground mb-1">Upcoming</p>
              <p className="text-3xl font-bold">{upcomingCount}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 pb-4 px-4">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm text-muted-foreground mb-1">Completed</p>
              <p className="text-3xl font-bold">{completedCount}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 pb-4 px-4">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm text-muted-foreground mb-1">
                {nextAppointment ? "Next Appointment" : "Cancelled"}
              </p>
              {nextAppointment ? (
                <p className="text-sm font-medium">
                  {format(new Date(`${nextAppointment.appointment_date}T${nextAppointment.start_time}`), "MMM d, h:mm a")}
                </p>
              ) : (
                <p className="text-3xl font-bold">{cancelledCount}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to view your appointments</h1>
                      </div>
                    </div>
      </Layout>
    );
  }

  // Main render for loaded state
  return (
    <Layout>
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Header with title and refresh controls */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <h1 className="text-2xl font-bold mb-2 md:mb-0">My Appointments</h1>
            <div className="flex items-center space-x-2">
              {renderRefreshButton()}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4 mr-1" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={directlyLoadAppointments}>
                    <div className="flex items-center w-full">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Direct Load</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={addTestAppointmentAndReload}>
                    <div className="flex items-center w-full">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>Add Test Appointment</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={debugAppointmentsData}>
                    <div className="flex items-center w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Debug Data</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={forceRefresh}>
                    <div className="flex items-center w-full">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      <span>Force Refresh</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/book-appointment")}>
                    <div className="flex items-center w-full">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Book New Appointment</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        {/* Tabs for upcoming vs past appointments */}
        <div className="border-b mb-6">
          <div className="flex space-x-6">
            <button 
              className={`pb-2 px-1 font-medium text-sm transition-colors relative ${activeTab === "upcoming" 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming Appointments
            </button>
            <button 
              className={`pb-2 px-1 font-medium text-sm transition-colors relative ${activeTab === "past" 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab("past")}
            >
              Past Appointments
            </button>
          </div>
        </div>
        
        {/* Add this after the tabs but before the filters */}
        {renderAppointmentStats()}
        
        {/* Filtering and search controls */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-2">
          <div className="flex items-center space-x-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                  {filterStatus !== "all" && (
                    <Badge variant="secondary" className="ml-2 h-5 rounded-sm">
                      1
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                  <div className="flex items-center w-full">
                    <span className="mr-2">{filterStatus === "all" && <Check className="h-4 w-4" />}</span>
                    <span>All Statuses</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("scheduled")}>
                  <div className="flex items-center w-full">
                    <span className="mr-2">{filterStatus === "scheduled" && <Check className="h-4 w-4" />}</span>
                    <span>Scheduled</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("confirmed")}>
                  <div className="flex items-center w-full">
                    <span className="mr-2">{filterStatus === "confirmed" && <Check className="h-4 w-4" />}</span>
                    <span>Confirmed</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("completed")}>
                  <div className="flex items-center w-full">
                    <span className="mr-2">{filterStatus === "completed" && <Check className="h-4 w-4" />}</span>
                    <span>Completed</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("cancelled")}>
                  <div className="flex items-center w-full">
                    <span className="mr-2">{filterStatus === "cancelled" && <Check className="h-4 w-4" />}</span>
                    <span>Cancelled</span>
                  </div>
                </DropdownMenuItem>
                {filterStatus !== "all" && (
                  <>
                    <Separator className="my-1" />
                    <DropdownMenuItem onClick={clearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      <span>Clear Filters</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ChevronDown className="h-4 w-4 mr-1" />
                  {sortOrder === "newest" ? "Soonest First" : "Latest First"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortOrder("newest")}>
                  <div className="flex items-center w-full">
                    <span className="mr-2">{sortOrder === "newest" && <Check className="h-4 w-4" />}</span>
                    <span>Soonest First</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
                  <div className="flex items-center w-full">
                    <span className="mr-2">{sortOrder === "oldest" && <Check className="h-4 w-4" />}</span>
                    <span>Latest First</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-primary/10" : ""}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-primary/10" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button 
              variant="default"
              size="sm"
              onClick={() => navigate("/book-appointment")}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Book Appointment
            </Button>
          </div>
        </div>
        
        {/* Add debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-gray-50 rounded text-xs">
            <details>
              <summary className="cursor-pointer font-semibold">Debug Info</summary>
              <div className="mt-2 overflow-auto max-h-40">
                <p>Appointments in state: {allAppointments.length}</p>
                <p>Filtered appointments: {filteredAppointments.length}</p>
                <p>Mock appointments in storage: {getMockAppointmentsFromStorage().length}</p>
                <p>Page state: {JSON.stringify(pageState)}</p>
                <p>Active filters: {filterStatus !== "all" ? filterStatus : "none"}</p>
                <p>Search query: {searchQuery || "none"}</p>
                <div className="mt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs h-6 bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                    onClick={() => {
                      // Reset pageState to default
                      setPageState({
                        initialLoading: false,
                        isDataLoaded: true,
                        doctorsLoaded: true,
                        isRefreshing: false,
                        hasError: false
                      });
                      toast.success('Page state reset');
                    }}
                  >
                    Reset Page State
                  </Button>
                </div>
              </div>
            </details>
          </div>
        )}
        
        {/* Show error message if any */}
        {(error || appointmentsError || pageState.hasError) && renderError()}
        
        {/* If both API and localStorage failed, show manual button to try direct load */}
        {allAppointments.length === 0 && !pageState.initialLoading && !pageState.isRefreshing && (
          <Alert className="mb-4">
            <AlertTitle>No appointments could be loaded</AlertTitle>
            <AlertDescription>
              <p className="mb-2">We couldn't load your appointments. You can try the following:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button size="sm" onClick={directlyLoadAppointments}>
                  Load from Local Storage
                </Button>
                <Button size="sm" onClick={addTestAppointmentAndReload}>
                  Add Test Appointment
                </Button>
                <Button size="sm" onClick={() => refreshAppointments(true)}>
                  Retry API Loading
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Try to render appointment list */}
        {renderAppointmentList()}
      </div>

      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <Dialog open={isDetailsOpen} onOpenChange={(isOpen) => {
          setIsDetailsOpen(isOpen);
          if (!isOpen) {
            // Reset selected appointment when dialog closes
            setTimeout(() => setSelectedAppointment(null), 300);
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <span className="mr-2">Appointment Details</span>
                {renderStatusBadge(selectedAppointment.status)}
              </DialogTitle>
              <DialogDescription>
                {selectedAppointment.appointment_date && format(parseISO(selectedAppointment.appointment_date), "EEEE, MMMM d, yyyy")}
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-5 p-1">
                {/* Doctor Information */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {typeof selectedAppointment.doctor === 'object' && selectedAppointment.doctor.user 
                        ? `${selectedAppointment.doctor.user.first_name?.[0] || ''}${selectedAppointment.doctor.user.last_name?.[0] || ''}`
                        : 'DR'}
                    </AvatarFallback>
                    {typeof selectedAppointment.doctor === 'object' && 
                     selectedAppointment.doctor.profile_image && (
                      <AvatarImage src={selectedAppointment.doctor.profile_image} alt="Doctor" />
                    )}
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{renderDoctorName(selectedAppointment.doctor)}</h3>
                    <p className="text-gray-500">{renderSpecialization(selectedAppointment.doctor)}</p>
                  </div>
                </div>
                
                <Separator />
                
                {/* Appointment Information */}
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="mr-2 h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Date & Time</span>
                      </div>
                      <div className="pl-6">
                        <p className="text-sm">
                          {format(parseISO(selectedAppointment.appointment_date), "EEEE, MMMM d, yyyy")}
                        </p>
                        <p className="text-sm">
                          {format(parseISO(`2000-01-01T${selectedAppointment.start_time}`), "h:mm a")} - 
                          {format(parseISO(`2000-01-01T${selectedAppointment.end_time}`), "h:mm a")}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="mr-2 h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Reason for Visit</span>
                      </div>
                      <p className="text-sm pl-6">{selectedAppointment.reason}</p>
                    </div>

                    {selectedAppointment.notes && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="mr-2 h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Additional Notes</span>
                        </div>
                        <p className="text-sm pl-6">{selectedAppointment.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Contact Information */}
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="mr-2 h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Contact</span>
                      </div>
                      <p className="text-sm pl-6">
                        {selectedAppointment.doctor && 
                         typeof selectedAppointment.doctor === 'object' && 
                         selectedAppointment.doctor.phone_number
                          ? selectedAppointment.doctor.phone_number
                          : "Phone number not available"}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="mr-2 h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Location</span>
                      </div>
                      <p className="text-sm pl-6">
                        {selectedAppointment.doctor && 
                         typeof selectedAppointment.doctor === 'object' && 
                         selectedAppointment.doctor.address
                          ? selectedAppointment.doctor.address
                          : "Address not available"}
                      </p>
                    </div>

                    {(activeTab === "upcoming" || selectedAppointment.status === "confirmed") && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Video className="mr-2 h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Online Consultation</span>
                        </div>
                        <div className="pl-6">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="mt-1"
                            onClick={() => {
                              toast.success("Video call link copied to clipboard");
                              navigator.clipboard.writeText("https://meet.mediswift.io/appointment/" + selectedAppointment.id);
                            }}
                          >
                            <Video className="mr-2 h-3 w-3" />
                            Copy Video Link
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Appointment Tracking */}
                <div className="text-xs text-gray-500">
                  <p>Appointment Created: {format(parseISO(selectedAppointment.created_at), "MMMM d, yyyy 'at' h:mm a")}</p>
                  {selectedAppointment.updated_at !== selectedAppointment.created_at && (
                    <p>Last Updated: {format(parseISO(selectedAppointment.updated_at), "MMMM d, yyyy 'at' h:mm a")}</p>
                  )}
                </div>
              </div>
            </ScrollArea>
            
            {activeTab === "upcoming" && selectedAppointment.status !== "cancelled" && (
              <div className="flex space-x-2 pt-2 mt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleReschedule(selectedAppointment.id!);
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Reschedule
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleCancelAppointment(selectedAppointment);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Appointment Cancellation Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your appointment
              {selectedAppointment && ` with ${getDoctorName(selectedAppointment.doctor)}`}?
              <br /><br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancelAppointment}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? 'Cancelling...' : 'Yes, Cancel Appointment'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default MyAppointments;