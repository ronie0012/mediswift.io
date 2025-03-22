import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';

export type Doctor = Database['public']['Tables']['doctors']['Row'];

export interface DoctorWithReviews extends Doctor {
  reviews?: {
    id: number;
    user_id: string;
    rating: number;
    comment: string;
    date: string;
    user_name?: string;
  }[];
}

export interface DoctorFilters {
  specialty?: string;
  availableToday?: boolean;
  availableForVideo?: boolean;
  availableForInClinic?: boolean;
  searchQuery?: string;
  sortBy?: 'rating_desc' | 'experience_desc' | 'fee_asc' | 'fee_desc';
  page?: number;
  perPage?: number;
}

class DoctorService {
  async getAllDoctors(filters?: DoctorFilters): Promise<{ doctors: Doctor[]; total: number }> {
    try {
      let query = supabase
        .from('doctors')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (filters) {
        if (filters.specialty && filters.specialty !== 'All') {
          query = query.eq('specialty', filters.specialty);
        }
        
        if (filters.availableToday) {
          query = query.eq('available_today', true);
        }
        
        if (filters.availableForVideo) {
          query = query.eq('available_for_video', true);
        }
        
        if (filters.availableForInClinic) {
          query = query.eq('available_for_in_clinic', true);
        }
        
        if (filters.searchQuery) {
          query = query.or(`name.ilike.%${filters.searchQuery}%,specialty.ilike.%${filters.searchQuery}%,hospital.ilike.%${filters.searchQuery}%`);
        }
        
        // Apply sorting
        if (filters.sortBy) {
          switch (filters.sortBy) {
            case 'rating_desc':
              query = query.order('rating', { ascending: false });
              break;
            case 'experience_desc':
              // Sort by experience (we'll need to extract the number of years)
              query = query.order('experience', { ascending: false });
              break;
            case 'fee_asc':
              query = query.order('consultation_fee', { ascending: true });
              break;
            case 'fee_desc':
              query = query.order('consultation_fee', { ascending: false });
              break;
            default:
              query = query.order('id', { ascending: true });
          }
        } else {
          query = query.order('id', { ascending: true });
        }
        
        // Apply pagination
        if (filters.page !== undefined && filters.perPage !== undefined) {
          const from = (filters.page - 1) * filters.perPage;
          const to = from + filters.perPage - 1;
          query = query.range(from, to);
        }
      }
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        doctors: data as Doctor[],
        total: count || 0
      };
    } catch (error) {
      console.error('Get all doctors error:', error);
      throw error;
    }
  }
  
  async getDoctorById(id: number): Promise<DoctorWithReviews | null> {
    try {
      const { data: doctor, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (!doctor) {
        return null;
      }
      
      // Get reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('*, users(name)')
        .eq('doctor_id', id);
      
      if (reviewsError) throw reviewsError;
      
      const formattedReviews = reviews.map(review => ({
        id: review.id,
        user_id: review.user_id,
        rating: review.rating,
        comment: review.comment,
        date: review.date,
        user_name: review.users?.name
      }));
      
      return {
        ...doctor,
        reviews: formattedReviews
      };
    } catch (error) {
      console.error('Get doctor by ID error:', error);
      throw error;
    }
  }
  
  async addReview(doctorId: number, userId: string, rating: number, comment: string): Promise<void> {
    try {
      // Add review
      const { error } = await supabase
        .from('reviews')
        .insert({
          doctor_id: doctorId,
          user_id: userId,
          rating,
          comment,
          date: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Update doctor rating
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('doctor_id', doctorId);
      
      if (reviewsError) throw reviewsError;
      
      if (reviews.length > 0) {
        const avgRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
        
        const { error: updateError } = await supabase
          .from('doctors')
          .update({ 
            rating: avgRating,
            review_count: reviews.length
          })
          .eq('id', doctorId);
        
        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error('Add review error:', error);
      throw error;
    }
  }
  
  async getDoctorSpecialties(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('specialty')
        .order('specialty');
      
      if (error) throw error;
      
      // Get unique specialties
      const specialties = ['All', ...new Set(data.map(item => item.specialty))];
      
      return specialties;
    } catch (error) {
      console.error('Get doctor specialties error:', error);
      throw error;
    }
  }
  
  async getDoctorAvailableSlots(doctorId: number, date: string): Promise<string[]> {
    try {
      const { data: doctor, error } = await supabase
        .from('doctors')
        .select('available_slots')
        .eq('id', doctorId)
        .single();
      
      if (error) throw error;
      
      if (!doctor || !doctor.available_slots) {
        return [];
      }
      
      // Get available slots for the selected date
      const availableSlots = doctor.available_slots[date] || [];
      
      // Get booked appointments for the date
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('doctor_id', doctorId)
        .eq('appointment_date', date)
        .in('status', ['confirmed', 'pending']);
      
      if (appointmentsError) throw appointmentsError;
      
      // Filter out booked slots
      const bookedSlots = appointments.map(a => a.appointment_time);
      const availableSlotsFiltered = availableSlots.filter(slot => !bookedSlots.includes(slot));
      
      return availableSlotsFiltered;
    } catch (error) {
      console.error('Get doctor available slots error:', error);
      throw error;
    }
  }
  
  // For admin use only
  async createDoctor(doctor: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>): Promise<Doctor> {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .insert({
          ...doctor,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Doctor;
    } catch (error) {
      console.error('Create doctor error:', error);
      throw error;
    }
  }
  
  // For admin use only
  async updateDoctor(id: number, doctor: Partial<Omit<Doctor, 'id' | 'created_at' | 'updated_at'>>): Promise<Doctor> {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .update({
          ...doctor,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Doctor;
    } catch (error) {
      console.error('Update doctor error:', error);
      throw error;
    }
  }
  
  // For admin use only
  async deleteDoctor(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Delete doctor error:', error);
      throw error;
    }
  }
}

export const doctorService = new DoctorService(); 