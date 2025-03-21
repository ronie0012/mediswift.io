
import React, { useState, useEffect } from "react";
import { 
  Package, 
  ShoppingBag, 
  Truck, 
  CheckCircle,
  Clock
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface OrderTrackerProps {
  orderId?: string;
  estimatedTime?: number; // in minutes
  currentStatus?: OrderStatus;
  orderDate?: string;
}

type OrderStatus = "order_placed" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";

const OrderTracker: React.FC<OrderTrackerProps> = ({ 
  orderId = "ORD" + Math.floor(100000 + Math.random() * 900000), 
  estimatedTime = 15,
  currentStatus: initialStatus = "order_placed",
  orderDate
}) => {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(initialStatus);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(estimatedTime);
  
  useEffect(() => {
    // Set initial progress based on status
    switch (initialStatus) {
      case "order_placed":
        setProgress(0);
        break;
      case "processing":
        setProgress(25);
        break;
      case "shipped":
      case "out_for_delivery":
        setProgress(50);
        break;
      case "delivered":
        setProgress(100);
        setTimeRemaining(0);
        break;
      case "cancelled":
        setProgress(0);
        setTimeRemaining(0);
        break;
    }
    
    // Only simulate progress if the order is not delivered or cancelled
    if (initialStatus !== "delivered" && initialStatus !== "cancelled") {
      // Simulate order progress
      const statusSequence: OrderStatus[] = ["order_placed", "processing", "out_for_delivery", "delivered"];
      const currentStatusIndex = statusSequence.indexOf(initialStatus);
      
      if (currentStatusIndex !== -1) {
        const statusTimeouts = [
          { status: "processing", time: 5000, progress: 25 },
          { status: "out_for_delivery", time: 10000, progress: 50 },
          { status: "delivered", time: 20000, progress: 100 }
        ].slice(currentStatusIndex);
        
        const timers: NodeJS.Timeout[] = [];
        
        statusTimeouts.forEach(({ status, time, progress }) => {
          const timer = setTimeout(() => {
            setCurrentStatus(status as OrderStatus);
            setProgress(progress);
          }, time);
          timers.push(timer);
        });
        
        // Countdown timer
        const countdownInterval = setInterval(() => {
          setTimeRemaining((prevTime) => {
            if (prevTime <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prevTime - 1;
          });
        }, 60000); // Update every minute
        
        return () => {
          timers.forEach(timer => clearTimeout(timer));
          clearInterval(countdownInterval);
        };
      }
    }
  }, [initialStatus, estimatedTime]);
  
  const statusInfo = {
    order_placed: {
      title: "Order Placed",
      description: "Your order has been received",
      icon: ShoppingBag,
      time: orderDate ? `${new Date(orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Just now"
    },
    processing: {
      title: "Processing",
      description: "Your order is being prepared",
      icon: Package,
      time: "5 mins ago"
    },
    shipped: {
      title: "Shipped",
      description: "Your order has been shipped",
      icon: Package,
      time: "10 mins ago"
    },
    out_for_delivery: {
      title: "Out for Delivery",
      description: "Your order is on the way",
      icon: Truck,
      time: "10 mins ago"
    },
    delivered: {
      title: "Delivered",
      description: "Your order has been delivered",
      icon: CheckCircle,
      time: "20 mins ago"
    },
    cancelled: {
      title: "Cancelled",
      description: "Your order has been cancelled",
      icon: Package,
      time: "Order cancelled"
    }
  };
  
  const statuses: OrderStatus[] = ["order_placed", "processing", "out_for_delivery", "delivered"];
  const currentStatusIndex = statuses.findIndex(status => status === currentStatus);
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold">Order Status</h2>
          <p className="text-sm text-gray-500">Order ID: {orderId}</p>
        </div>
        {currentStatus !== "cancelled" && (
          <div className="flex items-center text-medical-500">
            <Clock className="h-5 w-5 mr-1" />
            <span className="font-medium">
              {(currentStatus === "delivered")
                ? 'Delivered'
                : timeRemaining > 0 
                  ? `Arriving in ${timeRemaining} min${timeRemaining !== 1 ? 's' : ''}`
                  : 'Delivered'}
            </span>
          </div>
        )}
      </div>
      
      {currentStatus !== "cancelled" ? (
        <>
          <Progress value={progress} className="h-2 mb-8" />
          
          <div className="space-y-8">
            {statuses.map((status, index) => {
              const StatusIcon = statusInfo[status].icon;
              const isActive = index <= currentStatusIndex;
              const isPast = index < currentStatusIndex;
              
              return (
                <div key={status} className="flex items-start">
                  <div className={`rounded-full p-2 mr-4 ${
                    isActive ? 'bg-medical-100 text-medical-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <StatusIcon className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h3 className={`font-medium ${
                        isActive ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {statusInfo[status].title}
                      </h3>
                      
                      {isPast && (
                        <span className="text-sm text-gray-500">
                          {statusInfo[status].time}
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-sm ${
                      isActive ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {statusInfo[status].description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        // Cancelled order view
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center rounded-full bg-red-100 p-2 mb-4">
            <Package className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-red-700">Order Cancelled</h3>
          <p className="text-gray-500 mt-2">This order has been cancelled.</p>
        </div>
      )}
    </div>
  );
};

export default OrderTracker;
