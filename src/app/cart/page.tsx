'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MinusCircle, PlusCircle, Trash2, ShoppingBag, AlertCircle, ChevronRight, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  
  const [hasPrescription, setHasPrescription] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  
  // Check if any item requires prescription
  const requiresPrescription = items.some(item => item.prescription_required);
  
  // Handle prescription upload
  const handlePrescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setPrescriptionFile(file);
      setHasPrescription(true);
      
      toast({
        title: "Prescription uploaded",
        description: `File ${file.name} has been uploaded successfully.`,
      });
    }
  };
  
  // Handle remove prescription
  const handleRemovePrescription = () => {
    setPrescriptionFile(null);
    setHasPrescription(false);
    
    toast({
      title: "Prescription removed",
      description: "Your prescription has been removed.",
    });
  };
  
  // Handle checkout button click
  const handleCheckout = () => {
    if (requiresPrescription && !hasPrescription) {
      toast({
        variant: "destructive",
        title: "Prescription required",
        description: "Please upload a prescription for the medicines that require it.",
      });
      return;
    }
    
    // Navigate to checkout page
    router.push('/checkout');
  };
  
  // Empty cart view
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        
        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6 pb-8 text-center">
            <div className="mx-auto mb-4 bg-gray-100 rounded-full h-24 w-24 flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add items to your cart to proceed with checkout</p>
            <Button asChild>
              <Link href="/medicines">Browse Medicines</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
      <p className="text-gray-600 mb-8">{totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Cart Items</CardTitle>
              <CardDescription>Review and update your items</CardDescription>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.id} className="py-4 px-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image || '/placeholder-medicine.jpg'}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-muted-foreground">
                                ₹{item.price.toFixed(2)} per item
                              </span>
                              {item.prescription_required && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                >
                                  Prescription
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-end sm:items-start mt-2 sm:mt-0">
                            <span className="font-medium text-primary">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                            
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                            >
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                            
                            {item.quantity >= item.stock && (
                              <span className="text-xs text-orange-600 ml-2">
                                Max available
                              </span>
                            )}
                          </div>
                          
                          {/* Remove Button */}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            
            <CardFooter className="flex items-center justify-between pt-6">
              <Button variant="outline" size="sm" onClick={() => clearCart()}>
                Clear Cart
              </Button>
              
              <Button asChild variant="outline">
                <Link href="/medicines">
                  Continue Shopping
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                <span className="font-medium">₹{totalPrice.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">₹50.00</span>
              </div>
              
              {totalPrice >= 500 && (
                <div className="flex justify-between text-green-600">
                  <span>Shipping Discount</span>
                  <span>-₹50.00</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">
                  ₹{(totalPrice >= 500 ? totalPrice : totalPrice + 50).toFixed(2)}
                </span>
              </div>
              
              {totalPrice < 500 && (
                <div className="bg-amber-50 text-amber-800 text-sm p-3 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p>Add ₹{(500 - totalPrice).toFixed(2)} more to get free shipping!</p>
                </div>
              )}
              
              {/* Prescription Upload Section */}
              {requiresPrescription && (
                <div className="mt-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                    <div className="flex items-start">
                      <FileText className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-700">Prescription Required</h4>
                        <p className="text-sm text-blue-600 mt-1">
                          Some items in your cart require a valid prescription. Please upload a prescription to proceed.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {hasPrescription ? (
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-green-500 mr-2" />
                        <div className="text-sm">
                          <p className="font-medium">{prescriptionFile?.name}</p>
                          <p className="text-gray-500">{(prescriptionFile?.size && (prescriptionFile.size / 1024).toFixed(1))} KB</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleRemovePrescription}
                        className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                      <FileText className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Upload your prescription</p>
                      <Button asChild size="sm" variant="outline">
                        <label className="cursor-pointer">
                          Browse Files
                          <input 
                            type="file" 
                            className="hidden" 
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handlePrescriptionChange}
                          />
                        </label>
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">Supported formats: JPG, PNG, PDF</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleCheckout}
                disabled={(requiresPrescription && !hasPrescription)}
              >
                Proceed to Checkout
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </motion.div>
  );
} 