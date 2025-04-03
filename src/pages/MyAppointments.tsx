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
  Calendar as CalendarIcon,
  LayoutGrid,
  List
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

// Helper function to render doctor name with proper loading state
const renderDoctorName = (doctor: any) => {
  if (!doctor) {
    return <Skeleton className="h-5 w-32" />;
  }
  
  // Handle case where doctor is just an ID
  if (typeof doctor === 'number') {
    return <Skeleton className="h-5 w-32" />;
  }
  
  // Check if doctor has loading placeholder
  if (doctor.user && doctor.user.first_name === "Loading") {
    return <Skeleton className="h-5 w-32" />;
  }
  
  return getDoctorName(doctor);
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
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  
  // Dialog state
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelAppointmentId, setCancelAppointmentId] = useState<number | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Get appointments when the component mounts or when user changes
  useEffect(() => {
    if (user) {
      fetchAppointments();
      
      // Also get any mock appointments from localStorage
      try {
        const mockAppointments = JSON.parse(localStorage.getItem('mockAppointments') || '[]');
        if (mockAppointments.length > 0) {
          console.log("Found mock appointments:", mockAppointments);
          // Combine API appointments with mock appointments in a stable way
          setAllAppointments(prevAppointments => {
            // Only update if we have new appointments to prevent unnecessary re-renders
            if (prevAppointments.length === 0) {
              return [...appointments, ...mockAppointments];
            }
            return prevAppointments;
          });
        } else {
          setAllAppointments(appointments);
        }
      } catch (error) {
        console.error("Error loading mock appointments:", error);
        setAllAppointments(appointments);
      }
    }
  }, [user]);

  // Update allAppointments when appointments change
  useEffect(() => {
    if (appointments.length > 0) {
      setAllAppointments(prevAppointments => {
        // Get mock appointments
        const mockAppointments = prevAppointments.filter(apt => apt.id > 1000000);
        return [...appointments, ...mockAppointments];
      });
    }
  }, [appointments]);
  
  // Change tab with transition
  const handleTabChange = (tab: "upcoming" | "past") => {
    if (tab !== activeTab) {
      startTransition(() => {
        setActiveTab(tab);
      });
    }
  };

  // Enhanced filter and sort appointments
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
      });
  }, [allAppointments, activeTab, filterStatus, searchQuery, sortOrder]);

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
      // Find the appointment to cancel
      const appointmentToCancel = allAppointments.find(apt => apt.id === cancelAppointmentId);
      
      if (!appointmentToCancel) {
        throw new Error("Appointment not found");
      }
      
      // Check if it's a mock appointment from localStorage
      if (appointmentToCancel.id > 1000000) { // Assuming mock IDs are large numbers (from Date.now())
        const mockAppointments = JSON.parse(localStorage.getItem('mockAppointments') || '[]');
        const updatedMockAppointments = mockAppointments.map((apt: Appointment) => 
          apt.id === appointmentToCancel.id ? { ...apt, status: 'cancelled' as const } : apt
        );
        localStorage.setItem('mockAppointments', JSON.stringify(updatedMockAppointments));
        
        // Update the local state
        setAllAppointments(prev => 
          prev.map(apt => apt.id === appointmentToCancel.id ? { ...apt, status: 'cancelled' as const } : apt)
        );
        
        toast.success('Appointment cancelled successfully');
      } else {
        // Real API appointment
        await cancelAppointment(appointmentToCancel.id);
        
        // Update all appointments state after cancellation
        setAllAppointments(prev => 
          prev.map(apt => apt.id === appointmentToCancel.id ? { ...apt, status: 'cancelled' as const } : apt)
        );
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
    <Card className="w-full py-10">
      <CardContent className="flex flex-col items-center justify-center text-center p-6">
        <div className="rounded-full bg-primary/10 p-3 mb-4">
          <Calendar className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No appointments found</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-md">
          {activeTab === "upcoming" 
            ? "You don't have any upcoming appointments scheduled. Book a new appointment to get started." 
            : "You don't have any past appointments yet. Once you complete an appointment, it will appear here."}
        </p>
        {activeTab === "upcoming" && (
          <Button onClick={() => navigate("/doctors")} className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Book an Appointment
          </Button>
        )}
      </CardContent>
    </Card>
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
        {/* Header with statistics */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">My Appointments</h1>
            <Button onClick={() => navigate("/doctors")} className="w-full md:w-auto flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Book New Appointment
            </Button>
          </div>

          {/* Appointment Stats */}
          {!isLoading && !error && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <Card>
                <CardContent className="pt-6 pb-4 px-4">
                  <div className="flex flex-col items-center text-center">
                    <p className="text-sm font-medium text-gray-500">Total</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {allAppointments.length}
                    </h3>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 pb-4 px-4">
                  <div className="flex flex-col items-center text-center">
                    <p className="text-sm font-medium text-gray-500">Upcoming</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {allAppointments.filter(a => a.status !== 'cancelled' && a.status !== 'completed' && a.status !== 'no_show').length}
                    </h3>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 pb-4 px-4">
                  <div className="flex flex-col items-center text-center">
                    <p className="text-sm font-medium text-gray-500">Completed</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {allAppointments.filter(a => a.status === 'completed').length}
                    </h3>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 pb-4 px-4">
                  <div className="flex flex-col items-center text-center">
                    <p className="text-sm font-medium text-gray-500">Cancelled</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {allAppointments.filter(a => a.status === 'cancelled').length}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Tabs with view toggle */}
        <div className="flex justify-between items-center border-b mb-6">
          <div className="flex">
            <button
              className={`px-6 py-3 font-medium text-sm border-b-2 ${
                activeTab === "upcoming"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => handleTabChange("upcoming")}
              disabled={isPending}
            >
              Upcoming
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm border-b-2 ${
                activeTab === "past"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => handleTabChange("past")}
              disabled={isPending}
            >
              Past
            </button>
          </div>
          
          {/* View toggle */}
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="rounded-none px-3"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="rounded-none px-3"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by doctor, reason, or date..."
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
                      {filterStatus === "all" ? "All Statuses" : 
                        filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1).replace('_', ' ')}
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
          </CardContent>
        </Card>

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

        {/* Appointments list - with grouping for upcoming */}
        {!isLoading && !isPending && !error && filteredAppointments.length > 0 && activeTab === "upcoming" && (
          <div className="space-y-4">
            {/* Today's appointments */}
            {renderSectionHeader("Today", groupedAppointments.today.length)}
            {groupedAppointments.today.length > 0 && (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                {groupedAppointments.today.map((appointment) => (
                  <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="hidden sm:flex h-10 w-10">
                            <AvatarFallback>
                              {typeof appointment.doctor === 'object' && appointment.doctor.user ? 
                                `${appointment.doctor.user.first_name[0]}${appointment.doctor.user.last_name[0]}` : 
                                "DR"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{renderDoctorName(appointment.doctor)}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {renderSpecialization(appointment.doctor)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2">
                          {renderStatusBadge(appointment.status)}
                          <div className="ml-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(appointment)}>
                                  View Details
                                </DropdownMenuItem>
                                {activeTab === "upcoming" && appointment.status !== "cancelled" && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleReschedule(appointment.id)}>
                                      Reschedule
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-red-500"
                                      onClick={() => handleCancelAppointment(appointment)}
                                    >
                                      Cancel
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        <div className="flex items-center space-x-2">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm">
                            {format(parseISO(appointment.appointment_date), "EEEE, MMMM d, yyyy")}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm">
                            {format(parseISO(`2000-01-01T${appointment.start_time}`), "h:mm a")} - 
                            {format(parseISO(`2000-01-01T${appointment.end_time}`), "h:mm a")}
                          </span>
                        </div>

                        {appointment.reason && (
                          <div className="flex items-center space-x-2 md:col-span-2">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm truncate max-w-xs">
                              {appointment.reason}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex mt-4 space-x-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(appointment)}
                          className="sm:hidden"
                        >
                          View Details
                        </Button>
                        
                        {activeTab === "upcoming" && appointment.status !== "cancelled" && (
                          <div className="sm:hidden flex space-x-2">
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
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Tomorrow's appointments */}
            {renderSectionHeader("Tomorrow", groupedAppointments.tomorrow.length)}
            {groupedAppointments.tomorrow.length > 0 && (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                {groupedAppointments.tomorrow.map((appointment) => (
                  <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="hidden sm:flex h-10 w-10">
                            <AvatarFallback>
                              {typeof appointment.doctor === 'object' && appointment.doctor.user ? 
                                `${appointment.doctor.user.first_name[0]}${appointment.doctor.user.last_name[0]}` : 
                                "DR"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{renderDoctorName(appointment.doctor)}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {renderSpecialization(appointment.doctor)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2">
                          {renderStatusBadge(appointment.status)}
                          <div className="ml-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(appointment)}>
                                  View Details
                                </DropdownMenuItem>
                                {activeTab === "upcoming" && appointment.status !== "cancelled" && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleReschedule(appointment.id)}>
                                      Reschedule
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-red-500"
                                      onClick={() => handleCancelAppointment(appointment)}
                                    >
                                      Cancel
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        <div className="flex items-center space-x-2">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm">
                            {format(parseISO(appointment.appointment_date), "EEEE, MMMM d, yyyy")}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm">
                            {format(parseISO(`2000-01-01T${appointment.start_time}`), "h:mm a")} - 
                            {format(parseISO(`2000-01-01T${appointment.end_time}`), "h:mm a")}
                          </span>
                        </div>

                        {appointment.reason && (
                          <div className="flex items-center space-x-2 md:col-span-2">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm truncate max-w-xs">
                              {appointment.reason}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex mt-4 space-x-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(appointment)}
                          className="sm:hidden"
                        >
                          View Details
                        </Button>
                        
                        {activeTab === "upcoming" && appointment.status !== "cancelled" && (
                          <div className="sm:hidden flex space-x-2">
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
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {/* This week's appointments */}
            {renderSectionHeader("This Week", groupedAppointments.thisWeek.length)}
            {groupedAppointments.thisWeek.length > 0 && (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                {groupedAppointments.thisWeek.map((appointment) => (
                  <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="hidden sm:flex h-10 w-10">
                            <AvatarFallback>
                              {typeof appointment.doctor === 'object' && appointment.doctor.user ? 
                                `${appointment.doctor.user.first_name[0]}${appointment.doctor.user.last_name[0]}` : 
                                "DR"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{renderDoctorName(appointment.doctor)}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {renderSpecialization(appointment.doctor)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2">
                          {renderStatusBadge(appointment.status)}
                          <div className="ml-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(appointment)}>
                                  View Details
                                </DropdownMenuItem>
                                {activeTab === "upcoming" && appointment.status !== "cancelled" && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleReschedule(appointment.id)}>
                                      Reschedule
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-red-500"
                                      onClick={() => handleCancelAppointment(appointment)}
                                    >
                                      Cancel
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        <div className="flex items-center space-x-2">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm">
                            {format(parseISO(appointment.appointment_date), "EEEE, MMMM d, yyyy")}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm">
                            {format(parseISO(`2000-01-01T${appointment.start_time}`), "h:mm a")} - 
                            {format(parseISO(`2000-01-01T${appointment.end_time}`), "h:mm a")}
                          </span>
                        </div>

                        {appointment.reason && (
                          <div className="flex items-center space-x-2 md:col-span-2">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm truncate max-w-xs">
                              {appointment.reason}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex mt-4 space-x-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(appointment)}
                          className="sm:hidden"
                        >
                          View Details
                        </Button>
                        
                        {activeTab === "upcoming" && appointment.status !== "cancelled" && (
                          <div className="sm:hidden flex space-x-2">
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
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {/* This month's appointments */}
            {renderSectionHeader("This Month", groupedAppointments.thisMonth.length)}
            {groupedAppointments.thisMonth.length > 0 && (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                {groupedAppointments.thisMonth.map((appointment) => (
                  <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="hidden sm:flex h-10 w-10">
                            <AvatarFallback>
                              {typeof appointment.doctor === 'object' && appointment.doctor.user ? 
                                `${appointment.doctor.user.first_name[0]}${appointment.doctor.user.last_name[0]}` : 
                                "DR"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{renderDoctorName(appointment.doctor)}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {renderSpecialization(appointment.doctor)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2">
                          {renderStatusBadge(appointment.status)}
                          <div className="ml-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(appointment)}>
                                  View Details
                                </DropdownMenuItem>
                                {activeTab === "upcoming" && appointment.status !== "cancelled" && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleReschedule(appointment.id)}>
                                      Reschedule
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-red-500"
                                      onClick={() => handleCancelAppointment(appointment)}
                                    >
                                      Cancel
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        <div className="flex items-center space-x-2">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm">
                            {format(parseISO(appointment.appointment_date), "EEEE, MMMM d, yyyy")}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm">
                            {format(parseISO(`2000-01-01T${appointment.start_time}`), "h:mm a")} - 
                            {format(parseISO(`2000-01-01T${appointment.end_time}`), "h:mm a")}
                          </span>
                        </div>

                        {appointment.reason && (
                          <div className="flex items-center space-x-2 md:col-span-2">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm truncate max-w-xs">
                              {appointment.reason}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex mt-4 space-x-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(appointment)}
                          className="sm:hidden"
                        >
                          View Details
                        </Button>
                        
                        {activeTab === "upcoming" && appointment.status !== "cancelled" && (
                          <div className="sm:hidden flex space-x-2">
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
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Future appointments */}
            {renderSectionHeader("Later", groupedAppointments.future.length)}
            {groupedAppointments.future.length > 0 && (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                {groupedAppointments.future.map((appointment) => (
                  <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="hidden sm:flex h-10 w-10">
                            <AvatarFallback>
                              {typeof appointment.doctor === 'object' && appointment.doctor.user ? 
                                `${appointment.doctor.user.first_name[0]}${appointment.doctor.user.last_name[0]}` : 
                                "DR"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{renderDoctorName(appointment.doctor)}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {renderSpecialization(appointment.doctor)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2">
                          {renderStatusBadge(appointment.status)}
                          <div className="ml-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(appointment)}>
                                  View Details
                                </DropdownMenuItem>
                                {activeTab === "upcoming" && appointment.status !== "cancelled" && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleReschedule(appointment.id)}>
                                      Reschedule
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-red-500"
                                      onClick={() => handleCancelAppointment(appointment)}
                                    >
                                      Cancel
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        <div className="flex items-center space-x-2">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm">
                            {format(parseISO(appointment.appointment_date), "EEEE, MMMM d, yyyy")}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm">
                            {format(parseISO(`2000-01-01T${appointment.start_time}`), "h:mm a")} - 
                            {format(parseISO(`2000-01-01T${appointment.end_time}`), "h:mm a")}
                          </span>
                        </div>

                        {appointment.reason && (
                          <div className="flex items-center space-x-2 md:col-span-2">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm truncate max-w-xs">
                              {appointment.reason}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex mt-4 space-x-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(appointment)}
                          className="sm:hidden"
                        >
                          View Details
                        </Button>
                        
                        {activeTab === "upcoming" && appointment.status !== "cancelled" && (
                          <div className="sm:hidden flex space-x-2">
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
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Past appointments - simple list without grouping */}
        {!isLoading && !isPending && !error && filteredAppointments.length > 0 && activeTab === "past" && (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
            {filteredAppointments.map((appointment) => (
              <Card 
                key={appointment.id} 
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="hidden sm:flex h-10 w-10">
                        <AvatarFallback>
                          {typeof appointment.doctor === 'object' && appointment.doctor.user ? 
                            `${appointment.doctor.user.first_name[0]}${appointment.doctor.user.last_name[0]}` : 
                            "DR"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{renderDoctorName(appointment.doctor)}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {renderSpecialization(appointment.doctor)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2">
                      {renderStatusBadge(appointment.status)}
                      <div className="ml-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(appointment)}>
                              View Details
                            </DropdownMenuItem>
                            {activeTab === "upcoming" && appointment.status !== "cancelled" && (
                              <>
                                <DropdownMenuItem onClick={() => handleReschedule(appointment.id)}>
                                  Reschedule
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-500"
                                  onClick={() => handleCancelAppointment(appointment)}
                                >
                                  Cancel
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <div className="flex items-center space-x-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">
                        {format(parseISO(appointment.appointment_date), "EEEE, MMMM d, yyyy")}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">
                        {format(parseISO(`2000-01-01T${appointment.start_time}`), "h:mm a")} - 
                        {format(parseISO(`2000-01-01T${appointment.end_time}`), "h:mm a")}
                      </span>
                    </div>

                    {appointment.reason && (
                      <div className="flex items-center space-x-2 md:col-span-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm truncate max-w-xs">
                          {appointment.reason}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex mt-4 space-x-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(appointment)}
                      className="sm:hidden"
                    >
                      View Details
                    </Button>
                    
                    {activeTab === "upcoming" && appointment.status !== "cancelled" && (
                      <div className="sm:hidden flex space-x-2">
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
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
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
                {selectedAppointment.appointment_date && format(parseISO(selectedAppointment.appointment_date), "EEEE, MMMM d, yyyy")}
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-5 p-1">
                {/* Doctor Information */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {typeof selectedAppointment.doctor === 'object' && selectedAppointment.doctor.user ? 
                        `${selectedAppointment.doctor.user.first_name[0]}${selectedAppointment.doctor.user.last_name[0]}` : 
                        "DR"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{renderDoctorName(selectedAppointment.doctor)}</h3>
                    <p className="text-gray-500">{renderSpecialization(selectedAppointment.doctor)}</p>
                  </div>
                </div>
                
                <Separator />
                
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  {renderStatusBadge(selectedAppointment.status)}
                </div>
                
                {/* Appointment Information */}
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-primary" />
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
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Reason for Visit</span>
                      </div>
                      <p className="text-sm pl-6">{selectedAppointment.reason}</p>
                    </div>

                    {selectedAppointment.notes && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-primary" />
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
                        <Phone className="h-4 w-4 text-primary" />
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
                        <MapPin className="h-4 w-4 text-primary" />
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