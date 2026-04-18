import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMyOrders } from "@/lib/api.hooks";
// Removed useOrders dependency as we use the backend now
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Calendar, 
  IndianRupee, 
  MapPin, 
  Search, 
  Filter, 
  ChevronDown, 
  X, 
  Clock,
  Download,
  ArrowUpDown
} from "lucide-react";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import OrderTracker from "@/components/order/OrderTracker";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Define the type for filter status to include "all" or any valid OrderStatus
type OrderStatus = string;
type FilterStatusType = "all" | string;

// Define a local Order interface matching the original structure the UI expects
interface LocalOrder {
  id: string;
  orderDate: string;
  deliveryDate: string | null;
  deliveryAddress: string;
  totalAmount: number;
  status: string;
  items: { name: string; quantity: number; price: number }[];
  paymentMethod: string;
  estimatedDeliveryTime: number;
}

const MyOrders = () => {
  const { user } = useAuth();
  const { data: apiOrders, isLoading } = useMyOrders();
  
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [selectedOrder, setSelectedOrder] = useState<LocalOrder | null>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [filterStatus, setFilterStatus] = useState<FilterStatusType>("all");
  
  // Transform backend API Order type to LocalOrder type expected by UI
  const orders: LocalOrder[] = apiOrders ? apiOrders.map(o => ({
    id: String(o.id),
    orderDate: o.created_at,
    deliveryDate: o.status === 'delivered' ? o.created_at : null,
    deliveryAddress: o.shipping_address,
    totalAmount: parseFloat(o.total_amount),
    status: o.status,
    items: o.items.map(i => ({ name: i.medicine_name, quantity: i.quantity, price: parseFloat(i.price) })),
    paymentMethod: o.payment_method,
    estimatedDeliveryTime: 15
  })) : [];

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      // First filter by tab (active/completed)
      if (activeTab === "active" && (order.status === "delivered" || order.status === "cancelled")) {
        return false;
      }
      
      if (activeTab === "completed" && (order.status !== "delivered" && order.status !== "cancelled")) {
        return false;
      }
      
      // Then filter by status if needed
      if (filterStatus !== "all" && order.status !== filterStatus) {
        return false;
      }
      
      // Finally filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          order.id.toLowerCase().includes(query) ||
          order.items.some(item => item.name.toLowerCase().includes(query)) ||
          order.deliveryAddress.toLowerCase().includes(query)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.orderDate);
      const dateB = new Date(b.orderDate);
      
      return sortOrder === "newest" 
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "outline";
      case "shipped":
        return "secondary";
      case "delivered":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleTrackOrder = (order: LocalOrder) => {
    setSelectedOrder(order);
    setIsTrackingOpen(true);
  };

  const handleViewDetails = (order: LocalOrder) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleCancelOrder = async (order: LocalOrder) => {
    toast.error("Order cancellations must be processed by calling support directly.");
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const clearFilters = () => {
    setFilterStatus("all");
    setSortOrder("newest");
    setSearchQuery("");
  };

  const mapOrderStatusToTrackerStatus = (status: string) => {
    if (status === 'pending') return 'processing';
    return status;
  };

  const handleDownloadInvoice = (orderId: string) => {
    // In a real app, this would generate and download an invoice
    toast.success(`Invoice for Order #${orderId} downloaded successfully`);
  };

  // Format date nicely
  const formatOrderDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const getStatusDisplayName = (status: string): string => {
    switch (status) {
      case "pending":
        return "Pending / Processing";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to view your orders</h1>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">My Orders</h1>

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div className="flex space-x-4">
              <Button
                variant={activeTab === "active" ? "default" : "outline"}
                onClick={() => setActiveTab("active")}
              >
                Active Orders
              </Button>
              <Button
                variant={activeTab === "completed" ? "default" : "outline"}
                onClick={() => setActiveTab("completed")}
              >
                Completed Orders
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-8 w-full md:w-[200px]"
                />
                {searchQuery && (
                  <button 
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <Filter className="h-4 w-4" />
                    <span className="hidden md:inline">Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                      <span className={filterStatus === "all" ? "font-semibold" : ""}>All Statuses</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("order_placed")}>
                      <span className={filterStatus === "order_placed" ? "font-semibold" : ""}>Order Placed</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("processing")}>
                      <span className={filterStatus === "processing" ? "font-semibold" : ""}>Processing</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("shipped")}>
                      <span className={filterStatus === "shipped" ? "font-semibold" : ""}>Shipped</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("out_for_delivery")}>
                      <span className={filterStatus === "out_for_delivery" ? "font-semibold" : ""}>Out for Delivery</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("delivered")}>
                      <span className={filterStatus === "delivered" ? "font-semibold" : ""}>Delivered</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("cancelled")}>
                      <span className={filterStatus === "cancelled" ? "font-semibold" : ""}>Cancelled</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <ArrowUpDown className="h-4 w-4" />
                    <span className="hidden md:inline">Sort</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setSortOrder("newest")}>
                      <span className={sortOrder === "newest" ? "font-semibold" : ""}>Newest First</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
                      <span className={sortOrder === "oldest" ? "font-semibold" : ""}>Oldest First</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {(searchQuery || filterStatus !== "all" || sortOrder !== "newest") && (
                <Button variant="ghost" size="icon" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-8">
                <p>Loading your orders...</p>
              </div>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {getStatusDisplayName(order.status)}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-5 w-5 mr-2 text-medical-500" />
                          Ordered on {formatOrderDate(order.orderDate)}
                        </div>
                        {order.deliveryDate && (
                          <div className="flex items-center text-gray-600">
                            <Package className="h-5 w-5 mr-2 text-medical-500" />
                            Delivered on {formatOrderDate(order.deliveryDate)}
                          </div>
                        )}
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-5 w-5 mr-2 text-medical-500" />
                          {order.deliveryAddress}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(order)}
                        className="w-full sm:w-auto"
                      >
                        View Details
                      </Button>
                      {(order.status === "order_placed" || order.status === "processing" || order.status === "shipped" || order.status === "out_for_delivery") && (
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleTrackOrder(order)}
                          className="w-full sm:w-auto"
                        >
                          Track Order
                        </Button>
                      )}
                      {order.status === "delivered" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadInvoice(order.id)}
                          className="w-full sm:w-auto"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Invoice
                        </Button>
                      )}
                      {(order.status === "order_placed" || order.status === "processing") && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCancelOrder(order)}
                          className="w-full sm:w-auto text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-500">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                      <div className="flex items-center font-semibold">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {order.totalAmount.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-1">
                      {order.items.map(item => item.name).join(", ")}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-white rounded-lg shadow">
                <p className="text-gray-500">No {activeTab} orders found.</p>
                {(searchQuery || filterStatus !== "all") && (
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Tracking Dialog */}
      <Dialog open={isTrackingOpen} onOpenChange={(isOpen) => {
        setIsTrackingOpen(isOpen);
        if (!isOpen) {
          // Reset selected order when dialog closes after a short delay for animation
          setTimeout(() => setSelectedOrder(null), 300);
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Track Your Order</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <OrderTracker 
              orderId={selectedOrder.id} 
              currentStatus={mapOrderStatusToTrackerStatus(selectedOrder.status)}
              estimatedTime={selectedOrder.estimatedDeliveryTime || 15} 
              orderDate={selectedOrder.orderDate}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={(isOpen) => {
        setIsDetailsOpen(isOpen);
        if (!isOpen) {
          // Reset selected order when dialog closes after a short delay for animation
          setTimeout(() => setSelectedOrder(null), 300);
        }
      }}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <h3 className="text-lg font-semibold">Order #{selectedOrder.id}</h3>
                  <p className="text-sm text-gray-500">
                    Placed on {formatOrderDate(selectedOrder.orderDate)}
                  </p>
                </div>
                <Badge variant={getStatusBadgeVariant(selectedOrder.status)} className="w-fit">
                  {getStatusDisplayName(selectedOrder.status)}
                </Badge>
              </div>
              
              <Tabs defaultValue="items" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="items">Items</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping</TabsTrigger>
                  <TabsTrigger value="tracking">Tracking</TabsTrigger>
                </TabsList>
                
                <TabsContent value="items" className="space-y-4 pt-4">
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <div className="flex items-center font-medium">
                          <IndianRupee className="h-4 w-4 mr-1" />
                          {(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-medium">Subtotal</span>
                    <div className="flex items-center">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      {selectedOrder.totalAmount.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Shipping</span>
                    <div className="flex items-center">
                      <span className="text-green-600">Free</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center font-bold">
                    <span>Total</span>
                    <div className="flex items-center text-lg">
                      <IndianRupee className="h-5 w-5 mr-1" />
                      {selectedOrder.totalAmount.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="pt-4 space-y-2">
                    {selectedOrder.status === "delivered" && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleDownloadInvoice(selectedOrder.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Invoice
                      </Button>
                    )}
                    
                    {(selectedOrder.status === "order_placed" || selectedOrder.status === "processing") && (
                      <Button 
                        variant="outline" 
                        className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          handleCancelOrder(selectedOrder);
                          setIsDetailsOpen(false);
                        }}
                      >
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="shipping" className="space-y-4 pt-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium">Delivery Address</h3>
                      <p className="text-gray-700 mt-1">{selectedOrder.deliveryAddress}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Payment Method</h3>
                      <p className="text-gray-700 mt-1 capitalize">
                        {selectedOrder.paymentMethod || "Online Payment"}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Estimated Delivery</h3>
                      <p className="text-gray-700 mt-1">
                        {selectedOrder.deliveryDate 
                          ? `Delivered on ${formatOrderDate(selectedOrder.deliveryDate)}`
                          : selectedOrder.status === "cancelled"
                            ? "Order cancelled"
                            : `Within ${selectedOrder.estimatedDeliveryTime || 15} minutes`}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="tracking" className="pt-4">
                  <OrderTracker 
                    orderId={selectedOrder.id} 
                    currentStatus={mapOrderStatusToTrackerStatus(selectedOrder.status)}
                    estimatedTime={selectedOrder.estimatedDeliveryTime || 15} 
                    orderDate={selectedOrder.orderDate}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default MyOrders;
