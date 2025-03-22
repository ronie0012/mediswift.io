import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
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
  Heart,
  CheckCircle2,
  Medal,
  Repeat,
  BadgeCheck,
  X
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-gray-200">
        <CardContent className="p-0">
          <div className="p-6">
            {doctor.availableToday && (
              <Badge variant="secondary" className="absolute top-3 right-3 bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Available Today
              </Badge>
            )}
            
            <div className="flex items-start">
              <div className="relative">
                <Avatar className="h-20 w-20 rounded-lg border-2 border-gray-200">
                  <AvatarImage src={doctor.image} alt={doctor.name} />
                  <AvatarFallback className="bg-medical-100 text-medical-600 font-bold text-lg">
                    {doctor.name[0]}{doctor.name.split(' ')[1][0]}
                  </AvatarFallback>
                </Avatar>
                {doctor.experience.includes("15") && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1" title="Experienced Doctor">
                    <Medal className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              
              <div className="ml-4 flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <Link to={`/doctors/${doctor.id}`} className="hover:text-medical-600 transition-colors duration-200">
                      <h3 className="font-bold text-gray-900 text-xl">{doctor.name}</h3>
                    </Link>
                    <p className="text-medical-600 font-medium">{doctor.specialty}</p>
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className={`text-gray-400 hover:text-red-500 ${isBookmarked ? 'text-red-500' : ''}`}
                    onClick={() => setIsBookmarked(!isBookmarked)}
                  >
                    <Heart className={`h-5 w-5 ${isBookmarked ? 'fill-red-500' : ''}`} />
                  </Button>
                </div>
                
                <div className="flex items-center mt-2">
                  <div className="flex items-center bg-yellow-50 px-2 py-0.5 rounded-md">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium ml-1 text-yellow-700">{doctor.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">({doctor.reviewCount} reviews)</span>
                </div>
                
                <div className="flex flex-wrap items-center mt-3 text-sm text-gray-600">
                  <span className="mr-4 flex items-center bg-gray-50 px-2 py-1 rounded-md">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    {doctor.experience}
                  </span>
                  <span className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
                    <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                    {doctor.location}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-5 bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Select consultation type</p>
              <div className="flex flex-wrap gap-2">
                {doctor.availableForVideo && (
                  <Badge variant={consultationType === "video" ? "default" : "outline"} 
                    className={`cursor-pointer transition-all duration-200 ${consultationType === "video" ? "bg-medical-500 hover:bg-medical-600" : "hover:border-medical-400"}`}
                    onClick={() => setConsultationType("video")}
                  >
                    <Video className="h-3 w-3 mr-1" />
                    Video Consult
                  </Badge>
                )}
                {doctor.availableForInClinic && (
                  <Badge variant={consultationType === "clinic" ? "default" : "outline"} 
                    className={`cursor-pointer transition-all duration-200 ${consultationType === "clinic" ? "bg-medical-500 hover:bg-medical-600" : "hover:border-medical-400"}`}
                    onClick={() => setConsultationType("clinic")}
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    In-Clinic
                  </Badge>
                )}
                <Badge variant={consultationType === "phone" ? "default" : "outline"} 
                  className={`cursor-pointer transition-all duration-200 ${consultationType === "phone" ? "bg-medical-500 hover:bg-medical-600" : "hover:border-medical-400"}`}
                  onClick={() => setConsultationType("phone")}
                >
                  <Phone className="h-3 w-3 mr-1" />
                  Phone
                </Badge>
                <Badge variant={consultationType === "chat" ? "default" : "outline"} 
                  className={`cursor-pointer transition-all duration-200 ${consultationType === "chat" ? "bg-medical-500 hover:bg-medical-600" : "hover:border-medical-400"}`}
                  onClick={() => setConsultationType("chat")}
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Chat
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div>
                <p className="text-xs text-gray-500">Next Available</p>
                <p className="font-medium text-gray-800">
                  {doctor.availableToday ? 
                    <span className="text-green-600 flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {doctor.nextAvailable}
                    </span> : 
                    doctor.nextAvailable
                  }
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Consultation Fee</p>
                <p className="font-bold text-gray-900">₹{doctor.consultationFee}</p>
              </div>
            </div>
            
            {doctor.languages && (
              <div className="mt-3 flex flex-wrap gap-1">
                {doctor.languages.map((language: string) => (
                  <span key={language} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {language}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-2 border-t border-gray-100">
            <Button asChild className="w-full rounded-none rounded-b-lg h-12 bg-medical-500 hover:bg-medical-600 transition-all duration-300 font-medium">
              <Link to={`/doctors/${doctor.id}`} className="flex items-center justify-center gap-2">
                Book Appointment
                <Calendar className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Doctors = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const urlSearchQuery = searchParams.get('search') || '';
  
  const [activeSpecialty, setActiveSpecialty] = useState("All Specialties");
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [sortOption, setSortOption] = useState("relevance");
  const [tabValue, setTabValue] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([500, 2000]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Update search query when URL parameter changes
  useEffect(() => {
    setSearchQuery(urlSearchQuery);
  }, [urlSearchQuery]);
  
  const filteredDoctors = doctors.filter(doctor => {
    // Filter by tab
    if (tabValue === "available-today" && !doctor.availableToday) return false;
    if (tabValue === "video-consult" && !doctor.availableForVideo) return false;
    if (tabValue === "in-clinic" && !doctor.availableForInClinic) return false;
    
    // Filter by specialty
    const matchesSpecialty = activeSpecialty === "All Specialties" || doctor.specialty === activeSpecialty;
    
    // Filter by search query
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doctor.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by price range
    const matchesPrice = doctor.consultationFee >= priceRange[0] && doctor.consultationFee <= priceRange[1];
    
    return matchesSpecialty && matchesSearch && matchesPrice;
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
      <div className="bg-gradient-to-b from-medical-50 to-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900">Find & Book Doctor Appointments</h1>
              <p className="text-gray-600">Consult with our network of {doctors.length}+ verified specialists</p>
            </div>
            <div className="mt-4 md:mt-0 relative">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input 
                  className="pl-10 pr-4 py-6 rounded-xl shadow-sm focus:ring-2 focus:ring-medical-400 border-gray-200" 
                  placeholder="Search doctors, specialties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm mb-8 overflow-hidden">
            <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-50 p-1 rounded-none">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-white data-[state=active]:text-medical-600 data-[state=active]:shadow-sm rounded-lg"
                >
                  All Doctors
                </TabsTrigger>
                <TabsTrigger 
                  value="available-today" 
                  className="data-[state=active]:bg-white data-[state=active]:text-medical-600 data-[state=active]:shadow-sm rounded-lg"
                >
                  Available Today
                </TabsTrigger>
                <TabsTrigger 
                  value="video-consult" 
                  className="data-[state=active]:bg-white data-[state=active]:text-medical-600 data-[state=active]:shadow-sm rounded-lg"
                >
                  <Video className="h-4 w-4 mr-1" />
                  Video Consult
                </TabsTrigger>
                <TabsTrigger 
                  value="in-clinic" 
                  className="data-[state=active]:bg-white data-[state=active]:text-medical-600 data-[state=active]:shadow-sm rounded-lg"
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  In-Clinic
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Mobile filter toggle */}
          <div className="lg:hidden mb-6">
            <Button 
              variant="outline" 
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full flex items-center justify-center bg-white"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters {sortedDoctors.length > 0 && `(${sortedDoctors.length} results)`}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filter sidebar - desktop */}
            <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block sticky top-24 h-fit`}>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Filters</h3>
                  <Button variant="ghost" size="sm" className="text-gray-500 h-8 px-2">
                    Clear All
                  </Button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Specialty</label>
                    <Select value={activeSpecialty} onValueChange={setActiveSpecialty}>
                      <SelectTrigger className="border-gray-200 focus:ring-1 focus:ring-medical-400 h-10">
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
                    <label className="text-sm font-medium text-gray-700 block mb-3">Consultation Fee Range</label>
                    <div className="px-1">
                      <Slider
                        defaultValue={[500, 2000]}
                        min={0}
                        max={3000}
                        step={100}
                        value={priceRange}
                        onValueChange={setPriceRange}
                        className="mb-2"
                      />
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>₹{priceRange[0]}</span>
                        <span>₹{priceRange[1]}</span>
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
                        <input type="radio" name="gender" id="gender-any" className="text-medical-600 focus:ring-medical-500" defaultChecked />
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
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Experience</label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input type="checkbox" id="exp-1" className="rounded text-medical-600 focus:ring-medical-500" />
                        <label htmlFor="exp-1" className="ml-2 text-gray-600">0-5 years</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="exp-2" className="rounded text-medical-600 focus:ring-medical-500" />
                        <label htmlFor="exp-2" className="ml-2 text-gray-600">5-10 years</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="exp-3" className="rounded text-medical-600 focus:ring-medical-500" />
                        <label htmlFor="exp-3" className="ml-2 text-gray-600">10+ years</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 lg:hidden">
                    <Button 
                      className="w-full bg-medical-600 hover:bg-medical-700"
                      onClick={() => setShowMobileFilters(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="bg-white mb-6 p-4 rounded-lg shadow-sm flex flex-wrap items-center justify-between">
                <p className="text-gray-600 font-medium">
                  {isLoading ? 'Loading doctors...' : `${sortedDoctors.length} doctors found`}
                </p>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-[200px] border-gray-200 focus:ring-1 focus:ring-medical-400 h-9">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Recommended</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="fee-low">Fees: Low to High</SelectItem>
                    <SelectItem value="fee-high">Fees: High to Low</SelectItem>
                    <SelectItem value="experience">Most Experienced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                      <div className="p-6">
                        <div className="flex items-start">
                          <div className="h-20 w-20 rounded-lg bg-gray-200"></div>
                          <div className="ml-4 flex-1">
                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        </div>
                        <div className="h-10 bg-gray-200 rounded mt-4"></div>
                        <div className="flex justify-between mt-4">
                          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </div>
                      <div className="h-12 bg-gray-300 rounded-b-xl"></div>
                    </div>
                  ))}
                </div>
              ) : sortedDoctors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatePresence>
                    {sortedDoctors.map((doctor) => (
                      <DoctorCard key={doctor.id} doctor={doctor} />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-10 text-center">
                  <div className="flex justify-center mb-4">
                    <Search className="h-12 w-12 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">No doctors found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery("");
                      setActiveSpecialty("All Specialties");
                      setTabValue("all");
                      setPriceRange([500, 2000]);
                    }}
                    className="mx-auto"
                  >
                    <Repeat className="h-4 w-4 mr-2" />
                    Reset All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Doctors;
