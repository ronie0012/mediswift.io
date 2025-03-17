
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Menu, 
  X, 
  User, 
  ShoppingCart, 
  Phone, 
  ChevronDown 
} from "lucide-react";
import { useCart } from "@/context/CartContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getItemsCount } = useCart();
  const cartItemCount = getItemsCount();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-medical-600">MediSwift</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/" className="px-3 py-2 text-gray-700 hover:text-medical-600 rounded-md text-sm font-medium">Home</Link>
            <Link to="/medicines" className="px-3 py-2 text-gray-700 hover:text-medical-600 rounded-md text-sm font-medium">Medicines</Link>
            <Link to="/doctors" className="px-3 py-2 text-gray-700 hover:text-medical-600 rounded-md text-sm font-medium">Doctors</Link>
            <Link to="/ambulance" className="px-3 py-2 text-gray-700 hover:text-medical-600 rounded-md text-sm font-medium">Ambulance</Link>
            
            <div className="relative group px-3 py-2">
              <button className="flex items-center text-gray-700 hover:text-medical-600 text-sm font-medium">
                More <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                <Link to="/about" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">About Us</Link>
                <Link to="/contact" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Contact</Link>
                <Link to="/blog" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Health Blog</Link>
                <Link to="/faq" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">FAQs</Link>
              </div>
            </div>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <Link to="/search" className="text-gray-600 hover:text-medical-600">
              <Search className="h-5 w-5" />
            </Link>

            <Link to="/cart" className="text-gray-600 hover:text-medical-600 relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-emergency-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Link>

            <div className="hidden md:block">
              <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-medical-600">
                <Link to="/login">
                  <User className="h-5 w-5 mr-1" />
                  Login
                </Link>
              </Button>
            </div>

            <div className="hidden md:flex items-center">
              <Phone className="h-5 w-5 text-emergency-500 mr-2" />
              <span className="text-sm font-medium">Emergency: 1-800-MEDI</span>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-600 hover:text-gray-900"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/medicines"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Medicines
            </Link>
            <Link
              to="/doctors"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Doctors
            </Link>
            <Link
              to="/ambulance"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Ambulance
            </Link>
            <Link
              to="/login"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/cart"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Cart {cartItemCount > 0 && `(${cartItemCount})`}
            </Link>
            <div className="border-t mt-2 pt-2">
              <div className="flex items-center px-3 py-2">
                <Phone className="h-5 w-5 text-emergency-500 mr-2" />
                <span className="text-sm font-medium">Emergency: 1-800-MEDI</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
