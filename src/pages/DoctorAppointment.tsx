import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useAppointments } from "@/context/AppointmentContext";
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Phone, 
  MessageCircle,
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  availableToday: boolean;
  availableForVideo: boolean;
  availableForInClinic: boolean;
  nextAvailable: string;
  image: string;
  hospital: string;
  location: string;
  education: string;
  languages: string[];
  availableSlots: {
    [key: string]: string[];
  };
}

interface Appointment {
  doctorId: number;
  patientName: string;
  patientAge: string;
  patientPhone: string;
  symptoms: string;
  date: string;
  time: string;
  consultationType: string;
}

// Sample doctors data - In a real app, this would come from an API
const doctorsData: Doctor[] = [
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
    languages: ["English", "Hindi"],
    availableSlots: {
      [new Date().toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
    }
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
    languages: ["English", "Hindi", "Marathi"],
    availableSlots: {
      [new Date().toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
    }
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
    languages: ["English", "Hindi"],
    availableSlots: {
      [new Date().toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
    }
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
    languages: ["English", "Hindi", "Kannada"],
    availableSlots: {
      [new Date().toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
    }
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
    languages: ["English", "Hindi", "Tamil"],
    availableSlots: {
      [new Date().toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
    }
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
    languages: ["English", "Hindi", "Telugu"],
    availableSlots: {
      [new Date().toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
    }
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
    languages: ["English", "Hindi", "Marathi"],
    availableSlots: {
      [new Date().toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
    }
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
    languages: ["English", "Hindi"],
    availableSlots: {
      [new Date().toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
    }
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
    languages: ["English", "Hindi", "Kannada"],
    availableSlots: {
      [new Date().toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
    }
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
    languages: ["English", "Hindi", "Urdu"],
    availableSlots: {
      [new Date().toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
    }
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
    languages: ["English", "Hindi", "Tamil"],
    availableSlots: {
      [new Date().toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
    }
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
    languages: ["English", "Hindi"],
    availableSlots: {
      [new Date().toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
    }
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
    languages: ["English", "Hindi"],
    availableSlots: {
      [new Date().toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
    }
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
    languages: ["English", "Hindi", "Kannada"],
    availableSlots: {
      [new Date().toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      [new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
    }
  }
];

const DoctorAppointment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const { addAppointment, appointments } = useAppointments();
  const [loading, setLoading] = useState(false);
  const [consultationType, setConsultationType] = useState("video");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  
  // Find the doctor based on the ID from URL params
  const doctorData = doctorsData.find(doctor => doctor.id === parseInt(id || "", 10));

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Get date 30 days from now in YYYY-MM-DD format
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  useEffect(() => {
    if (!doctorData) {
      toast({
        title: "Doctor not found",
        description: "The requested doctor could not be found.",
        variant: "destructive",
      });
      navigate("/doctors");
      return;
    }

    // Pre-fill patient info if user is logged in
    if (user) {
      setPatientName(user.name);
      if (user.phone) {
        setPatientPhone(user.phone);
      }
    }
  }, [doctorData, navigate, user, toast]);

  useEffect(() => {
    if (doctorData && appointmentDate) {
      const slots = doctorData.availableSlots[appointmentDate] || [];
      setAvailableTimeSlots(slots);
      setAppointmentTime(""); // Reset time when date changes
    } else {
      setAvailableTimeSlots([]);
      setAppointmentTime("");
    }
  }, [appointmentDate, doctorData]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setAppointmentDate(selectedDate);
    setAppointmentTime(""); // Reset time when date changes
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAppointmentTime(e.target.value);
  };

  if (!doctorData) {
    return null;
  }

  const validateForm = () => {
    if (!appointmentDate) {
      toast({
        title: "Please select a date",
        variant: "destructive",
      });
      return false;
    }
    if (!appointmentTime) {
      toast({
        title: "Please select a time",
        variant: "destructive",
      });
      return false;
    }
    if (!patientName || !patientAge || !patientPhone || !symptoms) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to book an appointment",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (!doctorData) {
      return;
    }

    // Check if patient already has an appointment on the same date
    const existingAppointment = appointments.find(
      apt => apt.patientName === patientName && 
            apt.date === appointmentDate && 
            apt.status !== 'cancelled'
    );

    if (existingAppointment) {
      toast({
        title: "Appointment conflict",
        description: "You already have an appointment scheduled for this date",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      await addAppointment({
        doctorId: doctorData.id,
        doctorName: doctorData.name,
        patientName,
        patientAge,
        patientPhone,
        symptoms,
        date: appointmentDate,
        time: appointmentTime,
        consultationType,
      });

      navigate("/my-appointments");
    } catch (error) {
      toast({
        title: "Error booking appointment",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate("/doctors")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Doctors
          </Button>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start">
                <img 
                  src={doctorData.image} 
                  alt={doctorData.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="ml-6">
                  <h1 className="text-2xl font-bold">{doctorData.name}</h1>
                  <p className="text-medical-600">{doctorData.specialty}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <span className="mr-4 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {doctorData.experience}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {doctorData.location}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Consultation Fee: ₹{doctorData.consultationFee}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <Label>Consultation Type</Label>
                  <RadioGroup value={consultationType} onValueChange={setConsultationType}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {doctorData.availableForVideo && (
                        <div className="flex items-center space-x-2 border rounded-lg p-4">
                          <RadioGroupItem value="video" id="video" />
                          <div>
                            <Label htmlFor="video" className="font-medium">Video Consult</Label>
                            <p className="text-sm text-gray-500">Online consultation</p>
                          </div>
                        </div>
                      )}
                      {doctorData.availableForInClinic && (
                        <div className="flex items-center space-x-2 border rounded-lg p-4">
                          <RadioGroupItem value="clinic" id="clinic" />
                          <div>
                            <Label htmlFor="clinic" className="font-medium">In-Clinic</Label>
                            <p className="text-sm text-gray-500">Visit hospital</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 border rounded-lg p-4">
                        <RadioGroupItem value="phone" id="phone" />
                        <div>
                          <Label htmlFor="phone" className="font-medium">Phone</Label>
                          <p className="text-sm text-gray-500">Call consultation</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-4">
                        <RadioGroupItem value="chat" id="chat" />
                        <div>
                          <Label htmlFor="chat" className="font-medium">Chat</Label>
                          <p className="text-sm text-gray-500">Text consultation</p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date">Select Date</Label>
                    <Input
                      id="date"
                      type="date"
                      min={today}
                      max={maxDate}
                      value={appointmentDate}
                      onChange={handleDateChange}
                      className="w-full"
                    />
                  </div>

                  {appointmentDate && (
                    <div className="space-y-2">
                      <Label htmlFor="time">Select Time</Label>
                      <select
                        id="time"
                        value={appointmentTime}
                        onChange={handleTimeChange}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select a time slot</option>
                        {availableTimeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Patient Name</Label>
                    <Input
                      id="name"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Patient Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min="0"
                      max="120"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      className="pl-10"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      pattern="[0-9]{10}"
                      title="Please enter a valid 10-digit phone number"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symptoms">Symptoms/Reason for Visit</Label>
                  <Textarea
                    id="symptoms"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Please describe your symptoms or reason for consultation"
                    required
                  />
                </div>

                {!isAuthenticated && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Authentication Required</AlertTitle>
                    <AlertDescription>
                      Please <Button variant="link" className="p-0 text-destructive underline" onClick={() => navigate("/login")}>log in</Button> to book an appointment.
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-medical-500 hover:bg-medical-600"
                  disabled={loading || !isAuthenticated}
                >
                  {loading ? "Booking Appointment..." : "Book Appointment"}
                </Button>

                <p className="text-sm text-gray-500 text-center">
                  By booking an appointment you agree to our{" "}
                  <a href="#" className="text-medical-600 hover:underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-medical-600 hover:underline">Privacy Policy</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorAppointment; 