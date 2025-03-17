
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Star, ChevronRight, ChevronLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    id: "vitamins",
    name: "Vitamins & Supplements"
  },
  {
    id: "diabetes",
    name: "Diabetes Care"
  }
];

const medicines = {
  "pain-relief": [
    {
      id: 1,
      name: "Ibuprofen 400mg",
      brand: "MediRelief",
      price: 12.99,
      discountPrice: 9.99,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
    },
    {
      id: 2,
      name: "Paracetamol 500mg",
      brand: "LifeCare",
      price: 8.99,
      discountPrice: 6.49,
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1550572017-edd951b55104?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
    },
    {
      id: 3,
      name: "Aspirin 325mg",
      brand: "HealthPlus",
      price: 7.99,
      discountPrice: 5.99,
      rating: 4.3,
      image: "https://images.unsplash.com/photo-1626285869517-ce562e94e291?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
    },
    {
      id: 4,
      name: "Naproxen 220mg",
      brand: "MediRelief",
      price: 14.99,
      discountPrice: 11.49,
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
    }
  ],
  "antibiotics": [
    {
      id: 5,
      name: "Amoxicillin 500mg",
      brand: "MediCore",
      price: 19.99,
      discountPrice: 15.99,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1631549916768-4119b4220f0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
    },
    {
      id: 6,
      name: "Azithromycin 250mg",
      brand: "LifeCare",
      price: 24.99,
      discountPrice: 18.99,
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
    },
    {
      id: 7,
      name: "Ciprofloxacin 500mg",
      brand: "HealthPlus",
      price: 22.99,
      discountPrice: 17.99,
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1622227922686-58cef409d5c8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
    },
    {
      id: 8,
      name: "Doxycycline 100mg",
      brand: "MediCore",
      price: 17.99,
      discountPrice: 13.99,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
    }
  ],
  "vitamins": [
    {
      id: 9,
      name: "Multivitamin Daily",
      brand: "VitaLife",
      price: 15.99,
      discountPrice: 12.99,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1577460551100-d94f68dc8706?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
    },
    {
      id: 10,
      name: "Vitamin D3 1000IU",
      brand: "NutriPlus",
      price: 9.99,
      discountPrice: 7.99,
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1584308666974-95de95df7d6c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
    },
    {
      id: 11,
      name: "Vitamin C 500mg",
      brand: "VitaLife",
      price: 11.99,
      discountPrice: 8.99,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
    },
    {
      id: 12,
      name: "Omega-3 Fish Oil",
      brand: "NutriPlus",
      price: 18.99,
      discountPrice: 14.99,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1626285869517-ce562e94e291?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
    }
  ],
  "diabetes": [
    {
      id: 13,
      name: "Blood Glucose Monitor",
      brand: "DiaCare",
      price: 39.99,
      discountPrice: 29.99,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1611073561609-cdc414ccd7a8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
    },
    {
      id: 14,
      name: "Insulin Syringes 100 Pack",
      brand: "MediCore",
      price: 24.99,
      discountPrice: 19.99,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1618089086953-c1b1a6413a81?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
    },
    {
      id: 15,
      name: "Glucometer Test Strips",
      brand: "DiaCare",
      price: 19.99,
      discountPrice: 15.99,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1660227868332-93e0a0a8c67e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
    },
    {
      id: 16,
      name: "Diabetic Foot Cream",
      brand: "HealthPlus",
      price: 14.99,
      discountPrice: 11.99,
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1584308667839-77fbca23b2dc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
    }
  ]
};

const MedicineCard = ({ medicine }: { medicine: any }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative">
        <img 
          src={medicine.image} 
          alt={medicine.name}
          className="w-full h-48 object-cover"
        />
        <button className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-100">
          <Heart className="h-4 w-4 text-gray-400 hover:text-emergency-500" />
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
            <span className="text-sm font-bold text-gray-900">${medicine.discountPrice}</span>
            {medicine.discountPrice < medicine.price && (
              <span className="text-xs text-gray-500 line-through ml-1">${medicine.price}</span>
            )}
          </div>
          <Button size="sm" className="bg-medical-500 hover:bg-medical-600">
            <ShoppingCart className="h-4 w-4" />
          </Button>
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
            <a href="/medicines" className="flex items-center">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </a>
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
