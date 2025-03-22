
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from '@/types/models';
import { toast } from 'sonner';

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  getCartTotal: () => number;
  getItemsCount: () => number;
  totalPrice: number;
  removeFromCart: (id: number) => void;
  addToCart: (item: CartItem) => void;
  isInCart: (id: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedItems = localStorage.getItem('cartItems');
    if (storedItems) {
      try {
        setItems(JSON.parse(storedItems));
      } catch (error) {
        console.error('Failed to parse cart items from localStorage', error);
        localStorage.removeItem('cartItems');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(i => i.id === item.id);
      
      if (existingItem) {
        toast.info(`${item.name} quantity updated in cart`);
        return currentItems.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + item.quantity } 
            : i
        );
      } else {
        toast.success(`${item.name} added to cart`);
        return [...currentItems, item];
      }
    });
  };

  const removeItem = (id: number) => {
    setItems(currentItems => {
      const item = currentItems.find(i => i.id === id);
      if (item) {
        toast.info(`${item.name} removed from cart`);
      }
      return currentItems.filter(item => item.id !== id);
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;
    
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast.info('Cart cleared');
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemsCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const isInCart = (id: number) => {
    return items.some(item => item.id === id);
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems: items.reduce((acc, item) => acc + item.quantity, 0),
      getCartTotal,
      getItemsCount,
      totalPrice: getCartTotal(),
      removeFromCart: removeItem,
      addToCart: addItem,
      isInCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
