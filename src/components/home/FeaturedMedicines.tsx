
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { Medicine } from '@/types/models';

export default function FeaturedMedicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchFeaturedMedicines() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('medicines')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) {
          console.error('Error fetching featured medicines:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load featured medicines.",
          });
        } else {
          setMedicines(data as Medicine[]);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedMedicines();
  }, [toast]);

  const handleAddToCart = (medicine: Medicine) => {
    addToCart({
      id: medicine.id,
      name: medicine.name,
      price: medicine.discount_price,
      image: medicine.image,
      quantity: 1,
      brand: medicine.brand
    });

    toast({
      title: "Added to cart",
      description: `${medicine.name} added to your cart`,
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-0">
              <div className="relative h-[200px] bg-gray-100 rounded-t-lg"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="flex items-center mt-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mr-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded mt-4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {medicines.map((medicine) => (
        <Card key={medicine.id} className="h-full hover:shadow-md transition-shadow">
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
              <Button
                className="w-full mt-4"
                onClick={() => handleAddToCart(medicine)}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
