
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus, ShoppingBag, CreditCard, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "cod">("card");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  
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
  const deliveryFee = subtotal > 0 ? 2.99 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  const handleCheckout = async (values: any) => {
    setProcessingPayment(true);
    
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    if (Math.random() > 0.1) { // 90% success rate for demo
      setPaymentComplete(true);
      toast.success("Payment successful! Your order is confirmed.");
      clearCart();
    } else {
      toast.error("Payment failed. Please try again.");
    }
    
    setProcessingPayment(false);
  };

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
            <Button asChild variant="outline" className="w-full">
              <Link to="/account/orders">Track Your Order</Link>
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
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="ml-4 flex-grow">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        {item.brandName && (
                          <p className="text-sm text-gray-500">{item.brandName}</p>
                        )}
                        <div className="mt-1 text-sm font-bold text-gray-900">
                          ${item.price.toFixed(2)}
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
                          ${(item.price * item.quantity).toFixed(2)}
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
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-medical-500 hover:bg-medical-600">
                      Proceed to Checkout
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
                              You'll pay ${total.toFixed(2)} when your order is delivered.
                              A convenience fee may apply.
                            </p>
                          </div>
                        )}
                        
                        <div className="pt-4">
                          <Button 
                            type="submit" 
                            className="w-full bg-medical-500 hover:bg-medical-600"
                            disabled={processingPayment}
                          >
                            {processingPayment ? "Processing..." : `Pay $${total.toFixed(2)}`}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

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

export default Cart;
