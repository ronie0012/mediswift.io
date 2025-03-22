
'use client';

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Star, ShoppingCart } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabase';
import { useCart } from '@/lib/cart';
import { Medicine } from '@/types/models';
import { toast } from '@/lib/toast-compatibility';

export default function Home() {
  const { addToCart } = useCart();
  const [featuredMedicines, setFeaturedMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch featured medicines
        const { data: medicines, error: medicinesError } = await supabase
          .from('medicines')
          .select('*')
          .order('rating', { ascending: false })
          .limit(8);

        if (medicinesError) throw medicinesError;
        setFeaturedMedicines(medicines as Medicine[]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/medicines?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleAddToCart = (medicine: Medicine) => {
    addToCart({
      id: medicine.id,
      name: medicine.name,
      price: medicine.discount_price,
      image: medicine.image,
      quantity: 1,
      brand: medicine.brand || ''
    });
    
    toast.success(`${medicine.name} added to your cart`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 to-primary/5 py-20 overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-6">
            <Badge variant="outline" className="bg-primary/10 text-primary px-3 py-1 rounded-full">
              Trusted by 10,000+ patients
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Your Health, Our <span className="text-primary">Priority</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              MediSwift offers a complete healthcare solution - from doctor consultations to medicine delivery, all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link to="/medicines">Shop Medicines</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/doctors">Book Appointment</Link>
              </Button>
            </div>
          </div>
          <div className="flex-1 relative h-[400px] w-full">
            <img
              src="/hero-image.jpg"
              alt="Healthcare professionals"
              className="object-cover rounded-lg shadow-xl w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search for medicines, doctors, or symptoms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-6 text-lg rounded-full"
              />
              <Button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full"
                size="icon"
              >
                <Search className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Button variant="outline" asChild>
              <Link to="/medicines" className="flex items-center gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {isLoading ? (
              // Skeleton loaders for medicines
              Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="h-[350px] animate-pulse">
                  <CardContent className="p-0">
                    <div className="h-[200px] bg-gray-200 rounded-t-lg" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-6 bg-gray-200 rounded w-1/3" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : featuredMedicines.length > 0 ? (
              featuredMedicines.map((medicine) => (
                <Link to={`/medicines/${medicine.id}`} key={medicine.id}>
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative h-[200px] bg-gray-100 rounded-t-lg">
                        <img
                          src={medicine.image || '/placeholder-medicine.jpg'}
                          alt={medicine.name}
                          className="object-cover rounded-t-lg w-full h-full"
                        />
                        {medicine.discount_price < medicine.price && (
                          <Badge className="absolute top-2 right-2 bg-red-500">
                            {Math.round((1 - medicine.discount_price / medicine.price) * 100)}% OFF
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium truncate">{medicine.name}</h3>
                        <p className="text-sm text-muted-foreground">{medicine.brand}</p>
                        <div className="flex items-center mt-2">
                          <div className="flex items-center mr-2">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm ml-1">{medicine.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-sm">{medicine.dosage}</span>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex flex-col">
                            {medicine.discount_price < medicine.price && (
                              <span className="text-sm line-through text-muted-foreground">
                                ${medicine.price.toFixed(2)}
                              </span>
                            )}
                            <span className="font-bold text-primary">
                              ${medicine.discount_price.toFixed(2)}
                            </span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddToCart(medicine);
                            }}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No products found</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to prioritize your health?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust MediSwift for their healthcare needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/medicines">Shop Medicines</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link to="/doctors">Book Appointment</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
