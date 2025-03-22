'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Star, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const reviewSchema = z.object({
  rating: z.coerce.number().min(1, { message: "Rating is required" }).max(5),
  title: z.string().min(3, { message: "Title must be at least 3 characters" }).max(100),
  comment: z.string().min(10, { message: "Comment must be at least 10 characters" }).max(500),
});

type ReviewValues = z.infer<typeof reviewSchema>;

interface Medicine {
  id: number;
  name: string;
  brand: string;
  image: string;
}

export default function ReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [existingReview, setExistingReview] = useState<ReviewValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  
  const form = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      title: '',
      comment: '',
    },
  });
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push(`/auth/login?redirect=/medicines/${id}/review`);
    }
  }, [user, router, id]);
  
  // Fetch medicine details and check for existing review
  useEffect(() => {
    const fetchMedicineAndReview = async () => {
      if (!id || !user) return;
      
      try {
        // Fetch medicine details
        const { data: medicineData, error: medicineError } = await supabase
          .from('medicines')
          .select('id, name, brand, image')
          .eq('id', id)
          .single();
        
        if (medicineError) throw medicineError;
        setMedicine(medicineData as Medicine);
        
        // Check if user already has a review for this medicine
        const { data: reviewData, error: reviewError } = await supabase
          .from('reviews')
          .select('rating, title, comment')
          .eq('medicine_id', id)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (reviewError) throw reviewError;
        
        if (reviewData) {
          // Set existing review data
          setExistingReview(reviewData as ReviewValues);
          form.reset({
            rating: reviewData.rating,
            title: reviewData.title || '',
            comment: reviewData.comment,
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load medicine details. Please try again.",
        });
      }
    };
    
    fetchMedicineAndReview();
  }, [id, user, form, toast]);
  
  const onSubmit = async (values: ReviewValues) => {
    if (!user || !medicine) return;
    
    setIsSubmitting(true);
    
    try {
      const reviewData = {
        user_id: user.id,
        medicine_id: medicine.id,
        rating: values.rating,
        title: values.title,
        comment: values.comment,
      };
      
      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update(reviewData)
          .eq('user_id', user.id)
          .eq('medicine_id', medicine.id);
        
        if (error) throw error;
        
        toast({
          title: "Review updated",
          description: "Your review has been successfully updated.",
        });
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert(reviewData);
        
        if (error) throw error;
        
        toast({
          title: "Review submitted",
          description: "Thank you for your review!",
        });
      }
      
      // Redirect back to the medicine page
      router.push(`/medicines/${id}`);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit your review. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!medicine) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <div className="animate-pulse h-8 w-32 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Medicine
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>{existingReview ? 'Update Your Review' : 'Write a Review'}</CardTitle>
          <CardDescription>
            Share your experience with {medicine.name} by {medicine.brand}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <div
                            key={value}
                            className="cursor-pointer p-1"
                            onMouseEnter={() => setHoverRating(value)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => field.onChange(value)}
                          >
                            <Star
                              className={`h-8 w-8 ${
                                (hoverRating ? value <= hoverRating : value <= field.value)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </div>
                        ))}
                        <Input
                          type="hidden"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Click on a star to rate from 1 to 5
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Summarize your experience" {...field} />
                    </FormControl>
                    <FormDescription>
                      Add a brief headline for your review
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What did you like or dislike about this medicine?"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Share your experience with this product
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? "Submitting..." 
                  : existingReview 
                    ? "Update Review" 
                    : "Submit Review"
                }
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6 text-sm text-muted-foreground">
          <p>Your review helps other customers make better decisions</p>
        </CardFooter>
      </Card>
    </div>
  );
} 