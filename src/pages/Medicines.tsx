
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Heart, ShoppingCart, Filter, ChevronDown, Star, Plus, Minus } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/context/CartContext";

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

const medicineData = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    brandName: "Tylenol",
    category: "Fever & Pain Relief",
    price: 4.99,
    discountedPrice: 3.99,
    discountPercentage: 20,
    rating: 4.7,
    reviewCount: 253,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80",
    inStock: true,
    prescription: false,
    isFeatured: true
  },
  {
    id: 2,
    name: "Cetrizine 10mg",
    brandName: "Zyrtec",
    category: "Cold & Cough",
    price: 7.99,
    discountedPrice: 6.49,
    discountPercentage: 19,
    rating: 4.5,
    reviewCount: 187,
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    inStock: true,
    prescription: false,
    isFeatured: true
  },
  {
    id: 3,
    name: "Omeprazole 20mg",
    brandName: "Prilosec",
    category: "Digestive Health",
    price: 12.99,
    discountedPrice: 9.99,
    discountPercentage: 23,
    rating: 4.8,
    reviewCount: 324,
    image: "https://images.unsplash.com/photo-1550572017-edd951b55104?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    inStock: true,
    prescription: false,
    isFeatured: false
  },
  {
    id: 4,
    name: "Vitamin D3 1000IU",
    brandName: "Nature's Bounty",
    category: "Vitamins & Supplements",
    price: 15.99,
    discountedPrice: 13.99,
    discountPercentage: 13,
    rating: 4.6,
    reviewCount: 198,
    image: "https://images.unsplash.com/photo-1577460551100-905cc92e5c91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
    inStock: true,
    prescription: false,
    isFeatured: true
  },
  {
    id: 5,
    name: "Aspirin 75mg",
    brandName: "Bayer",
    category: "Heart Health",
    price: 6.99,
    discountedPrice: 5.99,
    discountPercentage: 14,
    rating: 4.9,
    reviewCount: 276,
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
    inStock: true,
    prescription: false,
    isFeatured: true
  },
  {
    id: 6,
    name: "Insulin Glargine",
    brandName: "Lantus",
    category: "Diabetes Care",
    price: 89.99,
    discountedPrice: 79.99,
    discountPercentage: 11,
    rating: 4.9,
    reviewCount: 142,
    image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1969&q=80",
    inStock: true,
    prescription: true,
    isFeatured: false
  },
  {
    id: 7,
    name: "Moisturizing Cream",
    brandName: "Cetaphil",
    category: "Skin Care",
    price: 12.99,
    discountedPrice: 10.99,
    discountPercentage: 15,
    rating: 4.7,
    reviewCount: 356,
    image: "https://images.unsplash.com/photo-1556229010-aa3f7ff66b24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
    inStock: true,
    prescription: false,
    isFeatured: true
  },
  {
    id: 8,
    name: "Baby Diaper Rash Cream",
    brandName: "Desitin",
    category: "Baby Care",
    price: 8.99,
    discountedPrice: 7.49,
    discountPercentage: 17,
    rating: 4.8,
    reviewCount: 214,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80",
    inStock: true,
    prescription: false,
    isFeatured: false
  }
];

const MedicineCard = ({ medicine }: { medicine: any }) => {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(medicine, quantity);
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

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
      <div className="relative h-48 overflow-hidden">
        {medicine.discountPercentage > 0 && (
          <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
            {medicine.discountPercentage}% OFF
          </Badge>
        )}
        {medicine.prescription && (
          <Badge className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600">
            Rx
          </Badge>
        )}
        <button 
          className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 rounded-full hover:bg-white"
          onClick={handleToggleWishlist}
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
        </button>
        <img 
          src={medicine.image} 
          alt={medicine.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center mb-1">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium ml-1">{medicine.rating}</span>
          <span className="text-xs text-gray-500 ml-1">({medicine.reviewCount})</span>
        </div>
        <h3 className="font-bold text-gray-900">{medicine.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{medicine.brandName}</p>
        
        <div className="flex items-center mb-4">
          <span className="text-lg font-bold text-gray-900">${medicine.discountedPrice}</span>
          {medicine.discountPercentage > 0 && (
            <span className="text-sm text-gray-500 line-through ml-2">${medicine.price}</span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center border rounded-md">
            <button 
              className="p-1.5 text-gray-500 hover:text-gray-700"
              onClick={decrementQuantity}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-2 font-medium text-gray-800">{quantity}</span>
            <button 
              className="p-1.5 text-gray-500 hover:text-gray-700"
              onClick={incrementQuantity}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={handleAddToCart} className="bg-medical-500 hover:bg-medical-600">
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

const Medicines = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredMedicines = medicineData.filter(medicine => {
    const matchesCategory = activeCategory === "All" || medicine.category === activeCategory;
    const matchesSearch = medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          medicine.brandName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  return (
    <Layout>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Online Pharmacy</h1>
              <p className="text-gray-600">Get medicines delivered in 10 minutes</p>
            </div>
            <div className="mt-4 md:mt-0 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input 
                className="pl-10 pr-4 py-2 w-full md:w-80" 
                placeholder="Search medicines, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 mb-8 overflow-x-auto">
            <div className="flex space-x-2 min-w-max">
              {medicineCategories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  className={activeCategory === category ? "bg-medical-500 hover:bg-medical-600" : ""}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">{filteredMedicines.length} products found</p>
            <Button variant="outline" className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filter
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMedicines.map((medicine) => (
              <MedicineCard key={medicine.id} medicine={medicine} />
            ))}
          </div>
          
          {filteredMedicines.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No medicines found matching your criteria.</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setActiveCategory("All");
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
          
          <div className="mt-12 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-4">Prescription Medicines</h2>
            <p className="text-gray-600 mb-4">
              To order prescription medicines, you need to upload a valid prescription from your doctor.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button asChild className="bg-medical-500 hover:bg-medical-600">
                <Link to="/upload-prescription">Upload Prescription</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/prescriptions">View Saved Prescriptions</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Medicines;
