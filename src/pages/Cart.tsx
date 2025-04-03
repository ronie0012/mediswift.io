import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useCart, CartItem } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrderContext";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus, ShoppingBag, CreditCard, Truck, MapPin, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AddressSelector from "@/components/address/AddressSelector";
import { AddressProvider, useAddress } from "@/context/AddressContext";
import OrderTracker from "@/components/order/OrderTracker";

// Helper function to get proper image URL
const getImageUrl = (item: CartItem): string => {
  // Check for valid image URL
  if (item.image && typeof item.image === 'string' && (item.image.startsWith('http') || item.image.startsWith('/'))) {
    return item.image;
  }
  
  // Check for other image fields
  if (item.imageUrl && typeof item.imageUrl === 'string') {
    return item.imageUrl;
  }
  
  // Fallback to placeholder
  return '/placeholder-medicine.jpg';
};

const CartContent = () => {
  const { items, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { createOrder, getOrderById, isLoading: isOrderLoading } = useOrders();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "cod">("card");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(!isAuthenticated);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState(15);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  
  const { selectedAddress } = useAddress();
  
  // Debug cart items
  useEffect(() => {
    console.log("Current cart items:", items);
  }, [items]);
  
  // Check if user is authenticated on component mount and when auth status changes
  useEffect(() => {
    setShowLoginAlert(!isAuthenticated);
  }, [isAuthenticated]);
  
  const form = useForm({
    defaultValues: {
      cardNumber: "",
      cardName: "",
      expiry: "",
      cvv: "",
      upiId: "",
    },
  });

  const subtotal = getCartTotal();
  const deliveryFee = subtotal >= 200 ? 0 : 40;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  const handleCheckout = async (values: any) => {
    // Check if user is logged in
    if (!isAuthenticated) {
      toast.error("Please log in to continue");
      navigate("/login");
      return;
    }
    
    // Check if address is selected
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      setShowAddressSelector(true);
      return;
    }
    
    setProcessingPayment(true);
    
    // Format the address as a string
    const addressString = `${selectedAddress.name}, ${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.pincode}, Phone: ${selectedAddress.phone}`;
    
    // Create the order using OrderContext
    const newOrderId = await createOrder({
      items: items,
      totalAmount: total,
      deliveryAddress: addressString,
      paymentMethod: paymentMethod
    });
    
    if (newOrderId) {
      setOrderId(newOrderId);
      setPaymentComplete(true);
      
      // Get the order to get the estimated delivery time
      const order = getOrderById(newOrderId);
      if (order && order.estimatedDeliveryTime) {
        setEstimatedDeliveryTime(order.estimatedDeliveryTime);
      }
      
      toast.success("Payment successful! Your order is confirmed.");
      clearCart();
    } else {
      toast.error("Payment failed. Please try again.");
    }
    
    setProcessingPayment(false);
  };

  if (orderPlaced) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 mr-2" />
                <div>
                  <h3 className="font-medium">Order Confirmed!</h3>
                  <p className="text-sm">Order ID: {orderId}</p>
                </div>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold mb-6">Track Your Order</h1>
            
            <OrderTracker 
              orderId={orderId || undefined} 
              estimatedTime={estimatedDeliveryTime} 
            />
            
            <div className="text-center mt-8">
              <Button asChild className="bg-medical-500 hover:bg-medical-600 mb-4">
                <Link to="/medicines">Continue Shopping</Link>
              </Button>
              <Button asChild variant="outline" className="ml-2">
                <Link to="/my-orders">View All Orders</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (paymentComplete) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-green-100 text-green-600 p-3 rounded-full inline-flex mb-6">
              <Truck className="h-12 w-12" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
            <p className="text-gray-600 mb-8">
              Your order has been placed successfully. You will receive a confirmation email shortly.
            </p>
            <Button asChild className="bg-medical-500 hover:bg-medical-600 mb-4 w-full">
              <Link to="/medicines">Continue Shopping</Link>
            </Button>
            <Button 
              variant="outline" 
              className="w-full mb-3"
              onClick={() => setOrderPlaced(true)}
            >
              Track Your Order
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className="w-full"
            >
              <Link to="/my-orders">View All Orders</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        {showLoginAlert && (
          <Alert className="mb-6 border-yellow-300 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Please{" "}
              <Link to="/login" className="font-medium underline text-yellow-800">
                log in
              </Link>{" "}
              or{" "}
              <Link to="/signup" className="font-medium underline text-yellow-800">
                create an account
              </Link>{" "}
              to complete your purchase.
            </AlertDescription>
          </Alert>
        )}

        {items.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any medicines to your cart yet.
            </p>
            <Button asChild className="bg-medical-500 hover:bg-medical-600">
              <Link to="/medicines">Browse Medicines</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Cart Items ({items.length})</h2>
                    <Button
                      variant="ghost"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={clearCart}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Cart
                    </Button>
                  </div>
                </div>

                <div className="divide-y">
                  {items.map((item) => (
                    <div key={item.id} className="p-4 flex items-center">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={getImageUrl(item)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Set a fallback image if the main image fails to load
                            (e.target as HTMLImageElement).src = '/placeholder-medicine.jpg';
                          }}
                        />
                      </div>

                      <div className="ml-4 flex-grow">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        {(item.brandName || item.brand) && (
                          <p className="text-sm text-gray-500">{item.brandName || item.brand}</p>
                        )}
                        {item.description && (
                          <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                        )}
                        <div className="mt-1 text-sm font-bold text-gray-900">
                          ₹{item.price.toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-2 min-w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="ml-6 text-right">
                        <div className="font-bold">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-1"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Address Selection */}
              {isAuthenticated && (
                <div className="mt-8">
                  <Dialog open={showAddressSelector} onOpenChange={setShowAddressSelector}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center justify-center"
                        onClick={() => setShowAddressSelector(true)}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        {selectedAddress ? "Change Delivery Address" : "Add Delivery Address"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Select Delivery Address</DialogTitle>
                      </DialogHeader>
                      <AddressSelector />
                    </DialogContent>
                  </Dialog>
                  
                  {selectedAddress && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-medical-500 mt-0.5 mr-2" />
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium">{selectedAddress.name}</h3>
                            {selectedAddress.isDefault && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-medical-100 text-medical-700 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{selectedAddress.street}</p>
                          <p className="text-sm text-gray-600">
                            {selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">Phone: {selectedAddress.phone}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">₹{deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Time Indicator */}
                <div className="mb-6 p-3 bg-medical-50 rounded-lg border border-medical-100">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 text-medical-600 mr-2" />
                    <span className="font-medium text-medical-700">Express Delivery</span>
                  </div>
                  <p className="text-sm text-medical-600">Your order will be delivered in 10-20 minutes</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="flex items-center">
                    <Truck className="h-5 w-5 text-medical-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium">Free Delivery</div>
                      <div className="text-xs text-gray-500">On orders above ₹200</div>
                    </div>
                  </div>
                </div>

                {!isAuthenticated ? (
                  <div className="space-y-4">
                    <Button 
                      asChild 
                      className="w-full bg-medical-500 hover:bg-medical-600"
                    >
                      <Link to="/login">Login to Checkout</Link>
                    </Button>
                    <p className="text-center text-sm text-gray-500">
                      Don't have an account?{" "}
                      <Link to="/signup" className="text-medical-500 hover:underline">
                        Sign up now
                      </Link>
                    </p>
                  </div>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-medical-500 hover:bg-medical-600"
                        disabled={!selectedAddress}
                      >
                        {selectedAddress ? "Proceed to Checkout" : "Select Delivery Address"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Complete Your Payment</DialogTitle>
                      </DialogHeader>
                      
                      <div className="flex space-x-2 mb-6">
                        <Button
                          variant={paymentMethod === "card" ? "default" : "outline"}
                          className={paymentMethod === "card" ? "bg-medical-500 hover:bg-medical-600 flex-1" : "flex-1"}
                          onClick={() => setPaymentMethod("card")}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Card
                        </Button>
                        <Button
                          variant={paymentMethod === "upi" ? "default" : "outline"}
                          className={paymentMethod === "upi" ? "bg-medical-500 hover:bg-medical-600 flex-1" : "flex-1"}
                          onClick={() => setPaymentMethod("upi")}
                        >
                          UPI
                        </Button>
                        <Button
                          variant={paymentMethod === "cod" ? "default" : "outline"}
                          className={paymentMethod === "cod" ? "bg-medical-500 hover:bg-medical-600 flex-1" : "flex-1"}
                          onClick={() => setPaymentMethod("cod")}
                        >
                          Cash on Delivery
                        </Button>
                      </div>

                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleCheckout)} className="space-y-4">
                          {paymentMethod === "card" && (
                            <>
                              <FormField
                                control={form.control}
                                name="cardNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Card Number</FormLabel>
                                    <FormControl>
                                      <Input placeholder="1234 5678 9012 3456" {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="cardName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Cardholder Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="expiry"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Expiry Date</FormLabel>
                                      <FormControl>
                                        <Input placeholder="MM/YY" {...field} />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name="cvv"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>CVV</FormLabel>
                                      <FormControl>
                                        <Input placeholder="123" type="password" {...field} />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </>
                          )}
                          
                          {paymentMethod === "upi" && (
                            <FormField
                              control={form.control}
                              name="upiId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>UPI ID</FormLabel>
                                  <FormControl>
                                    <Input placeholder="example@upi" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          )}
                          
                          {paymentMethod === "cod" && (
                            <div className="bg-yellow-50 p-4 rounded-lg">
                              <p className="text-sm text-yellow-800">
                                You'll pay ₹{total.toFixed(2)} when your order is delivered.
                                A convenience fee may apply.
                              </p>
                            </div>
                          )}
                          
                          <div className="pt-4">
                            <Button 
                              type="submit" 
                              className="w-full bg-medical-500 hover:bg-medical-600"
                              disabled={processingPayment || isOrderLoading}
                            >
                              {(processingPayment || isOrderLoading) ? "Processing..." : `Pay ₹${total.toFixed(2)}`}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                )}

                <div className="mt-6 text-center">
                  <Button asChild variant="link">
                    <Link to="/medicines" className="text-medical-500">
                      Continue Shopping
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

const Cart = () => {
  return (
    <AddressProvider>
      <CartContent />
    </AddressProvider>
  );
};

export default Cart;
