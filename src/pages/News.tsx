import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Search, Filter, X } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Import the news data (same as in NewsDetail)
const newsData = [
  {
    date: "March 15, 2024",
    title: "New Telemedicine Features",
    description: "We've launched advanced video consultation features with HD quality and real-time chat support.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    slug: "new-telemedicine-features",
    category: "Technology"
  },
  {
    date: "March 10, 2024",
    title: "24/7 Emergency Support",
    description: "Our emergency support team is now available round the clock to assist you with any medical emergencies.",
    image: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
    slug: "24-7-emergency-support",
    category: "Services"
  },
  {
    date: "March 5, 2024",
    title: "New Medicine Categories",
    description: "We've expanded our medicine inventory with new categories including Ayurvedic and Homeopathic medicines.",
    image: "/OIG3.jpeg",
    slug: "new-medicine-categories",
    category: "Products"
  },
  {
    date: "March 1, 2024",
    title: "Healthcare Tips for Summer",
    description: "Stay healthy during summer with these essential healthcare tips from our medical experts.",
    image: "https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    slug: "healthcare-tips-for-summer",
    category: "Health Tips"
  },
  {
    date: "February 25, 2024",
    title: "Introducing Health Packages",
    description: "Explore our new comprehensive health packages designed for individuals, families, and seniors.",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    slug: "introducing-health-packages",
    category: "Services"
  },
  {
    date: "February 20, 2024",
    title: "Updated Mobile App Features",
    description: "Our mobile app now includes dark mode, improved navigation, and personalized health recommendations.",
    image: "https://images.unsplash.com/photo-1616587226157-48e49175ee20?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    slug: "updated-mobile-app-features",
    category: "Technology"
  }
];

const News = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const urlSearchQuery = searchParams.get('search') || '';
  
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [filteredNews, setFilteredNews] = useState(newsData);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // Get unique categories
  const categories = ["All", ...Array.from(new Set(newsData.map(item => item.category)))];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);
  
  // Update search query when URL parameter changes
  useEffect(() => {
    setSearchQuery(urlSearchQuery);
  }, [urlSearchQuery]);

  useEffect(() => {
    // Filter news based on search query and active category
    const filtered = newsData.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
    
    setFilteredNews(filtered);
  }, [searchQuery, activeCategory]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                MediSwift News & Updates
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Stay informed about healthcare innovations, new features, and important updates from MediSwift.
              </p>
            </div>

            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-6 rounded-full border-gray-200 focus:border-medical-500 focus:ring-medical-500"
                />
                {searchQuery && (
                  <button 
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="mb-10 flex items-center justify-center space-x-2 overflow-x-auto py-2">
              <Filter className="h-4 w-4 text-gray-500 mr-1" />
              {categories.map(category => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(category)}
                  className={`rounded-full ${
                    activeCategory === category 
                      ? "bg-medical-500 hover:bg-medical-600 text-white" 
                      : "text-gray-600 hover:text-medical-600"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden shadow animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {filteredNews.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-600 mb-4">
                      We couldn't find any articles matching your search criteria.
                    </p>
                    <Button onClick={() => {setSearchQuery(""); setActiveCategory("All");}}>
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredNews.map((item, index) => (
                      <motion.article
                        key={item.slug}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                      >
                        <Link to={`/news/${item.slug}`} className="block relative h-48">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-1" />
                            {item.date}
                          </div>
                          <div className="absolute top-4 right-4 bg-medical-500 px-3 py-1 rounded-full text-sm text-white">
                            {item.category}
                          </div>
                        </Link>
                        <div className="p-6">
                          <Link to={`/news/${item.slug}`}>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-medical-600 transition-colors">
                              {item.title}
                            </h3>
                          </Link>
                          <p className="text-gray-600 mb-4">
                            {item.description}
                          </p>
                          <Link 
                            to={`/news/${item.slug}`} 
                            className="inline-flex items-center text-medical-500 hover:text-medical-600 font-medium"
                          >
                            Read article
                            <svg 
                              className="ml-1 w-4 h-4" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M9 5l7 7-7 7" 
                              />
                            </svg>
                          </Link>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default News; 