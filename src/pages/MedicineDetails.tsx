'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Star, 
  ShoppingCart, 
  Check, 
  ChevronRight, 
  Minus, 
  Plus, 
  Heart,
  Share2,
  PlusCircle,
  MinusCircle,
  ThumbsUp,
  ThumbsDown,
  User
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: number;
  user_id: string;
  medicine_id: number;
  rating: number;
  comment: string;
  created_at: string;
  users: {
    name: string;
    email: string;
  };
}

interface Medicine {
  id: number;
  name: string;
  brand: string;
  description: string;
  price: number;
  discount_price: number;
  image: string;
  stock: number;
  category: string;
  dosage: string;
  prescription_required: boolean;
  side_effects: string;
  usage: string;
  rating: number;
  review_count: number;
}

export default function MedicineDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedMedicines, setRelatedMedicines] = useState<Medicine[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('description');
  
  // Fetch medicine details
  useEffect(() => {
    async function fetchMedicineDetails() {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch medicine details
        const { data: medicineData, error: medicineError } = await supabase
          .from('medicines')
          .select('*')
          .eq('id', id)
          .single();
        
        if (medicineError) throw medicineError;
        if (!medicineData) throw new Error('Medicine not found');
        
        setMedicine(medicineData as Medicine);
        
        // Fetch related medicines in same category
        const { data: relatedData, error: relatedError } = await supabase
          .from('medicines')
          .select('*')
          .eq('category', medicineData.category)
          .neq('id', id)
          .limit(4);
        
        if (relatedError) throw relatedError;
        setRelatedMedicines(relatedData as Medicine[]);
        
      } catch (error: any) {
        console.error('Error fetching medicine details:', error);
        setError(error.message || 'Failed to load medicine details');
      } finally {
        setLoading(false);
      }
    }
    
    fetchMedicineDetails();
  }, [id]);
  
  // Fetch reviews
  useEffect(() => {
    async function fetchReviews() {
      if (!id) return;
      
      setReviewsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*, users(name, email)')
          .eq('medicine_id', id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setReviews(data as Review[]);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    }
    
    fetchReviews();
  }, [id]);
  
  // Handle quantity change
  const incrementQuantity = () => {
    if (medicine && quantity < medicine.stock) {
      setQuantity(quantity + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  // Handle add to cart
  const handleAddToCart = () => {
    if (!medicine) return;
    
    addToCart({
      id: medicine.id,
      name: medicine.name,
      price: medicine.discount_price,
      image: medicine.image,
      quantity,
      stock: medicine.stock,
      prescription_required: medicine.prescription_required
    });
    
    toast({
      title: "Added to cart",
      description: `${quantity} x ${medicine.name} added to your cart`,
    });
  };
  
  const handleBuyNow = (medicine: Medicine) => {
    addToCart({
      id: medicine.id,
      name: medicine.name,
      price: medicine.discount_price,
      image: medicine.image,
      quantity: 1,
      brand: medicine.brand
    });
    
    router.push('/cart');
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !medicine) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error || 'Medicine not found'}</p>
          <div className="mt-4">
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  const discountPercentage = Math.round((1 - medicine.discount_price / medicine.price) * 100);
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center space-x-1">
          <li>
            <Link href="/" className="text-gray-500 hover:text-primary">Home</Link>
          </li>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <li>
            <Link href="/medicines" className="text-gray-500 hover:text-primary">Medicines</Link>
          </li>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <li className="text-primary font-medium truncate max-w-[200px]">
            {medicine.name}
          </li>
        </ol>
      </nav>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Medicine Image */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-md p-4 flex items-center justify-center"
        >
          <div className="relative h-96 w-full">
            <Image
              src={medicine.image || '/placeholder-medicine.jpg'}
              alt={medicine.name}
              fill
              className="object-contain"
              priority
            />
          </div>
        </motion.div>
        
        {/* Medicine Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold">{medicine.name}</h1>
          <p className="text-lg text-gray-600 mb-2">{medicine.brand}</p>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 font-medium">{medicine.rating.toFixed(1)}</span>
              <span className="ml-1 text-gray-500">({medicine.review_count} reviews)</span>
            </div>
            {medicine.stock > 0 ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Check className="mr-1 h-3 w-3" /> In Stock
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Out of Stock
              </Badge>
            )}
            {medicine.prescription_required && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Prescription Required
              </Badge>
            )}
          </div>
          
          <div className="mb-6">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-primary">₹{medicine.discount_price.toFixed(2)}</span>
              {medicine.discount_price < medicine.price && (
                <>
                  <span className="text-xl text-gray-500 line-through">₹{medicine.price.toFixed(2)}</span>
                  <Badge className="bg-red-500">
                    {discountPercentage}% OFF
                  </Badge>
                </>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700 mb-2">Dosage: <span className="font-medium">{medicine.dosage}</span></p>
            <p className="text-gray-700 mb-2">Category: <span className="font-medium">{medicine.category}</span></p>
            <p className="text-gray-700">
              Availability: 
              <span className={`font-medium ${medicine.stock > 10 
                ? 'text-green-600' 
                : medicine.stock > 0 
                  ? 'text-orange-600' 
                  : 'text-red-600'}`}
              >
                {medicine.stock > 10 
                  ? ' In Stock' 
                  : medicine.stock > 0 
                    ? ` Only ${medicine.stock} left` 
                    : ' Out of Stock'}
              </span>
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center border rounded-md">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="h-10 w-10 rounded-none"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={incrementQuantity}
                disabled={medicine.stock <= quantity}
                className="h-10 w-10 rounded-none"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              onClick={handleAddToCart}
              disabled={medicine.stock === 0}
              className="flex-1"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            
            <Button variant="outline" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
            
            <Button variant="outline" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
          
          {medicine.prescription_required && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Prescription Required</p>
                    <p className="text-sm text-gray-600">You'll need to upload a valid prescription before your order is processed.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
      
      {/* Tabs Section */}
      <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab} className="mb-12">
        <TabsList className="w-full bg-muted grid grid-cols-3 rounded-lg">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="details">Details & Usage</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value="description" className="p-6 bg-white shadow-sm rounded-lg mt-4">
          <h3 className="text-xl font-semibold mb-4">Product Description</h3>
          <p className="text-gray-700 whitespace-pre-line">{medicine.description}</p>
        </TabsContent>
        
        <TabsContent value="details" className="p-6 bg-white shadow-sm rounded-lg mt-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Usage Instructions</h3>
              <p className="text-gray-700 whitespace-pre-line">{medicine.usage}</p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Side Effects</h3>
              <p className="text-gray-700 whitespace-pre-line">{medicine.side_effects}</p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Brand</p>
                  <p className="font-medium">{medicine.brand}</p>
                </div>
                <div>
                  <p className="text-gray-600">Category</p>
                  <p className="font-medium">{medicine.category}</p>
                </div>
                <div>
                  <p className="text-gray-600">Dosage</p>
                  <p className="font-medium">{medicine.dosage}</p>
                </div>
                <div>
                  <p className="text-gray-600">Prescription Required</p>
                  <p className="font-medium">{medicine.prescription_required ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="reviews" className="mt-4">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Customer Reviews</h3>
              {user && (
                <Button asChild>
                  <Link href={`/medicines/${medicine.id}/review`}>
                    Write a Review
                  </Link>
                </Button>
              )}
            </div>
            
            {reviewsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-16 bg-gray-200 rounded mb-2"></div>
                  </div>
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{review.users.name || review.users.email.split('@')[0]}</p>
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-5 w-5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    
                    <p className="text-gray-700">{review.comment}</p>
                    
                    <div className="flex items-center space-x-4 mt-3">
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 h-8 px-2">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Helpful
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 h-8 px-2">
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        Not Helpful
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Star className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium mb-2">No Reviews Yet</h4>
                <p className="text-gray-600 mb-4">Be the first to review this product</p>
                {user ? (
                  <Button asChild>
                    <Link href={`/medicines/${medicine.id}/review`}>
                      Write a Review
                    </Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href={`/auth/login?redirect=/medicines/${medicine.id}/review`}>
                      Sign in to Write a Review
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Related Products */}
      {relatedMedicines.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedMedicines.map((relatedMedicine) => (
              <Link href={`/medicines/${relatedMedicine.id}`} key={relatedMedicine.id}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative h-[200px] bg-gray-100 rounded-t-lg">
                      <Image
                        src={relatedMedicine.image || '/placeholder-medicine.jpg'}
                        alt={relatedMedicine.name}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                      {relatedMedicine.discount_price < relatedMedicine.price && (
                        <Badge className="absolute top-2 right-2 bg-red-500">
                          {Math.round((1 - relatedMedicine.discount_price / relatedMedicine.price) * 100)}% OFF
                        </Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium truncate">{relatedMedicine.name}</h3>
                      <p className="text-sm text-muted-foreground">{relatedMedicine.brand}</p>
                      <div className="flex items-center mt-2">
                        <div className="flex items-center mr-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm ml-1">{relatedMedicine.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-sm">{relatedMedicine.dosage}</span>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex flex-col">
                          {relatedMedicine.discount_price < relatedMedicine.price && (
                            <span className="text-sm line-through text-muted-foreground">
                              ₹{relatedMedicine.price.toFixed(2)}
                            </span>
                          )}
                          <span className="font-bold text-primary">
                            ₹{relatedMedicine.discount_price.toFixed(2)}
                          </span>
                        </div>
                        <Button size="sm" variant="secondary">
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
