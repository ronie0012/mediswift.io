import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Star, ChevronRight, ChevronLeft, Minus, Plus, AlertCircle, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useFeaturedMedicines, type Medicine } from "@/lib/api.hooks";
import { Skeleton } from "@/components/ui/skeleton";

const MedicineCard = ({ medicine }: { medicine: Medicine }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);

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

  return (
    <div
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-medical-500/10 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(`/medicines/${medicine.id}`)}
    >
      <div className="relative h-44 bg-gray-50 overflow-hidden">
        {medicine.discount_percentage > 0 && (
          <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            {medicine.discount_percentage}% OFF
          </span>
        )}
        {medicine.requires_prescription && (
          <span className="absolute top-2 right-2 z-10 bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            Rx
          </span>
        )}
        <img
          src={medicine.image}
          alt={medicine.name}
          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = '/Paracetamol.webp'; }}
        />
        <button
          className="absolute bottom-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          onClick={(e) => { e.stopPropagation(); setIsWishlisted(!isWishlisted); }}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'} transition-colors`} />
        </button>
      </div>
      <div className="p-4 space-y-2">
        <div className="text-xs text-gray-500 font-medium">{medicine.brand || 'Generic'}</div>
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{medicine.name}</h3>
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium">{medicine.rating}</span>
          <span className="text-xs text-gray-400">({medicine.review_count})</span>
        </div>
        <div className="flex justify-between items-center pt-1">
          <div>
            <span className="text-base font-bold text-gray-900">
              ₹{medicine.discount_price ?? medicine.price}
            </span>
            {medicine.discount_price && Number(medicine.discount_price) < Number(medicine.price) && (
              <span className="text-xs text-gray-400 line-through ml-1.5">₹{medicine.price}</span>
            )}
          </div>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button className="p-1 hover:bg-gray-50 rounded-l-lg" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-7 text-center text-xs font-medium">{quantity}</span>
              <button className="p-1 hover:bg-gray-50 rounded-r-lg" onClick={() => setQuantity(q => q + 1)}>
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <Button
              size="sm"
              className="bg-medical-600 hover:bg-medical-700 h-8 w-8 p-0"
              onClick={() => addToCart(cartItem, quantity)}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeaturedMedicinesSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
        <Skeleton className="h-44 w-full" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/4" />
          <div className="flex justify-between pt-1">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-8 w-1/3" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const FeaturedMedicines = () => {
  const { data: medicines, isLoading, isError } = useFeaturedMedicines();

  return (
    <section className="py-4 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">Featured Medicines</h2>
            <p className="text-gray-500">Top-rated medicines with the fastest delivery</p>
          </div>
          <Button asChild variant="outline" className="mt-4 md:mt-0 border-medical-500 text-medical-600 hover:bg-medical-50">
            <Link to="/medicines" className="flex items-center">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading && <FeaturedMedicinesSkeleton />}

        {isError && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <p className="font-semibold text-gray-700">Could not load medicines</p>
            <p className="text-sm text-gray-500 mt-1">Ensure the Django backend is running at <code className="bg-gray-100 px-1 rounded">http://localhost:8000</code></p>
          </div>
        )}

        {!isLoading && !isError && medicines?.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No featured medicines available.</p>
            <p className="text-sm text-gray-400 mt-1">Add medicines via the Django Admin panel at <code className="bg-gray-100 px-1 rounded">/admin</code></p>
          </div>
        )}

        {!isLoading && !isError && medicines && medicines.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {medicines.map((medicine) => (
              <MedicineCard key={medicine.id} medicine={medicine} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedMedicines;