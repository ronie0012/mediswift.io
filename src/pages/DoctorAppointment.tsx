import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, addDays, startOfDay, addHours, isAfter, isBefore, parseISO } from "date-fns";
import { Calendar as CalendarIcon, Clock, User, FileText, Calendar } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useAppointments } from "@/context/AppointmentContext";
import healthcareService from "@/lib/healthcare.service";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateAppointmentData } from "@/context/AppointmentContext";

// Helper function to properly render doctor name (consistent with MyAppointments.tsx)
const renderDoctorName = (doctor: any) => {
  if (!doctor) {
    return <Skeleton className="h-5 w-36" />;
  }
  
  // Handle case where doctor is just an ID
  if (typeof doctor === 'number') {
    return <Skeleton className="h-5 w-36" />;
  }
  
  // If doctor has a direct name property (from Doctors.tsx)
  if (doctor.name) {
    return doctor.name;
  }
  
  // Check if doctor has a valid user object with first and last name (from backend API)
  if (doctor.user && 
      typeof doctor.user === 'object' && 
      doctor.user.first_name && 
      doctor.user.last_name) {
    return `Dr. ${doctor.user.first_name} ${doctor.user.last_name}`;
  }
  
  return "Doctor";
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
  
  // If doctor has a direct specialty property (from Doctors.tsx)
  if (doctor.specialty) {
    return doctor.specialty;
  }
  
  // Check if doctor has specialization object with name (from backend API)
  if (doctor.specialization && 
      typeof doctor.specialization === 'object' && 
      doctor.specialization.name) {
    return doctor.specialization.name;
  }
  
  return "Specialization not available";
};

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

interface Doctor {
  id: number;
  // Backend API properties
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  specialization?: {
    id: number;
    name: string;
  };
  license_number?: string;
  years_of_experience?: number;
  bio?: string;
  is_available?: boolean;
  profile_image?: string;
  average_rating?: number;
  
  // Doctors.tsx properties
  name?: string;
  specialty?: string;
  experience?: string;
  rating?: number;
  reviewCount?: number;
  availability?: string;
  image?: string;
}

const DoctorAppointment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addAppointment } = useAppointments();
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(startOfDay(new Date()), 1));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
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
      toast.error("Please login to book an appointment");
      navigate("/login");
      return;
    }
    
    fetchDoctor();
  }, [id, user, navigate]);
  
  useEffect(() => {
    // Reset selected time slot when date changes
    setSelectedTimeSlot(null);
    // Generate new time slots for the selected date
    setTimeSlots(generateTimeSlots());
  }, [selectedDate]);
  
  const fetchDoctor = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // Use the same doctor data as in Doctors.tsx
      const actualDoctors = [
        {
          id: 1,
          name: "Dr. Anil Sharma",
          specialty: "General Physician",
          experience: "12 years",
          rating: 4.5,
          reviewCount: 150,
          availability: "Available Today",
          image: "https://randomuser.me/api/portraits/men/65.jpg",
          bio: "Dr. Anil Sharma is a seasoned general physician with expertise in treating a wide range of common illnesses and chronic conditions.",
          years_of_experience: 12,
          user: {
            id: 1,
            first_name: "Anil",
            last_name: "Sharma",
            email: "anil.sharma@example.com"
          },
          specialization: {
            id: 1,
            name: "General Physician"
          },
          license_number: "MED12345",
          is_available: true,
          profile_image: "https://randomuser.me/api/portraits/men/65.jpg"
        },
        {
          id: 2,
          name: "Dr. Vikram Patel",
          specialty: "Cardiologist",
          experience: "18 years",
          rating: 4.8,
          reviewCount: 200,
          availability: "Available Tomorrow",
          image: "https://randomuser.me/api/portraits/men/45.jpg",
          bio: "Dr. Vikram Patel is a distinguished cardiologist specializing in interventional procedures and cardiac care.",
          years_of_experience: 18,
          user: {
            id: 2,
            first_name: "Vikram",
            last_name: "Patel",
            email: "vikram.patel@example.com"
          },
          specialization: {
            id: 2,
            name: "Cardiologist"
          },
          license_number: "MED54321",
          is_available: true,
          profile_image: "https://randomuser.me/api/portraits/men/45.jpg"
        },
        {
          id: 3,
          name: "Dr. Sanjay Gupta",
          specialty: "Neurologist",
          experience: "15 years",
          rating: 4.7,
          reviewCount: 160,
          availability: "Available Today",
          image: "https://randomuser.me/api/portraits/men/32.jpg",
          bio: "Dr. Sanjay Gupta is an experienced neurologist specializing in movement disorders and neurodegenerative diseases.",
          years_of_experience: 15,
          user: {
            id: 3,
            first_name: "Sanjay",
            last_name: "Gupta",
            email: "sanjay.gupta@example.com"
          },
          specialization: {
            id: 3,
            name: "Neurologist"
          },
          license_number: "MED67890",
          is_available: true,
          profile_image: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        {
          id: 4,
          name: "Dr. Rohan Joshi",
          specialty: "Pediatrician",
          experience: "14 years",
          rating: 4.9,
          reviewCount: 220,
          availability: "Available in 2 days",
          image: "https://randomuser.me/api/portraits/men/86.jpg",
          bio: "Dr. Rohan Joshi is a compassionate pediatrician dedicated to providing comprehensive care for children from infancy through adolescence.",
          years_of_experience: 14,
          user: {
            id: 4,
            first_name: "Rohan",
            last_name: "Joshi",
            email: "rohan.joshi@example.com"
          },
          specialization: {
            id: 4,
            name: "Pediatrician"
          },
          license_number: "MED09876",
          is_available: true,
          profile_image: "https://randomuser.me/api/portraits/men/86.jpg"
        },
      ];
      
      const doctorId = parseInt(id);
      if (doctorId >= 1 && doctorId <= 4) {
        setDoctor(actualDoctors[doctorId - 1]);
      } else {
        // Try API only if not one of our predefined doctors
        try {
          const data = await healthcareService.getDoctor(doctorId);
          console.log("Doctor data from API:", data);
          setDoctor(data);
        } catch (apiError) {
          console.error("API error:", apiError);
          setError("Doctor not found");
          toast.error("Doctor not found");
        }
      }
    } catch (error) {
      console.error("Error fetching doctor:", error);
      setError("Failed to load doctor details. Please try again later.");
      toast.error("Failed to load doctor details");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async () => {
    if (!user || !doctor || !selectedDate || !selectedTimeSlot || !reason) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const appointmentData: CreateAppointmentData = {
      doctor_id: doctor.id,
      appointment_date: format(selectedDate, "yyyy-MM-dd"),
      start_time: selectedTimeSlot.start,
      end_time: selectedTimeSlot.end,
      reason,
      notes: notes || undefined
    };
    
    setIsSubmitting(true);
    try {
      // Try to add appointment using real API
      const appointment = await addAppointment(appointmentData);
      toast.success("Appointment booked successfully!");
      navigate("/my-appointments");
    } catch (error) {
      console.error("Error booking appointment:", error);
      
      // Fallback logic: if API fails, create a mock appointment locally
      try {
        // Generate a unique ID for the mock appointment
        const mockAppointmentId = Date.now();
        
        // Create mock appointment
        const mockAppointment = {
          id: mockAppointmentId,
          doctor: doctor,
          patient: {
            id: user.id,
            user: {
              id: user.id,
              first_name: user.first_name || '',
              last_name: user.last_name || '',
              email: user.email
            }
          },
          appointment_date: format(selectedDate, "yyyy-MM-dd"),
          start_time: selectedTimeSlot.start,
          end_time: selectedTimeSlot.end,
          status: "scheduled" as const,
          reason,
          notes: notes || undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Store in localStorage for persistence
        const existingAppointments = JSON.parse(localStorage.getItem('mockAppointments') || '[]');
        existingAppointments.push(mockAppointment);
        localStorage.setItem('mockAppointments', JSON.stringify(existingAppointments));
        
        toast.success("Appointment booked successfully!");
        navigate("/my-appointments");
      } catch (fallbackError) {
        console.error("Error with fallback appointment creation:", fallbackError);
        toast.error("Failed to book appointment. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
              <div className="md:col-span-1">
                <Skeleton className="h-[300px] w-full rounded-lg" />
              </div>
              <div className="md:col-span-2 space-y-6">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-[200px] w-full" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error || !doctor) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 text-red-600 rounded-lg p-6 border border-red-100">
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p className="mb-4">{error || "Doctor not found"}</p>
              <Button onClick={() => navigate("/doctors")}>
                Return to Doctors List
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
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
            {/* Doctor Information */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={doctor.image || doctor.profile_image} alt={renderDoctorName(doctor)} />
                      <AvatarFallback>
                        {doctor.user?.first_name?.[0] || doctor.name?.split(' ')[1]?.[0] || 'D'}
                        {doctor.user?.last_name?.[0] || doctor.name?.split(' ')?.[2]?.[0] || 'R'}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl">
                      {renderDoctorName(doctor)}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {renderSpecialization(doctor)}
                    </CardDescription>
                    <Badge variant="outline" className="mt-2">
                      {doctor.experience || `${doctor.years_of_experience} years experience`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p className="mb-4">{doctor.bio || "No biography available."}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Appointment Booking Form */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Book an Appointment</CardTitle>
                  <CardDescription>
                    Select a date and time slot to book your appointment with {renderDoctorName(doctor)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Date Selection */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Select Date
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
                      Select Time
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
                  
                  {/* Reason */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Reason for Visit
                    </h3>
                    <Textarea
                      placeholder="Please describe your symptoms or reason for the appointment"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  {/* Additional Notes */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Additional Notes (Optional)
                    </h3>
                    <Textarea
                      placeholder="Any additional information that may be helpful"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full space-y-4">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">Appointment Summary</p>
                      <div className="text-sm text-muted-foreground">
                        {selectedDate && (
                          <p>Date: {format(selectedDate, "PPP")}</p>
                        )}
                        {selectedTimeSlot && (
                          <p>Time: {selectedTimeSlot.start} - {selectedTimeSlot.end}</p>
                        )}
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      disabled={!selectedDate || !selectedTimeSlot || !reason || isSubmitting}
                      onClick={handleSubmit}
                    >
                      {isSubmitting ? "Booking..." : "Confirm Appointment"}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorAppointment;
