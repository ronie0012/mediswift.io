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

export const doctorsData: Doctor[] = [
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
  // Add more doctors as needed...
]; 