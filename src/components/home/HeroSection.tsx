
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Clock, MapPin, ShieldCheck } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-medical-50 to-blue-50 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
              <span className="block">Your Health, Our</span>
              <span className="text-medical-600">Priority</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">
              Get medicines delivered in 10 minutes, consult top doctors online, and book ambulances instantly with MediSwift.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button asChild size="lg" className="bg-medical-500 hover:bg-medical-600">
                <Link to="/medicines">Order Medicines</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-medical-500 text-medical-600 hover:bg-medical-50">
                <Link to="/doctors">Consult Doctor</Link>
              </Button>
            </div>
            
            <div className="pt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-medical-500 mr-2" />
                <span className="text-sm text-gray-600">10-min Delivery</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-medical-500 mr-2" />
                <span className="text-sm text-gray-600">Live Tracking</span>
              </div>
              <div className="flex items-center">
                <ShieldCheck className="h-5 w-5 text-medical-500 mr-2" />
                <span className="text-sm text-gray-600">Verified Doctors</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:block rounded-xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80" 
              alt="Healthcare Professionals" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Search bar */}
        <div className="mt-10 md:mt-16 max-w-4xl mx-auto relative">
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg">
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search for medicines, doctors, or services..." 
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                />
              </div>
              <Button className="bg-medical-500 hover:bg-medical-600 py-3 px-6">
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
