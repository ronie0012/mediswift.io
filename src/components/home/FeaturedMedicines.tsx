import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Star, ChevronRight, ChevronLeft, Minus, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";

// Sample medicine data
const medicineCategories = [
  {
    id: "pain-relief",
    name: "Pain Relief"
  },
  {
    id: "antibiotics",
    name: "Antibiotics"
  },
  {
    id: "cardiac",
    name: "Heart & Blood Pressure"
  },
  {
    id: "gastro",
    name: "Digestive Health"
  },
  {
    id: "allergy",
    name: "Allergy & Respiratory"
  }
];

const medicines = {
  "pain-relief": [
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
      id: 21,
      name: "Aspirin 75mg",
      brand: "Generic",
      price: 10,
      discountPrice: 8,
      rating: 4.6,
      category: "Pain Relief",
      quantity: "14 tablets",
      image: "https://5.imimg.com/data5/SELLER/Default/2021/1/KF/VF/XG/3823480/aspirin-tablets-500x500.jpg"
    }
  ],
  "antibiotics": [
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
      id: 24,
      name: "Doxycycline 100mg",
      brand: "Generic",
      price: 40,
      discountPrice: 35,
      rating: 4.6,
      category: "Antibiotics",
      quantity: "10 capsules",
      image: "https://5.imimg.com/data5/SELLER/Default/2022/1/ZN/VM/CR/144146006/doxycycline-100mg-capsule-500x500.jpg"
    }
  ],
  "cardiac": [
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
      id: 20,
      name: "Clopidogrel 75mg",
      brand: "Generic",
      price: 50,
      discountPrice: 45,
      rating: 4.7,
      category: "Cardiac",
      quantity: "10 tablets",
      image: "https://5.imimg.com/data5/SELLER/Default/2021/12/RU/ZE/ZH/142578078/clopidogrel-tablets-500x500.jpg"
    }
  ],
  "gastro": [
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
    }
  ],
  "allergy": [
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
    }
  ]
};

const MedicineCard = ({ medicine }: { medicine: any }) => {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(medicine, quantity);
    setQuantity(1); // Reset quantity after adding to cart
  };

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
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
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative">
        <img 
          src={medicine.image} 
          alt={medicine.name}
          className="w-full h-48 object-cover"
        />
        <button 
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-100"
          onClick={handleToggleWishlist}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-emergency-500'}`} />
        </button>
        {medicine.discountPrice < medicine.price && (
          <span className="absolute top-2 left-2 bg-emergency-500 text-white text-xs px-2 py-1 rounded">
            {Math.round((1 - medicine.discountPrice / medicine.price) * 100)}% OFF
          </span>
        )}
      </div>
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
            <Button size="sm" className="bg-medical-500 hover:bg-medical-600" onClick={handleAddToCart}>
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeaturedMedicines = () => {
  const [activeTab, setActiveTab] = useState("pain-relief");
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Medicines</h2>
            <p className="text-gray-600">Browse our top selling medicines with fastest delivery</p>
          </div>
          <Button asChild variant="outline" className="mt-4 md:mt-0">
            <Link to="/medicines" className="flex items-center">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <Tabs defaultValue="pain-relief" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-gray-100">
              {medicineCategories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="data-[state=active]:bg-white data-[state=active]:text-medical-600"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="hidden md:flex space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => {
                  const currentIndex = medicineCategories.findIndex(c => c.id === activeTab);
                  const prevIndex = currentIndex > 0 ? currentIndex - 1 : medicineCategories.length - 1;
                  setActiveTab(medicineCategories[prevIndex].id);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                  const currentIndex = medicineCategories.findIndex(c => c.id === activeTab);
                  const nextIndex = currentIndex < medicineCategories.length - 1 ? currentIndex + 1 : 0;
                  setActiveTab(medicineCategories[nextIndex].id);
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {medicineCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {medicines[category.id as keyof typeof medicines].map((medicine) => (
                  <MedicineCard key={medicine.id} medicine={medicine} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default FeaturedMedicines;
