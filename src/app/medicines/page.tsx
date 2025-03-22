'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { useSearchParams, useRouter } from 'next/navigation';
import MedicineCard from '@/components/medicines/MedicineCard';
import Pagination from '@/components/common/Pagination';
import { useMedicines } from '@/hooks/useMedicines';

export default function MedicinesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get search parameters
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialMinPrice = parseInt(searchParams.get('min_price') || '0', 10);
  const initialMaxPrice = parseInt(searchParams.get('max_price') || '10000', 10);
  const initialSortBy = searchParams.get('sort_by') || 'relevance';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  
  // Local state
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState<[number, number]>([initialMinPrice, initialMaxPrice]);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  // Fetch medicines with the current filters
  const { 
    medicines, 
    categories, 
    loading, 
    error,
    totalPages,
    totalCount,
    priceStats
  } = useMedicines({
    search,
    category,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    sortBy,
    page: currentPage
  });

  // Update URL with current filters
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (priceRange[0] > 0) params.set('min_price', priceRange[0].toString());
    if (priceRange[1] < 10000) params.set('max_price', priceRange[1].toString());
    if (sortBy !== 'relevance') params.set('sort_by', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/medicines?${queryString}` : '/medicines';
    
    router.push(url, { scroll: false });
  }, [search, category, priceRange, sortBy, currentPage, router]);
  
  // Handler for search submissions
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset pagination on new search
  };
  
  // Handler for changing page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearch('');
    setCategory('');
    setPriceRange([0, 10000]);
    setSortBy('relevance');
    setCurrentPage(1);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Browse Medicines</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters}
                className="h-8 text-blue-600 hover:text-blue-800"
              >
                Reset All
              </Button>
            </div>
            
            <Accordion type="multiple" defaultValue={['category', 'price']} className="w-full">
              <AccordionItem value="category">
                <AccordionTrigger className="text-base font-medium">Categories</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="all-categories" 
                        checked={category === ''}
                        onCheckedChange={() => setCategory('')}
                      />
                      <label 
                        htmlFor="all-categories" 
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        All Categories
                      </label>
                    </div>
                    
                    {categories.map((cat) => (
                      <div key={cat} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`category-${cat}`} 
                          checked={category === cat}
                          onCheckedChange={() => setCategory(cat)}
                        />
                        <label 
                          htmlFor={`category-${cat}`} 
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {cat}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="price">
                <AccordionTrigger className="text-base font-medium">Price Range</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <Slider
                      defaultValue={[priceRange[0], priceRange[1]]}
                      min={0}
                      max={10000}
                      step={100}
                      value={[priceRange[0], priceRange[1]]}
                      onValueChange={(value) => setPriceRange([value[0], value[1]])}
                      className="my-6"
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="border rounded-md px-3 py-1 w-24 text-center">
                        ₹{priceRange[0]}
                      </div>
                      <span className="text-gray-500">to</span>
                      <div className="border rounded-md px-3 py-1 w-24 text-center">
                        ₹{priceRange[1]}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
        
        <div className="md:w-3/4">
          {/* Search and Sort Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <Input
                  type="text"
                  placeholder="Search medicines by name, brand, or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="w-full md:w-48">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit">
                Search
              </Button>
            </form>
          </div>
          
          {/* Results Section */}
          <div className="mb-4">
            <p className="text-gray-600">
              {loading ? 'Searching...' : `${totalCount} medicines found`}
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 animate-pulse h-64 rounded-lg"></div>
              ))}
            </div>
          ) : medicines.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No medicines found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medicines.map((medicine) => (
                <MedicineCard key={medicine.id} medicine={medicine} />
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 