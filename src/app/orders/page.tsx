'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { ChevronRight, Search, Filter, Package } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  items: OrderItem[];
}

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchOrders();
  }, [user, router, statusFilter, sortBy]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('orders')
        .select(`
          id,
          created_at,
          total_amount,
          status,
          payment_method,
          items:order_items(
            id,
            medicine_id,
            order_id,
            quantity,
            price,
            medicine:medicines(name, image)
          )
        `)
        .eq('user_id', user?.id);
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (sortBy === 'price_high') {
        query = query.order('total_amount', { ascending: false });
      } else if (sortBy === 'price_low') {
        query = query.order('total_amount', { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;
      
      if (data) {
        const formattedOrders = data.map(order => ({
          ...order,
          items: (order.items || []).map(item => ({
            ...item,
            medicine: Array.isArray(item.medicine) && item.medicine.length > 0
              ? {
                  name: item.medicine[0]?.name || '',
                  image: item.medicine[0]?.image || ''
                }
              : (item.medicine || { name: '', image: '' })
          }))
        })) as Order[];
        
        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd MMM yyyy');
  };

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

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    
    if (order.id.toLowerCase().includes(searchLower)) return true;
    
    const hasMatchingMedicine = order.items.some(item => 
      item.medicine?.name.toLowerCase().includes(searchLower)
    );
    
    return hasMatchingMedicine;
  });

  const renderOrderCards = () => {
    if (loading) {
      return Array.from({ length: 3 }).map((_, index) => (
        <Card key={`skeleton-${index}`} className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-[120px]" />
              <Skeleton className="h-5 w-[100px]" />
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-5 w-[100px]" />
              <Skeleton className="h-6 w-[80px] rounded-full" />
            </div>
            <div className="flex gap-4 mb-4">
              <Skeleton className="h-16 w-16 rounded-md" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-full rounded-md" />
          </CardFooter>
        </Card>
      ));
    }

    if (filteredOrders.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto mb-4 bg-gray-100 rounded-full h-20 w-20 flex items-center justify-center">
            <Package className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No orders found</h3>
          {searchQuery ? (
            <p className="text-gray-600 mb-6">
              No orders match your search criteria. Try adjusting your filters.
            </p>
          ) : statusFilter !== 'all' ? (
            <p className="text-gray-600 mb-6">
              You don't have any orders with this status.
            </p>
          ) : (
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start shopping to place an order!
            </p>
          )}
          <Button asChild>
            <Link href="/medicines">Browse Medicines</Link>
          </Button>
        </div>
      );
    }

    return filteredOrders.map(order => (
      <Card key={order.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap justify-between gap-2">
            <CardTitle className="text-lg">Order #{order.id.substring(0, 8)}</CardTitle>
            <CardDescription className="mt-0">
              {formatDate(order.created_at)}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500">
              Payment: {getPaymentMethodText(order.payment_method)}
            </span>
            {getStatusBadge(order.status)}
          </div>
          
          <div className="space-y-3">
            {order.items.slice(0, 2).map(item => (
              <div key={item.id} className="flex gap-3">
                <div className="relative h-14 w-14 rounded-md overflow-hidden flex-shrink-0 border">
                  <Image
                    src={item.medicine?.image || '/placeholder-medicine.jpg'}
                    alt={item.medicine?.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate" title={item.medicine?.name}>
                    {item.medicine?.name}
                  </h4>
                  <div className="flex justify-between mt-1 text-sm">
                    <span className="text-gray-600">Qty: {item.quantity}</span>
                    <span className="font-medium">₹{item.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {order.items.length > 2 && (
              <p className="text-sm text-gray-500 italic">
                +{order.items.length - 2} more items
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-2 flex justify-between items-center">
          <div className="font-medium">
            Total: ₹{order.total_amount.toFixed(2)}
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/orders/${order.id}`}>
              <span className="flex items-center">
                View Order <ChevronRight className="h-4 w-4 ml-1" />
              </span>
            </Link>
          </Button>
        </CardFooter>
      </Card>
    ));
  };

  const getStatusCounts = () => {
    return {
      all: orders.length,
      processing: orders.filter(order => order.status === 'processing').length,
      shipped: orders.filter(order => order.status === 'shipped').length,
      delivered: orders.filter(order => order.status === 'delivered').length,
      pending_payment: orders.filter(order => order.status === 'pending_payment').length,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search orders by ID or product name"
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders ({statusCounts.all})</SelectItem>
                  <SelectItem value="processing">Processing ({statusCounts.processing})</SelectItem>
                  <SelectItem value="shipped">Shipped ({statusCounts.shipped})</SelectItem>
                  <SelectItem value="delivered">Delivered ({statusCounts.delivered})</SelectItem>
                  <SelectItem value="pending_payment">Pending Payment ({statusCounts.pending_payment})</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={sortBy} 
                onValueChange={setSortBy}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price_high">Price (High to Low)</SelectItem>
                  <SelectItem value="price_low">Price (Low to High)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            {renderOrderCards()}
          </div>
        </div>
        
        <div>
          <Card className="mb-6 sticky top-4">
            <CardHeader>
              <CardTitle>Order Status Guide</CardTitle>
              <CardDescription>
                Track the progress of your orders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending Payment</Badge>
                <p className="text-sm">Your order is awaiting payment confirmation.</p>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>
                <p className="text-sm">We're preparing your order for shipment.</p>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Shipped</Badge>
                <p className="text-sm">Your order is on its way to you.</p>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Delivered</Badge>
                <p className="text-sm">Your order has been delivered successfully.</p>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
                <p className="text-sm">The order has been cancelled.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                Having issues with your order? Our customer support team is here to help you.
              </p>
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/contact">Contact Support</Link>
              </Button>
              
              <div className="text-xs text-gray-500 mt-2">
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
