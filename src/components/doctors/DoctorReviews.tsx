import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { formatDistanceToNow } from 'date-fns';
import ReviewForm from '@/components/common/ReviewForm';
import { useAuth } from '@/context/AuthContext';

interface Review {
  id: number;
  user_id: string;
  doctor_id: number;
  rating: number;
  comment: string;
  date: string;
  created_at: string;
  users: {
    name: string;
  };
}

interface DoctorReviewsProps {
  doctorId: number;
}

export default function DoctorReviews({ doctorId }: DoctorReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const supabase = createClientComponentClient<Database>();
  
  // Fetch reviews for the doctor
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*, users(name)')
          .eq('doctor_id', doctorId)
          .order('date', { ascending: false });
          
        if (error) throw error;
        
        setReviews(data as any[]);
        
        // If user is logged in, check if they have already reviewed
        if (user) {
          const userReviewData = data.find((review: any) => review.user_id === user.id);
          setUserReview(userReviewData || null);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError('Failed to load reviews. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [doctorId, user, supabase]);
  
  // Render stars for rating
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ));
  };
  
  // Handle review submission
  const handleReviewSubmit = async (rating: number, comment: string) => {
    try {
      const reviewData = {
        doctor_id: doctorId,
        rating,
        comment,
        date: new Date().toISOString(),
        user_id: user?.id,
      };
      
      let response;
      
      if (userReview) {
        // Update existing review
        response = await supabase
          .from('reviews')
          .update(reviewData)
          .eq('id', userReview.id)
          .select('*, users(name)');
      } else {
        // Create new review
        response = await supabase
          .from('reviews')
          .insert(reviewData)
          .select('*, users(name)');
      }
      
      if (response.error) throw response.error;
      
      // Update local state
      if (userReview) {
        setReviews(reviews.map(rev => 
          rev.id === userReview.id ? (response.data[0] as any) : rev
        ));
      } else {
        setReviews([response.data[0] as any, ...reviews]);
      }
      
      setUserReview(response.data[0] as any);
      setShowReviewForm(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again.');
    }
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Patient Reviews</h2>
          
          {user && !showReviewForm && (
            <Button 
              onClick={() => setShowReviewForm(true)}
              variant={userReview ? "outline" : "default"}
            >
              {userReview ? 'Edit Your Review' : 'Write a Review'}
            </Button>
          )}
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {showReviewForm && (
          <div className="mb-8">
            <ReviewForm 
              initialRating={userReview?.rating || 0}
              initialComment={userReview?.comment || ''}
              onSubmit={handleReviewSubmit}
              onCancel={() => setShowReviewForm(false)}
            />
          </div>
        )}
        
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="flex space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.users?.name || 'Anonymous'}`} />
                  <AvatarFallback>
                    {(review.users?.name || 'A').charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{review.users?.name || 'Anonymous'}</h3>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(review.date), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="flex mt-1 mb-2">
                    {renderStars(review.rating)}
                  </div>
                  
                  <p className="text-gray-700">{review.comment}</p>
                  
                  {user && user.id === review.user_id && !showReviewForm && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 h-8 text-blue-600 hover:text-blue-800"
                      onClick={() => setShowReviewForm(true)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 