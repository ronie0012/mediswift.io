
import { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
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
import { useToast } from "@/components/ui/use-toast"
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
  const [doctor, setDoctor] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [consultationType, setConsultationType] = useState("video");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (doctorId) {
      // Find the doctor by ID from the sample data
      const foundDoctor = doctors.find((d) => d.id === parseInt(doctorId));
      if (foundDoctor) {
        setDoctor(foundDoctor);
      } else {
        // Handle doctor not found (e.g., redirect to doctors list)
        navigate('/doctors');
      }
    }
  }, [doctorId, navigate]);

  const timeslots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM"
  ];

  const submitAppointment = async () => {
    try {
      setSubmitting(true);
      // Here, we need to fix the problematic code where it's trying to access .id on an array
      // Instead of using doctors[parseInt(doctorId)].id, we should use doctorId directly
      // Since doctorId is already the ID value from the params

      // Fix the erroneous line
      const appointmentData = {
        doctorId: doctorId, // Using doctorId directly instead of trying to access it from an array
        patientName: name,
        patientEmail: email,
        patientPhone: phone,
        appointmentDate: date ? format(date, 'yyyy-MM-dd') : '', // Format the date as string
        appointmentTime: time,
        symptomDescription: symptoms,
        appointmentType: consultationType
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Appointment Booked",
        description: `Your appointment with Dr. ${doctor?.name} has been booked for ${date ? format(date, "PPP") : 'No date selected'} at ${time}.`,
      });
      navigate('/appointments'); // Redirect to appointments page
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Booking Appointment",
        description: "Failed to book appointment. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!doctor) {
    return <div>Loading...</div>; // Or a more informative loading state
  }

  return (
    <Layout>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="md:flex">
                <div className="md:w-1/3 p-6 bg-gray-100">
                  <div className="flex items-start">
                    <Avatar className="h-16 w-16 rounded-lg">
                      <AvatarImage src={doctor.image} alt={doctor.name} />
                      <AvatarFallback>{doctor.name[0]}{doctor.name.split(' ')[1][0]}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">{doctor.name}</h3>
                          <p className="text-medical-600">{doctor.specialty}</p>
                        </div>
                      </div>
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium ml-1">{doctor.rating}</span>
                        <span className="text-xs text-gray-500 ml-1">({doctor.reviewCount} reviews)</span>
                      </div>
                      <div className="flex flex-wrap items-center mt-2 text-sm text-gray-600">
                        <span className="mr-4 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {doctor.experience}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {doctor.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {doctor.availableForVideo && (
                        <Badge
                          variant={consultationType === "video" ? "default" : "outline"}
                          className={`cursor-pointer ${consultationType === "video" ? "bg-medical-500" : ""
                            }`}
                          onClick={() => setConsultationType("video")}
                        >
                          <Video className="h-3 w-3 mr-1" />
                          Video Consult
                        </Badge>
                      )}
                      {doctor.availableForInClinic && (
                        <Badge
                          variant={consultationType === "clinic" ? "default" : "outline"}
                          className={`cursor-pointer ${consultationType === "clinic" ? "bg-medical-500" : ""
                            }`}
                          onClick={() => setConsultationType("clinic")}
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          In-Clinic
                        </Badge>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Consultation Fee</p>
                      <p className="font-bold text-gray-900">₹{doctor.consultationFee}</p>
                    </div>
                  </div>
                </div>

                <div className="md:w-2/3 p-6">
                  <h2 className="text-2xl font-bold mb-4">Book Appointment</h2>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        type="text"
                        id="name"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        type="email"
                        id="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        type="tel"
                        id="phone"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Appointment Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
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
                          <DayPicker
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={{ before: new Date() }}
                            className="border-0 shadow-sm"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Select value={time} onValueChange={setTime}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeslots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="symptoms">Symptoms</Label>
                      <Input
                        id="symptoms"
                        placeholder="Describe your symptoms"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full mt-6"
                    onClick={submitAppointment}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Book Appointment"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorAppointment;
