import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Clock, MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Check if search query contains medicine-related keywords
      if (searchQuery.toLowerCase().includes("medicine") || 
          searchQuery.toLowerCase().includes("drug") || 
          searchQuery.toLowerCase().includes("tablet") || 
          searchQuery.toLowerCase().includes("capsule")) {
        navigate(`/medicines?search=${encodeURIComponent(searchQuery)}`);
      } 
      // Check if search query contains doctor-related keywords
      else if (searchQuery.toLowerCase().includes("doctor") || 
               searchQuery.toLowerCase().includes("physician") || 
               searchQuery.toLowerCase().includes("specialist") || 
               searchQuery.toLowerCase().includes("consultation")) {
        navigate(`/doctors?search=${encodeURIComponent(searchQuery)}`);
      }
      // Check if search query contains news-related keywords
      else if (searchQuery.toLowerCase().includes("news") || 
               searchQuery.toLowerCase().includes("update") || 
               searchQuery.toLowerCase().includes("article")) {
        navigate(`/news?search=${encodeURIComponent(searchQuery)}`);
      }
      // Default to medicines page with search query
      else {
        navigate(`/medicines?search=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-medical-50 via-blue-50 to-indigo-50 py-16 md:py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-medical-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block px-4 py-2 bg-medical-100 rounded-full text-medical-600 text-sm font-medium mb-4">
              Your Trusted Healthcare Partner
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900">
              <span className="block">Your Health, Our</span>
              <span className="text-medical-600">Priority</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
              Experience healthcare reimagined with MediSwift. Get medicines delivered in 10 minutes, consult top doctors online, and book ambulances instantly.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button asChild size="lg" className="bg-medical-500 hover:bg-medical-600 group">
                <Link to="/medicines" className="flex items-center">
                  Order Medicines
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-medical-500 text-medical-600 hover:bg-medical-50">
                <Link to="/doctors">Consult Doctor</Link>
              </Button>
            </div>
            
            <div className="pt-6 grid grid-cols-2 md:grid-cols-3 gap-6">
              <motion.div 
                className="flex items-center bg-white/50 backdrop-blur-sm p-3 rounded-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Clock className="h-6 w-6 text-medical-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">10-min Delivery</span>
              </motion.div>
              <motion.div 
                className="flex items-center bg-white/50 backdrop-blur-sm p-3 rounded-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <MapPin className="h-6 w-6 text-medical-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Live Tracking</span>
              </motion.div>
              <motion.div 
                className="flex items-center bg-white/50 backdrop-blur-sm p-3 rounded-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ShieldCheck className="h-6 w-6 text-medical-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Verified Doctors</span>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div 
            className="hidden md:block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-medical-500 rounded-2xl opacity-20 blur-xl"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <video 
                  src="/Buying Medicine Online-vmake.mp4" 
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Enhanced Search bar */}
        <motion.div 
          className="mt-12 md:mt-20 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <form onSubmit={handleSearch} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search for medicines, doctors, or services..." 
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                type="submit"
                className="bg-medical-500 hover:bg-medical-600 py-4 px-8 text-lg"
              >
                Search
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
