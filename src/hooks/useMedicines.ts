import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Medicine } from '@/components/medicines/MedicineCard';

interface UseMedicinesProps {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  page?: number;
  perPage?: number;
}

interface UseMedicinesResult {
  medicines: Medicine[];
  categories: string[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  totalCount: number;
  priceStats: {
    min: number;
    max: number;
  };
}

export function useMedicines({
  search = '',
  category = '',
  minPrice = 0,
  maxPrice = 10000,
  sortBy = 'relevance',
  page = 1,
  perPage = 12
}: UseMedicinesProps): UseMedicinesResult {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [priceStats, setPriceStats] = useState({ min: 0, max: 0 });
  
  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build query
        let query = supabase
          .from('medicines')
          .select('*', { count: 'exact' });
        
        // Apply filters
        if (search) {
          query = query.or(
            `name.ilike.%${search}%,brand.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`
          );
        }
        
        if (category) {
          query = query.eq('category', category);
        }
        
        query = query
          .gte('discount_price', minPrice)
          .lte('discount_price', maxPrice);
        
        // Apply sorting
        switch (sortBy) {
          case 'price_low':
            query = query.order('discount_price', { ascending: true });
            break;
          case 'price_high':
            query = query.order('discount_price', { ascending: false });
            break;
          case 'rating':
            query = query.order('rating', { ascending: false });
            break;
          default:
            // Default sort by relevance (or just use name if no search term)
            query = query.order(search ? 'name' : 'id', { ascending: true });
        }
        
        // Apply pagination
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;
        
        const { data, error: fetchError, count } = await query
          .range(from, to);
        
        if (fetchError) throw fetchError;
        
        // Calculate total pages
        const total = count || 0;
        const pages = Math.ceil(total / perPage);
        
        setMedicines(data as Medicine[]);
        setTotalCount(total);
        setTotalPages(pages);
      } catch (err: any) {
        console.error('Error fetching medicines:', err);
        setError(err.message || 'Failed to load medicines');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('medicines')
          .select('category')
          .order('category');
        
        if (error) throw error;
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(item => item.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    const fetchPriceStats = async () => {
      try {
        // Get min price
        const { data: minData, error: minError } = await supabase
          .from('medicines')
          .select('discount_price')
          .order('discount_price', { ascending: true })
          .limit(1)
          .single();
        
        if (minError) throw minError;
        
        // Get max price
        const { data: maxData, error: maxError } = await supabase
          .from('medicines')
          .select('discount_price')
          .order('discount_price', { ascending: false })
          .limit(1)
          .single();
        
        if (maxError) throw maxError;
        
        setPriceStats({
          min: Math.floor(minData.discount_price),
          max: Math.ceil(maxData.discount_price)
        });
      } catch (err) {
        console.error('Error fetching price stats:', err);
      }
    };
    
    // Execute fetches
    fetchMedicines();
    
    // Only fetch categories and price stats on initial load
    if (categories.length === 0) {
      fetchCategories();
    }
    
    if (priceStats.max === 0) {
      fetchPriceStats();
    }
  }, [
    search, 
    category, 
    minPrice, 
    maxPrice, 
    sortBy, 
    page, 
    perPage, 
    categories.length, 
    priceStats.max
  ]);
  
  return {
    medicines,
    categories,
    loading,
    error,
    totalPages,
    totalCount,
    priceStats
  };
} 