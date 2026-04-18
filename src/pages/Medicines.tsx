import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Heart, ShoppingCart, Filter, ChevronDown, Star, Plus, Minus, Check, ArrowUpDown, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useMedicines, useCategories, type Medicine as ApiMedicine } from "@/lib/api.hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";

const MedicineCard = ({ medicine }: { medicine: ApiMedicine }) => {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const cartItem = {
    id: medicine.id,
    name: medicine.name,
    brand: medicine.brand,
    price: Number(medicine.price),
    discountPrice: Number(medicine.discount_price ?? medicine.price),
    rating: Number(medicine.rating),
    category: medicine.category_name,
    quantity: medicine.quantity,
    image: medicine.image,
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(cartItem, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity} ${quantity === 1 ? 'unit' : 'units'} of ${medicine.name} has been added to your cart.`,
    });
    setQuantity(1);
    setShowQuickAdd(false);
  };

  const currentPrice = Number(medicine.discount_price ?? medicine.price);
  const originalPrice = Number(medicine.price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 cursor-pointer relative group"
      onClick={() => navigate(`/medicines/${medicine.id}`)}
      onMouseEnter={() => setShowQuickAdd(true)}
      onMouseLeave={() => setShowQuickAdd(false)}
    >
      <div className="relative h-48 overflow-hidden bg-gray-50 p-2">
        {medicine.discount_percentage > 0 && (
          <Badge className="absolute top-2 left-2 z-10 bg-red-500 hover:bg-red-600">{medicine.discount_percentage}% OFF</Badge>
        )}
        <button 
          className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 rounded-full hover:bg-white transition-colors"
          onClick={(e) => { e.stopPropagation(); setIsWishlisted(!isWishlisted); }}
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'} transition-colors`} />
        </button>
        <img 
          src={medicine.image}
          alt={medicine.name} 
          className="w-full h-full object-contain"
          onError={(e) => { (e.target as HTMLImageElement).src = '/Paracetamol.webp'; }}
        />
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500 mb-1 font-medium">{medicine.brand || 'Generic'}</div>
            <div className="text-xs font-medium text-medical-600">{medicine.category_name}</div>
          </div>
          <h3 className="font-semibold text-gray-900 text-base line-clamp-2 h-12">{medicine.name}</h3>
        </div>
        
        <div className="flex items-center">
          <div className="flex items-center bg-green-50 px-2 py-0.5 rounded-full">
            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium ml-1 text-green-700">{medicine.rating}</span>
          </div>
          <span className="text-xs text-gray-500 ml-2">({medicine.review_count})</span>
        </div>
        
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-gray-900">₹{currentPrice}</span>
              {currentPrice < originalPrice && (
                 <span className="text-sm text-gray-500 line-through">₹{originalPrice}</span>
              )}
            </div>
            <div className="text-xs text-gray-600 mt-0.5">{medicine.quantity}</div>
          </div>
          
          {showQuickAdd ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center bg-gray-100 rounded-md">
                <button className="p-1 hover:bg-gray-200 rounded-l-md" onClick={(e) => { e.stopPropagation(); setQuantity(q => Math.max(1, q-1)); }}><Minus className="h-4 w-4 text-gray-600" /></button>
                <span className="px-2 text-sm font-medium min-w-[24px] text-center bg-gray-100">{quantity}</span>
                <button className="p-1 hover:bg-gray-200 rounded-r-md" onClick={(e) => { e.stopPropagation(); setQuantity(q => q+1); }}><Plus className="h-4 w-4 text-gray-600" /></button>
              </div>
              <Button size="sm" className="bg-medical-600 hover:bg-medical-700 text-white h-8 w-full" onClick={handleAddToCart}>
                <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Add
              </Button>
            </div>
          ) : (
            <Button size="sm" className="bg-medical-600 hover:bg-medical-700 text-white h-9" onClick={handleAddToCart}>
              <ShoppingCart className="h-4 w-4 mr-1" /> Add
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Medicines = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [discountedOnly, setDiscountedOnly] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get('search');
    if (searchParam) setSearchQuery(searchParam);
  }, [location.search]);

  // Fetch true live categories
  const { data: categories = [] } = useCategories();
  
  // Build API params
  const params: Record<string, string> = {};
  if (searchQuery) params.search = searchQuery;
  if (activeCategory !== "All") params.category = activeCategory;
  if (sortBy === "price_low") params.ordering = "price"; // using standard price for simplicity, or discount_price
  if (sortBy === "price_high") params.ordering = "-price";
  if (sortBy === "rating") params.ordering = "-rating";
  if (sortBy === "newest") params.ordering = "-created_at";
  
  const { data: medicinesData, isLoading } = useMedicines(params);
  
  let medicines = medicinesData?.results || [];
  if (discountedOnly) {
     medicines = medicines.filter(m => m.discount_percentage > 0);
  }

  const resetFilters = () => {
    setActiveCategory("All");
    setSearchQuery("");
    setDiscountedOnly(false);
  };

  return (
    <Layout>
      <div className="bg-gradient-to-b from-medical-50 to-white pb-6 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Online Medicines</h1>
                <p className="text-gray-600 max-w-2xl">Browse our live inventory of medicines directly from our Django backend API.</p>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search API inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                <Button
                  variant={activeCategory === "All" ? "default" : "outline"}
                  onClick={() => setActiveCategory("All")}
                  className={`rounded-full px-4 ${activeCategory === "All" ? 'bg-medical-600 text-white hover:bg-medical-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  All
                </Button>
                {categories.map((c) => (
                  <Button
                    key={c.slug}
                    variant={activeCategory === c.slug ? "default" : "outline"}
                    onClick={() => setActiveCategory(c.slug)}
                    className={`whitespace-nowrap rounded-full px-4 ${activeCategory === c.slug ? 'bg-medical-600 text-white hover:bg-medical-700' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    {c.name}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5"><Filter className="h-4 w-4" /><span className="hidden sm:inline">Filters</span></Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                    <div className="py-6 space-y-6">
                      <div className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center ${discountedOnly ? 'bg-medical-50 border-medical-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`} onClick={() => setDiscountedOnly(!discountedOnly)}>
                        <span className="font-medium text-sm text-gray-800">Discounted Items Only</span>
                        {discountedOnly && <Check className="h-4 w-4 text-medical-600" />}
                      </div>
                    </div>
                    <SheetFooter>
                      <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5"><ArrowUpDown className="h-4 w-4" /><span className="hidden sm:inline">Sort By</span></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setSortBy("newest")} className="justify-between">Newest {sortBy ==="newest" && <Check className="h-4 w-4 text-medical-600" />}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("price_low")} className="justify-between">Price: Low to High {sortBy ==="price_low" && <Check className="h-4 w-4 text-medical-600" />}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("price_high")} className="justify-between">Price: High to Low {sortBy ==="price_high" && <Check className="h-4 w-4 text-medical-600" />}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("rating")} className="justify-between">Highest Rated {sortBy ==="rating" && <Check className="h-4 w-4 text-medical-600" />}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-72 w-full rounded-2xl" />
                ))}
              </div>
            ) : medicines.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No medicines found</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                  We couldn't find any medicines matching your search criteria in the API database.
                </p>
                <Button variant="outline" onClick={resetFilters} className="border-medical-500 text-medical-600 hover:bg-medical-50">Clear Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {medicines.map((medicine) => (
                  <MedicineCard key={medicine.id} medicine={medicine} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Medicines;
