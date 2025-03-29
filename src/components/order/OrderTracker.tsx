import React, { useState, useEffect } from "react";
import { 
  Package, 
  ShoppingBag, 
  Truck, 
  CheckCircle,
  Clock,
  MapPin,
  User,
  Phone,
  Star,
  MessageCircle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OrderTrackerProps {
  orderId?: string;
  estimatedTime?: number; // in minutes
  currentStatus?: OrderStatus;
  orderDate?: string;
}

type OrderStatus = "order_placed" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";

interface DeliveryAgent {
  name: string;
  phone: string;
  rating: number;
  image: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
    distance: number; // in km
  };
}

const OrderTracker: React.FC<OrderTrackerProps> = ({ 
  orderId = "ORD" + Math.floor(100000 + Math.random() * 900000), 
  estimatedTime = 15,
  currentStatus: initialStatus = "order_placed",
  orderDate
}) => {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(initialStatus);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(estimatedTime);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [deliveryAgent, setDeliveryAgent] = useState<DeliveryAgent | null>(null);
  
  // Generate a random delivery agent once the order is out for delivery
  useEffect(() => {
    if (currentStatus === "out_for_delivery" && !deliveryAgent) {
      const agent: DeliveryAgent = {
        name: ["Rahul Singh", "Amit Kumar", "Vijay Patel", "Rajesh Sharma"][Math.floor(Math.random() * 4)],
        phone: "+91 " + Math.floor(7000000000 + Math.random() * 2999999999),
        rating: 4 + Math.random(),
        image: `/avatars/agent-${Math.floor(Math.random() * 4) + 1}.jpg`,
        location: {
          lat: 28.7041 + (Math.random() * 0.02 - 0.01),
          lng: 77.1025 + (Math.random() * 0.02 - 0.01),
          address: "Sector " + Math.floor(Math.random() * 100) + ", Noida",
          distance: 2 + Math.random() * 3
        }
      };
      setDeliveryAgent(agent);
    }
  }, [currentStatus, deliveryAgent]);
  
  // Update delivery agent location periodically
  useEffect(() => {
    if (deliveryAgent && currentStatus === "out_for_delivery") {
      const locationInterval = setInterval(() => {
        setDeliveryAgent(prev => {
          if (!prev || !prev.location) return prev;
          
          // Decrease distance by a small random amount
          const newDistance = Math.max(0, prev.location.distance - (0.1 + Math.random() * 0.3));
          
          // Slightly vary the location coordinates
          return {
            ...prev,
            location: {
              ...prev.location,
              lat: prev.location.lat + (Math.random() * 0.001 - 0.0005),
              lng: prev.location.lng + (Math.random() * 0.001 - 0.0005),
              distance: newDistance
            }
          };
        });
      }, 15000); // Update every 15 seconds
      
      return () => clearInterval(locationInterval);
    }
  }, [deliveryAgent, currentStatus]);
  
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
          { status: "delivered", time: estimatedTime * 60000, progress: 100 }
        ].slice(currentStatusIndex);
        
        const timers: NodeJS.Timeout[] = [];
        
        statusTimeouts.forEach(({ status, time, progress }) => {
          const timer = setTimeout(() => {
            setCurrentStatus(status as OrderStatus);
            setProgress(progress);
          }, time);
          timers.push(timer);
        });
        
        // More precise countdown timer (seconds)
        setSecondsRemaining(estimatedTime * 60);
        const countdownInterval = setInterval(() => {
          setSecondsRemaining((prevSeconds) => {
            if (prevSeconds <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            
            // Update minutes remaining (for display)
            const newMinutes = Math.ceil(prevSeconds / 60) - 1;
            if (newMinutes !== timeRemaining) {
              setTimeRemaining(newMinutes);
            }
            
            return prevSeconds - 1;
          });
        }, 1000); // Update every second
        
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

  // Format remaining time nicely
  const formatRemainingTime = () => {
    if (timeRemaining <= 0) return "Delivered";
    
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;
    
    if (minutes === 0) {
      return `${seconds} seconds`;
    }
    
    return `${minutes} min${minutes !== 1 ? 's' : ''} ${seconds} sec${seconds !== 1 ? 's' : ''}`;
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">Order Status</h2>
          <p className="text-sm text-gray-500">Order ID: {orderId}</p>
        </div>
        {currentStatus !== "cancelled" && (
          <div className="text-right">
            <div className="flex items-center text-medical-500 justify-end">
              <Clock className="h-5 w-5 mr-1" />
              <span className="font-medium">
                {(currentStatus === "delivered")
                  ? 'Delivered'
                  : timeRemaining > 0 
                    ? `Arriving in ${formatRemainingTime()}`
                    : 'Delivered'}
              </span>
            </div>
            {currentStatus === "out_for_delivery" && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs mt-1" 
                onClick={() => setIsLive(!isLive)}
              >
                {isLive ? "Hide Live Updates" : "Show Live Updates"}
              </Button>
            )}
          </div>
        )}
      </div>
      
      {currentStatus !== "cancelled" ? (
        <>
          <Progress 
            value={progress} 
            className="h-2 mb-6" 
          />
          
          {/* Live delivery tracking section - only visible when out for delivery */}
          {currentStatus === "out_for_delivery" && isLive && deliveryAgent && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100 relative">
              <Badge variant="outline" className="absolute right-3 top-3 bg-blue-100 text-blue-700 border-blue-200 animate-pulse">
                Live
              </Badge>
              
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 overflow-hidden mr-3 flex-shrink-0">
                  <img 
                    src={deliveryAgent.image || `/avatars/default-agent.jpg`} 
                    alt={deliveryAgent.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/avatars/default-agent.jpg";
                    }}
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center">
                    <h3 className="font-medium">{deliveryAgent.name}</h3>
                    <div className="ml-2 flex items-center text-sm">
                      <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="ml-1">{deliveryAgent.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Your delivery agent</p>
                </div>
                <div className="flex-shrink-0">
                  <Button size="sm" className="bg-green-500 hover:bg-green-600">
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="flex items-center text-blue-700">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>Current Location</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{deliveryAgent.location?.distance.toFixed(1)} km away</span>
                </div>
              </div>
              
              <div className="w-full h-24 bg-gray-100 rounded-md mb-3 relative overflow-hidden">
                {/* This would be an actual map in a real implementation */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <span className="text-sm">Map view (simulated)</span>
                </div>
                <div className="absolute bottom-2 right-2 bg-white p-1 rounded-md shadow-sm">
                  <Truck className="h-4 w-4 text-medical-500" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {deliveryAgent.location?.address}
                </span>
                <Button size="sm" variant="ghost" className="text-xs">
                  <MessageCircle className="h-3.5 w-3.5 mr-1" />
                  Message
                </Button>
              </div>
            </div>
          )}
          
          <div className="space-y-8">
            {statuses.map((status, index) => {
              const StatusIcon = statusInfo[status].icon;
              const isActive = index <= currentStatusIndex;
              const isPast = index < currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              
              return (
                <div key={status} className="flex items-start">
                  <div className={`rounded-full p-2 mr-4 ${
                    isActive 
                      ? (isCurrent ? 'bg-medical-100 text-medical-600 animate-pulse' : 'bg-medical-100 text-medical-600')
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <StatusIcon className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h3 className={`font-medium ${
                        isActive ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {statusInfo[status].title}
                        {isCurrent && (
                          <Badge variant="outline" className="ml-2 text-xs bg-medical-50 text-medical-600 border-medical-200">
                            Current
                          </Badge>
                        )}
                      </h3>
                      
                      {(isPast || isCurrent) && (
                        <span className="text-sm text-gray-500">
                          {statusInfo[status].time}
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-sm ${
                      isActive ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {statusInfo[status].description}
                      {status === "out_for_delivery" && isActive && deliveryAgent && (
                        <span className="block mt-1 text-medical-600">
                          With {deliveryAgent.name}, {deliveryAgent.location?.distance.toFixed(1)} km away
                        </span>
                      )}
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
