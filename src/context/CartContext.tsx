import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { useAuth } from "./AuthContext";
import { orderService } from "@/services/order.service";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  prescription_required: boolean;
}

export interface CreateOrderData {
  userId: string;
  items: CartItem[];
  deliveryAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  isInCart: (itemId: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  // Load cart from localStorage on initial load
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Error parsing cart from localStorage', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);
  
  // Update localStorage and totals whenever items change
  useEffect(() => {
    // Calculate totals
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const price = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    setTotalItems(itemCount);
    setTotalPrice(price);
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);
  
  // Add an item to the cart
  const addToCart = (item: CartItem) => {
    setItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(i => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const existingItem = prevItems[existingItemIndex];
        const newQuantity = existingItem.quantity + item.quantity;
        
        // Check if new quantity exceeds stock
        if (newQuantity > existingItem.stock) {
          toast.error(`Sorry, only ${existingItem.stock} items available in stock`);
          return prevItems;
        }
        
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity
        };
        
        return updatedItems;
      } else {
        // Add new item if it doesn't exist
        return [...prevItems, item];
      }
    });
  };
  
  // Remove an item from the cart
  const removeFromCart = (itemId: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };
  
  // Update the quantity of an item in the cart
  const updateQuantity = (itemId: number, quantity: number) => {
    setItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === itemId) {
          // Validate quantity
          if (quantity <= 0) {
            return item;
          }
          
          if (quantity > item.stock) {
            toast.error(`Sorry, only ${item.stock} items available in stock`);
            return item;
          }
          
          return { ...item, quantity };
        }
        return item;
      });
    });
  };
  
  // Clear all items from the cart
  const clearCart = () => {
    setItems([]);
  };
  
  // Check if an item is already in the cart
  const isInCart = (itemId: number) => {
    return items.some(item => item.id === itemId);
  };
  
  const checkout = async (deliveryAddress: CreateOrderData['deliveryAddress']) => {
    if (!user) {
      toast.error("You must be logged in to checkout");
      throw new Error("User not authenticated");
    }
    
    if (items.length === 0) {
      toast.error("Your cart is empty");
      throw new Error("Cart is empty");
    }
    
    setLoading(true);
    
    try {
      // For now, simulate a successful order
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Uncomment when orderService is properly integrated
      // await orderService.createOrder({
      //   userId: user.id,
      //   items: items.map(item => ({
      //     medicine: {
      //       id: item.id,
      //       name: item.name,
      //       brand: item.brand,
      //       discount_price: item.price,
      //       image: item.image,
      //       quantity: item.quantityLabel
      //     },
      //     quantity: item.quantity
      //   })),
      //   deliveryAddress
      // });
      
      clearCart();
      toast.success("Order placed successfully!");
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to place order. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <CartContext.Provider value={{
      items,
      totalItems,
      totalPrice,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isInCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
