import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const medicineId = searchParams.get('medicine_id');
    const doctorId = searchParams.get('doctor_id');
    const userId = searchParams.get('user_id');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '10');
    
    // User can only see their own reviews if user_id is provided
    if (userId) {
      const user = await getCurrentUser();
      const isUserAdmin = await isAdmin();
      
      if (!user || (user.id !== userId && !isUserAdmin)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }
    
    // Build the query
    let query = supabase
      .from('reviews')
      .select('*, users(name), medicines:medicine_id(name), doctors:doctor_id(name)', { count: 'exact' });
    
    // Apply filters
    if (medicineId) {
      query = query.eq('medicine_id', medicineId);
    }
    
    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    // Apply pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);
    
    // Order by date (newest first)
    query = query.order('created_at', { ascending: false });
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
    
    // Return the result
    return NextResponse.json({
      reviews: data,
      totalCount: count,
      page,
      perPage,
      totalPages: Math.ceil((count || 0) / perPage)
    });
  } catch (error) {
    console.error('Error in GET /api/reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const {
      medicine_id,
      doctor_id,
      rating,
      comment
    } = body;
    
    // Validate required fields
    if (!rating || (rating < 1 || rating > 5) || !comment) {
      return NextResponse.json(
        { error: 'Rating (1-5) and comment are required' },
        { status: 400 }
      );
    }
    
    if (!medicine_id && !doctor_id) {
      return NextResponse.json(
        { error: 'Either medicine_id or doctor_id must be provided' },
        { status: 400 }
      );
    }
    
    if (medicine_id && doctor_id) {
      return NextResponse.json(
        { error: 'Only one of medicine_id or doctor_id should be provided' },
        { status: 400 }
      );
    }
    
    // Check if the user has already reviewed this item
    let existingReviewQuery = supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user.id);
    
    if (medicine_id) {
      existingReviewQuery = existingReviewQuery.eq('medicine_id', medicine_id);
    } else {
      existingReviewQuery = existingReviewQuery.eq('doctor_id', doctor_id);
    }
    
    const { data: existingReview, error: existingReviewError } = await existingReviewQuery.maybeSingle();
    
    if (existingReviewError) {
      console.error('Error checking existing review:', existingReviewError);
      return NextResponse.json(
        { error: 'Failed to check existing reviews' },
        { status: 500 }
      );
    }
    
    // If review exists, update it
    if (existingReview) {
      const { data, error } = await supabase
        .from('reviews')
        .update({
          rating,
          comment,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingReview.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating review:', error);
        return NextResponse.json(
          { error: 'Failed to update review' },
          { status: 500 }
        );
      }
      
      // Update the average rating
      await updateAverageRating(medicine_id, doctor_id);
      
      return NextResponse.json({ review: data, updated: true });
    }
    
    // Create a new review
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        medicine_id,
        doctor_id,
        rating,
        comment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating review:', error);
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      );
    }
    
    // Update the average rating
    await updateAverageRating(medicine_id, doctor_id);
    
    return NextResponse.json({ review: data, created: true });
  } catch (error) {
    console.error('Error in POST /api/reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }
    
    // Get the review to check ownership
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('user_id, medicine_id, doctor_id')
      .eq('id', id)
      .single();
    
    if (reviewError || !review) {
      console.error('Error getting review:', reviewError);
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to delete this review
    const isUserAdmin = await isAdmin();
    if (review.user_id !== user.id && !isUserAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Delete the review
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting review:', error);
      return NextResponse.json(
        { error: 'Failed to delete review' },
        { status: 500 }
      );
    }
    
    // Update the average rating
    await updateAverageRating(review.medicine_id, review.doctor_id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function updateAverageRating(medicineId?: number, doctorId?: number) {
  try {
    if (medicineId) {
      // Get all reviews for the medicine
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('medicine_id', medicineId);
      
      if (error || !reviews.length) {
        console.error('Error getting medicine reviews:', error);
        return;
      }
      
      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = totalRating / reviews.length;
      
      // Update the medicine's rating
      await supabase
        .from('medicines')
        .update({ rating: avgRating })
        .eq('id', medicineId);
    }
    
    if (doctorId) {
      // Get all reviews for the doctor
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('doctor_id', doctorId);
      
      if (error || !reviews.length) {
        console.error('Error getting doctor reviews:', error);
        return;
      }
      
      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = totalRating / reviews.length;
      
      // Update the doctor's rating and review count
      await supabase
        .from('doctors')
        .update({ 
          rating: avgRating,
          review_count: reviews.length
        })
        .eq('id', doctorId);
    }
  } catch (error) {
    console.error('Error updating average rating:', error);
  }
} 