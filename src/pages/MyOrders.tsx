import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
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

interface Order {
  id: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  orderDate: string;
  deliveryDate: string | null;
  deliveryAddress: string;
}

const MyOrders = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [filterStatus, setFilterStatus] = useState<"all" | "processing" | "shipped" | "delivered" | "cancelled">("all");

  // In a real app, this would come from an API
  const orders: Order[] = [
    {
      id: "ORD001",
      items: [
        {
          name: "Paracetamol 500mg",
          quantity: 2,
          price: 50
        },
        {
          name: "Vitamin C 1000mg",
          quantity: 1,
          price: 150
        }
      ],
      totalAmount: 250,
      status: "processing",
      orderDate: "2024-03-18",
      deliveryDate: null,
      deliveryAddress: "123 Main St, Bangalore, Karnataka 560001"
    },
    {
      id: "ORD002",
      items: [
        {
          name: "Blood Pressure Monitor",
          quantity: 1,
          price: 1500
        }
      ],
      totalAmount: 1500,
      status: "delivered",
      orderDate: "2024-03-15",
      deliveryDate: "2024-03-17",
      deliveryAddress: "456 Park Road, Bangalore, Karnataka 560002"
    },
    {
      id: "ORD003",
      items: [
        {
          name: "First Aid Kit",
          quantity: 1,
          price: 800
        },
        {
          name: "Hand Sanitizer 500ml",
          quantity: 2,
          price: 120
        }
      ],
      totalAmount: 1040,
      status: "shipped",
      orderDate: "2024-03-20",
      deliveryDate: null,
      deliveryAddress: "789 Lake View, Bangalore, Karnataka 560003"
    }
  ];

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      // First filter by tab (active/completed)
      if (activeTab === "active" && (order.status === "delivered" || order.status === "cancelled")) {
        return false;
      }
      
      if (activeTab === "completed" && (order.status === "processing" || order.status === "shipped")) {
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

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeVariant = (status: Order["status"]) => {
    switch (status) {
      case "processing":
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

  const handleTrackOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsTrackingOpen(true);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const clearFilters = () => {
    setFilterStatus("all");
    setSortOrder("newest");
    setSearchQuery("");
  };

  // Map the order status to the OrderTracker component's status
  const mapOrderStatusToTrackerStatus = (status: Order["status"]) => {
    switch (status) {
      case "processing": return "processing";
      case "shipped": return "shipped";
      case "delivered": return "delivered";
      case "cancelled": return "cancelled";
      default: return "order_placed";
    }
  };

  const handleDownloadInvoice = (orderId: string) => {
    // In a real app, this would generate and download an invoice
    toast.success(`Invoice for Order #${orderId} downloaded successfully`);
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
                    <DropdownMenuItem onClick={() => setFilterStatus("processing")}>
                      <span className={filterStatus === "processing" ? "font-semibold" : ""}>Processing</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("shipped")}>
                      <span className={filterStatus === "shipped" ? "font-semibold" : ""}>Shipped</span>
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
            {filteredOrders.length > 0 ? (
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
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-5 w-5 mr-2 text-medical-500" />
                          Ordered on {format(new Date(order.orderDate), "MMMM d, yyyy")}
                        </div>
                        {order.deliveryDate && (
                          <div className="flex items-center text-gray-600">
                            <Package className="h-5 w-5 mr-2 text-medical-500" />
                            Delivered on {format(new Date(order.deliveryDate), "MMMM d, yyyy")}
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
                      {(order.status === "processing" || order.status === "shipped") && (
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
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-500">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                      <div className="flex items-center font-semibold">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {order.totalAmount}
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
      <Dialog open={isTrackingOpen} onOpenChange={setIsTrackingOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Track Your Order</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <OrderTracker 
              orderId={selectedOrder.id} 
              currentStatus={mapOrderStatusToTrackerStatus(selectedOrder.status)}
              estimatedTime={selectedOrder.status === "delivered" ? 0 : 15} 
              orderDate={selectedOrder.orderDate}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
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
                    Placed on {format(new Date(selectedOrder.orderDate), "MMMM d, yyyy")}
                  </p>
                </div>
                <Badge variant={getStatusBadgeVariant(selectedOrder.status)} className="w-fit">
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
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
                          {item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-medium">Subtotal</span>
                    <div className="flex items-center">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      {selectedOrder.totalAmount}
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
                      {selectedOrder.totalAmount}
                    </div>
                  </div>
                  
                  {selectedOrder.status === "delivered" && (
                    <div className="pt-4">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleDownloadInvoice(selectedOrder.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Invoice
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="shipping" className="space-y-4 pt-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium">Delivery Address</h3>
                      <p className="text-gray-700 mt-1">{selectedOrder.deliveryAddress}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Estimated Delivery</h3>
                      <p className="text-gray-700 mt-1">
                        {selectedOrder.deliveryDate 
                          ? `Delivered on ${format(new Date(selectedOrder.deliveryDate), "MMMM d, yyyy")}`
                          : selectedOrder.status === "cancelled"
                            ? "Order cancelled"
                            : "Within 3-5 business days"}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="tracking" className="pt-4">
                  <OrderTracker 
                    orderId={selectedOrder.id} 
                    currentStatus={mapOrderStatusToTrackerStatus(selectedOrder.status)}
                    estimatedTime={selectedOrder.status === "delivered" ? 0 : 15} 
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
