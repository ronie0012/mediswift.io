'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ChevronLeft, CreditCard, Truck, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

// Form schemas
const addressSchema = z.object({
  fullName: z.string().min(2, { message: "Name is required" }),
  addressLine1: z.string().min(5, { message: "Address is required" }),
  addressLine2: z.string().optional(),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  postalCode: z.string().min(6, { message: "Postal code is required" }).max(6),
  phone: z.string().min(10, { message: "Valid phone number is required" }).max(10),
});

const paymentSchema = z.object({
  cardNumber: z.string().min(16, { message: "Valid card number is required" }).max(16),
  cardName: z.string().min(2, { message: "Name on card is required" }),
  expiryDate: z.string().min(5, { message: "Expiry date is required" }).max(5),
  cvv: z.string().min(3, { message: "CVV is required" }).max(3),
});

type AddressValues = z.infer<typeof addressSchema>;
type PaymentValues = z.infer<typeof paymentSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { items, totalItems, totalPrice, clearCart } = useCart();
  
  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'upi'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedAddress, setSavedAddress] = useState<AddressValues | null>(null);
  
  // Initialize address form
  const addressForm = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      phone: '',
    },
  });
  
  // Initialize payment form
  const paymentForm = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
    },
  });
  
  // Calculate order summary
  const subtotal = totalPrice;
  const shippingFee = subtotal >= 500 ? 0 : 50;
  const total = subtotal + shippingFee;
  
  // Handle address form submission
  const onAddressSubmit = (values: AddressValues) => {
    // Save address for order processing
    setSavedAddress(values);
    
    // Move to payment step
    setStep('payment');
    
    toast({
      title: "Address saved",
      description: "Your shipping address has been saved.",
    });
  };
  
  // Handle payment form submission
  const onPaymentSubmit = async (values: PaymentValues) => {
    if (!user || !savedAddress) return;
    
    setIsSubmitting(true);
    
    try {
      // Create order in database
      const orderData = {
        user_id: user.id,
        total_amount: total,
        status: paymentMethod === 'cod' ? 'pending_payment' : 'processing',
        payment_method: paymentMethod,
        delivery_address: {
          full_name: savedAddress.fullName,
          address_line1: savedAddress.addressLine1,
          address_line2: savedAddress.addressLine2 || '',
          city: savedAddress.city,
          state: savedAddress.state,
          postal_code: savedAddress.postalCode,
          phone: savedAddress.phone,
        },
        items: items.map(item => ({
          medicine_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };
      
      // Create the order
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select('id')
        .single();
      
      if (error) throw error;
      
      // Clear cart after successful order
      clearCart();
      
      // Redirect to success page
      router.push(`/orders/success?order_id=${data.id}`);
      
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        variant: "destructive",
        title: "Checkout failed",
        description: error.message || "Failed to create your order. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle cash on delivery selection
  const handleCodCheckout = async () => {
    if (!user || !savedAddress) return;
    
    setIsSubmitting(true);
    
    try {
      // Create order in database
      const orderData = {
        user_id: user.id,
        total_amount: total,
        status: 'pending_payment',
        payment_method: 'cod',
        delivery_address: {
          full_name: savedAddress.fullName,
          address_line1: savedAddress.addressLine1,
          address_line2: savedAddress.addressLine2 || '',
          city: savedAddress.city,
          state: savedAddress.state,
          postal_code: savedAddress.postalCode,
          phone: savedAddress.phone,
        },
        items: items.map(item => ({
          medicine_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };
      
      // Create the order
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select('id')
        .single();
      
      if (error) throw error;
      
      // Clear cart after successful order
      clearCart();
      
      // Redirect to success page
      router.push(`/orders/success?order_id=${data.id}`);
      
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        variant: "destructive",
        title: "Checkout failed",
        description: error.message || "Failed to create your order. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If no items in cart, redirect to cart page
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 pb-8 text-center">
            <div className="mx-auto mb-4 bg-gray-100 rounded-full h-24 w-24 flex items-center justify-center">
              <ShieldCheck className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add items to your cart before proceeding to checkout</p>
            <Button asChild>
              <Link href="/cart">Go to Cart</Link>
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
      <Button 
        variant="ghost" 
        asChild 
        className="mb-6"
      >
        <Link href="/cart">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Link>
      </Button>
      
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Checkout Form */}
        <div className="lg:col-span-2">
          <Card>
            {/* Address Step */}
            {step === 'address' && (
              <>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                  <CardDescription>Enter your delivery address details</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Form {...addressForm}>
                    <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-6">
                      <FormField
                        control={addressForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addressForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="10-digit mobile number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addressForm.control}
                        name="addressLine1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address Line 1</FormLabel>
                            <FormControl>
                              <Input placeholder="Street address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addressForm.control}
                        name="addressLine2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Address Line 2 <span className="text-gray-500 font-normal">(Optional)</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Apartment, suite, unit, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={addressForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="City" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={addressForm.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select state" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Delhi">Delhi</SelectItem>
                                  <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                                  <SelectItem value="Karnataka">Karnataka</SelectItem>
                                  <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                                  <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                                  <SelectItem value="Gujarat">Gujarat</SelectItem>
                                  <SelectItem value="West Bengal">West Bengal</SelectItem>
                                  <SelectItem value="Telangana">Telangana</SelectItem>
                                  <SelectItem value="Kerala">Kerala</SelectItem>
                                  <SelectItem value="Bihar">Bihar</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={addressForm.control}
                          name="postalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal Code</FormLabel>
                              <FormControl>
                                <Input placeholder="6-digit postal code" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="pt-4">
                        <Button type="submit" className="w-full" size="lg">
                          Continue to Payment
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </>
            )}
            
            {/* Payment Step */}
            {step === 'payment' && (
              <>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Choose your preferred payment method</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <RadioGroup 
                    defaultValue="card" 
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as 'card' | 'cod' | 'upi')}
                    className="mb-6"
                  >
                    <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="card" id="card" />
                      <label htmlFor="card" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <div>
                            <span className="font-medium">Credit/Debit Card</span>
                            <p className="text-sm text-gray-500">Pay with Visa, Mastercard or RuPay</p>
                          </div>
                        </div>
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="cod" id="cod" />
                      <label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Truck className="h-5 w-5 text-primary" />
                          <div>
                            <span className="font-medium">Cash on Delivery</span>
                            <p className="text-sm text-gray-500">Pay when your order is delivered</p>
                          </div>
                        </div>
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="upi" id="upi" disabled />
                      <label htmlFor="upi" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 text-gray-400">
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 0C5.373 0 0 5.373 0 12C0 18.627 5.373 24 12 24C18.627 24 24 18.627 24 12C24 5.373 18.627 0 12 0ZM8.3 16.7H5.7L7.5 10.3H10.1L8.3 16.7ZM14.3 16.7H11.7L14.5 5.3H17.1L14.3 16.7Z" fill="currentColor" />
                          </svg>
                          <div>
                            <span className="font-medium">UPI</span>
                            <p className="text-sm">Coming soon</p>
                          </div>
                          <Badge variant="outline" className="ml-auto text-xs">Coming Soon</Badge>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>
                  
                  {paymentMethod === 'card' && (
                    <Form {...paymentForm}>
                      <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-6">
                        <FormField
                          control={paymentForm.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Card Number</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="1234 5678 9012 3456" 
                                  {...field} 
                                  maxLength={16}
                                  onChange={(e) => {
                                    // Only allow numbers
                                    const value = e.target.value.replace(/\D/g, '');
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={paymentForm.control}
                          name="cardName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name on Card</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-6">
                          <FormField
                            control={paymentForm.control}
                            name="expiryDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expiry Date</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="MM/YY" 
                                    {...field} 
                                    maxLength={5}
                                    onChange={(e) => {
                                      let value = e.target.value.replace(/\D/g, '');
                                      // Format as MM/YY
                                      if (value.length > 2) {
                                        value = value.slice(0, 2) + '/' + value.slice(2);
                                      }
                                      field.onChange(value);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={paymentForm.control}
                            name="cvv"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CVV</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="123" 
                                    {...field} 
                                    maxLength={3}
                                    type="password"
                                    onChange={(e) => {
                                      // Only allow numbers
                                      const value = e.target.value.replace(/\D/g, '');
                                      field.onChange(value);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="pt-4 space-y-4">
                          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? "Processing..." : "Place Order"}
                          </Button>
                          
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full" 
                            onClick={() => setStep('address')}
                          >
                            Back to Address
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                  
                  {paymentMethod === 'cod' && (
                    <div className="pt-6 space-y-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                        <p className="text-yellow-800 text-sm">
                          You'll pay ₹{total.toFixed(2)} when your order is delivered to your address. Please keep exact change ready if possible.
                        </p>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        size="lg" 
                        onClick={handleCodCheckout}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Processing..." : "Place Order"}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => setStep('address')}
                      >
                        Back to Address
                      </Button>
                    </div>
                  )}
                  
                  {paymentMethod === 'upi' && (
                    <div className="pt-6 space-y-4">
                      <div className="bg-gray-100 border border-gray-200 rounded-md p-4 text-center py-8">
                        <p className="text-gray-500">UPI payment option is coming soon!</p>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => setStep('address')}
                      >
                        Back to Address
                      </Button>
                    </div>
                  )}
                </CardContent>
              </>
            )}
          </Card>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-5">
              <div className="max-h-60 overflow-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 py-2">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image || '/placeholder-medicine.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate" title={item.name}>
                        {item.name}
                      </h4>
                      <div className="flex justify-between items-center mt-1 text-sm">
                        <span className="text-gray-600">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-medium">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      {item.prescription_required && (
                        <Badge variant="outline" className="text-xs mt-1 bg-blue-50 text-blue-700 border-blue-200">
                          Prescription Required
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{shippingFee > 0 ? `₹${shippingFee.toFixed(2)}` : 'Free'}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="rounded-md bg-gray-50 p-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <div className="text-sm">
                    <span className="font-medium">Secure Checkout</span>
                    <p className="text-gray-500 text-xs">Your payment information is secure</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
} 