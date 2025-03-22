'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Star, MapPin, Award, Calendar, Clock, Video, User, Phone, Mail } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AppointmentBooking from '@/components/appointments/AppointmentBooking';
import DoctorReviews from '@/components/doctors/DoctorReviews';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { useAuth } from '@/context/AuthContext';

export default function DoctorDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  
  const supabase = createClientComponentClient<Database>();
  
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        setDoctor(data);
      } catch (error) {
        console.error('Error fetching doctor details:', error);
        setError('Failed to load doctor details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchDoctor();
    }
  }, [id, supabase]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-1/3 bg-gray-200 rounded mb-6"></div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-2/3">
              <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
              <div className="h-8 w-1/4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-6"></div>
            </div>
            <div className="w-full md:w-1/3">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !doctor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Doctor not found. Please check the URL and try again.'}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3">
          {/* Doctor Profile */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="relative h-40 w-40 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={doctor.image || '/placeholder-doctor.jpg'}
                    alt={doctor.name}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="flex-grow">
                  <h1 className="text-2xl font-bold">{doctor.name}</h1>
                  <p className="text-gray-600">{doctor.specialty}</p>
                  <p className="text-gray-600">{doctor.experience} experience</p>
                  
                  <div className="flex items-center mt-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 text-sm font-medium">{doctor.rating}</span>
                    </div>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-sm text-gray-600">{doctor.review_count} reviews</span>
                  </div>
                  
                  <div className="flex items-center mt-2 text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{doctor.hospital}, {doctor.location}</span>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {doctor.available_today && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Available Today
                      </Badge>
                    )}
                    {doctor.available_for_video && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Video Consult
                      </Badge>
                    )}
                    {doctor.available_for_in_clinic && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        In-Clinic
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-lg font-medium">₹{doctor.consultation_fee}</p>
                    <p className="text-sm text-gray-500">Consultation Fee</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tabs for Doctor Info */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="education">Education & Experience</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">About Dr. {doctor.name.split(' ')[0]}</h2>
                  <p className="text-gray-700 mb-6">
                    Dr. {doctor.name} is a renowned {doctor.specialty.toLowerCase()} with {doctor.experience} of experience. 
                    {doctor.available_for_video && ' The doctor offers online consultations for patients who prefer remote healthcare services.'} 
                    {doctor.available_for_in_clinic && ' You can also visit the doctor at their clinic for in-person consultations.'}
                  </p>
                  
                  <h3 className="text-lg font-medium mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {doctor.languages?.map((language: string) => (
                      <Badge key={language} variant="secondary">
                        {language}
                      </Badge>
                    ))}
                  </div>
                  
                  <h3 className="text-lg font-medium mb-2">Consultation Types</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {doctor.available_for_video && (
                      <div className="flex items-center p-3 border rounded-md">
                        <Video className="h-5 w-5 text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium">Video Consultation</p>
                          <p className="text-sm text-gray-600">Online appointment via video call</p>
                        </div>
                      </div>
                    )}
                    
                    {doctor.available_for_in_clinic && (
                      <div className="flex items-center p-3 border rounded-md">
                        <User className="h-5 w-5 text-purple-600 mr-3" />
                        <div>
                          <p className="font-medium">In-Clinic Consultation</p>
                          <p className="text-sm text-gray-600">Visit the doctor at their clinic</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-500 mr-2" />
                      <span>Contact clinic for phone details</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-500 mr-2" />
                      <span>Book online for email communication</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="education" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Education & Experience</h2>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Education</h3>
                    <p className="text-gray-700">{doctor.education}</p>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Experience</h3>
                    <div className="flex items-start">
                      <Award className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium">{doctor.experience} of Professional Experience</p>
                        <p className="text-sm text-gray-600">Working at {doctor.hospital}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Specializations</h3>
                    <p className="text-gray-700">{doctor.specialty}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-4">
              <DoctorReviews doctorId={Number(id)} />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="w-full md:w-1/3">
          {/* Appointment Booking Section */}
          <Card className="sticky top-8">
            <CardContent className="p-6">
              {showAppointmentForm ? (
                <AppointmentBooking 
                  doctorId={Number(id)} 
                  doctorName={doctor.name}
                  consultationFee={doctor.consultation_fee}
                  availableSlots={doctor.available_slots}
                  onBack={() => setShowAppointmentForm(false)} 
                />
              ) : (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Book an Appointment</h2>
                  
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="font-medium">Next Available</p>
                      <p className="text-sm text-gray-600">{doctor.next_available}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-sm text-gray-600">30 minutes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <p className="font-medium">Consultation Fee:</p>
                    <p className="text-lg font-bold ml-2">₹{doctor.consultation_fee}</p>
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={() => {
                      if (user) {
                        setShowAppointmentForm(true);
                      } else {
                        // Redirect to login page
                        window.location.href = `/login?redirect=/doctors/${id}`;
                      }
                    }}
                  >
                    Book Appointment
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center mt-2">
                    No payment required to book an appointment
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 