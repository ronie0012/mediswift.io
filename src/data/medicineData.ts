
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Medicine {
  id: number;
  name: string;
  brand: string;
  price: number;
  discount_price: number | null;
  category: string;
  quantity: string;
  description: string;
  image_url: string;
  in_stock: boolean;
  requires_prescription: boolean;
}

export interface MedicineCategory {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
}

export interface MedicineInventory {
  id: string;
  medicine_id: number;
  batch_number: string;
  expiry_date: string;
  stock_quantity: number;
  location: string | null;
}

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: number;
  diagnosis: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  expires_at: string;
  items?: PrescriptionItem[];
}

export interface PrescriptionItem {
  id: string;
  prescription_id: string;
  medicine_id: number;
  medicine?: Medicine;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string | null;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
}

// Fetch all medicines
export const fetchMedicines = async (): Promise<Medicine[]> => {
  try {
    // Use the more generic from() method instead of specifying a typed table
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .order('name') as { data: Medicine[] | null, error: any };
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching medicines:', error);
    toast.error('Failed to load medicines');
    return [];
  }
};

// Fetch a single medicine by ID
export const fetchMedicineById = async (id: number): Promise<Medicine | null> => {
  try {
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .eq('id', id)
      .single() as { data: Medicine | null, error: any };
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching medicine with ID ${id}:`, error);
    toast.error('Failed to load medicine details');
    return null;
  }
};

// Fetch medicines by category
export const fetchMedicinesByCategory = async (category: string): Promise<Medicine[]> => {
  try {
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .eq('category', category)
      .order('name') as { data: Medicine[] | null, error: any };
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching medicines in category ${category}:`, error);
    toast.error('Failed to load medicines for this category');
    return [];
  }
};

// Fetch all medicine categories
export const fetchMedicineCategories = async (): Promise<MedicineCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('medicine_categories')
      .select('*')
      .order('name') as { data: MedicineCategory[] | null, error: any };
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching medicine categories:', error);
    toast.error('Failed to load categories');
    return [];
  }
};

// Fetch medicine inventory
export const fetchMedicineInventory = async (medicineId: number): Promise<MedicineInventory[]> => {
  try {
    const { data, error } = await supabase
      .from('medicine_inventory')
      .select('*')
      .eq('medicine_id', medicineId)
      .order('expiry_date') as { data: MedicineInventory[] | null, error: any };
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching inventory for medicine ID ${medicineId}:`, error);
    toast.error('Failed to load inventory information');
    return [];
  }
};

// Fetch user notifications
export const fetchUserNotifications = async (): Promise<Notification[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false }) as { data: Notification[] | null, error: any };
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    toast.error('Failed to load notifications');
    return [];
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error marking notification ${notificationId} as read:`, error);
    toast.error('Failed to update notification');
  }
};

// Fetch user prescriptions
export const fetchUserPrescriptions = async (): Promise<Prescription[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];
    
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .order('created_at', { ascending: false }) as { data: Prescription[] | null, error: any };
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    toast.error('Failed to load prescriptions');
    return [];
  }
};

// Fetch prescription details with items
export const fetchPrescriptionDetails = async (prescriptionId: string): Promise<Prescription | null> => {
  try {
    // Fetch prescription
    const { data: prescription, error: prescriptionError } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('id', prescriptionId)
      .single() as { data: Prescription | null, error: any };
    
    if (prescriptionError) throw prescriptionError;
    if (!prescription) return null;
    
    // Fetch prescription items
    const { data: items, error: itemsError } = await supabase
      .from('prescription_items')
      .select(`
        *,
        medicine:medicine_id (*)
      `)
      .eq('prescription_id', prescriptionId) as { 
        data: Array<PrescriptionItem & {medicine: Medicine}> | null, 
        error: any 
      };
    
    if (itemsError) throw itemsError;
    
    return {
      ...prescription,
      items: items || []
    };
  } catch (error) {
    console.error(`Error fetching prescription details for ID ${prescriptionId}:`, error);
    toast.error('Failed to load prescription details');
    return null;
  }
};
