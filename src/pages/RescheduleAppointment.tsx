import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, addDays, startOfDay, isAfter, isBefore, parseISO } from "date-fns";
import { Calendar as CalendarIcon, Clock, Calendar } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useAppointments } from "@/context/AppointmentContext";
import healthcareService from "@/lib/healthcare.service";
import { Skeleton } from "@/components/ui/skeleton";

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

const RescheduleAppointment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getAppointmentById } = useAppointments();
  
  const [appointment, setAppointment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Generate time slots between 9 AM and 5 PM with 30-minute intervals
  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 17;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minutes = 0; minutes < 60; minutes += 30) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const endHourCalculated = minutes === 30 ? hour + 1 : hour;
        const endMinutes = minutes === 30 ? 0 : 30;
        const endTime = `${endHourCalculated.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
        
        slots.push({
          start: startTime,
          end: endTime,
          available: true // For a real app, this would come from the backend
        });
      }
    }
    
    // Randomly mark some slots as unavailable for demo purposes
    return slots.map(slot => ({
      ...slot,
      available: Math.random() > 0.3 // 30% chance of being unavailable
    }));
  };
  
  useEffect(() => {
    if (!user) {
      toast.error("Please login to reschedule an appointment");
      navigate("/login");
      return;
    }
    
    fetchAppointment();
  }, [id, user, navigate]);
  
  useEffect(() => {
    if (selectedDate) {
      // Reset selected time slot when date changes
      setSelectedTimeSlot(null);
      // Generate new time slots for the selected date
      setTimeSlots(generateTimeSlots());
    }
  }, [selectedDate]);
  
  const fetchAppointment = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const appointmentData = await getAppointmentById(parseInt(id));
      
      if (!appointmentData) {
        throw new Error("Appointment not found");
      }
      
      setAppointment(appointmentData);
      
      // Set initial date to the current appointment date
      const initialDate = parseISO(appointmentData.appointment_date);
      if (isBefore(initialDate, startOfDay(new Date()))) {
        // If the appointment date is in the past, set to tomorrow
        setSelectedDate(addDays(startOfDay(new Date()), 1));
      } else {
        setSelectedDate(initialDate);
      }
      
    } catch (error) {
      console.error("Error fetching appointment:", error);
      setError("Failed to load appointment details. Please try again later.");
      toast.error("Failed to load appointment details");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async () => {
    if (!user || !appointment || !selectedDate || !selectedTimeSlot) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const updatedAppointment = await healthcareService.updateAppointment(
        appointment.id,
        {
          appointment_date: format(selectedDate, "yyyy-MM-dd"),
          start_time: selectedTimeSlot.start,
          end_time: selectedTimeSlot.end
        }
      );
      
      toast.success("Appointment rescheduled successfully!");
      navigate("/my-appointments");
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      toast.error("Failed to reschedule appointment");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-xl mx-auto">
            <Skeleton className="h-10 w-3/4 mb-6" />
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error || !appointment) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-xl mx-auto">
            <div className="bg-red-50 text-red-600 rounded-lg p-6 border border-red-100">
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p className="mb-4">{error || "Appointment not found"}</p>
              <Button onClick={() => navigate("/my-appointments")}>
                Return to My Appointments
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Reschedule Appointment</CardTitle>
              <CardDescription>
                Reschedule your appointment with Dr. {appointment.doctor?.user?.first_name} {appointment.doctor?.user?.last_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-medium mb-2">Current Appointment Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {format(parseISO(appointment.appointment_date), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {appointment.start_time} - {appointment.end_time}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Date Selection */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Select New Date
                </h3>
                <div className="border rounded-md p-4">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    disabled={(date) => 
                      isBefore(date, startOfDay(new Date())) || 
                      isAfter(date, addDays(new Date(), 30))
                    }
                    className="mx-auto"
                  />
                </div>
              </div>
              
              {/* Time Slot Selection */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Select New Time
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot, index) => (
                    <Button
                      key={index}
                      variant={selectedTimeSlot === slot ? "default" : "outline"}
                      disabled={!slot.available}
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`${!slot.available ? "opacity-50" : ""}`}
                    >
                      {slot.start}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full space-y-4">
                <div className="flex flex-col">
                  <p className="text-sm font-medium">New Appointment Summary</p>
                  <div className="text-sm text-muted-foreground">
                    {selectedDate && (
                      <p>Date: {format(selectedDate, "PPP")}</p>
                    )}
                    {selectedTimeSlot && (
                      <p>Time: {selectedTimeSlot.start} - {selectedTimeSlot.end}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => navigate("/my-appointments")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    disabled={!selectedDate || !selectedTimeSlot || isSubmitting}
                    onClick={handleSubmit}
                  >
                    {isSubmitting ? "Rescheduling..." : "Confirm Reschedule"}
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default RescheduleAppointment; 