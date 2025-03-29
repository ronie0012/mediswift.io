import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, Clock, User, Mail, Phone, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { DayPicker } from "react-day-picker"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MapPin, Star, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAppointments } from "@/context/AppointmentContext";

// Sample data - replace with actual data fetching later
const doctors = [
  {
    id: 1,
    name: "Dr. Anil Sharma",
    specialty: "General Physician",
    experience: "12 years",
    rating: 4.5,
    reviewCount: 150,
    consultationFee: 800,
    availableToday: true,
    availableForVideo: true,
    availableForInClinic: true,
    nextAvailable: "Today, 2:30 PM",
    image: "https://randomuser.me/api/portraits/men/65.jpg",
    hospital: "MediCare Hospital",
    location: "Mumbai, Maharashtra",
    education: "MBBS - General Medicine",
    languages: ["English", "Hindi"]
  },
  {
    id: 2,
    name: "Dr. Priya Deshmukh",
    specialty: "General Physician",
    experience: "8 years",
    rating: 4.2,
    reviewCount: 120,
    consultationFee: 600,
    availableToday: true,
    availableForVideo: true,
    availableForInClinic: true,
    nextAvailable: "Today, 4:00 PM",
    image: "https://randomuser.me/api/portraits/women/32.jpg",
    hospital: "City Medical Center",
    location: "Pune, Maharashtra",
    education: "MBBS - General Medicine",
    languages: ["English", "Hindi", "Marathi"]
  },
  {
    id: 3,
    name: "Dr. Vikram Patel",
    specialty: "Cardiology",
    experience: "18 years",
    rating: 4.8,
    reviewCount: 200,
    consultationFee: 1500,
    availableToday: false,
    availableForVideo: true,
    availableForInClinic: true,
    nextAvailable: "Tomorrow, 10:00 AM",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
    hospital: "Heart Care Institute",
    location: "Delhi, NCR",
    education: "MBBS, MD, DM - Cardiology",
    languages: ["English", "Hindi"]
  },
  {
    id: 4,
    name: "Dr. Neha Kulkarni",
    specialty: "Cardiology",
    experience: "10 years",
    rating: 4.6,
    reviewCount: 180,
    consultationFee: 1200,
    availableToday: true,
    availableForVideo: true,
    availableForInClinic: true,
    nextAvailable: "Today, 3:30 PM",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
    hospital: "Cardio Care Center",
    location: "Bangalore, Karnataka",
    education: "MBBS, MD, DM - Cardiology",
    languages: ["English", "Hindi", "Kannada"]
  },
  {
    id: 5,
    name: "Dr. Sanjay Gupta",
    specialty: "Neurology",
    experience: "15 years",
    rating: 4.7,
    reviewCount: 160,
    consultationFee: 1800,
    availableToday: false,
    availableForVideo: true,
    availableForInClinic: true,
    nextAvailable: "Tomorrow, 11:00 AM",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    hospital: "Neuro Care Institute",
    location: "Chennai, Tamil Nadu",
    education: "MBBS, MD, DM - Neurology",
    languages: ["English", "Hindi", "Tamil"]
  },
  {
    id: 6,
    name: "Dr. Meera Rao",
    specialty: "Neurology",
    experience: "9 years",
    rating: 4.4,
    reviewCount: 140,
    consultationFee: 1300,
    availableToday: true,
    availableForVideo: true,
    availableForInClinic: true,
    nextAvailable: "Today, 5:00 PM",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
    hospital: "Brain & Spine Center",
    location: "Hyderabad, Telangana",
    education: "MBBS, MD, DM - Neurology",
    languages: ["English", "Hindi", "Telugu"]
  },
  {
    id: 7,
    name: "Dr. Rohan Joshi",
    specialty: "Pediatrics",
    experience: "14 years",
    rating: 4.9,
    reviewCount: 220,
    consultationFee: 1000,
    availableToday: true,
    availableForVideo: true,
    availableForInClinic: true,
    nextAvailable: "Today, 2:00 PM",
    image: "https://randomuser.me/api/portraits/men/86.jpg",
    hospital: "Children's Hospital",
    location: "Mumbai, Maharashtra",
    education: "MBBS, MD - Pediatrics",
    languages: ["English", "Hindi", "Marathi"]
  },
  {
    id: 8,
    name: "Dr. Aarti Singh",
    specialty: "Pediatrics",
    experience: "7 years",
    rating: 4.3,
    reviewCount: 130,
    consultationFee: 800,
    availableToday: true,
    availableForVideo: true,
    availableForInClinic: true,
    nextAvailable: "Today, 4:30 PM",
    image: "https://randomuser.me/api/portraits/women/22.jpg",
    hospital: "Kids Care Center",
    location: "Delhi, NCR",
    education: "MBBS, MD - Pediatrics",
    languages: ["English", "Hindi"]
  },
  {
    id: 9,
    name: "Dr. Kavita Mehra",
    specialty: "Dermatology",
    experience: "11 years",
    rating: 4.6,
    reviewCount: 170,
    consultationFee: 1200,
    availableToday: false,
    availableForVideo: true,
    availableForInClinic: true,
    nextAvailable: "Tomorrow, 9:30 AM",
    image: "https://randomuser.me/api/portraits/women/32.jpg",
    hospital: "Skin Care Clinic",
    location: "Bangalore, Karnataka",
    education: "MBBS, MD - Dermatology",
    languages: ["English", "Hindi", "Kannada"]
  },
  {
    id: 10,
    name: "Dr. Sameer Khan",
    specialty: "Dermatology",
    experience: "16 years",
    rating: 4.8,
    reviewCount: 190,
    consultationFee: 1500,
    availableToday: true,
    availableForVideo: true,
    availableForInClinic: true,
    nextAvailable: "Today, 3:00 PM",
    image: "https://randomuser.me/api/portraits/men/54.jpg",
    hospital: "Derma Solutions",
    location: "Mumbai, Maharashtra",
    education: "MBBS, MD - Dermatology",
    languages: ["English", "Hindi", "Urdu"]
  },
  {
    id: 11,
    name: "Dr. Sunita Iyer",
    specialty: "Gynecology",
    experience: "20 years",
    rating: 4.9,
    reviewCount: 240,
    consultationFee: 1600,
    availableToday: false,
    availableForVideo: true,
    availableForInClinic: true,
    nextAvailable: "Tomorrow, 10:30 AM",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
    hospital: "Women's Health Center",
    location: "Chennai, Tamil Nadu",
    education: "MBBS, MS - Obstetrics & Gynecology",
    languages: ["English", "Hindi", "Tamil"]
  },
  {
    id: 12,
    name: "Dr. Ritu Nair",
    specialty: "Gynecology",
    experience: "13 years",
    rating: 4.5,
    reviewCount: 160,
    consultationFee: 1200,
    availableToday: true,
    availableForVideo: true,
    availableForInClinic: true,
    nextAvailable: "Today, 4:00 PM",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
    hospital: "FemCare Hospital",
    location: "Delhi, NCR",
    education: "MBBS, MS - Obstetrics & Gynecology",
    languages: ["English", "Hindi"]
  },
  {
    id: 13,
    name: "Dr. Arjun Malhotra",
    specialty: "Orthopedics",
    experience: "17 years",
    rating: 4.7,
    reviewCount: 180,
    consultationFee: 1400,
    availableToday: false,
    availableForVideo: true,
    availableForInClinic: true,
    nextAvailable: "Tomorrow, 11:30 AM",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    hospital: "Ortho Care Institute",
    location: "Mumbai, Maharashtra",
    education: "MBBS, MS - Orthopedics",
    languages: ["English", "Hindi"]
  },
  {
    id: 14,
    name: "Dr. Shalini Verma",
    specialty: "Orthopedics",
    experience: "10 years",
    rating: 4.4,
    reviewCount: 140,
    consultationFee: 1100,
    availableToday: true,
    availableForVideo: true,
    availableForInClinic: true,
    nextAvailable: "Today, 3:30 PM",
    image: "https://randomuser.me/api/portraits/women/32.jpg",
    hospital: "Bone & Joint Center",
    location: "Bangalore, Karnataka",
    education: "MBBS, MS - Orthopedics",
    languages: ["English", "Hindi", "Kannada"]
  }
];

const DoctorAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addAppointment } = useAppointments();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [consultationType, setConsultationType] = useState("video");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Check if we have data from location state
      const locationState = location.state as { doctor?: any; consultationType?: string } | null;
      
      if (locationState?.doctor) {
        // Use doctor directly from location state
        setDoctor(locationState.doctor);
        if (locationState.consultationType) {
          setConsultationType(locationState.consultationType);
        }
        setLoading(false);
      } else if (doctorId) {
        // Fallback to finding doctor by ID
        const doctorIdNum = parseInt(doctorId, 10);
        const foundDoctor = doctors.find((d) => d.id === doctorIdNum);
        
        if (foundDoctor) {
          setDoctor(foundDoctor);
        } else {
          toast.error("Doctor Not Found", {
            description: "The requested doctor could not be found.",
          });
          // Add a small delay before navigation to show the toast
          setTimeout(() => {
            navigate('/doctors');
          }, 1500);
        }
        setLoading(false);
      } else {
        // If no doctorId is provided, redirect to doctors list
        navigate('/doctors');
      }
    } catch (error) {
      console.error("Error loading doctor information:", error);
      toast.error("Failed to load doctor information");
      setLoading(false);
    }
  }, [doctorId, navigate, location]);

  const validateForm = () => {
    setFormError(null);
    
    if (!name.trim()) {
      setFormError("Please enter your name to continue.");
      toast.error("Please enter your name to continue.");
      return false;
    }
    if (!email.trim()) {
      setFormError("Please enter your email to continue.");
      toast.error("Please enter your email to continue.");
      return false;
    }
    if (!phone.trim()) {
      setFormError("Please enter your phone number to continue.");
      toast.error("Please enter your phone number to continue.");
      return false;
    }
    if (!date) {
      setFormError("Please select an appointment date.");
      toast.error("Please select an appointment date.");
      return false;
    }
    if (!time) {
      setFormError("Please select an appointment time.");
      toast.error("Please select an appointment time.");
      return false;
    }
    if (!symptoms.trim()) {
      setFormError("Please describe your symptoms.");
      toast.error("Please describe your symptoms.");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (submitting) return; // Prevent double submission
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      if (!doctor) {
        throw new Error("Doctor information not found");
      }

      const appointmentData = {
        doctorId: doctor.id,
        doctorName: doctor.name,
        patientName: name,
        patientEmail: email,
        patientAge: "0",
        patientPhone: phone,
        symptoms: symptoms,
        date: format(date!, 'yyyy-MM-dd'),
        time: time,
        consultationType: consultationType,
      };

      console.log("Submitting appointment data:", appointmentData);

      // Use the addAppointment function from context
      const newAppointment = await addAppointment(appointmentData);
      
      if (newAppointment && newAppointment.id) {
        console.log("Appointment created successfully:", newAppointment);
        toast.success('Appointment Booked Successfully', {
          description: `Your appointment with ${doctor.name} has been booked for ${format(date!, "PPP")} at ${time}.`
        });
        
        // Wait a moment for the toast to be visible before navigating
        setTimeout(() => {
          navigate('/appointment-success');
        }, 1000);
      } else {
        throw new Error("Failed to create appointment");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      setFormError(error instanceof Error ? error.message : "Failed to book appointment. Please try again.");
      toast.error(error instanceof Error ? error.message : "Failed to book appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!doctor) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Doctor Not Found</h2>
            <p className="text-gray-600 mb-6">The requested doctor could not be found.</p>
            <Button onClick={() => navigate('/doctors')}>
              Back to Doctors
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{doctor.name}</h1>
                <p className="text-gray-600">{doctor.specialty}</p>
                <p className="text-medical-600 font-semibold">
                  Consultation Fee: ₹{doctor.consultationFee}
                </p>
              </div>
            </div>

            {formError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Appointment Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        name="date"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Appointment Time</Label>
                  <Select value={time} onValueChange={setTime} required>
                    <SelectTrigger id="time" name="time">
                      <SelectValue placeholder="Select time">
                        {time ? (
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            {time}
                          </div>
                        ) : (
                          "Select time"
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                      <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                      <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                      <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                      <SelectItem value="02:00 PM">02:00 PM</SelectItem>
                      <SelectItem value="03:00 PM">03:00 PM</SelectItem>
                      <SelectItem value="04:00 PM">04:00 PM</SelectItem>
                      <SelectItem value="05:00 PM">05:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consultationType">Consultation Type</Label>
                  <Select
                    value={consultationType}
                    onValueChange={setConsultationType}
                    required
                  >
                    <SelectTrigger id="consultationType" name="consultationType">
                      <SelectValue placeholder="Select consultation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Consultation</SelectItem>
                      <SelectItem value="clinic">In-Clinic Visit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="symptoms">Symptoms Description</Label>
                <Textarea
                  id="symptoms"
                  name="symptoms"
                  placeholder="Please describe your symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="min-h-[100px]"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-medical-600 hover:bg-medical-700 text-white"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Booking...
                  </div>
                ) : (
                  "Book Appointment"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorAppointment;
