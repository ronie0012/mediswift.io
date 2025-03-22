'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, Package, TruckIcon, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface OrderItem {
  id: string;
  medicine_id: string;
  order_id: string;
  quantity: number;
  price: number;
  medicine: {
    name: string;
    image: string;
  };
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  payment_method: string;
  delivery_address: {
    full_name: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    postal_code: string;
    phone: string;
  };
  items: OrderItem[];
}

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!orderId) {
      router.push('/');
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch order with items
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            total_amount,
            status,
            payment_method,
            delivery_address,
            items:order_items(
              id,
              medicine_id,
              order_id,
              quantity,
              price,
              medicine:medicines(name, image)
            )
          `)
          .eq('id', orderId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        
        if (data) {
          // Transform the data to match our Order interface
          const formattedOrder = {
            ...data,
            // Transform items to match OrderItem interface
            items: (data.items || []).map(item => ({
              ...item,
              // Transform medicine from array to object
              medicine: Array.isArray(item.medicine) && item.medicine.length > 0
                ? {
                    name: item.medicine[0]?.name || '',
                    image: item.medicine[0]?.image || ''
                  }
                : (item.medicine || { name: '', image: '' })
            }))
          } as Order;
          
          setOrder(formattedOrder);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, user, router]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  // Estimated delivery date (7 days from order date)
  const getEstimatedDelivery = (dateString: string) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 7);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  // Get payment method text
  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'card':
        return 'Credit/Debit Card';
      case 'cod':
        return 'Cash on Delivery';
      case 'upi':
        return 'UPI';
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded-md max-w-sm mx-auto mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-md max-w-2xl mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p className="text-gray-600 mb-6">We couldn't find the order you're looking for.</p>
        <Button asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-12"
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="mx-auto mb-4 bg-green-100 rounded-full h-20 w-20 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600">
            Thank you for your order. We'll send a confirmation once your order ships.
          </p>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order #{order.id.substring(0, 8)}</span>
              <span className="text-sm font-normal text-gray-500">
                {formatDate(order.created_at)}
              </span>
            </CardTitle>
            <CardDescription>
              Estimated delivery: {getEstimatedDelivery(order.created_at)}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Order Status */}
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Order Status: <span className="text-blue-600 capitalize">{order.status.replace('_', ' ')}</span></h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.status === 'processing' 
                      ? 'Your order has been received and is being processed.' 
                      : order.status === 'pending_payment'
                      ? 'Your order is awaiting payment confirmation.'
                      : 'Your order is being prepared for shipping.'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Order Items */}
            <div>
              <h3 className="font-medium mb-3">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0 border">
                      <Image
                        src={item.medicine.image || '/placeholder-medicine.jpg'}
                        alt={item.medicine.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.medicine.name}</h4>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                        <span className="text-sm font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Delivery Address */}
            <div>
              <h3 className="font-medium mb-3">Shipping Address</h3>
              <div className="border rounded-md p-3 text-sm">
                <p className="font-medium">{order.delivery_address.full_name}</p>
                <p>{order.delivery_address.address_line1}</p>
                {order.delivery_address.address_line2 && <p>{order.delivery_address.address_line2}</p>}
                <p>
                  {order.delivery_address.city}, {order.delivery_address.state} {order.delivery_address.postal_code}
                </p>
                <p className="mt-1">Phone: {order.delivery_address.phone}</p>
              </div>
            </div>
            
            {/* Payment Details */}
            <div>
              <h3 className="font-medium mb-3">Payment Information</h3>
              <div className="border rounded-md p-3 text-sm">
                <div className="flex justify-between mb-2">
                  <span>Payment Method</span>
                  <span className="font-medium">{getPaymentMethodText(order.payment_method)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status</span>
                  <span className={`font-medium ${order.payment_method === 'cod' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {order.payment_method === 'cod' ? 'Pending' : 'Paid'}
                  </span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Order Summary */}
            <div>
              <h3 className="font-medium mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{order.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span>{order.total_amount >= 500 ? 'Free' : '₹50.00'}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="justify-between flex-wrap gap-4 sm:flex-nowrap">
            <Button asChild variant="outline">
              <Link href="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
            <Button asChild>
              <Link href="/orders">
                View All Orders
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Need Help Section */}
        <div className="text-center">
          <h3 className="font-medium mb-2">Need help with your order?</h3>
          <p className="text-sm text-gray-600 mb-4">
            If you have any questions or concerns about your order, our customer support team is here to help.
          </p>
          <Button asChild variant="outline">
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
