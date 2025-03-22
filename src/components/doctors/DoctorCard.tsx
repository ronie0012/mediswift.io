import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  review_count: number;
  consultation_fee: number;
  available_today: boolean;
  available_for_video: boolean;
  image: string;
  hospital: string;
  location: string;
}

interface DoctorCardProps {
  doctor: Doctor;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/doctors/${doctor.id}`}>
        <div className="p-4">
          <div className="flex items-start space-x-4">
            <div className="relative h-24 w-24 rounded-full overflow-hidden border bg-gray-100 flex-shrink-0">
              <Image
                src={doctor.image || '/placeholder-doctor.jpg'}
                alt={doctor.name}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="flex-grow">
              <h3 className="font-medium text-lg">{doctor.name}</h3>
              <p className="text-sm text-gray-600">{doctor.specialty}</p>
              <p className="text-sm text-gray-600">{doctor.experience} experience</p>
              
              <div className="flex items-center mt-1">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 text-sm font-medium">{doctor.rating}</span>
                </div>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-sm text-gray-600">{doctor.review_count} reviews</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{doctor.hospital}</p>
                <p className="text-sm text-gray-500">{doctor.location}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium">₹{doctor.consultation_fee}</p>
                <p className="text-xs text-gray-500">Consultation Fee</p>
              </div>
            </div>
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
          </div>
        </div>
      </Link>
      
      <div className="px-4 py-3 bg-gray-50 border-t">
        <Link href={`/doctors/${doctor.id}`}>
          <Button className="w-full">Book Appointment</Button>
        </Link>
      </div>
    </div>
  );
} 