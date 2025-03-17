
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, X, User, ShoppingCart, Bell, Search, 
  ChevronDown, Phone, Pill, Stethoscope, Ambulance,
  LogIn
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  
  return (
    <header className="w-full shadow-sm sticky top-0 z-50 bg-white">
      {/* Top bar with contact and account info */}
      <div className="header-gradient text-white px-4 py-1.5">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <a href="tel:+1800123456" className="flex items-center text-xs md:text-sm">
              <Phone className="h-3 w-3 mr-1" /> 1-800-123-456
            </a>
            <span className="hidden md:inline text-xs md:text-sm">Emergency support 24/7</span>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/login" className="text-xs md:text-sm flex items-center">
              <LogIn className="h-3 w-3 mr-1" /> Login
            </Link>
            <Link to="/signup" className="text-xs md:text-sm">Signup</Link>
          </div>
        </div>
      </div>
      
      {/* Main navigation */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-medical-600 font-display font-bold text-2xl">Medi<span className="text-medical-500">Swift</span></span>
          </Link>
          
          {/* Search bar - hidden on mobile */}
          <div className="hidden md:flex relative flex-grow mx-10 max-w-xl">
            <input 
              type="text" 
              placeholder="Search medicines, doctors, services..." 
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/cart" className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-1 text-gray-600" />
              <span className="text-sm">Cart</span>
            </Link>
            <Link to="/profile" className="flex items-center">
              <User className="h-5 w-5 mr-1 text-gray-600" />
              <span className="text-sm">Account</span>
            </Link>
            <Link to="/notifications" className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emergency-500 text-white text-xs flex items-center justify-center">3</span>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-500"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Category navigation */}
        <nav className="hidden md:flex mt-3 pb-1">
          <ul className="flex space-x-8">
            <li>
              <Link to="/medicines" className="flex items-center text-gray-600 hover:text-medical-600 transition-colors">
                <Pill className="h-4 w-4 mr-1" />
                <span>Medicines</span>
              </Link>
            </li>
            <li>
              <Link to="/doctors" className="flex items-center text-gray-600 hover:text-medical-600 transition-colors">
                <Stethoscope className="h-4 w-4 mr-1" />
                <span>Doctors</span>
              </Link>
            </li>
            <li>
              <Link to="/ambulance" className="flex items-center text-gray-600 hover:text-medical-600 transition-colors">
                <Ambulance className="h-4 w-4 mr-1" />
                <span>Ambulance</span>
              </Link>
            </li>
            <li className="flex items-center text-gray-600 hover:text-medical-600 transition-colors cursor-pointer">
              <span>Health Packages</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </li>
            <li className="flex items-center text-gray-600 hover:text-medical-600 transition-colors cursor-pointer">
              <span>More</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Mobile menu */}
      {isMobile && isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg border-t animate-fade-in">
          <div className="container mx-auto py-3 px-4">
            {/* Mobile search */}
            <div className="relative mb-4">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <ul className="space-y-4 pb-4">
              <li>
                <Link to="/medicines" className="flex items-center text-gray-600 py-2 hover:text-medical-600">
                  <Pill className="h-5 w-5 mr-3" />
                  <span className="text-lg">Medicines</span>
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="flex items-center text-gray-600 py-2 hover:text-medical-600">
                  <Stethoscope className="h-5 w-5 mr-3" />
                  <span className="text-lg">Doctors</span>
                </Link>
              </li>
              <li>
                <Link to="/ambulance" className="flex items-center text-gray-600 py-2 hover:text-medical-600">
                  <Ambulance className="h-5 w-5 mr-3" />
                  <span className="text-lg">Ambulance</span>
                </Link>
              </li>
              <li>
                <Link to="/cart" className="flex items-center text-gray-600 py-2 hover:text-medical-600">
                  <ShoppingCart className="h-5 w-5 mr-3" />
                  <span className="text-lg">Cart</span>
                </Link>
              </li>
              <li>
                <Link to="/profile" className="flex items-center text-gray-600 py-2 hover:text-medical-600">
                  <User className="h-5 w-5 mr-3" />
                  <span className="text-lg">My Account</span>
                </Link>
              </li>
              <li>
                <Link to="/notifications" className="flex items-center text-gray-600 py-2 hover:text-medical-600">
                  <Bell className="h-5 w-5 mr-3" />
                  <span className="text-lg">Notifications</span>
                </Link>
              </li>
              <li className="pt-2">
                <Button asChild className="w-full bg-medical-500 hover:bg-medical-600">
                  <Link to="/login">Login / Sign Up</Link>
                </Button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
