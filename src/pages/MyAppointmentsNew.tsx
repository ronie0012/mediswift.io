import { useState, useEffect, useMemo, useCallback, useTransition } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppointments, Appointment } from "@/context/AppointmentContext";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Search, Filter, ChevronDown, X } from "lucide-react";
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
  const [filterStatus, setFilterStatus] = useState<"all" | "confirmed" | "cancelled" | "scheduled">("all");
  
  // Dialog state
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Load appointments on initial render and tab change
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        if (activeTab === "upcoming") {
          await fetchUpcomingAppointments();
        } else {
          await fetchAppointments();
        }
      };
      
      startTransition(() => {
        fetchData();
      });
    }
  }, [user, activeTab, fetchUpcomingAppointments, fetchAppointments]);

  // Change tab with transition
  const handleTabChange = (tab: "upcoming" | "past") => {
    if (tab !== activeTab) {
      startTransition(() => {
        setActiveTab(tab);
      });
    }
  };

  // Memoized filtered and sorted appointments
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter(app => {
        // Filter by status if needed
        if (filterStatus !== "all" && app.status !== filterStatus) {
          return false;
        }
        
        // Filter by tab (upcoming/past)
        try {
          const appointmentDate = parseISO(`${app.appointment_date}T${app.start_time}`);
          const now = new Date();
          
          if (activeTab === "upcoming") {
            return isAfter(appointmentDate, now) && 
                  app.status !== "cancelled" && 
                  app.status !== "completed";
          }
          
          if (activeTab === "past") {
            return isBefore(appointmentDate, now) || 
                  app.status === "cancelled" || 
                  app.status === "completed";
          }
        } catch (err) {
          console.error("Date parsing error:", err);
          return true;
        }
        
        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            (app.doctor?.user?.first_name + ' ' + app.doctor?.user?.last_name).toLowerCase().includes(query) ||
            app.doctor?.specialization?.name.toLowerCase().includes(query) ||
            app.appointment_date.includes(query) ||
            app.start_time.toLowerCase().includes(query) ||
            app.reason.toLowerCase().includes(query)
          );
        }
        
        return true;
      })
      .sort((a, b) => {
        // Create Date objects for sorting
        try {
          const dateA = parseISO(`${a.appointment_date}T${a.start_time}`);
          const dateB = parseISO(`${b.appointment_date}T${b.start_time}`);
          
          return sortOrder === "newest" 
            ? dateB.getTime() - dateA.getTime()
            : dateA.getTime() - dateB.getTime();
        } catch (err) {
          return 0;
        }
      });
  }, [appointments, activeTab, searchQuery, filterStatus, sortOrder]);

  // Handle appointment cancellation
  const handleCancel = async (appointmentId: number) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await cancelAppointment(appointmentId);
        toast.success("Appointment cancelled successfully");
      } catch (error) {
        console.error("Error cancelling appointment:", error);
        toast.error("Failed to cancel appointment");
      }
    }
  };

  // Handle appointment rescheduling
  const handleReschedule = (appointmentId: number) => {
    navigate(`/reschedule-appointment/${appointmentId}`);
  };

  // Handle viewing appointment details
  const handleViewDetails = useCallback((appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsOpen(true);
  }, []);

  // Filter utilities
  const clearSearch = () => {
    startTransition(() => {
      setSearchQuery("");
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      setFilterStatus("all");
      setSortOrder("newest");
      setSearchQuery("");
    });
  };

  // Status badge helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Scheduled</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmed</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      case "no_show":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">No Show</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Check if we need to show login screen
  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to view your appointments</h1>
            <Button onClick={() => navigate("/login")}>Login</Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Check if we need to show loading screen
  const showFullLoadingScreen = isLoading && !isPending && appointments.length === 0;
  
  if (showFullLoadingScreen) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col items-center justify-center h-[40vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading your appointments...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Check if we need to show error screen
  if (error && !isPending) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-md mx-auto p-6 bg-red-50 rounded-lg border border-red-100">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Appointments</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => activeTab === "upcoming" ? fetchUpcomingAppointments() : fetchAppointments()}>
              Try Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Main UI
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">My Appointments</h1>

          {/* Tab and filter controls */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div className="flex space-x-4">
              <Button
                variant={activeTab === "upcoming" ? "default" : "outline"}
                onClick={() => handleTabChange("upcoming")}
                disabled={isPending}
                className="min-w-[100px] justify-center"
              >
                <span>Upcoming</span>
                {isPending && activeTab === "upcoming" && (
                  <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                )}
              </Button>
              <Button
                variant={activeTab === "past" ? "default" : "outline"}
                onClick={() => handleTabChange("past")}
                disabled={isPending}
                className="min-w-[100px] justify-center"
              >
                <span>Past</span>
                {isPending && activeTab === "past" && (
                  <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                )}
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => {
                    startTransition(() => {
                      setSearchQuery(e.target.value);
                    });
                  }}
                  className="pl-8 pr-8 w-full md:w-[200px]"
                />
                {searchQuery && (
                  <button 
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    disabled={isPending}
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1" disabled={isPending}>
                    <Filter className="h-4 w-4" />
                    <span className="hidden md:inline">Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => startTransition(() => setFilterStatus("all"))}>
                      <span className={filterStatus === "all" ? "font-semibold" : ""}>All Statuses</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => startTransition(() => setFilterStatus("scheduled"))}>
                      <span className={filterStatus === "scheduled" ? "font-semibold" : ""}>Scheduled</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => startTransition(() => setFilterStatus("confirmed"))}>
                      <span className={filterStatus === "confirmed" ? "font-semibold" : ""}>Confirmed</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => startTransition(() => setFilterStatus("cancelled"))}>
                      <span className={filterStatus === "cancelled" ? "font-semibold" : ""}>Cancelled</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1" disabled={isPending}>
                    <ChevronDown className="h-4 w-4" />
                    <span className="hidden md:inline">Sort</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => startTransition(() => setSortOrder("newest"))}>
                      <span className={sortOrder === "newest" ? "font-semibold" : ""}>Newest First</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => startTransition(() => setSortOrder("oldest"))}>
                      <span className={sortOrder === "oldest" ? "font-semibold" : ""}>Oldest First</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {(searchQuery || filterStatus !== "all" || sortOrder !== "newest") && (
                <Button variant="ghost" size="icon" onClick={clearFilters} disabled={isPending}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Stable container with loading overlay */}
          <div className="mt-6 relative min-h-[200px]">
            {/* Loading overlay */}
            {isPending && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}
            
            {/* Content */}
            <div style={{ opacity: isPending ? 0.5 : 1 }} className="transition-opacity duration-200">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-10 border rounded-lg bg-muted/20">
                  <h3 className="text-lg font-medium mb-2">No appointments found</h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === "upcoming" 
                      ? "You don't have any upcoming appointments." 
                      : filterStatus !== "all" || searchQuery
                        ? "No appointments match your search criteria."
                        : "You don't have any past appointments."}
                  </p>
                  {activeTab === "upcoming" && (
                    <Button 
                      onClick={() => navigate("/doctors")}
                      type="button"
                    >
                      Book an Appointment
                    </Button>
                  )}
                  {(filterStatus !== "all" || searchQuery) && (
                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                      type="button"
                      disabled={isPending}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <div 
                      key={`appointment-${appointment.id}`}
                      className="bg-card rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-medium">
                            Dr. {appointment.doctor?.user?.first_name} {appointment.doctor?.user?.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {appointment.doctor?.specialization?.name}
                          </p>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(parseISO(appointment.appointment_date), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{appointment.start_time} - {appointment.end_time}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          type="button"
                          onClick={() => handleViewDetails(appointment)}
                        >
                          View Details
                        </Button>
                        
                        {appointment.status !== "cancelled" && 
                         appointment.status !== "completed" && 
                         activeTab === "upcoming" && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              type="button"
                              onClick={() => handleReschedule(appointment.id)}
                            >
                              Reschedule
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              type="button"
                              onClick={() => handleCancel(appointment.id)}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Appointment details dialog */}
      <Dialog 
        open={isDetailsOpen} 
        onOpenChange={(open) => {
          setIsDetailsOpen(open);
          if (!open) {
            setTimeout(() => setSelectedAppointment(null), 300);
          }
        }}
      >
        {selectedAppointment && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>
                Appointment with Dr. {selectedAppointment.doctor?.user?.first_name} {selectedAppointment.doctor?.user?.last_name}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 p-1">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                  {getStatusBadge(selectedAppointment.status)}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Doctor</h4>
                  <p>Dr. {selectedAppointment.doctor?.user?.first_name} {selectedAppointment.doctor?.user?.last_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.doctor?.specialization?.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Schedule</h4>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(parseISO(selectedAppointment.appointment_date), "PPPP")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{selectedAppointment.start_time} - {selectedAppointment.end_time}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Reason for Visit</h4>
                  <p>{selectedAppointment.reason}</p>
                </div>
                {selectedAppointment.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Additional Notes</h4>
                    <p>{selectedAppointment.notes}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Created</h4>
                  <p>{format(parseISO(selectedAppointment.created_at), "PPP")}</p>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        )}
      </Dialog>
    </Layout>
  );
};

export default MyAppointments; 