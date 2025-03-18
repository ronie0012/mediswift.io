import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Package, Calendar, IndianRupee, MapPin } from "lucide-react";
import { format } from "date-fns";

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
    }
  ];

  const activeOrders = orders.filter(
    order => order.status === "processing" || order.status === "shipped"
  );

  const completedOrders = orders.filter(
    order => order.status === "delivered" || order.status === "cancelled"
  );

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

          <div className="flex space-x-4 mb-6">
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

          <div className="space-y-6">
            {(activeTab === "active" ? activeOrders : completedOrders).map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Order #{order.id}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-5 w-5 mr-2" />
                        Ordered on {format(new Date(order.orderDate), "MMMM d, yyyy")}
                      </div>
                      {order.deliveryDate && (
                        <div className="flex items-center text-gray-600">
                          <Package className="h-5 w-5 mr-2" />
                          Delivered on {format(new Date(order.deliveryDate), "MMMM d, yyyy")}
                        </div>
                      )}
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-5 w-5 mr-2" />
                        {order.deliveryAddress}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-500 ml-2">x{item.quantity}</span>
                        </div>
                        <div className="flex items-center">
                          <IndianRupee className="h-4 w-4 mr-1" />
                          {item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <span className="font-semibold">Total Amount</span>
                    <div className="flex items-center font-semibold">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      {order.totalAmount}
                    </div>
                  </div>
                </div>

                {(order.status === "processing" || order.status === "shipped") && (
                  <div className="mt-4">
                    <Button variant="outline" className="w-full">
                      Track Order
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {(activeTab === "active" ? activeOrders : completedOrders).length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No {activeTab} orders found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyOrders; 