import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// ---- Types ----
export interface MedicineCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  medicine_count: number;
}

export interface Medicine {
  id: number;
  name: string;
  brand: string;
  category: number;
  category_name: string;
  description: string;
  price: string;
  discount_price: string | null;
  stock: number;
  quantity: string;
  image: string;
  requires_prescription: boolean;
  is_featured: boolean;
  rating: string;
  review_count: number;
  discount_percentage: number;
  created_at: string;
}

export interface MedicineListResponse {
  count: number;
  results: Medicine[];
}

export interface FeedbackCluster {
  issue: string;
  count: number;
  percentage: number;
  action_taken: string;
}

export interface FeedbackAnalysis {
  total_reports: number;
  period: string;
  clusters: FeedbackCluster[];
}

export interface FeedbackItem {
  id: number;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export interface RevenueBreakdown {
  stream: string;
  model_type: string;
  amount: number;
}

export interface RevenueStats {
  total: number;
  currency: string;
  period: string;
  note?: string;
  breakdown: RevenueBreakdown[];
}

export interface MarketingStats {
  google_ads: Record<string, unknown>;
  social_media: Record<string, unknown>;
  referral: Record<string, unknown>;
  email: Record<string, unknown>;
  platform_stats: { registered_users: number; total_medicines: number; total_feedback: number };
}

// ---- Hooks ----

export function useFeaturedMedicines() {
  return useQuery<Medicine[]>({
    queryKey: ['medicines', 'featured'],
    queryFn: async () => {
      const { data } = await api.get('/medicines/featured/');
      return data;
    },
  });
}

export function useMedicines(params?: Record<string, string>) {
  return useQuery<MedicineListResponse>({
    queryKey: ['medicines', params],
    queryFn: async () => {
      const { data } = await api.get('/medicines/', { params });
      return data;
    },
  });
}

export function useCategories() {
  return useQuery<MedicineCategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories/');
      return data;
    },
  });
}

export function useUploadPrescription() {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/prescriptions/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
  });
}

export function useAdminAuthCheck() {
  return useQuery<{ is_admin: boolean; username: string }>({
    queryKey: ['admin', 'auth'],
    queryFn: async () => {
      const { data } = await api.get('/admin/auth/check/');
      return data;
    },
    retry: false,
  });
}

export function useAdminFeedback() {
  return useQuery<FeedbackItem[]>({
    queryKey: ['admin', 'feedback'],
    queryFn: async () => {
      const { data } = await api.get('/admin/feedback/');
      return data;
    },
  });
}

export function useAdminFeedbackAnalysis() {
  return useQuery<FeedbackAnalysis>({
    queryKey: ['admin', 'feedback', 'analysis'],
    queryFn: async () => {
      const { data } = await api.get('/admin/feedback/analysis/');
      return data;
    },
  });
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; email: string; category: string; subject: string; message: string }) => {
      const { data } = await api.post('/admin/feedback/', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feedback'] });
    },
  });
}

export function useMarketingStats() {
  return useQuery<MarketingStats>({
    queryKey: ['admin', 'marketing'],
    queryFn: async () => {
      const { data } = await api.get('/admin/marketing/stats/');
      return data;
    },
  });
}

export function useRevenueStats() {
  return useQuery<RevenueStats>({
    queryKey: ['admin', 'revenue'],
    queryFn: async () => {
      const { data } = await api.get('/admin/revenue/stats/');
      return data;
    },
  });
}

export function useAdminLogin() {
  return useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const { data } = await api.post('/auth/token/', credentials);
      return data as { access: string; refresh: string; user: { username: string } };
    },
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
    },
  });
}

// ---- Order & Admin Hooks ----

export interface OrderItem {
  id: number;
  medicine: number | null;
  medicine_name: string;
  price: string;
  quantity: number;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: string;
  status: string;
  payment_method: string;
  is_paid: boolean;
  created_at: string;
  items: OrderItem[];
}

export function useCheckout() {
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      phone: string;
      address: string;
      payment_method: string;
      items: { id: number; quantity: number }[];
    }) => {
      const { data } = await api.post('/orders/checkout/', payload);
      return data;
    },
  });
}

export function useAdminOrders() {
  return useQuery<Order[]>({
    queryKey: ['admin', 'orders'],
    queryFn: async () => {
      const { data } = await api.get('/admin/orders/');
      return data;
    },
  });
}

export function useMyOrders() {
  return useQuery<Order[]>({
    queryKey: ['my', 'orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders/my/');
      return data;
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const { data } = await api.patch(`/admin/orders/${id}/`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });
}

export function useAdminMedicines() {
  return useQuery<Medicine[]>({
    queryKey: ['admin', 'medicines'],
    queryFn: async () => {
      const { data } = await api.get('/admin/medicines/');
      return data;
    },
  });
}

export function useCreateMedicine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Medicine>) => {
      const { data } = await api.post('/admin/medicines/', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'medicines'] });
    },
  });
}

export function useUpdateMedicine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Medicine> & { id: number }) => {
      const { data } = await api.patch(`/admin/medicines/${id}/`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'medicines'] });
    },
  });
}

export function useDeleteMedicine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/medicines/${id}/`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'medicines'] });
    },
  });
}
