import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Doctor } from '@/components/doctors/DoctorCard';

interface UseDoctorsParams {
  search?: string;
  specialty?: string;
  availableToday?: boolean;
  videoConsult?: boolean;
  page?: number;
  perPage?: number;
}

interface UseDoctorsResult {
  doctors: Doctor[];
  specialties: string[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  totalCount: number;
}

export function useDoctors({
  search = '',
  specialty = '',
  availableToday = false,
  videoConsult = false,
  page = 1,
  perPage = 9
}: UseDoctorsParams = {}): UseDoctorsResult {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const supabase = createClientComponentClient<Database>();
  
  // Fetch doctors based on filters
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build the query with filters
        let query = supabase
          .from('doctors')
          .select('*', { count: 'exact' });
        
        // Apply filters
        if (search) {
          query = query.or(`name.ilike.%${search}%,hospital.ilike.%${search}%`);
        }
        
        if (specialty) {
          query = query.eq('specialty', specialty);
        }
        
        if (availableToday) {
          query = query.eq('available_today', true);
        }
        
        if (videoConsult) {
          query = query.eq('available_for_video', true);
        }
        
        // Add pagination
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;
        
        // Execute the query with pagination
        const { data, error, count } = await query
          .order('rating', { ascending: false })
          .range(from, to);
        
        if (error) throw error;
        
        setDoctors(data as Doctor[]);
        setTotalCount(count || 0);
        setTotalPages(Math.ceil((count || 0) / perPage));
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setError('Failed to load doctors. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoctors();
  }, [search, specialty, availableToday, videoConsult, page, perPage, supabase]);
  
  // Fetch available specialties (only once)
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('specialty')
          .order('specialty');
        
        if (error) throw error;
        
        // Extract unique specialties
        const uniqueSpecialties = [...new Set(data.map(d => d.specialty))];
        setSpecialties(uniqueSpecialties);
      } catch (error) {
        console.error('Error fetching specialties:', error);
      }
    };
    
    fetchSpecialties();
  }, [supabase]);
  
  return { doctors, specialties, loading, error, totalPages, totalCount };
} 