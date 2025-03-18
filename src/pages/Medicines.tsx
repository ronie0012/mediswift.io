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
import { motion } from "framer-motion";

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
    image: "https://www.netmeds.com/images/product-v1/600x600/341517/paracetamol_tablets_ip_500mg_10s_0.jpg"
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
    image: "https://5.imimg.com/data5/SELLER/Default/2021/12/MI/CM/OC/142578078/amoxicillin-capsules-500x500.jpg"
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
    image: "https://5.imimg.com/data5/SELLER/Default/2022/9/RL/ON/JI/162395100/azithromycin-500mg-tablets-500x500.jpg"
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
    image: "https://5.imimg.com/data5/SELLER/Default/2022/3/QR/ZE/JK/148371869/ciprofloxacin-tablets-500x500.jpg"
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
    image: "https://5.imimg.com/data5/SELLER/Default/2022/3/VN/CE/OZ/148371869/metformin-tablets-500x500.jpg"
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
    image: "https://5.imimg.com/data5/SELLER/Default/2022/3/UW/DP/OX/148371869/amlodipine-tablets-500x500.jpg"
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
    image: "https://5.imimg.com/data5/SELLER/Default/2021/12/UY/ON/MY/142578078/atorvastatin-tablets-500x500.jpg"
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
    image: "https://5.imimg.com/data5/SELLER/Default/2022/3/TH/BK/KX/148371869/omeprazole-capsules-500x500.jpg"
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
    image: "https://5.imimg.com/data5/SELLER/Default/2021/12/YC/QL/OT/142578078/pantoprazole-tablets-500x500.jpg"
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
    image: "https://5.imimg.com/data5/SELLER/Default/2022/3/UO/FX/ZB/148371869/cetirizine-tablets-500x500.jpg"
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
    image: "https://5.imimg.com/data5/SELLER/Default/2021/12/NX/XC/XZ/142578078/levocetirizine-tablets-500x500.jpg"
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
    image: "https://5.imimg.com/data5/SELLER/Default/2022/1/XD/XK/XQ/144146006/montelukast-tablets-500x500.jpg"
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
    image: "https://5.imimg.com/data5/SELLER/Default/2022/1/OW/BK/DZ/144146006/losartan-potassium-tablets-500x500.jpg"
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
    image: "https://5.imimg.com/data5/SELLER/Default/2021/12/PQ/WC/VZ/142578078/telmisartan-tablets-500x500.jpg"
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
    image: "https://5.imimg.com/data5/SELLER/Default/2022/3/KL/VQ/XZ/148371869/metoprolol-tablets-500x500.jpg"
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
    image: "https://5.imimg.com/data5/SELLER/Default/2021/12/WE/XC/ZK/142578078/atenolol-tablets-500x500.jpg"
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
    image: "https://5.imimg.com/data5/SELLER/Default/2022/1/QW/YC/XZ/144146006/furosemide-tablets-500x500.jpg"
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
    image: "https://5.imimg.com/data5/SELLER/Default/2021/12/TH/QW/ZX/142578078/hydrochlorothiazide-tablets-500x500.jpg"
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
    image: "https://5.imimg.com/data5/SELLER/Default/2022/3/PO/QW/XC/148371869/spironolactone-tablets-500x500.jpg"
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
    image: "https://5.imimg.com/data5/SELLER/Default/2021/12/RU/ZE/ZH/142578078/clopidogrel-tablets-500x500.jpg"
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
    image: "https://5.imimg.com/data5/SELLER/Default/2021/1/KF/VF/XG/3823480/aspirin-tablets-500x500.jpg"
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
    image: "https://5.imimg.com/data5/SELLER/Default/2022/1/KL/WQ/XZ/144146006/rosuvastatin-tablets-500x500.jpg"
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
    image: "https://5.imimg.com/data5/SELLER/Default/2021/12/YU/IO/PQ/142578078/simvastatin-tablets-500x500.jpg"
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
    image: "https://5.imimg.com/data5/SELLER/Default/2022/1/ZN/VM/CR/144146006/doxycycline-100mg-capsule-500x500.jpg"
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
    image: "https://5.imimg.com/data5/SELLER/Default/2022/3/JK/LM/NO/148371869/levofloxacin-tablets-500x500.jpg"
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
    >
      <motion.div 
        className="relative h-48 overflow-hidden"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        {medicine.discountPrice < medicine.price && (
          <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
            {Math.round(((medicine.price - medicine.discountPrice) / medicine.price) * 100)}% OFF
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
      </motion.div>
      <div className="p-4">
        <div className="text-xs text-gray-500 mb-1">{medicine.brand}</div>
        <h3 className="font-medium text-gray-900 mb-1">{medicine.name}</h3>
        <div className="flex items-center mb-2">
          <div className="flex items-center mr-2">
            <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium ml-1">{medicine.rating}</span>
          </div>
          <span className="text-xs text-gray-500">({Math.floor(Math.random() * 500) + 100} reviews)</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm font-bold text-gray-900">₹{medicine.discountPrice}</span>
            {medicine.discountPrice < medicine.price && (
              <span className="text-xs text-gray-500 line-through ml-1">₹{medicine.price}</span>
            )}
            <div className="text-xs text-gray-500 mt-1">{medicine.quantity}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-md">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-gray-100"
                onClick={decrementQuantity}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-gray-100"
                onClick={incrementQuantity}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button 
                size="sm" 
                className="bg-medical-500 hover:bg-medical-600" 
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Medicines = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredMedicines = medicineData.filter((medicine) => {
    const matchesCategory = activeCategory === "All" || medicine.category === activeCategory;
    const matchesSearch = medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         medicine.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div className="mb-4 md:mb-0">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-2xl font-bold text-gray-900"
            >
              Medicines
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-gray-500"
            >
              Browse our wide range of medicines
            </motion.p>
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full md:w-64"
            />
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex overflow-x-auto space-x-2 mb-6 pb-2"
        >
          {categories.map((category, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
            >
              <Button
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {filteredMedicines.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <p className="text-gray-500">No medicines found matching your criteria.</p>
            <Button
              variant="outline"
              onClick={() => {
                setActiveCategory("All");
                setSearchQuery("");
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredMedicines.map((medicine, index) => (
              <motion.div
                key={medicine.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <MedicineCard medicine={medicine} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
};

export default Medicines;
