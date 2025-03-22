'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import DoctorCard from '@/components/doctors/DoctorCard';
import Pagination from '@/components/common/Pagination';
import { useDoctors } from '@/hooks/useDoctors';

export default function DoctorsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get search parameters
  const initialSearch = searchParams.get('search') || '';
  const initialSpecialty = searchParams.get('specialty') || '';
  const initialAvailabilityToday = searchParams.get('available_today') === 'true';
  const initialVideoConsult = searchParams.get('video_consult') === 'true';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  
  // Local state
  const [search, setSearch] = useState(initialSearch);
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [availabilityToday, setAvailabilityToday] = useState(initialAvailabilityToday);
  const [videoConsult, setVideoConsult] = useState(initialVideoConsult);
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  // Fetch doctors with the current filters
  const { 
    doctors, 
    specialties, 
    loading, 
    error,
    totalPages,
    totalCount
  } = useDoctors({
    search,
    specialty,
    availableToday: availabilityToday,
    videoConsult,
    page: currentPage
  });

  // Update URL with current filters
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (search) params.set('search', search);
    if (specialty) params.set('specialty', specialty);
    if (availabilityToday) params.set('available_today', 'true');
    if (videoConsult) params.set('video_consult', 'true');
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/doctors?${queryString}` : '/doctors';
    
    router.push(url, { scroll: false });
  }, [search, specialty, availabilityToday, videoConsult, currentPage, router]);
  
  // Handler for search submissions
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset pagination on new search
  };
  
  // Handler for changing page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Find Doctors</h1>
      
      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              type="text"
              placeholder="Search doctors by name or hospital..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Select specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Specialties</SelectItem>
                {specialties.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Button type="submit" className="w-full">
              Search
            </Button>
          </div>
        </form>
        
        <div className="flex flex-wrap gap-6 mt-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="available-today" 
              checked={availabilityToday}
              onCheckedChange={(checked) => setAvailabilityToday(checked === true)}
            />
            <label 
              htmlFor="available-today" 
              className="text-sm font-medium leading-none cursor-pointer"
            >
              Available Today
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="video-consult" 
              checked={videoConsult}
              onCheckedChange={(checked) => setVideoConsult(checked === true)}
            />
            <label 
              htmlFor="video-consult" 
              className="text-sm font-medium leading-none cursor-pointer"
            >
              Video Consultation
            </label>
          </div>
        </div>
      </div>
      
      {/* Results Section */}
      <div className="mb-4">
        <p className="text-gray-600">
          {loading ? 'Searching...' : `${totalCount} doctors found`}
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 animate-pulse h-64 rounded-lg"></div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No doctors found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
} 