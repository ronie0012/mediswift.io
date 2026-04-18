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
            
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <motion.div 
                className="flex items-center glass-panel p-4 hover:shadow-lg transition-all duration-300 group"
                whileHover={{ y: -5 }}
              >
                <div className="bg-medical-100 p-3 rounded-full mr-4 group-hover:bg-medical-500 transition-colors duration-300">
                  <Clock className="h-6 w-6 text-medical-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-sm font-semibold text-gray-800">30-Minute Delivery</span>
              </motion.div>
              <motion.div 
                className="flex items-center glass-panel p-4 hover:shadow-lg transition-all duration-300 group"
                whileHover={{ y: -5 }}
              >
                <div className="bg-medical-100 p-3 rounded-full mr-4 group-hover:bg-medical-500 transition-colors duration-300">
                  <MapPin className="h-6 w-6 text-medical-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-sm font-semibold text-gray-800">100% Authentic Medicines</span>
              </motion.div>
              <motion.div 
                className="flex items-center glass-panel p-4 hover:shadow-lg transition-all duration-300 group"
                whileHover={{ y: -5 }}
              >
                <div className="bg-medical-100 p-3 rounded-full mr-4 group-hover:bg-medical-500 transition-colors duration-300">
                  <ShieldCheck className="h-6 w-6 text-medical-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-sm font-semibold text-gray-800">Licensed Pharmacies</span>
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
          className="mt-16 md:mt-20 max-w-4xl mx-auto relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
        >
          <div className="glass-panel p-6 sm:p-8 rounded-3xl">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-medical-400" />
                <input 
                  type="text"
                  placeholder="Search for medicines, doctors, or services..." 
                  className="w-full h-14 sm:h-16 pl-16 pr-6 py-2 rounded-2xl bg-white/60 backdrop-blur-md border border-white/50 focus:outline-none focus:ring-4 focus:ring-medical-500/20 focus:border-medical-500 text-base sm:text-lg text-gray-800 placeholder-gray-400 shadow-inner transition-all duration-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" className="bg-medical-600 hover:bg-medical-700 h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg rounded-2xl shadow-lg shadow-medical-500/30 transition-all duration-300 hover:-translate-y-1">
                Search Now
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
