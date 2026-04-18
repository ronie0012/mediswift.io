import { useCategories } from "@/lib/api.hooks";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Baby, Heart, Accessibility, ShieldCheck, Beaker } from "lucide-react";

// Fallback icon mapping based on slug
const getCategoryIcon = (slug: string) => {
  switch (slug) {
    case "pain-relief": return <Activity className="w-8 h-8 text-medical-600 mb-4" />;
    case "baby-care": return <Baby className="w-8 h-8 text-medical-600 mb-4" />;
    case "heart-health": return <Heart className="w-8 h-8 text-medical-600 mb-4" />;
    case "diabetes-care": return <Accessibility className="w-8 h-8 text-medical-600 mb-4" />;
    case "supplements": return <ShieldCheck className="w-8 h-8 text-medical-600 mb-4" />;
    default: return <Beaker className="w-8 h-8 text-medical-600 mb-4" />;
  }
};

const CategorySection = () => {
  const { data: categories, isLoading, isError } = useCategories();

  if (isError) return null; // Fallback gracefully if API is down

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col mb-8 md:text-center md:items-center">
          <h2 className="text-3xl font-bold font-display text-gray-900 mb-2">Shop by Category</h2>
          <p className="text-gray-500">Find exactly what you need quickly from our curated collections</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories?.map((cat) => (
              <Link 
                key={cat.id} 
                to={`/medicines?category=${cat.slug}`}
                className="group relative flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-medical-200 transition-all duration-300"
              >
                <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-xs font-semibold text-medical-600 shadow-sm border border-medical-50">
                  {cat.medicine_count} items
                </div>
                {getCategoryIcon(cat.slug)}
                <h3 className="font-semibold text-gray-900 group-hover:text-medical-600 transition-colors text-center">{cat.name}</h3>
                <p className="text-xs text-gray-500 text-center mt-2 line-clamp-2">{cat.description}</p>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium text-medical-600 flex items-center gap-1">
                  Shop Now &rarr;
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySection;
