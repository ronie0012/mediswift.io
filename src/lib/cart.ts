
import { useContext } from 'react';
import { CartContext, useCart as useCartContext } from '@/context/CartContext';

// For backward compatibility
export const useCart = useCartContext;

// Also export the context directly in case it's needed
export { CartContext };
