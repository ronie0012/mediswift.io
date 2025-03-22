'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  EyeIcon, 
  ClipboardList, 
  TruckIcon, 
  PackageCheck, 
  AlertTriangle,
  RefreshCcw,
  X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/common/Pagination';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

// Order interface
interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
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
  profiles: {
    full_name: string;
    email: string;
  };
  items_count: number;
}

// Order status options
const ORDER_STATUSES = [
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  
  // State for orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for filters and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  // State for update status dialog
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Verify user is authenticated and has admin privileges
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!isAdmin) {
      router.push('/dashboard');
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to access the admin area.",
      });
      return;
    }

    fetchOrders();
  }, [user, isAdmin, router]);

  // Apply filters and sorting whenever filter state changes
  useEffect(() => {
    applyFiltersAndSort();
  }, [searchQuery, statusFilter, paymentMethodFilter, sortBy, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          updated_at,
          user_id,
          total_amount,
          status,
          payment_method,
          delivery_address,
          profiles(full_name, email),
          items_count:order_items(count)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Transform data to match Order interface
        const formattedOrders = data.map(order => ({
          ...order,
          items_count: order.items_count?.length || 0
        }));
        
        setOrders(formattedOrders);
        setFilteredOrders(formattedOrders);
        calculateTotalPages(formattedOrders.length);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load orders. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...orders];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.id.toLowerCase().includes(query) ||
        order.profiles.full_name?.toLowerCase().includes(query) ||
        order.profiles.email.toLowerCase().includes(query) ||
        order.delivery_address.full_name?.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Apply payment method filter
    if (paymentMethodFilter !== 'all') {
      result = result.filter(order => order.payment_method === paymentMethodFilter);
    }
    
    // Apply sorting
    result = sortOrders(result, sortBy);
    
    setFilteredOrders(result);
    calculateTotalPages(result.length);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const sortOrders = (orders: Order[], sortBy: string): Order[] => {
    return [...orders].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'amount_high':
          return b.total_amount - a.total_amount;
        case 'amount_low':
          return a.total_amount - b.total_amount;
        default:
          return 0;
      }
    });
  };

  const calculateTotalPages = (totalItems: number) => {
    setTotalPages(Math.ceil(totalItems / ITEMS_PER_PAGE));
  };

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (value: string) => {
    setSortBy(value);
  };

  const handleUpdateStatusClick = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setUpdateDialogOpen(true);
  };

  const confirmUpdateStatus = async () => {
    if (!selectedOrder || newStatus === selectedOrder.status) {
      setUpdateDialogOpen(false);
      return;
    }
    
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedOrder.id);
      
      if (error) throw error;
      
      // Update orders list
      setOrders(orders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() } 
          : order
      ));
      
      toast({
        title: "Order status updated",
        description: `Order #${selectedOrder.id.substring(0, 8)} status changed to ${getStatusLabel(newStatus)}.`,
      });
      
      setUpdateDialogOpen(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order status. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy, h:mm a');
  };

  // Get status badge
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

  // Get status label
  const getStatusLabel = (status: string) => {
    const statusObj = ORDER_STATUSES.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  // Get next status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return <ClipboardList className="h-4 w-4" />;
      case 'processing':
        return <TruckIcon className="h-4 w-4" />;
      case 'shipped':
        return <PackageCheck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <X className="h-4 w-4" />;
      default:
        return <RefreshCcw className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 justify-between">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-40" />
              </div>
              
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-gray-500 mt-1">Manage customer orders</p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <Button variant="outline" onClick={fetchOrders}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh Orders
          </Button>
        </div>
      </div>
      
      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>
            You have {filteredOrders.length} orders {searchQuery || statusFilter !== 'all' || paymentMethodFilter !== 'all' ? 'matching the current filters' : 'in total'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by order ID, customer name or email..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="cod">Cash on Delivery</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={handleSort}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    <SelectValue placeholder="Sort By" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="amount_high">Amount (High-Low)</SelectItem>
                  <SelectItem value="amount_low">Amount (Low-High)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Table */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No orders found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || statusFilter !== 'all' || paymentMethodFilter !== 'all'
                  ? 'Try adjusting your search or filters to find what you\'re looking for'
                  : 'No orders have been placed yet'}
              </p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getCurrentPageItems().map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        #{order.id.substring(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.profiles?.full_name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{order.profiles?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(order.created_at)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.items_count} items</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(order.total_amount)}</div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{getPaymentMethodText(order.payment_method)}</span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  asChild
                                >
                                  <Link href={`/admin/orders/${order.id}`}>
                                    <EyeIcon className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Order Details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleUpdateStatusClick(order)}
                                >
                                  <RefreshCcw className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Update Status</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination */}
          {filteredOrders.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                showSummary
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Update the status for order #{selectedOrder?.id.substring(0, 8)}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Current Status:</p>
              <div>{selectedOrder && getStatusBadge(selectedOrder.status)}</div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">New Status:</p>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem 
                      key={status.value} 
                      value={status.value}
                      disabled={selectedOrder?.status === status.value}
                    >
                      <div className="flex items-center">
                        {getStatusIcon(status.value)}
                        <span className="ml-2">{status.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {(selectedOrder?.status === 'delivered' || selectedOrder?.status === 'cancelled') && 
             newStatus !== 'delivered' && newStatus !== 'cancelled' && (
              <div className="flex items-start mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700">
                  This order is currently marked as {selectedOrder.status === 'delivered' ? 'delivered' : 'cancelled'}.
                  Changing its status may confuse customers.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpdateDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmUpdateStatus} 
              disabled={isUpdating || selectedOrder?.status === newStatus}
            >
              {isUpdating ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 