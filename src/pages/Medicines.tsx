import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Heart, ShoppingCart, Filter, ChevronDown, Star, Plus, Minus } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

// Sample medicine data
const medicineCategories = [
  "All",
  "Fever & Pain Relief",
  "Cold & Cough",
  "Digestive Health",
  "Vitamins & Supplements",
  "Skin Care",
  "Personal Care",
  "Diabetes Care",
  "Heart Health",
  "Baby Care",
];

interface Medicine {
  id: number;
  name: string;
  brand: string;
  price: number;
  discountPrice: number;
  rating: number;
  image: string;
  category: string;
  quantity: string;
}

const medicineData: Medicine[] = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    brand: "Generic",
    price: 15,
    discountPrice: 12,
    rating: 4.8,
    category: "Pain Relief",
    quantity: "10 tablets",
    image: "/Paracetamol.webp"
  },
  {
    id: 2,
    name: "Amoxicillin 500mg",
    brand: "Generic",
    price: 50,
    discountPrice: 45,
    rating: 4.7,
    category: "Antibiotics",
    quantity: "10 capsules",
    image: "/Amoxicillin.webp"
  },
  {
    id: 3,
    name: "Azithromycin 500mg",
    brand: "Generic",
    price: 60,
    discountPrice: 55,
    rating: 4.7,
    category: "Antibiotics",
    quantity: "3 tablets",
    image: "/Azithromycin.webp"
  },
  {
    id: 4,
    name: "Ciprofloxacin 500mg",
    brand: "Generic",
    price: 55,
    discountPrice: 50,
    rating: 4.5,
    category: "Antibiotics",
    quantity: "10 tablets",
    image: "/Ciprofloxacin.webp"
  },
  {
    id: 5,
    name: "Metformin 500mg",
    brand: "Generic",
    price: 12,
    discountPrice: 10,
    rating: 4.6,
    category: "Diabetes",
    quantity: "10 tablets",
    image: "/Metformin.webp"
  },
  {
    id: 6,
    name: "Amlodipine 5mg",
    brand: "Generic",
    price: 20,
    discountPrice: 18,
    rating: 4.8,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Amlodipine.webp"
  },
  {
    id: 7,
    name: "Atorvastatin 10mg",
    brand: "Generic",
    price: 25,
    discountPrice: 22,
    rating: 4.7,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Atorvastatin.webp"
  },
  {
    id: 8,
    name: "Omeprazole 20mg",
    brand: "Generic",
    price: 18,
    discountPrice: 15,
    rating: 4.7,
    category: "Gastro",
    quantity: "10 capsules",
    image: "/Omeprazole.webp"
  },
  {
    id: 9,
    name: "Pantoprazole 40mg",
    brand: "Generic",
    price: 35,
    discountPrice: 30,
    rating: 4.6,
    category: "Gastro",
    quantity: "10 tablets",
    image: "/Pantoprazole.webp"
  },
  {
    id: 10,
    name: "Cetirizine 10mg",
    brand: "Generic",
    price: 15,
    discountPrice: 12,
    rating: 4.8,
    category: "Allergy",
    quantity: "10 tablets",
    image: "/Cetirizine.webp"
  },
  {
    id: 11,
    name: "Levocetirizine 5mg",
    brand: "Generic",
    price: 25,
    discountPrice: 22,
    rating: 4.7,
    category: "Allergy",
    quantity: "10 tablets",
    image: "/Levocetirizine.webp"
  },
  {
    id: 12,
    name: "Montelukast 10mg",
    brand: "Generic",
    price: 70,
    discountPrice: 65,
    rating: 4.6,
    category: "Allergy",
    quantity: "10 tablets",
    image: "/Montelukast.webp"
  },
  {
    id: 13,
    name: "Losartan 50mg",
    brand: "Generic",
    price: 30,
    discountPrice: 28,
    rating: 4.6,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Losartan.webp"
  },
  {
    id: 14,
    name: "Telmisartan 40mg",
    brand: "Generic",
    price: 45,
    discountPrice: 40,
    rating: 4.7,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Telmisartan.webp"
  },
  {
    id: 15,
    name: "Metoprolol 50mg",
    brand: "Generic",
    price: 25,
    discountPrice: 22,
    rating: 4.6,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Metoprolol.webp"
  },
  {
    id: 16,
    name: "Atenolol 50mg",
    brand: "Generic",
    price: 20,
    discountPrice: 18,
    rating: 4.7,
    category: "Cardiac",
    quantity: "14 tablets",
    image: "/Atenolol.webp"
  },
  {
    id: 17,
    name: "Furosemide 40mg",
    brand: "Generic",
    price: 15,
    discountPrice: 12,
    rating: 4.6,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Furosemide.webp"
  },
  {
    id: 18,
    name: "Hydrochlorothiazide 25mg",
    brand: "Generic",
    price: 12,
    discountPrice: 10,
    rating: 4.5,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Hydrochlorothiazide.webp"
  },
  {
    id: 19,
    name: "Spironolactone 25mg",
    brand: "Generic",
    price: 30,
    discountPrice: 28,
    rating: 4.6,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Spironolactone.webp"
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
    image: "/Clopidogrel.webp"
  },
  {
    id: 21,
    name: "Aspirin 75mg",
    brand: "Generic",
    price: 10,
    discountPrice: 8,
    rating: 4.6,
    category: "Pain Relief",
    quantity: "14 tablets",
    image: "/Aspirin.webp"
  },
  {
    id: 22,
    name: "Rosuvastatin 10mg",
    brand: "Generic",
    price: 50,
    discountPrice: 45,
    rating: 4.7,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Rosuvastatin.webp"
  },
  {
    id: 23,
    name: "Simvastatin 20mg",
    brand: "Generic",
    price: 30,
    discountPrice: 28,
    rating: 4.6,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Simvastatin.webp"
  },
  {
    id: 24,
    name: "Doxycycline 100mg",
    brand: "Generic",
    price: 40,
    discountPrice: 35,
    rating: 4.6,
    category: "Antibiotics",
    quantity: "10 capsules",
    image: "/Doxycycline.webp"
  },
  {
    id: 25,
    name: "Levofloxacin 500mg",
    brand: "Generic",
    price: 70,
    discountPrice: 65,
    rating: 4.7,
    category: "Antibiotics",
    quantity: "5 tablets",
    image: "/Levofloxacin.jpg"
  }
];

const categories = [
  "All",
  "Pain Relief",
  "Antibiotics",
  "Cardiac",
  "Gastro",
  "Allergy",
  "Diabetes"
];

const MedicineCard = ({ medicine }: { medicine: Medicine }) => {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = () => {
    addToCart(medicine, quantity);
    toast({
      title: "Added to cart",
      description: `${medicine.name} has been added to your cart.`,
      variant: "default",
    });
    setQuantity(1); // Reset quantity after adding to cart
  };

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: `${medicine.name} has been ${isWishlisted ? "removed from" : "added to"} your wishlist.`,
    });
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Fallback image if the main image fails to load
  const fallbackImage = "/Paracetamol.webp";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition-all border border-gray-100"
    >
      <div className="relative h-48 overflow-hidden bg-gray-50">
        {!imageLoaded && !imageError && (
          <Skeleton className="h-full w-full absolute top-0 left-0" />
        )}
        
        {medicine.discountPrice < medicine.price && (
          <Badge className="absolute top-2 left-2 z-10 bg-red-500 hover:bg-red-600">
            {Math.round(((medicine.price - medicine.discountPrice) / medicine.price) * 100)}% OFF
          </Badge>
        )}
        
        <button 
          className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 rounded-full hover:bg-white transition-colors"
          onClick={handleToggleWishlist}
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'} transition-colors`} />
        </button>
        
        <img 
          src={imageError ? fallbackImage : medicine.image}
          alt={medicine.name} 
          className={`w-full h-full object-contain p-2 transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
        />
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <div className="text-xs text-gray-500 mb-1 font-medium">{medicine.brand}</div>
          <h3 className="font-semibold text-gray-900 text-base line-clamp-2 h-12">{medicine.name}</h3>
        </div>
        
        <div className="flex items-center">
          <div className="flex items-center bg-green-50 px-2 py-0.5 rounded-full">
            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium ml-1 text-green-700">{medicine.rating}</span>
          </div>
          <span className="text-xs text-gray-500 ml-2">({Math.floor(Math.random() * 500) + 100})</span>
        </div>
        
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-gray-900">₹{medicine.discountPrice}</span>
              {medicine.discountPrice < medicine.price && (
                <span className="text-sm text-gray-500 line-through">₹{medicine.price}</span>
              )}
            </div>
            <div className="text-xs text-gray-600 mt-0.5">{medicine.quantity}</div>
          </div>
          
          <Button 
            size="sm" 
            className="bg-medical-600 hover:bg-medical-700 text-white h-9 px-3"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            <span>Add</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const Medicines = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredMedicines = medicineData.filter((medicine) => {
    const matchesCategory = activeCategory === "All" || medicine.category === activeCategory;
    const matchesSearch = medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         medicine.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <div className="bg-gradient-to-b from-medical-50 to-white pb-6">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-screen-xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Online Medicines</h1>
                <p className="text-gray-600 max-w-2xl">
                  Browse our wide range of medicines with fast delivery and attractive discounts
                </p>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search medicines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full border-gray-200 focus:border-medical-500"
                />
              </div>
            </div>
            
            {/* Categories */}
            <div className="flex overflow-x-auto gap-2 pb-4 mb-6 scrollbar-hide">
              {categories.map((category, index) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  onClick={() => setActiveCategory(category)}
                  className={`whitespace-nowrap rounded-full px-4 ${
                    activeCategory === category 
                      ? 'bg-medical-600 hover:bg-medical-700' 
                      : 'text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
            
            {/* Results info */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-600">
                Showing {filteredMedicines.length} {filteredMedicines.length === 1 ? 'medicine' : 'medicines'}
                {activeCategory !== "All" && ` in ${activeCategory}`}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>

            {/* Medicine Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-xl overflow-hidden shadow animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="flex justify-between items-end">
                        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-8 bg-gray-200 rounded-md w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredMedicines.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No medicines found</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  We couldn't find any medicines matching your criteria. Try adjusting your filters or search terms.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setActiveCategory("All");
                    setSearchQuery("");
                  }}
                  className="border-medical-500 text-medical-600 hover:bg-medical-50"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMedicines.map((medicine) => (
                  <MedicineCard key={medicine.id} medicine={medicine} />
                ))}
              </div>
            )}

            {/* Pagination placeholder for future */}
            {filteredMedicines.length > 0 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled className="text-gray-400 border-gray-200">
                    Previous
                  </Button>
                  <Button variant="default" size="sm" className="bg-medical-600 hover:bg-medical-700">
                    1
                  </Button>
                  <Button variant="outline" size="sm" className="text-gray-700 border-gray-200">
                    2
                  </Button>
                  <Button variant="outline" size="sm" className="text-gray-700 border-gray-200">
                    3
                  </Button>
                  <Button variant="outline" size="sm" className="text-gray-700 border-gray-200">
                    Next
                  </Button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Medicines;
