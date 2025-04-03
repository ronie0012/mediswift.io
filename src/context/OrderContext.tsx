import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { CartItem } from "./CartContext";
import { toast } from "sonner";

export type OrderStatus = "order_placed" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";

export interface Order {
  id: string;
  items: {
    id: number;
    name: string;
    quantity: number;
    price: number;
    image?: string;
    brandName?: string;
    description?: string;
  }[];
  totalAmount: number;
  status: OrderStatus;
  orderDate: string;
  deliveryDate: string | null;
  deliveryAddress: string;
  userId: string | null;
  paymentMethod: string;
  estimatedDeliveryTime?: number; // in minutes
}

interface OrderContextType {
  orders: Order[];
  createOrder: (orderData: {
    items: CartItem[],
    totalAmount: number,
    deliveryAddress: string,
    paymentMethod: string
  }) => Promise<string | null>; // Returns order ID if successful
  getOrderById: (orderId: string) => Order | null;
  getUserOrders: () => Order[];
  cancelOrder: (orderId: string) => Promise<boolean>;
  isLoading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();

  // Load orders from localStorage on initialization
  useEffect(() => {
    const savedOrders = localStorage.getItem("orders");
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (error) {
        console.error("Failed to parse orders from localStorage:", error);
        localStorage.removeItem("orders");
      }
    }
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  // Create a new order
  const createOrder = async (orderData: {
    items: CartItem[],
    totalAmount: number,
    deliveryAddress: string,
    paymentMethod: string
  }): Promise<string | null> => {
    setIsLoading(true);
    
    try {
      // Generate a unique order ID
      const orderId = "ORD" + Math.floor(100000 + Math.random() * 900000);
      
      // Create order object
      const newOrder: Order = {
        id: orderId,
        items: orderData.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          brandName: item.brandName || item.brand,
          description: item.description
        })),
        totalAmount: orderData.totalAmount,
        status: "order_placed",
        orderDate: new Date().toISOString(),
        deliveryDate: null,
        deliveryAddress: orderData.deliveryAddress,
        userId: user?.id || null,
        paymentMethod: orderData.paymentMethod,
        estimatedDeliveryTime: Math.floor(Math.random() * 11) + 10 // 10-20 minutes
      };
      
      // Add to orders array
      setOrders(prevOrders => [...prevOrders, newOrder]);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Order created successfully!");
      setIsLoading(false);
      return orderId;
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order. Please try again.");
      setIsLoading(false);
      return null;
    }
  };

  // Get a specific order by ID
  const getOrderById = (orderId: string): Order | null => {
    return orders.find(order => order.id === orderId) || null;
  };

  // Get all orders for the current user
  const getUserOrders = (): Order[] => {
    if (!user) return [];
    return orders.filter(order => order.userId === user.id);
  };

  // Cancel an order
  const cancelOrder = async (orderId: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update order status
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: "cancelled" } 
            : order
        )
      );
      
      toast.success("Order cancelled successfully!");
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order. Please try again.");
      setIsLoading(false);
      return false;
    }
  };

  // Simulate order status progression (for demo purposes)
  useEffect(() => {
    const progressOrders = () => {
      setOrders(prevOrders => 
        prevOrders.map(order => {
          // Only progress orders that aren't delivered or cancelled
          if (order.status === "delivered" || order.status === "cancelled") {
            return order;
          }
          
          // Determine next status
          let nextStatus: OrderStatus = order.status;
          
          switch (order.status) {
            case "order_placed":
              nextStatus = "processing";
              break;
            case "processing":
              nextStatus = "shipped";
              break;
            case "shipped":
              nextStatus = "out_for_delivery";
              break;
            case "out_for_delivery":
              nextStatus = "delivered";
              // Set delivery date when status changes to delivered
              return {
                ...order,
                status: nextStatus,
                deliveryDate: new Date().toISOString()
              };
          }
          
          return { ...order, status: nextStatus };
        })
      );
    };
    
    // Progress orders every 3 minutes (for demo purposes)
    const interval = setInterval(progressOrders, 3 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        getOrderById,
        getUserOrders,
        cancelOrder,
        isLoading
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
}; 