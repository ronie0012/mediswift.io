import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, isSameDay, isValid } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  MessageSquare,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Doctor, TimeSlot, AppointmentWithDetails } from '@/types/models';

const appointmentSchema = z.object({
  patientName: z.string().min(2, { message: "Patient name must be at least 2 characters" }),
  patientAge: z.string().refine(value => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  }, {
    message: "Patient age must be a valid number",
  }),
  patientPhone: z.string().min(10, { message: "Please enter a valid phone number" }),
  symptoms: z.string().min(10, { message: "Symptoms must be at least 10 characters" }),
  consultationType: z.enum(['video', 'in-clinic'], {
    required_error: "You need to select a consultation type.",
  }),
});

type AppointmentValues = z.infer<typeof appointmentSchema>;

interface DoctorAppointmentProps {
  doctorId: string;
}

export default function DoctorAppointment({ doctorId }: DoctorAppointmentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointmentConfirmation, setAppointmentConfirmation] = useState<{
    id: number;
    date: string;
    time: string;
  } | null>(null);
  
  const disabledDays: (date: Date) => boolean = (date: Date) => {
    return date < addDays(new Date(), 0)
  };
  
  const form = useForm<AppointmentValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientName: user?.user_metadata?.name || '',
      patientAge: '',
      patientPhone: user?.phone || '',
      symptoms: '',
      consultationType: 'video',
    },
  });
  
  // Fetch doctor details
  useEffect(() => {
    async function fetchDoctorDetails() {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .eq('id', doctorId)
          .single();
        
        if (error) {
          console.error("Error fetching doctor details:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load doctor details. Please try again."
          });
          return;
        }
        
        setDoctor(data as Doctor);
      } catch (error) {
        console.error("Unexpected error:", error);
        toast({
          variant: "destructive",
          title: "Unexpected Error",
          description: "An unexpected error occurred. Please try again later."
        });
      }
    }
    
    if (doctorId) {
      fetchDoctorDetails();
    }
  }, [doctorId, toast]);
  
  // Fetch available time slots for the selected date
  useEffect(() => {
    async function fetchAvailableSlots() {
      if (!doctor || !selectedDate) return;
      
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      try {
        const { data: existingAppointments, error: appointmentError } = await supabase
          .from('appointments')
          .select('time_slot(*)')
          .eq('doctor_id', doctor.id)
          .eq('date', formattedDate);
        
        if (appointmentError) {
          console.error("Error fetching existing appointments:", appointmentError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load available time slots. Please try again."
          });
          return;
        }
        
        // Fetch all time slots for the doctor
        const { data: allTimeSlotsData, error: allTimeSlotsError } = await supabase
          .from('time_slots')
          .select('*')
          .eq('doctor_id', doctor.id);
        
        if (allTimeSlotsError) {
          console.error("Error fetching all time slots:", allTimeSlotsError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load available time slots. Please try again."
          });
          return;
        }
        
        let availableTimeSlots = allTimeSlotsData as TimeSlot[];
        
        // Filter out the booked time slots
        if (existingAppointments && existingAppointments.length > 0) {
          const bookedTimeSlotIds = existingAppointments.map(appointment => appointment.time_slot.id);
          availableTimeSlots = availableTimeSlots.filter(slot => !bookedTimeSlotIds.includes(slot.id));
        }
        
        setAvailableSlots(availableTimeSlots);
      } catch (error) {
        console.error("Unexpected error:", error);
        toast({
          variant: "destructive",
          title: "Unexpected Error",
          description: "An unexpected error occurred. Please try again later."
        });
      }
    }
    
    fetchAvailableSlots();
  }, [doctor, selectedDate, toast]);
  
  const onSubmit = async (values: AppointmentValues) => {
    if (!selectedDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a date for your appointment."
      });
      return;
    }
    
    if (!selectedTime) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a time slot for your appointment."
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Create appointment
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert([
          {
            doctor_id: doctor?.id,
            user_id: user?.id,
            date: formattedDate,
            time_slot_id: selectedTime.id,
            status: 'pending',
            symptoms: values.symptoms,
            patientName: values.patientName,
            patientAge: values.patientAge,
            patientPhone: values.patientPhone,
            consultationType: values.consultationType,
          }
        ])
        .select('*')
        .single();
      
      if (appointmentError) {
        console.error("Error creating appointment:", appointmentError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create appointment. Please try again."
        });
        return;
      }
      
      // Update time slot availability (assuming you have an 'is_available' column)
      const { error: timeSlotError } = await supabase
        .from('time_slots')
        .update({ is_available: false })
        .eq('id', selectedTime.id);
      
      if (timeSlotError) {
        console.error("Error updating time slot:", timeSlotError);
        toast({
          variant: "destructive",
          title: "Warning",
          description: "Appointment created, but failed to update time slot availability."
        });
      }
      
      setAppointmentConfirmation({
        id: appointmentData.id,
        date: formattedDate,
        time: selectedTime.start_time,
      });
      
      toast({
        title: "Success",
        description: "Appointment created successfully!",
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        variant: "destructive",
        title: "Unexpected Error",
        description: "An unexpected error occurred. Please try again later."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {doctor ? (
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Book Appointment with {doctor.name}</CardTitle>
            <CardDescription>
              Please fill out the form below to book an appointment.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {appointmentConfirmation ? (
              <div className="text-center space-y-4">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h2 className="text-xl font-semibold">Appointment Booked!</h2>
                <p>
                  Your appointment with {doctor.name} is scheduled for {appointmentConfirmation.date} at {appointmentConfirmation.time}.
                </p>
                <Button onClick={handleGoToDashboard}>Go to Dashboard</Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="patientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter patient name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="patientAge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient Age</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter patient age" type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="patientPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="symptoms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Symptoms</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe your symptoms" className="resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="consultationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consultation Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a consultation type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="video">Video Consultation</SelectItem>
                            <SelectItem value="in-clinic">In-Clinic Consultation</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Select Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? (
                              format(selectedDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={disabledDays}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div>
                      <Label>Select Time</Label>
                      <Select onValueChange={(value) => {
                        const selected = availableSlots.find(slot => slot.id === value);
                        setSelectedTime(selected || null);
                      }}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSlots.map((slot) => (
                            <SelectItem key={slot.id} value={slot.id}>
                              {slot.start_time} - {slot.end_time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Submitting..." : "Book Appointment"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <p>Loading doctor details...</p>
        </div>
      )}
    </div>
  );
}
