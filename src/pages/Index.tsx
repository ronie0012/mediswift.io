
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Star, ShoppingCart, Calendar, Shield, Truck, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/lib/cart';
import { toast } from '@/lib/toast-compatibility';
import { Medicine } from '@/types/models';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  image: string;
  rating: number;
}

export default function Home() {
  const { addToCart } = useCart();
  const [featuredMedicines, setFeaturedMedicines] = useState<Medicine[]>([]);
  const [popularDoctors, setPopularDoctors] = useState<Doctor[]>([]);
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

        // Fetch popular doctors
        const { data: doctors, error: doctorsError } = await supabase
          .from('doctors')
          .select('*')
          .order('rating', { ascending: false })
          .limit(4);

        if (doctorsError) throw doctorsError;
        setPopularDoctors(doctors as Doctor[]);
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

  // Just rendering a simple homepage for now to avoid Next.js issues
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-center mb-8">MediSwift</h1>
      <div className="text-center mb-8">
        <p className="text-xl">Your one-stop healthcare solution</p>
      </div>
      
      {/* Basic Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <ShoppingCart className="text-blue-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-medium mb-2">Shop Medicines</h3>
            <p className="text-center text-gray-600 mb-4">Browse and buy from a wide range of medicines.</p>
            <Button asChild className="mt-auto">
              <Link to="/medicines">Shop Now</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Calendar className="text-green-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-medium mb-2">Book Appointments</h3>
            <p className="text-center text-gray-600 mb-4">Schedule appointments with top doctors.</p>
            <Button asChild className="mt-auto">
              <Link to="/doctors">Find Doctors</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Truck className="text-purple-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-medium mb-2">Fast Delivery</h3>
            <p className="text-center text-gray-600 mb-4">Get medicines delivered to your doorstep.</p>
            <Button asChild className="mt-auto">
              <Link to="/medicines">Order Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="flex">
          <Input
            type="text"
            placeholder="Search for medicines, doctors, or symptoms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" className="ml-2">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </div>
      
      {/* CTA Section */}
      <Card className="bg-primary text-primary-foreground mb-8">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to prioritize your health?</h2>
          <p className="mb-6">Join thousands of satisfied customers who trust MediSwift for their healthcare needs.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/medicines">Shop Medicines</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link to="/doctors">Book Appointment</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
