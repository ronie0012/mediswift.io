import { supabase } from './supabase';
import type { Database } from '@/types/database.types';

export type PharmacyItem = Database['public']['Tables']['pharmacy_inventory']['Row'];
export type PharmacyItemInsert = Database['public']['Tables']['pharmacy_inventory']['Insert'];
export type PharmacyItemUpdate = Database['public']['Tables']['pharmacy_inventory']['Update'];

export type MedicineOrder = Database['public']['Tables']['medicine_orders']['Row'];
export type MedicineOrderInsert = Database['public']['Tables']['medicine_orders']['Insert'];
export type MedicineOrderUpdate = Database['public']['Tables']['medicine_orders']['Update'];

export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];

// Get all medicines
export const getAllMedicines = async () => {
  const { data, error } = await supabase
    .from('pharmacy_inventory')
    .select('*')
    .order('medication_name', { ascending: true });

  return { data, error };
};

// Search medicines
export const searchMedicines = async (query: string) => {
  const { data, error } = await supabase
    .from('pharmacy_inventory')
    .select('*')
    .or(`medication_name.ilike.%${query}%,generic_name.ilike.%${query}%,brand_name.ilike.%${query}%`)
    .order('medication_name', { ascending: true });

  return { data, error };
};

// Get medicine by ID
export const getMedicineById = async (id: string) => {
  const { data, error } = await supabase
    .from('pharmacy_inventory')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
};

// Add new medicine (admin/pharmacy only)
export const addMedicine = async (medicine: PharmacyItemInsert) => {
  const { data, error } = await supabase
    .from('pharmacy_inventory')
    .insert(medicine)
    .select()
    .single();

  return { data, error };
};

// Update medicine (admin/pharmacy only)
export const updateMedicine = async (id: string, updates: PharmacyItemUpdate) => {
  const { data, error } = await supabase
    .from('pharmacy_inventory')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

// Create medicine order
export const createMedicineOrder = async (
  order: MedicineOrderInsert,
  items: Omit<OrderItemInsert, 'order_id'>[]
) => {
  // Start a transaction
  const { data, error } = await supabase
    .from('medicine_orders')
    .insert(order)
    .select()
    .single();

  if (error || !data) {
    return { data: null, error };
  }

  // Insert order items
  const orderItems = items.map(item => ({
    ...item,
    order_id: data.id,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    return { data, error: itemsError };
  }

  // Create notification
  await supabase.from('notifications').insert({
    user_id: order.patient_id,
    title: 'Order Placed',
    message: 'Your medicine order has been placed successfully.',
    notification_type: 'medicine_order',
    related_id: data.id,
  });

  // Update inventory (reduce stock)
  for (const item of items) {
    await supabase.rpc('update_medicine_stock', {
      medicine_id: item.medication_id,
      quantity: -item.quantity,
    });
  }

  return { data, error: null };
};

// Get order by ID
export const getOrderById = async (id: string) => {
  const { data, error } = await supabase
    .from('medicine_orders')
    .select(`
      *,
      patient:patient_id (
        id,
        first_name,
        last_name,
        phone
      ),
      order_items (
        *,
        medication:medication_id (
          id,
          medication_name,
          brand_name,
          dosage_form,
          strength,
          image_url
        )
      )
    `)
    .eq('id', id)
    .single();

  return { data, error };
};

// Get orders for patient
export const getPatientOrders = async (patientId: string) => {
  const { data, error } = await supabase
    .from('medicine_orders')
    .select(`
      *,
      order_items (
        id,
        quantity,
        unit_price,
        subtotal,
        medication:medication_id (
          id,
          medication_name,
          brand_name,
          image_url
        )
      )
    `)
    .eq('patient_id', patientId)
    .order('order_date', { ascending: false });

  return { data, error };
};

// Update order status (admin/pharmacy only)
export const updateOrderStatus = async (
  id: string,
  status: MedicineOrder['status']
) => {
  const { data, error } = await supabase
    .from('medicine_orders')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (data) {
    // Create notification
    const statusMessages = {
      pending: 'is pending review',
      processing: 'is being processed',
      shipped: 'has been shipped',
      delivered: 'has been delivered',
      cancelled: 'has been cancelled',
    };

    await supabase.from('notifications').insert({
      user_id: data.patient_id,
      title: `Order ${status}`,
      message: `Your medicine order ${statusMessages[status]}.`,
      notification_type: 'order_status',
      related_id: data.id,
    });
  }

  return { data, error };
};

// Get medicines by category
export const getMedicinesByCategory = async (category: string) => {
  const { data, error } = await supabase
    .from('pharmacy_inventory')
    .select('*')
    .eq('category', category)
    .order('medication_name', { ascending: true });

  return { data, error };
}; 