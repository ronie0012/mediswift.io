import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppointments } from '../context/AppointmentContext';
import { useAuth } from '../context/AuthContext';
import { format, parseISO, isToday, isTomorrow, isThisWeek, isAfter } from 'date-fns';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  ChevronDown,
  X,
  MoreHorizontal,
  AlertCircle,
  MapPin,
  Phone,
  FileText,
  ArrowRight,
  RefreshCw,
  Calendar as CalendarIcon,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const AppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    appointments, 
    isLoading, 
    error, 
    fetchUpcomingAppointments,
    cancelAppointment,
    refreshAppointments
  } = useAppointments();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [hasAppointments, setHasAppointments] = useState(false);

  // Load appointments on mount
  useEffect(() => {
    let mounted = true;
    const loadAppointments = async () => {
      try {
        setIsRefreshing(true);
        await fetchUpcomingAppointments();
        if (mounted) {
          setHasAppointments(appointments.length > 0);
          setInitialLoadComplete(true);
        }
      } catch (error) {
        console.error('Error loading appointments:', error);
      } finally {
        if (mounted) {
          setIsRefreshing(false);
        }
      }
    };
    loadAppointments();
    return () => {
      mounted = false;
    };
  }, [fetchUpcomingAppointments]);

  // Update hasAppointments when appointments change
  useEffect(() => {
    setHasAppointments(appointments.length > 0);
  }, [appointments]);

  // Filtered appointments with memoization
  const filteredAppointments = useMemo(() => {
    if (!initialLoadComplete) return [];
    
    return appointments.filter(appointment => {
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const doctorName = `${appointment.doctor?.user?.first_name || ''} ${appointment.doctor?.user?.last_name || ''}`.toLowerCase();
        const specialty = appointment.doctor?.specialization?.name?.toLowerCase() || '';
        const reason = appointment.reason?.toLowerCase() || '';
        
        if (!doctorName.includes(query) && !specialty.includes(query) && !reason.includes(query)) {
          return false;
        }
      }
      
      // Filter by status
      if (filterStatus !== 'all' && appointment.status !== filterStatus) {
        return false;
      }
      
      // Filter by tab
      const appointmentDate = parseISO(`${appointment.appointment_date}T${appointment.start_time}`);
      const now = new Date();
      
      if (activeTab === 'upcoming') {
        return isAfter(appointmentDate, now) && 
              appointment.status !== 'cancelled' && 
              appointment.status !== 'completed';
      }
      
      if (activeTab === 'past') {
        return !isAfter(appointmentDate, now) || 
              appointment.status === 'cancelled' || 
              appointment.status === 'completed';
      }
      
      return true;
    });
  }, [appointments, searchQuery, filterStatus, activeTab, initialLoadComplete]);

  // Group appointments by relative date with memoization
  const groupedAppointments = useMemo(() => {
    const groups = {
      today: [] as any[],
      tomorrow: [] as any[],
      thisWeek: [] as any[],
      later: [] as any[],
      completed: [] as any[],
      cancelled: [] as any[],
    };
    
    filteredAppointments.forEach(appointment => {
      const appointmentDate = parseISO(appointment.appointment_date);
      
      if (appointment.status === 'completed') {
        groups.completed.push(appointment);
      } else if (appointment.status === 'cancelled') {
        groups.cancelled.push(appointment);
      } else if (isToday(appointmentDate)) {
        groups.today.push(appointment);
      } else if (isTomorrow(appointmentDate)) {
        groups.tomorrow.push(appointment);
      } else if (isThisWeek(appointmentDate)) {
        groups.thisWeek.push(appointment);
      } else {
        groups.later.push(appointment);
      }
    });
    
    return groups;
  }, [filteredAppointments]);

  // Functions for appointment actions
  const handleCancelAppointment = (id: number) => {
    setAppointmentToCancel(id);
    setIsConfirmingCancel(true);
  };

  const confirmCancelAppointment = async () => {
    if (appointmentToCancel) {
      try {
        await cancelAppointment(appointmentToCancel);
        toast.success('Appointment cancelled successfully');
        setIsConfirmingCancel(false);
      } catch (error) {
        toast.error('Failed to cancel appointment');
      }
    }
  };

  const handleViewDetails = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsDetailsOpen(true);
  };

  const handleReschedule = (id: number) => {
    navigate(`/reschedule-appointment/${id}`);
  };

  // Helper to render status badge with proper styling
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Scheduled</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmed</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      case 'no_show':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">No Show</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Helper function to clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAppointments();
    } catch (error) {
      console.error('Error refreshing appointments:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Component to render a section of appointments
  const renderAppointmentSection = (title: string, appointments: any[], showEmptyMsg: boolean = true) => {
    if (appointments.length === 0 && !showEmptyMsg) {
      return null;
    }

    return (
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Badge variant="outline" className="ml-2">{appointments.length}</Badge>
        </div>
        
        {appointments.length === 0 ? (
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-muted-foreground text-sm">No appointments in this section</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map(appointment => (
              <Card 
                key={appointment.id} 
                className="overflow-hidden transition-all hover:shadow-md"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Dr. {appointment.doctor?.user?.first_name} {appointment.doctor?.user?.last_name}
                      </CardTitle>
                      <CardDescription>
                        {appointment.doctor?.specialization?.name}
                      </CardDescription>
                    </div>
                    {renderStatusBadge(appointment.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{format(new Date(appointment.appointment_date), 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{appointment.start_time} - {appointment.end_time}</span>
                    </div>
                    <div className="flex items-start text-sm">
                      <FileText className="h-4 w-4 mr-2 mt-1 text-muted-foreground flex-shrink-0" />
                      <span className="line-clamp-2">{appointment.reason}</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-1 flex justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleViewDetails(appointment)}
                  >
                    Details
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuGroup>
                        <DropdownMenuItem 
                          onClick={() => handleViewDetails(appointment)}
                          className="cursor-pointer"
                        >
                          View Details
                        </DropdownMenuItem>
                        
                        {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => handleReschedule(appointment.id)}
                              className="cursor-pointer"
                            >
                              Reschedule
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleCancelAppointment(appointment.id)}
                              className="text-red-600 cursor-pointer"
                            >
                              Cancel Appointment
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render loading state
  if (isLoading && !initialLoadComplete) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-[50vh] flex-col">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
            <div>
              <h3 className="font-medium text-red-800">Error loading appointments</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <Button 
                onClick={handleRefresh}
                variant="outline"
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render empty state
  if (initialLoadComplete && !hasAppointments) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12 border rounded-lg flex flex-col items-center justify-center">
          <div className="text-center max-w-md">
            <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No appointments found</h3>
            <p className="text-muted-foreground mt-2 mb-6">
              {activeTab === 'upcoming' 
                ? "You don't have any upcoming appointments. Would you like to book one?"
                : "You don't have any past appointments."}
            </p>
            {activeTab === 'upcoming' && (
              <Button onClick={() => navigate('/book-appointment')}>
                Book an Appointment
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Appointments</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your medical appointments
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            onClick={() => navigate('/book-appointment')}
            size="sm"
          >
            Book Appointment
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={(value) => setActiveTab(value as 'upcoming' | 'past')}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            
            <div className="w-full sm:w-auto flex gap-2">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search appointments..."
                  className="pl-9 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-7 w-7 p-0"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                    {filterStatus !== 'all' && (
                      <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
                        1
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuItem 
                      onClick={() => setFilterStatus('all')}
                      className="cursor-pointer"
                    >
                      <span className="mr-auto">All Status</span>
                      {filterStatus === 'all' && <Check className="h-4 w-4 ml-2" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setFilterStatus('scheduled')}
                      className="cursor-pointer"
                    >
                      <span className="mr-auto">Scheduled</span>
                      {filterStatus === 'scheduled' && <Check className="h-4 w-4 ml-2" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setFilterStatus('confirmed')}
                      className="cursor-pointer"
                    >
                      <span className="mr-auto">Confirmed</span>
                      {filterStatus === 'confirmed' && <Check className="h-4 w-4 ml-2" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setFilterStatus('completed')}
                      className="cursor-pointer"
                    >
                      <span className="mr-auto">Completed</span>
                      {filterStatus === 'completed' && <Check className="h-4 w-4 ml-2" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setFilterStatus('cancelled')}
                      className="cursor-pointer"
                    >
                      <span className="mr-auto">Cancelled</span>
                      {filterStatus === 'cancelled' && <Check className="h-4 w-4 ml-2" />}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <Separator />
                  <DropdownMenuItem onClick={clearFilters} className="cursor-pointer">
                    Clear Filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <TabsContent value="upcoming" className="m-0">
            {filteredAppointments.length === 0 ? (
              <div className="py-12 border rounded-lg flex flex-col items-center justify-center">
                <div className="text-center max-w-md">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No upcoming appointments</h3>
                  <p className="text-muted-foreground mt-2 mb-6">
                    You don't have any upcoming appointments. Would you like to book one?
                  </p>
                  <Button onClick={() => navigate('/book-appointment')}>
                    Book an Appointment
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {renderAppointmentSection("Today", groupedAppointments.today)}
                {renderAppointmentSection("Tomorrow", groupedAppointments.tomorrow)}
                {renderAppointmentSection("This Week", groupedAppointments.thisWeek)}
                {renderAppointmentSection("Later", groupedAppointments.later)}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="m-0">
            {filteredAppointments.length === 0 ? (
              <div className="py-12 border rounded-lg flex flex-col items-center justify-center">
                <div className="text-center max-w-md">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No past appointments</h3>
                  <p className="text-muted-foreground mt-2">
                    You don't have any past appointment records.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {renderAppointmentSection("Completed", groupedAppointments.completed)}
                {renderAppointmentSection("Cancelled", groupedAppointments.cancelled)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Appointment Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              View the details of your appointment.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-4 pr-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    Dr. {selectedAppointment.doctor?.user?.first_name} {selectedAppointment.doctor?.user?.last_name}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedAppointment.doctor?.specialization?.name}
                  </p>
                </div>
                
                <div>
                  {renderStatusBadge(selectedAppointment.status)}
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-[20px_1fr] gap-x-3 gap-y-4 items-start">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Date</div>
                    <div>{format(new Date(selectedAppointment.appointment_date), 'EEEE, MMMM d, yyyy')}</div>
                  </div>
                  
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Time</div>
                    <div>{selectedAppointment.start_time} - {selectedAppointment.end_time}</div>
                  </div>
                  
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Reason for Visit</div>
                    <div>{selectedAppointment.reason}</div>
                  </div>
                  
                  {selectedAppointment.notes && (
                    <>
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Additional Notes</div>
                        <div>{selectedAppointment.notes}</div>
                      </div>
                    </>
                  )}
                </div>
                
                <Separator />
                
                {selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'completed' && (
                  <div className="flex justify-between pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDetailsOpen(false);
                        handleReschedule(selectedAppointment.id);
                      }}
                    >
                      Reschedule
                    </Button>
                    
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setIsDetailsOpen(false);
                        handleCancelAppointment(selectedAppointment.id);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={isConfirmingCancel} onOpenChange={setIsConfirmingCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelAppointment}>
              Yes, cancel appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AppointmentsPage; 