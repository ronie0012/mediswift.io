import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';

export type Medicine = Database['public']['Tables']['medicines']['Row'];

export interface MedicineWithReviews extends Medicine {
  reviews?: {
    id: number;
    user_id: string;
    rating: number;
    comment: string;
    date: string;
    user_name?: string;
  }[];
}

export interface MedicineFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  searchQuery?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating_desc' | 'popularity';
  page?: number;
  perPage?: number;
}

class MedicineService {
  async getAllMedicines(filters?: MedicineFilters): Promise<{ medicines: Medicine[]; total: number }> {
    try {
      let query = supabase
        .from('medicines')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (filters) {
        if (filters.category && filters.category !== 'All') {
          query = query.eq('category', filters.category);
        }
        
        if (filters.priceMin !== undefined) {
          query = query.gte('price', filters.priceMin);
        }
        
        if (filters.priceMax !== undefined) {
          query = query.lte('price', filters.priceMax);
        }
        
        if (filters.searchQuery) {
          query = query.or(`name.ilike.%${filters.searchQuery}%,brand.ilike.%${filters.searchQuery}%`);
        }
        
        // Apply sorting
        if (filters.sortBy) {
          switch (filters.sortBy) {
            case 'price_asc':
              query = query.order('price', { ascending: true });
              break;
            case 'price_desc':
              query = query.order('price', { ascending: false });
              break;
            case 'rating_desc':
              query = query.order('rating', { ascending: false });
              break;
            // For popularity, we would need a view count or sales count column
            case 'popularity':
              query = query.order('rating', { ascending: false });
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
        medicines: data as Medicine[],
        total: count || 0
      };
    } catch (error) {
      console.error('Get all medicines error:', error);
      throw error;
    }
  }
  
  async getMedicineById(id: number): Promise<MedicineWithReviews | null> {
    try {
      const { data: medicine, error } = await supabase
        .from('medicines')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (!medicine) {
        return null;
      }
      
      // Get reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('*, users(name)')
        .eq('medicine_id', id);
      
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
        ...medicine,
        reviews: formattedReviews
      };
    } catch (error) {
      console.error('Get medicine by ID error:', error);
      throw error;
    }
  }
  
  async addReview(medicineId: number, userId: string, rating: number, comment: string): Promise<void> {
    try {
      // Add review
      const { error } = await supabase
        .from('reviews')
        .insert({
          medicine_id: medicineId,
          user_id: userId,
          rating,
          comment,
          date: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Update medicine rating
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('medicine_id', medicineId);
      
      if (reviewsError) throw reviewsError;
      
      if (reviews.length > 0) {
        const avgRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
        
        const { error: updateError } = await supabase
          .from('medicines')
          .update({ rating: avgRating })
          .eq('id', medicineId);
        
        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error('Add review error:', error);
      throw error;
    }
  }
  
  async getMedicineCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('category')
        .order('category');
      
      if (error) throw error;
      
      // Get unique categories
      const categories = ['All', ...new Set(data.map(item => item.category))];
      
      return categories;
    } catch (error) {
      console.error('Get medicine categories error:', error);
      throw error;
    }
  }
  
  // For admin use only
  async createMedicine(medicine: Omit<Medicine, 'id' | 'created_at' | 'updated_at'>): Promise<Medicine> {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .insert({
          ...medicine,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Medicine;
    } catch (error) {
      console.error('Create medicine error:', error);
      throw error;
    }
  }
  
  // For admin use only
  async updateMedicine(id: number, medicine: Partial<Omit<Medicine, 'id' | 'created_at' | 'updated_at'>>): Promise<Medicine> {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .update({
          ...medicine,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Medicine;
    } catch (error) {
      console.error('Update medicine error:', error);
      throw error;
    }
  }
  
  // For admin use only
  async deleteMedicine(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('medicines')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Delete medicine error:', error);
      throw error;
    }
  }
}

export const medicineService = new MedicineService(); 