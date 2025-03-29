import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Clock, MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/medicines?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="bg-gradient-to-br from-medical-50 via-blue-50 to-indigo-50 py-16 md:py-28 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-medical-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center max-w-7xl mx-auto">
          {/* Left content */}
          <motion.div 
            className="space-y-6 md:space-y-8 py-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-medical-100 rounded-full text-medical-600 text-sm font-medium">
              Your Trusted Healthcare Partner
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
              <span className="block">Your Health, Our</span>
              <span className="text-medical-600">Priority</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 max-w-lg leading-relaxed">
              Experience healthcare reimagined with MediSwift. Get medicines delivered in 10 minutes, consult top doctors online, and book ambulances instantly.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 pt-2">
              <Button asChild size="lg" className="bg-medical-500 hover:bg-medical-600 group w-full sm:w-auto">
                <Link to="/medicines" className="flex items-center justify-center">
                  Order Medicines
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-medical-500 text-medical-600 hover:bg-medical-50 w-full sm:w-auto">
                <Link to="/doctors" className="flex items-center justify-center">Consult Doctor</Link>
              </Button>
            </div>
            
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <motion.div 
                className="flex items-center bg-white/50 backdrop-blur-sm p-3 rounded-lg shadow-sm"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Clock className="h-6 w-6 text-medical-500 mr-2 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">10-min Delivery</span>
              </motion.div>
              <motion.div 
                className="flex items-center bg-white/50 backdrop-blur-sm p-3 rounded-lg shadow-sm"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <MapPin className="h-6 w-6 text-medical-500 mr-2 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">Live Tracking</span>
              </motion.div>
              <motion.div 
                className="flex items-center bg-white/50 backdrop-blur-sm p-3 rounded-lg shadow-sm"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ShieldCheck className="h-6 w-6 text-medical-500 mr-2 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">Verified Doctors</span>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Right content - video */}
          <motion.div 
            className="hidden md:block h-full flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative w-full max-w-xl mx-auto">
              <div className="absolute -inset-4 bg-medical-500 rounded-2xl opacity-20 blur-xl"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl w-full aspect-[4/3]">
                <video
                  src="/Online Pharmacy.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Search bar */}
        <motion.div 
          className="mt-12 md:mt-16 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search for medicines, doctors, or services..." 
                  className="w-full h-12 sm:h-14 pl-12 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent text-base sm:text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" className="bg-medical-500 hover:bg-medical-600 h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg">
                Search
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
