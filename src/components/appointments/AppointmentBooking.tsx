import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Check } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { format, addDays, parseISO, isBefore, startOfDay } from 'date-fns';

interface AppointmentBookingProps {
  doctorId: number;
  doctorName: string;
  consultationFee: number;
  availableSlots: { [key: string]: string[] };
  onBack: () => void;
}

export default function AppointmentBooking({
  doctorId,
  doctorName,
  consultationFee,
  availableSlots,
  onBack
}: AppointmentBookingProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();
  
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<string>('');
  const [type, setType] = useState<string>('video');
  const [notes, setNotes] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Disable past dates
  const disabledDays = (date: Date) => {
    return isBefore(date, startOfDay(new Date()));
  };
  
  // Update available times when date changes
  useEffect(() => {
    if (date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      const slots = availableSlots?.[dateStr] || [];
      setAvailableTimes(slots);
      setTime(''); // Reset time when date changes
    }
  }, [date, availableSlots]);
  
  // Handle appointment submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to book an appointment');
      return;
    }
    
    if (!date || !time || !type) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Format the date to ISO string
      const appointmentDate = format(date, 'yyyy-MM-dd');
      
      // Check if the appointment slot is still available
      const { data: existingAppointments, error: checkError } = await supabase
        .from('appointments')
        .select('id')
        .eq('doctor_id', doctorId)
        .eq('appointment_date', appointmentDate)
        .eq('appointment_time', time)
        .neq('status', 'cancelled');
      
      if (checkError) throw checkError;
      
      if (existingAppointments && existingAppointments.length > 0) {
        setError('This appointment slot is no longer available. Please select another time.');
        return;
      }
      
      // Create the appointment
      const { data, error: insertError } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          doctor_id: doctorId,
          appointment_date: appointmentDate,
          appointment_time: time,
          status: 'scheduled',
          type: type,
          notes: notes || null
        })
        .select();
      
      if (insertError) throw insertError;
      
      // Show success message
      setSuccess(true);
      toast({
        title: 'Appointment Booked',
        description: `Your appointment with Dr. ${doctorName} has been scheduled successfully.`,
      });
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold">Appointment Confirmed!</h2>
        
        <p className="text-gray-600">
          Your appointment with Dr. {doctorName} has been scheduled for{' '}
          {format(date, 'EEEE, MMMM d, yyyy')} at {time}.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 text-left">
          <div className="flex items-center mb-2">
            <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
            <span>{format(date, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center mb-2">
            <Clock className="h-5 w-5 text-gray-500 mr-2" />
            <span>{time}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium">Consultation Fee:</span>
            <span className="ml-2">₹{consultationFee}</span>
          </div>
        </div>
        
        <Button onClick={onBack} className="mt-4">
          Return to Doctor Profile
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 mr-2"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h2 className="text-xl font-semibold">Book an Appointment</h2>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Appointment Type */}
        <div>
          <h3 className="text-base font-medium mb-3">Consultation Type</h3>
          <Tabs defaultValue={type} onValueChange={(value) => setType(value)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="video">Video Consultation</TabsTrigger>
              <TabsTrigger value="in-clinic">In-Clinic Visit</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Date Selection */}
        <div>
          <h3 className="text-base font-medium mb-3">Select Date</h3>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => newDate && setDate(newDate)}
            disabled={disabledDays}
            className="rounded-md border"
          />
        </div>
        
        {/* Time Selection */}
        <div>
          <h3 className="text-base font-medium mb-3">Select Time</h3>
          {availableTimes.length === 0 ? (
            <p className="text-gray-500">No available slots for this date. Please select another date.</p>
          ) : (
            <RadioGroup value={time} onValueChange={setTime} className="grid grid-cols-3 gap-2">
              {availableTimes.map((slot) => (
                <div key={slot}>
                  <RadioGroupItem 
                    value={slot} 
                    id={`time-${slot}`} 
                    className="peer sr-only" 
                  />
                  <Label
                    htmlFor={`time-${slot}`}
                    className="flex items-center justify-center h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-100 hover:text-gray-900 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary cursor-pointer"
                  >
                    {slot}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
        
        {/* Notes */}
        <div>
          <h3 className="text-base font-medium mb-2">Additional Notes (Optional)</h3>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any symptoms or questions you'd like to discuss..."
            className="min-h-[100px]"
          />
        </div>
        
        {/* Fee Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Consultation Fee:</span>
            <span>₹{consultationFee}</span>
          </div>
        </div>
        
        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading || !date || !time || !type}
        >
          {loading ? 'Booking...' : 'Confirm Appointment'}
        </Button>
      </form>
    </div>
  );
} 