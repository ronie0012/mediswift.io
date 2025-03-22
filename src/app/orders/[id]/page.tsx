'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { ChevronLeft, Package, Truck, CreditCard, MapPin, Clock, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
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
    description: string;
    prescription_required: boolean;
  };
}

interface Order {
  id: string;
  created_at: string;
  updated_at: string;
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

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  const orderId = params.id;

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!orderId) {
      router.push('/orders');
      return;
    }

    fetchOrderDetails();
  }, [orderId, user, router]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch order with items
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          updated_at,
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
            medicine:medicines(
              name, 
              image,
              description,
              prescription_required
            )
          )
        `)
        .eq('id', orderId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setOrder(data as Order);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load order details. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !user) return;
    
    // Only allow cancellation for orders that are not yet shipped
    if (order.status !== 'processing' && order.status !== 'pending_payment') {
      toast({
        variant: "destructive",
        title: "Cannot cancel order",
        description: "Orders that have been shipped cannot be cancelled.",
      });
      return;
    }
    
    try {
      setCancellingOrder(true);
      
      // Update order status
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', order.id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Update local state
      setOrder({ ...order, status: 'cancelled' });
      
      toast({
        title: "Order cancelled",
        description: "Your order has been cancelled successfully.",
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel the order. Please try again.",
      });
    } finally {
      setCancellingOrder(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd MMM yyyy, h:mm a');
  };

  // Estimated delivery date (7 days from order date)
  const getEstimatedDelivery = (dateString: string) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 7);
    return format(date, 'dd MMM yyyy');
  };

  // Get status badge with appropriate styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>;
      case 'shipped':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Shipped</Badge>;
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Delivered</Badge>;
      case 'pending_payment':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending Payment</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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

  // Get order timeline steps based on status
  const getOrderTimeline = (order: Order) => {
    const steps = [
      {
        title: 'Order Placed',
        description: `Your order was placed on ${formatDate(order.created_at)}`,
        icon: Package,
        status: 'completed',
      },
      {
        title: 'Processing',
        description: 'Your order is being prepared for shipment',
        icon: Package,
        status: order.status === 'cancelled' 
          ? 'cancelled' 
          : ['processing', 'shipped', 'delivered'].includes(order.status) 
            ? 'completed' 
            : 'pending',
      },
      {
        title: 'Shipped',
        description: 'Your order has been shipped',
        icon: Truck,
        status: order.status === 'cancelled' 
          ? 'cancelled' 
          : ['shipped', 'delivered'].includes(order.status) 
            ? 'completed' 
            : 'pending',
      },
      {
        title: 'Delivered',
        description: order.status === 'delivered' 
          ? `Your order was delivered on ${formatDate(order.updated_at)}` 
          : `Estimated delivery: ${getEstimatedDelivery(order.created_at)}`,
        icon: MapPin,
        status: order.status === 'cancelled' 
          ? 'cancelled' 
          : order.status === 'delivered' 
            ? 'completed' 
            : 'pending',
      },
    ];

    return steps;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-md" />
              <Skeleton className="h-96 w-full rounded-md" />
            </div>
            <div>
              <Skeleton className="h-64 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="mx-auto mb-6 bg-gray-100 rounded-full h-20 w-20 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find the order you're looking for. It may have been removed or you may not have access.
          </p>
          <Button asChild>
            <Link href="/orders">View All Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        asChild 
        className="mb-6"
      >
        <Link href="/orders">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Link>
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            Order #{order.id.substring(0, 8)}
          </h1>
          <p className="text-gray-500 mt-1">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {getStatusBadge(order.status)}
          
          {(order.status === 'processing' || order.status === 'pending_payment') && (
            <Button 
              variant="outline" 
              onClick={handleCancelOrder}
              disabled={cancellingOrder}
            >
              {cancellingOrder ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Order Content */}
        <div className="lg:col-span-2">
          {/* Order Status Timeline */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Progress</CardTitle>
              <CardDescription>
                Track your order's journey from placement to delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {order.status === 'cancelled' && (
                  <div className="absolute inset-0 bg-gray-50 bg-opacity-70 z-10 flex items-center justify-center">
                    <div className="bg-red-50 border border-red-100 rounded-md p-4 text-center max-w-md">
                      <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <h3 className="font-medium text-red-800 mb-1">Order Cancelled</h3>
                      <p className="text-sm text-red-600">
                        This order has been cancelled and will not be processed further.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-1/2 before:h-full before:w-0.5 before:bg-gray-200">
                  {getOrderTimeline(order).map((step, index) => (
                    <div key={index} className="relative flex items-start">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full z-10 relative flex-shrink-0
                        ${step.status === 'completed' ? 'bg-green-100' : 
                          step.status === 'cancelled' ? 'bg-gray-100' : 'bg-gray-100'}`}>
                        <step.icon className={`h-5 w-5 
                          ${step.status === 'completed' ? 'text-green-600' : 
                            step.status === 'cancelled' ? 'text-gray-400' : 'text-gray-400'}`} />
                      </div>
                      <div className="ml-4 min-w-0">
                        <h3 className={`font-medium
                          ${step.status === 'completed' ? 'text-gray-900' : 
                            step.status === 'cancelled' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {step.title}
                        </h3>
                        <p className={`text-sm mt-0.5
                          ${step.status === 'completed' ? 'text-gray-600' : 
                            step.status === 'cancelled' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Order Items Tab */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="items">
                <TabsList className="mb-4">
                  <TabsTrigger value="items">Items ({order.items.length})</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping Info</TabsTrigger>
                  <TabsTrigger value="payment">Payment</TabsTrigger>
                </TabsList>
                
                <TabsContent value="items" className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border rounded-md">
                      <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0 border">
                        <Image
                          src={item.medicine?.image || '/placeholder-medicine.jpg'}
                          alt={item.medicine?.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.medicine?.name}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {item.medicine?.description || 'No description available'}
                        </p>
                        
                        <div className="flex flex-wrap items-center justify-between mt-2">
                          <div className="space-x-4">
                            <span className="text-sm inline-block">Qty: {item.quantity}</span>
                            {item.medicine?.prescription_required && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                Prescription Required
                              </Badge>
                            )}
                          </div>
                          <span className="font-medium">₹{item.price.toFixed(2)} per unit</span>
                        </div>
                        
                        <div className="flex justify-end mt-2 pt-2 border-t">
                          <span className="font-medium">
                            Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="shipping">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-md flex gap-4 items-start">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium mb-1">Delivery Address</h3>
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">{order.delivery_address.full_name}</p>
                          <p>{order.delivery_address.address_line1}</p>
                          {order.delivery_address.address_line2 && <p>{order.delivery_address.address_line2}</p>}
                          <p>
                            {order.delivery_address.city}, {order.delivery_address.state} {order.delivery_address.postal_code}
                          </p>
                          <p className="mt-1">Phone: {order.delivery_address.phone}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md flex gap-4 items-start">
                      <Truck className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium mb-1">Shipping Information</h3>
                        <div className="text-sm text-gray-600">
                          <p>Standard Shipping</p>
                          <p>Estimated delivery: {getEstimatedDelivery(order.created_at)}</p>
                          {order.status === 'shipped' && (
                            <p className="mt-2 text-green-600">
                              Your order has been shipped and is on its way!
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md flex gap-4 items-start">
                      <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium mb-1">Order Timeline</h3>
                        <div className="text-sm text-gray-600 space-y-2">
                          <div className="flex justify-between">
                            <span>Order Placed:</span>
                            <span>{formatDate(order.created_at)}</span>
                          </div>
                          {order.status === 'shipped' && (
                            <div className="flex justify-between">
                              <span>Order Shipped:</span>
                              <span>{formatDate(order.updated_at)}</span>
                            </div>
                          )}
                          {order.status === 'delivered' && (
                            <div className="flex justify-between">
                              <span>Order Delivered:</span>
                              <span>{formatDate(order.updated_at)}</span>
                            </div>
                          )}
                          {order.status === 'cancelled' && (
                            <div className="flex justify-between">
                              <span>Order Cancelled:</span>
                              <span>{formatDate(order.updated_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="payment">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-md flex gap-4 items-start">
                      <CreditCard className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium mb-1">Payment Method</h3>
                        <p className="text-sm text-gray-600">
                          {getPaymentMethodText(order.payment_method)}
                        </p>
                        <div className="mt-3 flex items-center">
                          <span className="text-sm mr-2">Payment Status:</span>
                          <Badge className={
                            order.payment_method === 'cod' && order.status !== 'delivered' 
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' 
                              : 'bg-green-100 text-green-800 hover:bg-green-100'
                          }>
                            {order.payment_method === 'cod' && order.status !== 'delivered' 
                              ? 'Pending' 
                              : 'Paid'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b">
                        <h3 className="font-medium">Order Summary</h3>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Item(s) Subtotal:</span>
                          <span>₹{order.total_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Shipping:</span>
                          <span>{order.total_amount >= 500 ? 'Free' : '₹50.00'}</span>
                        </div>
                        {order.total_amount >= 500 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Shipping Discount:</span>
                            <span>-₹50.00</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>Order Total:</span>
                          <span>₹{order.total_amount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Order Summary Sidebar */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                If you have any questions or concerns about your order, we're here to help.
              </p>
              
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/contact?order=${order.id}`}>
                    Contact Support
                  </Link>
                </Button>
                
                {order.status !== 'cancelled' && (order.status === 'processing' || order.status === 'pending_payment') && (
                  <Button 
                    variant="ghost" 
                    onClick={handleCancelOrder}
                    disabled={cancellingOrder}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {cancellingOrder ? 'Cancelling...' : 'Cancel Order'}
                  </Button>
                )}
              </div>
              
              <Separator />
              
              <div className="text-xs text-gray-500 space-y-1">
                <p className="font-medium">Common Questions:</p>
                <p>• Where is my order?</p>
                <p>• Can I modify my order?</p>
                <p>• What is your return policy?</p>
                <p>• How do I track my delivery?</p>
              </div>
              
              <div className="text-xs text-gray-500">
                <p>Customer Support Hours:</p>
                <p>Monday to Saturday: 9:00 AM - 6:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 