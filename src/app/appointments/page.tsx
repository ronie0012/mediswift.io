'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, startOfDay, endOfDay, startOfWeek, addWeeks, differenceInDays } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Search, Filter, MapPin, Star, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Pagination } from '@/components/common/Pagination';
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
  location: string;
  bio: string;
  education: string;
  languages: string[];
  consultation_fee: number;
}

interface TimeSlot {
  id: string;
  doctor_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface Appointment {
  id?: string;
  doctor_id: string;
  user_id: string;
  date: string;
  time_slot_id: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'pending';
  created_at?: string;
  symptoms?: string;
  notes?: string;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // State for doctors
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State for appointments
  const [date, setDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingInProgress, setBookingInProgress] = useState(false);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [specialties, setSpecialties] = useState<string[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 6;
  
  // States for UI steps
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Load doctors and initialize
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    fetchDoctors();
  }, [user, router]);
  
  // Step 2: Apply filters when search or filter criteria change
  useEffect(() => {
    if (doctors.length > 0) {
      applyFiltersAndSort();
    }
  }, [searchQuery, specialtyFilter, sortBy, doctors]);
  
  // Step 3: Fetch available time slots when doctor or date changes
  useEffect(() => {
    if (selectedDoctor && date) {
      fetchAvailableTimeSlots();
    }
  }, [selectedDoctor, date]);
  
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      
      // Fetch all doctors
      const { data, error } = await supabase
        .from('doctors')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        setDoctors(data);
        setFilteredDoctors(data);
        
        // Extract unique specialties for filter
        const uniqueSpecialties = Array.from(
          new Set(data.map((doctor) => doctor.specialty))
        );
        setSpecialties(uniqueSpecialties);
        
        calculateTotalPages(data.length);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load doctors. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAvailableTimeSlots = async () => {
    if (!selectedDoctor || !date) return;
    
    try {
      setLoading(true);
      
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Fetch available time slots for the selected doctor and date
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('doctor_id', selectedDoctor.id)
        .eq('date', formattedDate)
        .eq('is_available', true);
      
      if (error) throw error;
      
      setAvailableSlots(data || []);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load available time slots. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const applyFiltersAndSort = () => {
    let result = [...doctors];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(doctor => 
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query) ||
        doctor.location.toLowerCase().includes(query)
      );
    }
    
    // Apply specialty filter
    if (specialtyFilter !== 'all') {
      result = result.filter(doctor => doctor.specialty === specialtyFilter);
    }
    
    // Apply sorting
    result = sortDoctors(result, sortBy);
    
    setFilteredDoctors(result);
    calculateTotalPages(result.length);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  const sortDoctors = (doctors: Doctor[], sortBy: string): Doctor[] => {
    return [...doctors].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'experience':
          return b.experience - a.experience;
        case 'fee_low':
          return a.consultation_fee - b.consultation_fee;
        case 'fee_high':
          return b.consultation_fee - a.consultation_fee;
        default:
          return 0;
      }
    });
  };
  
  const calculateTotalPages = (totalItems: number) => {
    setTotalPages(Math.ceil(totalItems / ITEMS_PER_PAGE));
  };
  
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredDoctors.slice(startIndex, endIndex);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setCurrentStep(2); // Move to date selection
    setDate(new Date()); // Reset date to today
    setSelectedSlot(null); // Reset selected slot
  };
  
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  
  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };
  
  const handleBookAppointment = async () => {
    if (!user || !selectedDoctor || !selectedSlot) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a doctor, date, and time slot to book an appointment.",
      });
      return;
    }
    
    try {
      setBookingInProgress(true);
      
      const appointment: Appointment = {
        doctor_id: selectedDoctor.id,
        user_id: user.id,
        date: format(date, 'yyyy-MM-dd'),
        time_slot_id: selectedSlot.id,
        status: 'confirmed',
        symptoms,
        notes
      };
      
      // Insert the appointment
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointment)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update the time slot to unavailable
      const { error: slotError } = await supabase
        .from('time_slots')
        .update({ is_available: false })
        .eq('id', selectedSlot.id);
      
      if (slotError) throw slotError;
      
      toast({
        title: "Appointment Booked",
        description: `Your appointment with Dr. ${selectedDoctor.name} has been confirmed for ${format(date, 'MMMM d, yyyy')} at ${format(new Date(selectedSlot.start_time), 'h:mm a')}.`,
      });
      
      // Redirect to the appointments view page
      router.push(`/appointments/${data.id}`);
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to book appointment. Please try again.",
      });
    } finally {
      setBookingInProgress(false);
    }
  };
  
  const formatTime = (timeString: string) => {
    return format(new Date(timeString), 'h:mm a');
  };
  
  const getRatingStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  // Display loading skeleton when fetching data
  if (loading && currentStep === 1) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div>
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {currentStep === 1 && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Book Appointment</h1>
              <p className="text-gray-500 mt-1">Find a doctor and schedule your appointment</p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => router.push('/appointments/my-appointments')}
              className="mt-4 sm:mt-0"
            >
              My Appointments
            </Button>
          </div>
          
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search doctors by name, specialty, or location..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Specialty" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="experience">Most Experienced</SelectItem>
                    <SelectItem value="fee_low">Lowest Fee First</SelectItem>
                    <SelectItem value="fee_high">Highest Fee First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Doctors Grid */}
          {filteredDoctors.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="mb-4 text-primary/40">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium mb-2">No doctors found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || specialtyFilter !== 'all'
                  ? 'Try adjusting your search or filters to find more doctors'
                  : 'No doctors are currently available'}
              </p>
              <Button onClick={() => {
                setSearchQuery('');
                setSpecialtyFilter('all');
              }}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getCurrentPageItems().map((doctor) => (
                  <Card key={doctor.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border">
                          <AvatarImage src={doctor.image} alt={doctor.name} />
                          <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{doctor.name}</CardTitle>
                          <CardDescription>{doctor.specialty}</CardDescription>
                          <div className="flex items-center gap-1 mt-1">
                            {getRatingStars(doctor.rating)}
                            <span className="text-sm text-gray-500 ml-1">({doctor.rating})</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                          <span className="text-sm">{doctor.location}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                          <span className="text-sm">{doctor.experience} years experience</span>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <Badge variant="outline" className="font-normal">
                            ${doctor.consultation_fee.toFixed(2)} per consultation
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={() => handleDoctorSelect(doctor)}>
                        Book Appointment
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    showSummary
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
      
      {currentStep === 2 && selectedDoctor && (
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
            <Button variant="ghost" className="p-0 h-auto" onClick={() => setCurrentStep(1)}>
              Doctors
            </Button>
            <ArrowRight className="h-3.5 w-3.5" />
            <span className="font-medium">{selectedDoctor.name}</span>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border">
                    <AvatarImage src={selectedDoctor.image} alt={selectedDoctor.name} />
                    <AvatarFallback>{selectedDoctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{selectedDoctor.name}</CardTitle>
                    <CardDescription>{selectedDoctor.specialty} • {selectedDoctor.experience} years experience</CardDescription>
                    <div className="flex items-center gap-1 mt-1">
                      {getRatingStars(selectedDoctor.rating)}
                      <span className="text-sm text-gray-500 ml-1">({selectedDoctor.rating})</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="font-normal">
                  ${selectedDoctor.consultation_fee.toFixed(2)} per consultation
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Select Date & Time</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Choose an available date and time slot for your appointment
                  </p>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/2">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        fromDate={new Date()}
                        toDate={addDays(new Date(), 30)}
                        className="rounded-md border"
                      />
                    </div>
                    
                    <div className="md:w-1/2">
                      <h4 className="font-medium mb-3">Available Time Slots:</h4>
                      {availableSlots.length === 0 ? (
                        <div className="p-6 border rounded-md text-center">
                          <p className="text-gray-500">No time slots available for the selected date</p>
                          <p className="text-sm text-gray-400 mt-1">Please choose another date</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => handleSlotSelect(slot)}
                              className={`p-3 border rounded-md text-center transition-colors ${
                                selectedSlot?.id === slot.id 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              {formatTime(slot.start_time)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3">Appointment Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="symptoms" className="block text-sm font-medium mb-1">
                        Symptoms (optional)
                      </label>
                      <Input
                        id="symptoms"
                        placeholder="Describe your symptoms briefly"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium mb-1">
                        Additional Notes (optional)
                      </label>
                      <Input
                        id="notes"
                        placeholder="Any other information you'd like to share with the doctor"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back to Doctors
              </Button>
              <Button 
                onClick={handleBookAppointment} 
                disabled={!selectedSlot || bookingInProgress}
              >
                {bookingInProgress ? "Booking..." : "Confirm Appointment"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
} 