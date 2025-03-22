import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';
import { Medicine } from './medicine.service';

export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];

export interface OrderWithItems extends Order {
  items: OrderItemWithDetails[];
}

export interface OrderItemWithDetails extends OrderItem {
  medicine?: {
    id: number;
    name: string;
    brand: string;
    image: string;
    quantity: string;
  };
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface CartItem {
  medicine: Medicine;
  quantity: number;
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

class OrderService {
  async createOrder(data: CreateOrderData): Promise<Order> {
    try {
      // Calculate total amount
      const totalAmount = data.items.reduce(
        (total, item) => total + item.medicine.discount_price * item.quantity,
        0
      );
      
      // First create the order
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: data.userId,
          total_amount: totalAmount,
          status: OrderStatus.PENDING,
          delivery_address: data.deliveryAddress,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (!order) {
        throw new Error('Failed to create order');
      }
      
      // Then create the order items
      const orderItems = data.items.map(item => ({
        order_id: order.id,
        medicine_id: item.medicine.id,
        quantity: item.quantity,
        price: item.medicine.discount_price,
        created_at: new Date().toISOString()
      }));
      
      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (orderItemsError) {
        // If there's an error creating order items, delete the order
        await supabase.from('orders').delete().eq('id', order.id);
        throw orderItemsError;
      }
      
      return order as Order;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  }
  
  async getUserOrders(userId: string): Promise<OrderWithItems[]> {
    try {
      // Get orders
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (!orders || orders.length === 0) {
        return [];
      }
      
      // Get order items with medicine details
      const orderIds = orders.map(order => order.id);
      
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          medicine:medicine_id (
            id,
            name,
            brand,
            image,
            quantity
          )
        `)
        .in('order_id', orderIds);
      
      if (itemsError) throw itemsError;
      
      // Combine orders with their items
      const ordersWithItems = orders.map(order => {
        const items = orderItems.filter(item => item.order_id === order.id);
        return {
          ...order,
          items: items as OrderItemWithDetails[]
        };
      });
      
      return ordersWithItems as OrderWithItems[];
    } catch (error) {
      console.error('Get user orders error:', error);
      throw error;
    }
  }
  
  async getOrderById(id: number): Promise<OrderWithItems | null> {
    try {
      // Get order
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Get order items with medicine details
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          medicine:medicine_id (
            id,
            name,
            brand,
            image,
            quantity
          )
        `)
        .eq('order_id', id);
      
      if (itemsError) throw itemsError;
      
      return {
        ...order,
        items: orderItems as OrderItemWithDetails[]
      } as OrderWithItems;
    } catch (error) {
      console.error('Get order by ID error:', error);
      throw error;
    }
  }
  
  async updateOrderStatus(id: number, status: OrderStatus): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  }
  
  async cancelOrder(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: OrderStatus.CANCELLED,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Cancel order error:', error);
      throw error;
    }
  }
  
  // For admin use only
  async getAllOrders(page: number = 1, perPage: number = 10): Promise<{ orders: Order[]; total: number }> {
    try {
      // Calculate range
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      
      // Get orders
      const { data, error, count } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      return {
        orders: data as Order[],
        total: count || 0
      };
    } catch (error) {
      console.error('Get all orders error:', error);
      throw error;
    }
  }
}

export const orderService = new OrderService(); 