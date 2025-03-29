import { supabase } from './supabase';
import type { Database } from '@/types/database.types';

export type Payment = Database['public']['Tables']['payments']['Row'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

// Create payment
export const createPayment = async (payment: PaymentInsert) => {
  const { data, error } = await supabase
    .from('payments')
    .insert(payment)
    .select()
    .single();

  return { data, error };
};

// Get payment by ID
export const getPaymentById = async (id: string) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
};

// Update payment status
export const updatePaymentStatus = async (
  id: string,
  status: Payment['status'],
  transactionId?: string
) => {
  const updates: PaymentUpdate = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (transactionId) {
    updates.transaction_id = transactionId;
  }

  const { data, error } = await supabase
    .from('payments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

// Get user payments
export const getUserPayments = async (userId: string) => {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      appointments:appointment_id (
        id,
        appointment_date,
        start_time,
        doctor:doctor_id (
          profiles:id (
            first_name,
            last_name
          )
        )
      ),
      medicine_orders:order_id (
        id,
        order_date,
        status
      ),
      ambulance_requests:ambulance_request_id (
        id,
        request_time,
        status,
        service:service_id (
          name
        )
      )
    `)
    .eq('user_id', userId)
    .order('payment_date', { ascending: false });

  return { data, error };
};

// Process payment for appointment
export const processAppointmentPayment = async (
  userId: string,
  appointmentId: string,
  amount: number,
  paymentMethod: string,
  currency = 'USD'
) => {
  // Create payment record
  const payment: PaymentInsert = {
    user_id: userId,
    appointment_id: appointmentId,
    amount,
    currency,
    payment_method: paymentMethod,
    status: 'pending',
    payment_date: new Date().toISOString(),
  };

  const { data, error } = await createPayment(payment);

  if (error || !data) {
    return { data: null, error };
  }

  // Update appointment with payment ID and status
  await supabase
    .from('appointments')
    .update({
      payment_id: data.id,
      payment_status: 'pending',
      updated_at: new Date().toISOString(),
    })
    .eq('id', appointmentId);

  return { data, error: null };
};

// Process payment for medicine order
export const processMedicineOrderPayment = async (
  userId: string,
  orderId: string,
  amount: number,
  paymentMethod: string,
  currency = 'USD'
) => {
  // Create payment record
  const payment: PaymentInsert = {
    user_id: userId,
    order_id: orderId,
    amount,
    currency,
    payment_method: paymentMethod,
    status: 'pending',
    payment_date: new Date().toISOString(),
  };

  const { data, error } = await createPayment(payment);

  if (error || !data) {
    return { data: null, error };
  }

  // Update order with payment ID and status
  await supabase
    .from('medicine_orders')
    .update({
      payment_id: data.id,
      payment_status: 'pending',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  return { data, error: null };
};

// Process payment for ambulance request
export const processAmbulanceRequestPayment = async (
  userId: string,
  requestId: string,
  amount: number,
  paymentMethod: string,
  currency = 'USD'
) => {
  // Create payment record
  const payment: PaymentInsert = {
    user_id: userId,
    ambulance_request_id: requestId,
    amount,
    currency,
    payment_method: paymentMethod,
    status: 'pending',
    payment_date: new Date().toISOString(),
  };

  const { data, error } = await createPayment(payment);

  if (error || !data) {
    return { data: null, error };
  }

  // Update ambulance request with payment ID and status
  await supabase
    .from('ambulance_requests')
    .update({
      payment_id: data.id,
      payment_status: 'pending',
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  return { data, error: null };
}; 