import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, Star } from "lucide-react";
import { Link } from "react-router-dom";

// Sample doctor data
const doctors = [
  {
    id: 1,
    name: "Dr. Anil Sharma",
    specialty: "General Physician",
    experience: "12 years",
    rating: 4.5,
    reviewCount: 150,
    availability: "Available Today",
    image: "https://randomuser.me/api/portraits/men/65.jpg"
  },
  {
    id: 2,
    name: "Dr. Vikram Patel",
    specialty: "Cardiologist",
    experience: "18 years",
    rating: 4.8,
    reviewCount: 200,
    availability: "Available Tomorrow",
    image: "https://randomuser.me/api/portraits/men/45.jpg"
  },
  {
    id: 3,
    name: "Dr. Sanjay Gupta",
    specialty: "Neurologist",
    experience: "15 years",
    rating: 4.7,
    reviewCount: 160,
    availability: "Available Today",
    image: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: 4,
    name: "Dr. Rohan Joshi",
    specialty: "Pediatrician",
    experience: "14 years",
    rating: 4.9,
    reviewCount: 220,
    availability: "Available in 2 days",
    image: "https://randomuser.me/api/portraits/men/86.jpg"
  }
];

const DoctorCard = ({ doctor }: { doctor: any }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start">
          <Avatar className="h-16 w-16 rounded-lg">
            <AvatarImage src={doctor.image} alt={doctor.name} />
            <AvatarFallback>{doctor.name[0]}{doctor.name.split(' ')[1][0]}</AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <h3 className="font-bold text-gray-900">{doctor.name}</h3>
            <p className="text-medical-600">{doctor.specialty}</p>
            <div className="flex items-center mt-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium ml-1">{doctor.rating}</span>
              <span className="text-xs text-gray-500 ml-1">({doctor.reviewCount} reviews)</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{doctor.experience} experience</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-600 font-medium">{doctor.availability}</span>
            <Button asChild className="bg-medical-500 hover:bg-medical-600">
              <Link to={`/doctors/${doctor.id}`}>Book Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DoctorsSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Top Doctors</h2>
            <p className="text-gray-600">Consult with top specialists for your health concerns</p>
          </div>
          <Button asChild variant="outline" className="mt-4 md:mt-0">
            <Link to="/doctors" className="flex items-center">
              View All Doctors <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DoctorsSection;
