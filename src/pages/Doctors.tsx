import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Star, 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Filter, 
  ChevronDown,
  Phone,
  MessageCircle,
  Heart
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Sample data
const specialties = [
  "All Specialties",
  "General Physician",
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Dermatology",
  "Gynecology",
  "Orthopedics"
];

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

const DoctorCard = ({ doctor }: { doctor: any }) => {
  const [consultationType, setConsultationType] = useState("video");
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-6">
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
                <Button size="icon" variant="ghost" className="text-gray-500 hover:text-red-500">
                  <Heart className="h-5 w-5" />
                </Button>
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
                <Badge variant={consultationType === "video" ? "default" : "outline"} 
                  className={`cursor-pointer ${consultationType === "video" ? "bg-medical-500" : ""}`}
                  onClick={() => setConsultationType("video")}
                >
                  <Video className="h-3 w-3 mr-1" />
                  Video Consult
                </Badge>
              )}
              {doctor.availableForInClinic && (
                <Badge variant={consultationType === "clinic" ? "default" : "outline"} 
                  className={`cursor-pointer ${consultationType === "clinic" ? "bg-medical-500" : ""}`}
                  onClick={() => setConsultationType("clinic")}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  In-Clinic
                </Badge>
              )}
              <Badge variant={consultationType === "phone" ? "default" : "outline"} 
                className={`cursor-pointer ${consultationType === "phone" ? "bg-medical-500" : ""}`}
                onClick={() => setConsultationType("phone")}
              >
                <Phone className="h-3 w-3 mr-1" />
                Phone
              </Badge>
              <Badge variant={consultationType === "chat" ? "default" : "outline"} 
                className={`cursor-pointer ${consultationType === "chat" ? "bg-medical-500" : ""}`}
                onClick={() => setConsultationType("chat")}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Chat
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Next Available</p>
                <p className="font-medium text-gray-800">
                  {doctor.availableToday ? 
                    <span className="text-green-600">{doctor.nextAvailable}</span> : 
                    doctor.nextAvailable
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Consultation Fee</p>
                <p className="font-bold text-gray-900">₹{doctor.consultationFee}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 border-t border-gray-100">
          <Button asChild className="w-full rounded-none rounded-b-lg h-12 bg-medical-500 hover:bg-medical-600">
            <Link to={`/doctors/${doctor.id}`}>Book Appointment</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Doctors = () => {
  const [activeSpecialty, setActiveSpecialty] = useState("All Specialties");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("relevance");
  
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSpecialty = activeSpecialty === "All Specialties" || doctor.specialty === activeSpecialty;
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });
  
  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    if (sortOption === "rating") return b.rating - a.rating;
    if (sortOption === "fee-low") return a.consultationFee - b.consultationFee;
    if (sortOption === "fee-high") return b.consultationFee - a.consultationFee;
    if (sortOption === "experience") return parseInt(b.experience) - parseInt(a.experience);
    // Default: relevance - no specific sort
    return 0;
  });
  
  return (
    <Layout>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Find & Book Doctor Appointments</h1>
              <p className="text-gray-600">Consult with top specialists online or in-person</p>
            </div>
            <div className="mt-4 md:mt-0 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input 
                className="pl-10 pr-4 py-2 w-full md:w-80" 
                placeholder="Search doctors, specialties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs defaultValue="all" className="w-full mb-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="available-today">Available Today</TabsTrigger>
              <TabsTrigger value="video-consult">Video Consult</TabsTrigger>
              <TabsTrigger value="in-clinic">In-Clinic</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-6 h-fit">
              <h3 className="font-bold text-lg mb-4">Filter By</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Specialty</label>
                  <Select value={activeSpecialty} onValueChange={setActiveSpecialty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Consultation Fee</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="fee-1" className="rounded text-medical-600 focus:ring-medical-500" />
                      <label htmlFor="fee-1" className="ml-2 text-gray-600">Under ₹500</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="fee-2" className="rounded text-medical-600 focus:ring-medical-500" />
                      <label htmlFor="fee-2" className="ml-2 text-gray-600">₹500 - ₹1000</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="fee-3" className="rounded text-medical-600 focus:ring-medical-500" />
                      <label htmlFor="fee-3" className="ml-2 text-gray-600">₹1000 - ₹1500</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="fee-4" className="rounded text-medical-600 focus:ring-medical-500" />
                      <label htmlFor="fee-4" className="ml-2 text-gray-600">Above ₹1500</label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Availability</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="avail-1" className="rounded text-medical-600 focus:ring-medical-500" />
                      <label htmlFor="avail-1" className="ml-2 text-gray-600">Available Today</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="avail-2" className="rounded text-medical-600 focus:ring-medical-500" />
                      <label htmlFor="avail-2" className="ml-2 text-gray-600">Available Tomorrow</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="avail-3" className="rounded text-medical-600 focus:ring-medical-500" />
                      <label htmlFor="avail-3" className="ml-2 text-gray-600">Available This Week</label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Gender</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="radio" name="gender" id="gender-any" className="text-medical-600 focus:ring-medical-500" />
                      <label htmlFor="gender-any" className="ml-2 text-gray-600">Any</label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" name="gender" id="gender-male" className="text-medical-600 focus:ring-medical-500" />
                      <label htmlFor="gender-male" className="ml-2 text-gray-600">Male</label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" name="gender" id="gender-female" className="text-medical-600 focus:ring-medical-500" />
                      <label htmlFor="gender-female" className="ml-2 text-gray-600">Female</label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" className="w-full">Clear All Filters</Button>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">{sortedDoctors.length} doctors found</p>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="fee-low">Fees: Low to High</SelectItem>
                    <SelectItem value="fee-high">Fees: High to Low</SelectItem>
                    <SelectItem value="experience">Experience</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedDoctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
              
              {sortedDoctors.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No doctors found matching your criteria.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setActiveSpecialty("All Specialties");
                      setSearchQuery("");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
              
              <div className="mt-8 text-center">
                <Button variant="outline" className="mx-auto">Load More Doctors</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Doctors;
