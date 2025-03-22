'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO, isAfter, isBefore, isToday } from 'date-fns';
import {
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  FileClock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Eye,
  MessageSquare,
  FileText,
  Star
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

// Types
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  image: string;
  phone: string;
}

interface Appointment {
  id: string;
  doctor_id: string;
  user_id: string;
  date: string;
  time_slot: {
    id: string;
    start_time: string;
    end_time: string;
  };
  status: 'confirmed' | 'cancelled' | 'completed' | 'pending';
  created_at: string;
  symptoms?: string;
  notes?: string;
  doctor: Doctor;
}

export default function MyAppointmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // State for appointments
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for filter
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for cancellation
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  
  // State for feedback
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [appointmentForFeedback, setAppointmentForFeedback] = useState<Appointment | null>(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  
  // State for reschedule
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  
  // Auth check and fetch appointments
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    fetchAppointments();
  }, [user, router]);
  
  // Apply filters when filter state changes
  useEffect(() => {
    if (appointments.length > 0) {
      applyFilters();
    }
  }, [activeFilter, searchQuery, appointments]);
  
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      // Fetch user's appointments with doctor details and time slots
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          doctor_id,
          user_id,
          date,
          status,
          created_at,
          symptoms,
          notes,
          time_slot:time_slot_id (id, start_time, end_time),
          doctor:doctor_id (id, name, specialty, experience, rating, image, phone)
        `)
        .eq('user_id', user?.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Transform data to match the Appointment interface
        const formattedAppointments = data.map(apt => ({
          ...apt,
          // Ensure time_slot is properly formatted as an object, not an array
          time_slot: Array.isArray(apt.time_slot) && apt.time_slot.length > 0 
            ? apt.time_slot[0] 
            : apt.time_slot || { id: '', start_time: '', end_time: '' },
          // Ensure doctor is properly formatted as an object, not an array
          doctor: Array.isArray(apt.doctor) && apt.doctor.length > 0 
            ? apt.doctor[0] 
            : apt.doctor || { id: 0, name: '', specialty: '', experience: '', rating: 0, image: '', phone: '' }
        })) as Appointment[];
        
        setAppointments(formattedAppointments);
        // Default to upcoming appointments
        setFilteredAppointments(filterAppointments(formattedAppointments, 'upcoming'));
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your appointments. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let result = [...appointments];
    
    // Apply status filter
    result = filterAppointments(result, activeFilter);
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(appointment => 
        appointment.doctor.name.toLowerCase().includes(query) ||
        appointment.doctor.specialty.toLowerCase().includes(query) ||
        appointment.symptoms?.toLowerCase().includes(query) ||
        appointment.notes?.toLowerCase().includes(query)
      );
    }
    
    setFilteredAppointments(result);
  };
  
  const filterAppointments = (appointments: Appointment[], filter: string) => {
    const now = new Date();
    
    return appointments.filter(appointment => {
      const appointmentDate = parseISO(`${appointment.date}T${format(new Date(appointment.time_slot.start_time), 'HH:mm:ss')}`);
      
      switch (filter) {
        case 'upcoming':
          return (
            (appointment.status === 'confirmed' || appointment.status === 'pending') && 
            (isAfter(appointmentDate, now) || isToday(appointmentDate))
          );
        case 'past':
          return (
            appointment.status === 'completed' || 
            (appointment.status === 'confirmed' && isBefore(appointmentDate, now) && !isToday(appointmentDate))
          );
        case 'cancelled':
          return appointment.status === 'cancelled';
        default:
          return true;
      }
    });
  };
  
  const handleCancelAppointment = (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
    setCancellationReason('');
    setCancelDialogOpen(true);
  };
  
  const confirmCancellation = async () => {
    if (!appointmentToCancel) return;
    
    try {
      setIsCancelling(true);
      
      // Update appointment status to cancelled
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'cancelled',
          notes: appointmentToCancel.notes 
            ? `${appointmentToCancel.notes}\n\nCancellation reason: ${cancellationReason}` 
            : `Cancellation reason: ${cancellationReason}`
        })
        .eq('id', appointmentToCancel.id);
      
      if (error) throw error;
      
      // Update the time slot to available again
      const { error: slotError } = await supabase
        .from('time_slots')
        .update({ is_available: true })
        .eq('id', appointmentToCancel.time_slot.id);
      
      if (slotError) throw slotError;
      
      // Update local state
      setAppointments(appointments.map(apt => 
        apt.id === appointmentToCancel.id 
          ? { ...apt, status: 'cancelled' } 
          : apt
      ));
      
      // Show success message
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been successfully cancelled.",
      });
      
      // Close dialog
      setCancelDialogOpen(false);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
      });
    } finally {
      setIsCancelling(false);
    }
  };
  
  const handleGiveFeedback = (appointment: Appointment) => {
    setAppointmentForFeedback(appointment);
    setRating(5);
    setFeedback('');
    setFeedbackDialogOpen(true);
  };
  
  const submitFeedback = async () => {
    if (!appointmentForFeedback) return;
    
    try {
      setIsSubmittingFeedback(true);
      
      // Create feedback record
      const { error } = await supabase
        .from('doctor_reviews')
        .insert({
          doctor_id: appointmentForFeedback.doctor_id,
          user_id: user?.id,
          appointment_id: appointmentForFeedback.id,
          rating,
          comment: feedback,
        });
      
      if (error) throw error;
      
      // Update appointment with feedback submitted flag if needed
      
      // Show success message
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback on your appointment.",
      });
      
      // Close dialog
      setFeedbackDialogOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };
  
  const formatAppointmentDate = (date: string) => {
    return format(parseISO(date), 'MMMM d, yyyy');
  };
  
  const formatAppointmentTime = (timeString: string) => {
    return format(new Date(timeString), 'h:mm a');
  };
  
  const getStatusBadge = (status: string, appointmentDate: Date) => {
    const now = new Date();
    
    switch (status) {
      case 'confirmed':
        return isAfter(appointmentDate, now) 
          ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>
          : <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getAppointmentActions = (appointment: Appointment) => {
    const appointmentDate = parseISO(`${appointment.date}T${format(new Date(appointment.time_slot.start_time), 'HH:mm:ss')}`);
    const now = new Date();
    
    if (appointment.status === 'cancelled') {
      return (
        <div className="flex flex-wrap gap-2 mt-4 justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/appointments')}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Book New Appointment
          </Button>
        </div>
      );
    }
    
    if (appointment.status === 'completed' || 
       (appointment.status === 'confirmed' && isBefore(appointmentDate, now) && !isToday(appointmentDate))) {
      return (
        <div className="flex flex-wrap gap-2 mt-4 justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleGiveFeedback(appointment)}
            className="w-full sm:w-auto"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Give Feedback
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push(`/appointments/view-notes/${appointment.id}`)}
            className="w-full sm:w-auto"
          >
            <FileText className="mr-2 h-4 w-4" />
            View Notes
          </Button>
        </div>
      );
    }
    
    // Upcoming appointments (confirmed or pending)
    return (
      <div className="flex flex-wrap gap-2 mt-4 justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push(`/appointments/${appointment.id}`)}
          className="w-full sm:w-auto"
        >
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </Button>
        {/* Only show cancel if the appointment is more than 24 hours away */}
        {isAfter(appointmentDate, new Date(now.getTime() + 24 * 60 * 60 * 1000)) && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => handleCancelAppointment(appointment)}
            className="w-full sm:w-auto"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        )}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="mb-6">
          <Skeleton className="h-10 w-full mb-4" />
        </div>
        
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full flex justify-end gap-2">
                  <Skeleton className="h-9 w-32" />
                  <Skeleton className="h-9 w-32" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Appointments</h1>
          <p className="text-gray-500 mt-1">View and manage your scheduled appointments</p>
        </div>
        
        <Button 
          onClick={() => router.push('/appointments')}
          className="mt-4 sm:mt-0"
        >
          Book New Appointment
        </Button>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Search by doctor, specialty, symptoms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs value={activeFilter} onValueChange={(value: any) => setActiveFilter(value)} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-4 sm:grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mb-4 text-primary/40">
            <FileClock className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium mb-2">No appointments found</h3>
          <p className="text-gray-500 mb-6">
            {activeFilter === 'upcoming' 
              ? "You don't have any upcoming appointments scheduled"
              : activeFilter === 'past'
                ? "You don't have any past appointments"
                : activeFilter === 'cancelled'
                  ? "You don't have any cancelled appointments"
                  : "No appointments match your search criteria"}
          </p>
          <Button onClick={() => router.push('/appointments')}>
            Book an Appointment
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredAppointments.map((appointment) => {
            const appointmentDate = parseISO(`${appointment.date}T${format(new Date(appointment.time_slot.start_time), 'HH:mm:ss')}`);
            
            return (
              <Card key={appointment.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{formatAppointmentDate(appointment.date)}</span>
                      <span className="mx-1">•</span>
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{formatAppointmentTime(appointment.time_slot.start_time)}</span>
                    </div>
                    {getStatusBadge(appointment.status, appointmentDate)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border">
                      <AvatarImage src={appointment.doctor.image} alt={appointment.doctor.name} />
                      <AvatarFallback>{appointment.doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-lg">{appointment.doctor.name}</h3>
                      <p className="text-gray-500">{appointment.doctor.specialty}</p>
                      
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{appointment.doctor.phone}</span>
                        </div>
                        
                        {appointment.symptoms && (
                          <div className="flex items-center gap-2 text-sm mt-2">
                            <span className="font-medium">Symptoms:</span>
                            <span className="text-gray-600">{appointment.symptoms}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {getAppointmentActions(appointment)}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Cancel Appointment Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your appointment with Dr. {appointmentToCancel?.doctor.name} on {appointmentToCancel ? formatAppointmentDate(appointmentToCancel.date) : ''} at {appointmentToCancel ? formatAppointmentTime(appointmentToCancel.time_slot.start_time) : ''}?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-yellow-50">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">
                  Please note that cancellation within 24 hours of your appointment may still incur charges according to our policy.
                </p>
              </div>
            </div>
            
            <div>
              <label htmlFor="cancellation-reason" className="block text-sm font-medium mb-1">
                Reason for cancellation
              </label>
              <Input
                id="cancellation-reason"
                placeholder="Please let us know why you're cancelling"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={isCancelling}
            >
              Keep Appointment
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmCancellation}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Cancel Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Feedback</DialogTitle>
            <DialogDescription>
              Share your experience with Dr. {appointmentForFeedback?.doctor.name} from your appointment on {appointmentForFeedback ? formatAppointmentDate(appointmentForFeedback.date) : ''}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                How would you rate your experience?
              </label>
              <div className="flex items-center gap-1">
                {Array(5).fill(0).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className="text-yellow-400"
                  >
                    <Star className={`h-8 w-8 ${i < rating ? 'fill-yellow-400' : 'fill-gray-200'}`} />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="feedback" className="block text-sm font-medium mb-1">
                Your feedback
              </label>
              <Input
                id="feedback"
                placeholder="Share details about your experience"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="h-24"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFeedbackDialogOpen(false)}
              disabled={isSubmittingFeedback}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitFeedback}
              disabled={isSubmittingFeedback || !feedback.trim()}
            >
              {isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
