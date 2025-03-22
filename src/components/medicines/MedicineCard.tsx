import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/context/CartContext';

export interface Medicine {
  id: number;
  name: string;
  brand: string;
  description: string;
  price: number;
  discount_price: number;
  image: string;
  stock: number;
  category: string;
  dosage: string;
  prescription_required: boolean;
  rating: number;
}

interface MedicineCardProps {
  medicine: Medicine;
}

const MedicineCard: React.FC<MedicineCardProps> = ({ medicine }) => {
  const { toast } = useToast();
  const { addToCart, isInCart } = useCart();
  
  const discountPercentage = medicine.discount_price < medicine.price
    ? Math.round((1 - medicine.discount_price / medicine.price) * 100)
    : 0;
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling
    
    if (medicine.stock <= 0) {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: "This medicine is currently out of stock.",
      });
      return;
    }
    
    addToCart({
      id: medicine.id,
      name: medicine.name,
      price: medicine.discount_price,
      image: medicine.image,
      quantity: 1,
      stock: medicine.stock,
      prescription_required: medicine.prescription_required
    });
    
    toast({
      title: "Added to cart",
      description: `${medicine.name} added to your cart`,
    });
  };
  
  return (
    <Link href={`/medicines/${medicine.id}`}>
      <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-md">
        <CardContent className="p-0">
          <div className="relative h-48 bg-gray-100">
            <Image
              src={medicine.image || '/placeholder-medicine.jpg'}
              alt={medicine.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {discountPercentage > 0 && (
              <Badge className="absolute top-2 right-2 bg-red-500">
                {discountPercentage}% OFF
              </Badge>
            )}
            {medicine.prescription_required && (
              <Badge 
                variant="outline" 
                className="absolute top-2 left-2 bg-blue-50 text-blue-700 border-blue-200"
              >
                Rx
              </Badge>
            )}
          </div>
          
          <div className="p-4">
            <h3 className="font-medium line-clamp-1" title={medicine.name}>
              {medicine.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1" title={medicine.brand}>
              {medicine.brand}
            </p>
            
            <div className="flex items-center mt-2">
              <div className="flex items-center mr-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm ml-1 text-gray-600">{medicine.rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-gray-600">{medicine.dosage}</span>
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex flex-col">
                {medicine.discount_price < medicine.price && (
                  <span className="text-sm line-through text-muted-foreground">
                    ₹{medicine.price.toFixed(2)}
                  </span>
                )}
                <span className="font-bold text-primary">
                  ₹{medicine.discount_price.toFixed(2)}
                </span>
              </div>
              
              <Button 
                size="sm" 
                variant="secondary"
                onClick={handleAddToCart}
                disabled={medicine.stock <= 0}
                title={medicine.stock <= 0 ? "Out of stock" : "Add to cart"}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                {medicine.stock <= 0 ? "Sold Out" : "Add"}
              </Button>
            </div>
            
            {medicine.stock > 0 && medicine.stock <= 5 && (
              <p className="text-xs text-orange-600 mt-2">
                Only {medicine.stock} left in stock
              </p>
            )}
            {medicine.stock <= 0 && (
              <p className="text-xs text-red-600 mt-2">
                Out of stock
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default MedicineCard; 