import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ShoppingCart, Star, AlertCircle, Info, ChevronLeft, Plus, Minus, Truck, Shield, Clock, Calendar, Check } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Import medicine data directly from Medicines.tsx
// This is the same data used in the Medicines page
const medicineData = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    brand: "Generic",
    price: 35,
    discountPrice: 32,
    rating: 4.8,
    category: "Pain Relief",
    quantity: "10 tablets",
    image: "/Paracetamol.webp",
    description: "Paracetamol is used to treat headaches, muscle aches, arthritis, backache, toothaches, colds, and fevers.",
    usage: "Take 1-2 tablets every 4-6 hours as needed. Do not exceed 8 tablets in 24 hours.",
    sideEffects: "Rare side effects may include nausea, stomach pain, and rash. Seek medical attention if experiencing severe side effects.",
    contraindications: "Do not use if allergic to paracetamol. Consult doctor if you have liver disease, kidney disease, or consume alcohol regularly.",
    stock: 50,
    reviews: [
      { id: 1, user: "John D.", rating: 5, comment: "Works great for headaches!", date: "2023-05-15" },
      { id: 2, user: "Sarah M.", rating: 4, comment: "Effective pain relief, but takes some time to kick in.", date: "2023-06-22" },
      { id: 3, user: "Robert T.", rating: 5, comment: "Always keep this in my medicine cabinet.", date: "2023-07-10" }
    ]
  },
  {
    id: 2,
    name: "Amoxicillin 500mg",
    brand: "Generic",
    price: 84,
    discountPrice: 79,
    rating: 4.7,
    category: "Antibiotics",
    quantity: "10 capsules",
    image: "/Amoxicillin.webp",
    stock: 15
  },
  {
    id: 3,
    name: "Azithromycin 500mg",
    brand: "Generic",
    price: 90,
    discountPrice: 85,
    rating: 4.7,
    category: "Antibiotics",
    quantity: "3 tablets",
    image: "/Azithromycin.webp",
    stock: 12
  },
  {
    id: 4,
    name: "Ciprofloxacin 500mg",
    brand: "Generic",
    price: 70,
    discountPrice: 65,
    rating: 4.5,
    category: "Antibiotics",
    quantity: "10 tablets",
    image: "/Ciprofloxacin.webp",
    stock: 20
  },
  {
    id: 5,
    name: "Metformin 500mg",
    brand: "Generic",
    price: 25,
    discountPrice: 22,
    rating: 4.6,
    category: "Diabetes",
    quantity: "10 tablets",
    image: "/Metformin.webp",
    stock: 18
  },
  {
    id: 6,
    name: "Amlodipine 5mg",
    brand: "Generic",
    price: 15,
    discountPrice: 12,
    rating: 4.8,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Amlodipine.webp",
    stock: 25
  },
  {
    id: 7,
    name: "Atorvastatin 10mg",
    brand: "Generic",
    price: 55,
    discountPrice: 50,
    rating: 4.7,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Atorvastatin.webp",
    stock: 30
  },
  {
    id: 8,
    name: "Omeprazole 20mg",
    brand: "Generic",
    price: 20,
    discountPrice: 18,
    rating: 4.7,
    category: "Gastro",
    quantity: "10 capsules",
    image: "/Omeprazole.webp",
    stock: 22
  },
  {
    id: 9,
    name: "Pantoprazole 40mg",
    brand: "Generic",
    price: 40,
    discountPrice: 36,
    rating: 4.6,
    category: "Gastro",
    quantity: "10 tablets",
    image: "/Pantoprazole.webp",
    stock: 16
  },
  {
    id: 10,
    name: "Cetirizine 10mg",
    brand: "Generic",
    price: 10,
    discountPrice: 8,
    rating: 4.8,
    category: "Allergy",
    quantity: "10 tablets",
    image: "/Cetirizine.webp",
    stock: 40
  },
  {
    id: 11,
    name: "Levocetirizine 5mg",
    brand: "Generic",
    price: 12,
    discountPrice: 10,
    rating: 4.7,
    category: "Allergy",
    quantity: "10 tablets",
    image: "/Levocetirizine.webp",
    stock: 35
  },
  {
    id: 12,
    name: "Montelukast 10mg",
    brand: "Generic",
    price: 35,
    discountPrice: 30,
    rating: 4.6,
    category: "Allergy",
    quantity: "10 tablets",
    image: "/Montelukast.webp",
    stock: 28
  },
  {
    id: 13,
    name: "Losartan 50mg",
    brand: "Generic",
    price: 28,
    discountPrice: 25,
    rating: 4.6,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Losartan.webp",
    stock: 14
  },
  {
    id: 14,
    name: "Telmisartan 40mg",
    brand: "Generic",
    price: 38,
    discountPrice: 34,
    rating: 4.7,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Telmisartan.webp",
    stock: 17
  },
  {
    id: 15,
    name: "Metoprolol 50mg",
    brand: "Generic",
    price: 30,
    discountPrice: 27,
    rating: 4.6,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Metoprolol.webp",
    stock: 19
  },
  {
    id: 16,
    name: "Atenolol 50mg",
    brand: "Generic",
    price: 18,
    discountPrice: 15,
    rating: 4.7,
    category: "Cardiac",
    quantity: "14 tablets",
    image: "/Atenolol.webp",
    stock: 23
  },
  {
    id: 17,
    name: "Furosemide 40mg",
    brand: "Generic",
    price: 12,
    discountPrice: 10,
    rating: 4.6,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Furosemide.webp",
    stock: 26
  },
  {
    id: 18,
    name: "Hydrochlorothiazide 25mg",
    brand: "Generic",
    price: 8,
    discountPrice: 6,
    rating: 4.5,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Hydrochlorothiazide.webp",
    stock: 32
  },
  {
    id: 19,
    name: "Spironolactone 25mg",
    brand: "Generic",
    price: 22,
    discountPrice: 19,
    rating: 4.6,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Spironolactone.webp",
    stock: 21
  },
  {
    id: 20,
    name: "Clopidogrel 75mg",
    brand: "Generic",
    price: 50,
    discountPrice: 45,
    rating: 4.7,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Clopidogrel.webp",
    stock: 18
  },
  {
    id: 21,
    name: "Aspirin 75mg",
    brand: "Generic",
    price: 5,
    discountPrice: 4,
    rating: 4.6,
    category: "Pain Relief",
    quantity: "14 tablets",
    image: "/Aspirin.webp",
    stock: 42
  },
  {
    id: 22,
    name: "Rosuvastatin 10mg",
    brand: "Generic",
    price: 60,
    discountPrice: 54,
    rating: 4.7,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Rosuvastatin.webp",
    stock: 15
  },
  {
    id: 23,
    name: "Simvastatin 20mg",
    brand: "Generic",
    price: 50,
    discountPrice: 45,
    rating: 4.6,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Simvastatin.webp",
    stock: 13
  },
  {
    id: 24,
    name: "Doxycycline 100mg",
    brand: "Generic",
    price: 35,
    discountPrice: 30,
    rating: 4.6,
    category: "Antibiotics",
    quantity: "10 capsules",
    image: "/Doxycycline.webp",
    stock: 24
  },
  {
    id: 25,
    name: "Levofloxacin 500mg",
    brand: "Generic",
    price: 65,
    discountPrice: 60,
    rating: 4.7,
    category: "Antibiotics",
    quantity: "5 tablets",
    image: "/Levofloxacin.jpg",
    stock: 17
  }
];

const MedicineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [medicine, setMedicine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState(0);

  // Add image error handler
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/Paracetamol.webp";  // Use the same fallback as in the Medicines page
  };

  useEffect(() => {
    // In a real app, this would be an API call
    const loadMedicine = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        const foundMedicine = medicineData.find(m => m.id === Number(id));
        if (foundMedicine) {
          setMedicine(foundMedicine);
          
          // Generate random estimated delivery time between 10-20 minutes
          const minutes = Math.floor(Math.random() * 11) + 10; // 10-20 minutes
          setEstimatedMinutes(minutes);
        } else {
          // If medicine not found, go back to medicines page
          toast({
            variant: "destructive",
            title: "Medicine not found",
            description: "The requested medicine could not be found."
          });
          navigate('/medicines');
        }
      } catch (error) {
        console.error("Error loading medicine:", error);
        toast({
          variant: "destructive",
          title: "Error loading medicine",
          description: "There was an error loading the medicine details."
        });
      } finally {
        setLoading(false);
      }
    };

    loadMedicine();
  }, [id, navigate, toast]);

  const incrementQuantity = () => {
    if (medicine && quantity < medicine.stock) {
      setQuantity(prev => prev + 1);
    } else {
      toast({
        variant: "destructive", // Changed from "warning" to "destructive" to fix the error
        title: "Maximum quantity reached",
        description: "You've reached the maximum available quantity for this product."
      });
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (medicine) {
      addToCart(medicine, quantity);
      toast({
        title: "Added to cart",
        description: `${quantity} ${quantity === 1 ? 'unit' : 'units'} of ${medicine.name} added to your cart.`
      });
    }
  };

  const handleOrderNow = () => {
    if (medicine) {
      // Add to cart and then open checkout dialog
      addToCart(medicine, quantity);
      setShowCheckoutDialog(true);
    }
  };

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: `${medicine?.name} has been ${isWishlisted ? "removed from" : "added to"} your wishlist.`
    });
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
  };

  const handleProceedToPayment = () => {
    if (!deliveryAddress.trim()) {
      toast({
        variant: "destructive",
        title: "Address required",
        description: "Please enter a delivery address to continue."
      });
      return;
    }
    setCheckoutStep(2);
  };

  const handlePlaceOrder = () => {
    // Simulate payment processing
    setCheckoutStep(3);
    
    // Generate random order number
    const randomOrderNumber = "MED" + Math.floor(100000 + Math.random() * 900000);
    setOrderNumber(randomOrderNumber);
    
    // Simulate order confirmation after 2 seconds
    setTimeout(() => {
      setOrderPlaced(true);
    }, 2000);
  };

  const handleCloseCheckout = () => {
    if (orderPlaced) {
      // If order was placed, navigate to medicines page
      setShowCheckoutDialog(false);
      setOrderPlaced(false);
      setCheckoutStep(1);
      setDeliveryAddress("");
      navigate('/medicines');
    } else {
      // Just close the dialog
      setShowCheckoutDialog(false);
      setCheckoutStep(1);
      setDeliveryAddress("");
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-2/5">
                <Skeleton className="w-full aspect-square rounded-lg" />
              </div>
              <div className="w-full md:w-3/5 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <div className="pt-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!medicine) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Medicine Not Found</h1>
          <p className="text-gray-600 mb-6">The medicine you're looking for could not be found.</p>
          <Button onClick={() => navigate('/medicines')}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Medicines
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Button 
            variant="outline" 
            className="mb-6" 
            onClick={() => navigate('/medicines')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Medicines
          </Button>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Product Image */}
            <div className="w-full md:w-2/5">
              <motion.div 
                className="bg-white border rounded-lg overflow-hidden shadow-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative aspect-square">
                  <img 
                    src={medicine.image} 
                    alt={medicine.name} 
                    className="w-full h-full object-contain p-8"
                    onError={handleImageError}
                  />
                  {medicine.discountPrice < medicine.price && (
                    <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600">
                      {Math.round(((medicine.price - medicine.discountPrice) / medicine.price) * 100)}% OFF
                    </Badge>
                  )}
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute top-4 right-4"
                    onClick={handleToggleWishlist}
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Product Details */}
            <div className="w-full md:w-3/5">
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{medicine.name}</h1>
                  <p className="text-gray-500">{medicine.brand}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 font-medium">{medicine.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    ({medicine.reviews?.length || 0} reviews)
                  </span>
                  <Badge variant="outline" className="ml-2">{medicine.category}</Badge>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">₹{medicine.discountPrice}</span>
                  {medicine.discountPrice < medicine.price && (
                    <span className="text-lg text-gray-500 line-through">₹{medicine.price}</span>
                  )}
                  <span className="text-sm text-gray-600">per {medicine.quantity}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <span className={`mr-2 ${medicine.stock > 10 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {medicine.stock > 10 
                      ? 'In Stock' 
                      : `Only ${medicine.stock} left`}
                  </span>
                </div>

                <div className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-md">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10"
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-10 text-center font-medium">{quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10"
                        onClick={incrementQuantity}
                        disabled={medicine.stock <= quantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button 
                      className="bg-medical-500 hover:bg-medical-600 text-white"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button 
                      className="bg-medical-600 hover:bg-medical-700 text-white"
                      onClick={handleOrderNow}
                    >
                      Order Now
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="flex items-center">
                    <Truck className="h-5 w-5 text-medical-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium">Free Delivery</div>
                      <div className="text-xs text-gray-500">On orders above ₹200</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-medical-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium">Genuine Products</div>
                      <div className="text-xs text-gray-500">100% authentic</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-medical-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium">Express Delivery</div>
                      <div className="text-xs text-gray-500">In {estimatedMinutes} minutes</div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <Tabs defaultValue="description" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="usage">Usage</TabsTrigger>
                  <TabsTrigger value="sideEffects">Side Effects</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="pt-4">
                  <div className="text-gray-700 space-y-4">
                    <p>{medicine.description}</p>
                    <p>{medicine.contraindications}</p>
                  </div>
                </TabsContent>
                <TabsContent value="usage" className="pt-4">
                  <div className="text-gray-700 space-y-4">
                    <h3 className="font-medium">How to use {medicine.name}</h3>
                    <p>{medicine.usage}</p>
                    <div className="flex items-start gap-2 bg-blue-50 p-4 rounded-md">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        Always consult with a healthcare professional before starting any medication.
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="sideEffects" className="pt-4">
                  <div className="text-gray-700 space-y-4">
                    <h3 className="font-medium">Possible Side Effects</h3>
                    <p>{medicine.sideEffects}</p>
                    <div className="flex items-start gap-2 bg-yellow-50 p-4 rounded-md">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div className="text-sm text-yellow-700">
                        If you experience severe or persistent side effects, stop taking the medication and contact your doctor immediately.
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="reviews" className="pt-4">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center bg-medical-50 rounded-full h-16 w-16">
                        <div className="text-center">
                          <div className="text-xl font-bold text-medical-600">{medicine.rating}</div>
                          <div className="flex items-center justify-center">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const reviewCount = medicine.reviews?.filter((r: any) => r.rating === star).length || 0;
                            const percentage = medicine.reviews?.length ? (reviewCount / medicine.reviews.length) * 100 : 0;
                            
                            return (
                              <div key={star} className="flex items-center gap-2">
                                <div className="text-sm text-gray-600 w-6">{star}</div>
                                <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                                <Progress value={percentage} className="h-2 flex-1" />
                                <div className="text-sm text-gray-600 w-10">{reviewCount}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="divide-y">
                      {medicine.reviews && medicine.reviews.length > 0 ? (
                        medicine.reviews.map((review: any) => (
                          <div key={review.id} className="py-4">
                            <div className="flex justify-between mb-1">
                              <div className="font-medium">{review.user}</div>
                              <div className="text-sm text-gray-500">{review.date}</div>
                            </div>
                            <div className="flex items-center mb-2">
                              {Array.from({ length: 5 }).map((_, index) => (
                                <Star 
                                  key={index} 
                                  className={`h-4 w-4 ${index < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center text-gray-500">
                          No reviews available for this product yet.
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {orderPlaced 
                ? "Order Placed Successfully!" 
                : checkoutStep === 3 
                  ? "Processing Payment" 
                  : checkoutStep === 2 
                    ? "Payment Details" 
                    : "Shipping Details"}
            </DialogTitle>
            <DialogDescription>
              {orderPlaced 
                ? `Your order #${orderNumber} has been placed successfully.` 
                : checkoutStep === 3 
                  ? "Please wait while we process your payment." 
                  : checkoutStep === 2 
                    ? "Enter your payment details to complete your order." 
                    : "Enter your shipping address to proceed with your order."}
            </DialogDescription>
          </DialogHeader>

          {checkoutStep === 1 && (
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label htmlFor="address">Delivery Address</Label>
                <Input
                  id="address"
                  placeholder="Enter your full address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-1">
                <Label>Delivery Option</Label>
                <div className="flex items-center justify-between space-x-2 rounded-md border p-3 bg-medical-50">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-medical-600" />
                    <Label className="font-medium text-medical-700">Express Delivery</Label>
                  </div>
                  <div className="text-sm font-medium text-medical-700">In {estimatedMinutes} minutes</div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Our quick delivery service ensures your medicine will arrive in {estimatedMinutes} minutes or less</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{medicine.discountPrice * quantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>{medicine.discountPrice * quantity >= 200 ? 'Free' : '₹40'}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>₹{medicine.discountPrice * quantity + (medicine.discountPrice * quantity >= 200 ? 0 : 40)}</span>
                </div>
              </div>
            </div>
          )}

          {checkoutStep === 2 && (
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label>Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={handlePaymentMethodChange} className="space-y-2">
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="font-normal">Credit/Debit Card</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="font-normal">UPI</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="font-normal">Cash on Delivery</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {paymentMethod === 'card' && (
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input id="cardName" placeholder="John Doe" />
                  </div>
                </div>
              )}
              
              {paymentMethod === 'upi' && (
                <div className="space-y-1">
                  <Label htmlFor="upiId">UPI ID</Label>
                  <Input id="upiId" placeholder="yourname@upi" />
                </div>
              )}
              
              {paymentMethod === 'cod' && (
                <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-700">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-1" />
                    <div>
                      <p className="font-medium">Cash on Delivery Available</p>
                      <p>Please keep exact change ready at the time of delivery.</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Total Amount</span>
                  <span className="font-medium">₹{medicine.discountPrice * quantity + (medicine.discountPrice * quantity >= 200 ? 0 : 40)}</span>
                </div>
              </div>
            </div>
          )}

          {checkoutStep === 3 && !orderPlaced && (
            <div className="py-6 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical-600"></div>
                <p className="text-gray-500">Processing your payment, please wait...</p>
              </div>
            </div>
          )}

          {orderPlaced && (
            <div className="py-4 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-green-100 rounded-full p-3">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-lg">Thank you for your order!</p>
                  <p className="text-gray-600">Order #: {orderNumber}</p>
                  <p className="text-gray-600 text-sm mt-1">
                    Your order will arrive in approximately {estimatedMinutes} minutes
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {orderPlaced ? (
              <Button 
                onClick={handleCloseCheckout}
                className="w-full bg-medical-600 hover:bg-medical-700"
              >
                Continue Shopping
              </Button>
            ) : checkoutStep === 3 ? (
              <Button disabled className="w-full">
                Processing...
              </Button>
            ) : checkoutStep === 2 ? (
              <div className="flex w-full gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setCheckoutStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handlePlaceOrder}
                  className="flex-1 bg-medical-600 hover:bg-medical-700"
                >
                  Place Order
                </Button>
              </div>
            ) : (
              <div className="flex w-full gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleCloseCheckout}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleProceedToPayment}
                  className="flex-1 bg-medical-600 hover:bg-medical-700"
                >
                  Proceed to Payment
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default MedicineDetails;
