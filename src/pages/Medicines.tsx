
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, ShoppingCart, Search } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/lib/cart";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Slider
} from "@/components/ui/slider"
import { medicineData, Medicine } from "@/data/medicines";

export default function Medicines() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);

  useEffect(() => {
    // Simulate fetching medicines from an API
    const loadMedicines = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        setMedicines(medicineData);
      } catch (error) {
        console.error("Error loading medicines:", error);
        toast({
          variant: "destructive",
          title: "Error loading medicines",
          description: "Failed to load medicines. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadMedicines();
  }, [toast]);

  const filteredMedicines = medicines.filter((medicine) => {
    const searchMatch = medicine.name.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = categoryFilter === "All" || medicine.category === categoryFilter;
    const priceMatch = medicine.discountPrice >= priceRange[0] && medicine.discountPrice <= priceRange[1];

    return searchMatch && categoryMatch && priceMatch;
  });

  const handleAddToCart = (medicine: Medicine) => {
    addToCart({
      id: medicine.id,
      name: medicine.name,
      price: medicine.discountPrice,
      image: medicine.image,
      quantity: 1,
      brand: medicine.brand
    });
    
    toast({
      title: "Added to cart",
      description: `${medicine.name} added to your cart`,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
  };

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value);
  };

  const availableCategories = ["All", ...new Set(medicines.map((medicine) => medicine.category))];

  // Loading skeleton
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-8 w-1/4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="w-full aspect-square rounded-md mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="mt-2">
                    <Skeleton className="h-6 w-1/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-1/3">
            <Input
              type="text"
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          </div>
          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {availableCategories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mb-6">
          <Label>Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}</Label>
          <Slider
            defaultValue={[0, 1000]}
            max={1000}
            step={10}
            onValueChange={handlePriceRangeChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMedicines.map((medicine) => (
            <Card key={medicine.id} className="h-full flex flex-col">
              <CardContent className="p-4 flex-grow">
                <div className="relative aspect-square mb-2">
                  <img
                    src={medicine.image}
                    alt={medicine.name}
                    className="w-full h-full object-contain rounded-md"
                  />
                  {medicine.discountPrice < medicine.price && (
                    <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
                      {Math.round(((medicine.price - medicine.discountPrice) / medicine.price) * 100)}% OFF
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-sm font-medium truncate">{medicine.name}</CardTitle>
                <CardDescription className="text-xs text-gray-500 truncate">{medicine.brand}</CardDescription>
                <div className="flex items-center mt-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="text-sm">{medicine.rating}</span>
                </div>
                <div className="mt-auto">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">₹{medicine.discountPrice}</span>
                    {medicine.discountPrice < medicine.price && (
                      <span className="text-sm text-gray-500 line-through">₹{medicine.price}</span>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 flex justify-between items-center">
                <Button
                  size="sm"
                  onClick={() => handleAddToCart(medicine)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate(`/medicines/${medicine.id}`)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};
