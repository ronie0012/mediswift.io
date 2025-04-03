import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Star, MapPin, Clock, CalendarClock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Define actual doctor data
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
    bio: "Dr. Anil Sharma is a seasoned general physician with expertise in treating a wide range of common illnesses and chronic conditions."
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
    bio: "Dr. Vikram Patel is a distinguished cardiologist specializing in interventional procedures and cardiac care."
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
    bio: "Dr. Sanjay Gupta is an experienced neurologist specializing in movement disorders and neurodegenerative diseases."
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
    bio: "Dr. Rohan Joshi is a compassionate pediatrician dedicated to providing comprehensive care for children from infancy through adolescence."
  }
];

// Define specializations
const actualSpecializations = [
  { id: 1, name: "General Physician" },
  { id: 2, name: "Cardiologist" },
  { id: 3, name: "Neurologist" },
  { id: 4, name: "Pediatrician" }
];

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviewCount: number;
  availability: string;
  image: string;
  bio: string;
}

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState<number | null>(null);
  const [specializations, setSpecializations] = useState<{id: number, name: string}[]>([]);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Use the actual doctors data instead of fetching from API
    loadDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [searchQuery, selectedSpecialization, doctors]);

  const loadDoctors = () => {
    setIsLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setDoctors(actualDoctors);
      setFilteredDoctors(actualDoctors);
      setSpecializations(actualSpecializations);
      setIsLoading(false);
    }, 500);
  };
  
  const filterDoctors = () => {
    let filtered = [...doctors];
    
    // Filter by specialization
    if (selectedSpecialization !== null) {
      const selectedSpecialtyName = specializations.find(
        spec => spec.id === selectedSpecialization
      )?.name;
      
      filtered = filtered.filter(
        (doctor) => doctor.specialty === selectedSpecialtyName
      );
    }
    
    // Filter by search query (doctor name or specialization)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doctor) =>
        doctor.name.toLowerCase().includes(query) || 
        doctor.specialty.toLowerCase().includes(query) ||
          doctor.bio.toLowerCase().includes(query)
      );
    }
    
    setFilteredDoctors(filtered);
  };

  const handleBookAppointment = (doctorId: number) => {
    if (!user) {
      toast.error("Please login to book an appointment");
      navigate("/login");
      return;
    }
    
    navigate(`/doctors/${doctorId}`);
  };

  const handleSpecializationFilter = (specializationId: number) => {
    if (selectedSpecialization === specializationId) {
      setSelectedSpecialization(null);
    } else {
      setSelectedSpecialization(specializationId);
    }
  };

  const renderDoctorSkeleton = () => (
    Array(4).fill(0).map((_, index) => (
      <Card key={index} className="shadow-sm">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-9 w-full" />
        </CardFooter>
      </Card>
    ))
  );
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Find a Doctor</h1>

          {/* Search and Filter Section */}
          <div className="bg-card rounded-lg border p-4 mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                  placeholder="Search by doctor name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
              />
          </div>
          
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={!selectedSpecialization ? "bg-primary text-primary-foreground" : ""} onClick={() => setSelectedSpecialization(null)}>
                  All
                </Badge>
                {specializations.map((spec) => (
                  <Badge
                    key={spec.id}
                    variant="outline" 
                    className={selectedSpecialization === spec.id ? "bg-primary text-primary-foreground" : "cursor-pointer hover:bg-muted"}
                    onClick={() => handleSpecializationFilter(spec.id)}
                  >
                    {spec.name}
                  </Badge>
                ))}
              </div>
            </div>
              </div>
              
          {error && (
            <div className="bg-red-50 text-red-600 rounded-lg p-4 mb-6 border border-red-100">
              <p>{error}</p>
              <Button variant="outline" className="mt-2" onClick={loadDoctors}>
                Try Again
                  </Button>
                </div>
              )}
              
          {/* Doctors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? renderDoctorSkeleton() : (
              filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => (
                  <Card key={doctor.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-start gap-4 pb-2">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={doctor.image} alt={doctor.name} />
                        <AvatarFallback>
                          {doctor.name.split(' ')[1][0]}{doctor.name.split(' ')[2]?.[0] || ''}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">
                          {doctor.name}
                        </CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          {doctor.specialty}
                        </CardDescription>
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm">
                            {doctor.rating} ({doctor.reviewCount} reviews)
                          </span>
                          <span className="mx-2">•</span>
                          <span className="text-sm">{doctor.experience}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm line-clamp-3">
                        {doctor.bio || "No biography available."}
                      </p>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{doctor.availability}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={() => handleBookAppointment(doctor.id)}
                      >
                        Book Appointment
                  </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center p-8">
                  <h3 className="text-lg font-medium">No doctors found</h3>
                  <p className="text-muted-foreground mt-2">
                    Try adjusting your search or filters
                  </p>
                </div>
              )
              )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorsPage;
