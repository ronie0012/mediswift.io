import { useState, useEffect, useMemo, useCallback, useTransition } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppointments, Appointment } from "@/context/AppointmentContext";
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
  Calendar as CalendarIcon
} from "lucide-react";
import { format, isAfter, isBefore, parseISO } from "date-fns";
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

// Define AppointmentStatus type since it's not exported from AppointmentContext
type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

// Helper function to get doctor name consistently
const getDoctorName = (doctor: any): string => {
  if (!doctor) return "Unknown Doctor";
  
  if (doctor.name) {
    return doctor.name;
  }
  
  if (doctor.user) {
    return `Dr. ${doctor.user.first_name} ${doctor.user.last_name}`;
  }
  
  if (typeof doctor === "number") {
    return `Doctor #${doctor}`;
  }
  
  return "Unknown Doctor";
};

// Helper function to get doctor specialty consistently
const getDoctorSpecialty = (doctor: any): string => {
  if (!doctor) return "Specialty unknown";
  
  if (doctor.specialty) {
    return doctor.specialty;
  }
  
  if (doctor.specialization && doctor.specialization.name) {
    return doctor.specialization.name;
  }
  
  return "Specialty unknown";
};

// Helper function to render specialization
const renderSpecialization = (doctor: any) => {
  if (!doctor) {
    return <Skeleton className="h-4 w-24" />;
  }
  
  // Handle case where doctor is just an ID
  if (typeof doctor === 'number') {
    return <Skeleton className="h-4 w-24" />;
  }
  
  // Check if doctor has a valid specialization object with name
  if (doctor.specialization && 
      typeof doctor.specialization === 'object' && 
      doctor.specialization.name) {
    // Check if we have a loading placeholder
    if (doctor.specialization.name === "Loading...") {
      return <Skeleton className="h-4 w-24" />;
    }
    return doctor.specialization.name;
  }
  
  // If doctor has a direct specialization property
  if (typeof doctor.specialization === 'string') {
    return doctor.specialization;
  }
  
  return <Skeleton className="h-4 w-24" />;
};

const MyAppointments = () => {
  const { user } = useAuth();
  const { appointments, isLoading, error, fetchAppointments, fetchUpcomingAppointments, cancelAppointment } = useAppointments();
  const navigate = useNavigate();
  
  // Use useTransition to prevent UI blocking during updates
  const [isPending, startTransition] = useTransition();
  
  // UI state
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [filterStatus, setFilterStatus] = useState<"all" | AppointmentStatus>("all");
  
  // Dialog state
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [isCancelling, setIsCancelling] = useState(false);

  // Get appointments when the component mounts or when user changes
  useEffect(() => {
    if (user) {
      fetchAppointments();
      
      // Also get any mock appointments from localStorage
      try {
        const mockAppointments = JSON.parse(localStorage.getItem('mockAppointments') || '[]');
        if (mockAppointments.length > 0) {
          console.log("Found mock appointments:", mockAppointments);
          // Combine API appointments with mock appointments
          setAllAppointments(prevAppointments => [...appointments, ...mockAppointments]);
        } else {
          setAllAppointments(appointments);
        }
      } catch (error) {
        console.error("Error loading mock appointments:", error);
        setAllAppointments(appointments);
      }
    }
  }, [user, appointments]);

  // Change tab with transition
  const handleTabChange = (tab: "upcoming" | "past") => {
    if (tab !== activeTab) {
      startTransition(() => {
        setActiveTab(tab);
      });
    }
  };

  // Filter and sort appointments based on search, filter, and activeTab
  const filteredAppointments = useMemo(() => {
    return allAppointments
      .filter(appointment => {
        // First filter by tab (upcoming/past)
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
        
        // Then filter by status if needed
        if (filterStatus !== "all" && appointment.status !== filterStatus) {
          return false;
        }
        
        // Finally filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const doctorName = getDoctorName(appointment.doctor);
          
          return (
            doctorName.toLowerCase().includes(query) ||
            appointment.reason.toLowerCase().includes(query) ||
            appointment.appointment_date.includes(query)
          );
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort by appointment date and time
        const dateA = new Date(`${a.appointment_date}T${a.start_time}`);
        const dateB = new Date(`${b.appointment_date}T${b.start_time}`);
        
        if (activeTab === "upcoming") {
          // For upcoming, sort by closest first
          return dateA.getTime() - dateB.getTime();
        } else {
          // For past, sort by most recent first
          return dateB.getTime() - dateA.getTime();
        }
      });
  }, [allAppointments, activeTab, filterStatus, searchQuery]);

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointment: Appointment) => {
    if (window.confirm(`Are you sure you want to cancel your appointment with ${getDoctorName(appointment.doctor)}?`)) {
      setIsCancelling(true);
      try {
        // Check if it's a mock appointment from localStorage
        if (appointment.id > 1000000) { // Assuming mock IDs are large numbers (from Date.now())
          const mockAppointments = JSON.parse(localStorage.getItem('mockAppointments') || '[]');
          const updatedMockAppointments = mockAppointments.map((apt: Appointment) => 
            apt.id === appointment.id ? { ...apt, status: 'cancelled' as const } : apt
          );
          localStorage.setItem('mockAppointments', JSON.stringify(updatedMockAppointments));
          
          // Update the local state
          setAllAppointments(prev => 
            prev.map(apt => apt.id === appointment.id ? { ...apt, status: 'cancelled' as const } : apt)
          );
          
          toast.success('Appointment cancelled successfully');
        } else {
          // Real API appointment
          await cancelAppointment(appointment.id);
          
          // Update all appointments state after cancellation
          setAllAppointments(prev => 
            prev.map(apt => apt.id === appointment.id ? { ...apt, status: 'cancelled' as const } : apt)
          );
        }
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        toast.error('Failed to cancel appointment');
      } finally {
        setIsCancelling(false);
      }
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
      <div key={`skeleton-${index}`} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
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
      </div>
    ));
  };

  // Render empty state
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Calendar className="h-16 w-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-1">No appointments found</h3>
      <p className="text-sm text-gray-500 mb-6">
        {activeTab === "upcoming" 
          ? "You don't have any upcoming appointments scheduled." 
          : "You don't have any past appointments."}
      </p>
      {activeTab === "upcoming" && (
        <Button onClick={() => navigate("/doctors")}>
          Book an Appointment
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

  return (
    <Layout>
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">My Appointments</h1>
          <Button onClick={() => navigate("/doctors")} className="w-full md:w-auto">
            Book New Appointment
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "upcoming"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => handleTabChange("upcoming")}
            disabled={isPending}
          >
            Upcoming
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "past"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => handleTabChange("past")}
            disabled={isPending}
          >
            Past
          </button>
        </div>

        {/* Search and filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                    All Statuses
                    {filterStatus === "all" && <Check className="h-4 w-4 ml-2" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("scheduled")}>
                    Scheduled
                    {filterStatus === "scheduled" && <Check className="h-4 w-4 ml-2" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("confirmed")}>
                    Confirmed
                    {filterStatus === "confirmed" && <Check className="h-4 w-4 ml-2" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("completed")}>
                    Completed
                    {filterStatus === "completed" && <Check className="h-4 w-4 ml-2" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("cancelled")}>
                    Cancelled
                    {filterStatus === "cancelled" && <Check className="h-4 w-4 ml-2" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("no_show")}>
                    No Show
                    {filterStatus === "no_show" && <Check className="h-4 w-4 ml-2" />}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  Sort
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setSortOrder("newest")}>
                    Newest First
                    {sortOrder === "newest" && <Check className="h-4 w-4 ml-2" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
                    Oldest First
                    {sortOrder === "oldest" && <Check className="h-4 w-4 ml-2" />}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {(filterStatus !== "all" || searchQuery !== "" || sortOrder !== "newest") && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={clearFilters}
                title="Clear filters"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Loading state */}
        {(isLoading || isPending) && renderAppointmentSkeleton()}

        {/* Error state */}
        {error && !isLoading && !isPending && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
            <p>{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isPending && !error && filteredAppointments.length === 0 && renderEmptyState()}

        {/* Appointments list */}
        {!isLoading && !isPending && !error && filteredAppointments.length > 0 && (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{getDoctorName(appointment.doctor)}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {getDoctorSpecialty(appointment.doctor)}
                      </p>
                    </div>
                    {renderStatusBadge(appointment.status)}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {format(parseISO(appointment.appointment_date), "EEEE, MMMM d, yyyy")}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {format(parseISO(`2000-01-01T${appointment.start_time}`), "h:mm a")} - 
                      {format(parseISO(`2000-01-01T${appointment.end_time}`), "h:mm a")}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap justify-end gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(appointment)}
                    >
                      View Details
                    </Button>
                    
                    {activeTab === "upcoming" && appointment.status !== "cancelled" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReschedule(appointment.id)}
                        >
                          Reschedule
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelAppointment(appointment)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>
                View your appointment information
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 p-1">
                <div>
                  <h3 className="font-semibold text-lg">{getDoctorName(selectedAppointment.doctor)}</h3>
                  <p className="text-gray-500">{getDoctorSpecialty(selectedAppointment.doctor)}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  {renderStatusBadge(selectedAppointment.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-y-3">
                  <div className="col-span-2">
                    <span className="text-sm font-medium">Date & Time:</span>
                    <div className="flex items-center mt-1 space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {format(parseISO(selectedAppointment.appointment_date), "EEEE, MMMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center mt-1 space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {format(parseISO(`2000-01-01T${selectedAppointment.start_time}`), "h:mm a")} - 
                        {format(parseISO(`2000-01-01T${selectedAppointment.end_time}`), "h:mm a")}
                      </span>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <span className="text-sm font-medium">Reason for Visit:</span>
                    <p className="text-sm mt-1">{selectedAppointment.reason}</p>
                  </div>
                  
                  {selectedAppointment.notes && (
                    <div className="col-span-2">
                      <span className="text-sm font-medium">Additional Notes:</span>
                      <p className="text-sm mt-1">{selectedAppointment.notes}</p>
                    </div>
                  )}
                  
                  <div className="col-span-2">
                    <span className="text-sm font-medium">Contact:</span>
                    <div className="flex items-center mt-1 space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {selectedAppointment.doctor && 
                         typeof selectedAppointment.doctor === 'object' && 
                         selectedAppointment.doctor.phone_number
                          ? selectedAppointment.doctor.phone_number
                          : "Phone number not available"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <span className="text-sm font-medium">Location:</span>
                    <div className="flex items-start mt-1 space-x-2">
                      <div className="mt-0.5">
                        <MapPin className="h-4 w-4 text-gray-400" />
                      </div>
                      <span className="text-sm">
                        {selectedAppointment.doctor && 
                         typeof selectedAppointment.doctor === 'object' && 
                         selectedAppointment.doctor.address
                          ? selectedAppointment.doctor.address
                          : "Address not available"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <span className="text-sm font-medium">Appointment Created:</span>
                    <p className="text-sm mt-1">
                      {format(parseISO(selectedAppointment.created_at), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  
                  {selectedAppointment.updated_at !== selectedAppointment.created_at && (
                    <div className="col-span-2">
                      <span className="text-sm font-medium">Last Updated:</span>
                      <p className="text-sm mt-1">
                        {format(parseISO(selectedAppointment.updated_at), "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  )}
                </div>
                
                {activeTab === "upcoming" && selectedAppointment.status !== "cancelled" && (
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setIsDetailsOpen(false);
                        handleReschedule(selectedAppointment.id!);
                      }}
                    >
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
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
};

export default MyAppointments;