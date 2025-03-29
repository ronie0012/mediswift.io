import { supabase } from './supabase';
import type { Database } from '@/types/database.types';

export type Review = Database['public']['Tables']['reviews']['Row'];
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update'];

// Create doctor review
export const createDoctorReview = async (
  review: Omit<ReviewInsert, 'order_id' | 'ambulance_request_id'>
) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();

  if (data && data.doctor_id) {
    // Update doctor's average rating
    await updateDoctorAverageRating(data.doctor_id);
  }

  return { data, error };
};

// Create order review
export const createOrderReview = async (
  review: Omit<ReviewInsert, 'doctor_id' | 'appointment_id' | 'ambulance_request_id'>
) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();

  return { data, error };
};

// Create ambulance service review
export const createAmbulanceReview = async (
  review: Omit<ReviewInsert, 'doctor_id' | 'appointment_id' | 'order_id'>
) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();

  return { data, error };
};

// Get review by ID
export const getReviewById = async (id: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:reviewer_id (
        id,
        first_name,
        last_name,
        avatar_url
      ),
      doctor:doctor_id (
        id,
        specialty,
        profiles:id (
          first_name,
          last_name
        )
      )
    `)
    .eq('id', id)
    .single();

  return { data, error };
};

// Get reviews for a doctor
export const getDoctorReviews = async (doctorId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:reviewer_id (
        id,
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });

  return { data, error };
};

// Get reviews by user
export const getUserReviews = async (userId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      doctor:doctor_id (
        id,
        specialty,
        profiles:id (
          first_name,
          last_name
        )
      ),
      order:order_id (
        id,
        order_date
      ),
      ambulance:ambulance_request_id (
        id,
        request_time,
        service:service_id (
          name
        )
      )
    `)
    .eq('reviewer_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
};

// Update review
export const updateReview = async (
  id: string,
  updates: Partial<Pick<ReviewUpdate, 'rating' | 'review_text' | 'is_anonymous'>>
) => {
  const { data, error } = await supabase
    .from('reviews')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (data && data.doctor_id) {
    // Update doctor's average rating if the rating was changed
    if (updates.rating) {
      await updateDoctorAverageRating(data.doctor_id);
    }
  }

  return { data, error };
};

// Delete review
export const deleteReview = async (id: string) => {
  // Get the review first to check if it's a doctor review
  const { data: review } = await getReviewById(id);
  const doctorId = review?.doctor_id;

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);

  if (!error && doctorId) {
    // Update doctor's average rating
    await updateDoctorAverageRating(doctorId);
  }

  return { error };
};

// Update doctor's average rating
async function updateDoctorAverageRating(doctorId: string) {
  // Get all reviews for the doctor
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('doctor_id', doctorId);

  if (error || !reviews || reviews.length === 0) {
    return;
  }

  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = parseFloat((totalRating / reviews.length).toFixed(2));

  // Update doctor's average rating and total reviews
  await supabase
    .from('doctors')
    .update({
      average_rating: averageRating,
      total_reviews: reviews.length,
      updated_at: new Date().toISOString(),
    })
    .eq('id', doctorId);
}

// Check if user has already reviewed
export const hasUserReviewed = async (
  userId: string,
  type: 'doctor' | 'order' | 'ambulance',
  id: string
) => {
  const fieldName = 
    type === 'doctor' ? 'appointment_id' : 
    type === 'order' ? 'order_id' : 'ambulance_request_id';

  const { count, error } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('reviewer_id', userId)
    .eq(fieldName, id);

  return {
    hasReviewed: count !== null && count > 0,
    error,
  };
}; 