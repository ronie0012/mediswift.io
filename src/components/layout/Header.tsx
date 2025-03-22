
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Menu, X, ShoppingCart, User, Search, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { getItemsCount } = useCart();

  const isActive = (path: string) => pathname === path;

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-primary">MediSwift</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-medium ${isActive('/') ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}
            >
              Home
            </Link>
            <Link 
              to="/medicines" 
              className={`text-sm font-medium ${isActive('/medicines') ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}
            >
              Medicines
            </Link>
            <Link 
              to="/doctors" 
              className={`text-sm font-medium ${isActive('/doctors') ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}
            >
              Doctors
            </Link>
            <Link 
              to="/lab-tests" 
              className={`text-sm font-medium ${isActive('/lab-tests') ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}
            >
              Lab Tests
            </Link>
            <Link 
              to="/health-plans" 
              className={`text-sm font-medium ${isActive('/health-plans') ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}
            >
              Health Plans
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Link to="/search" className="text-gray-600 hover:text-primary p-1">
              <Search className="h-5 w-5" />
            </Link>
            
            <Link to="/cart" className="text-gray-600 hover:text-primary p-1 relative">
              <ShoppingCart className="h-5 w-5" />
              {getItemsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {getItemsCount() > 9 ? '9+' : getItemsCount()}
                </span>
              )}
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/notifications" className="text-gray-600 hover:text-primary p-1 relative hidden md:block">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    2
                  </span>
                </Link>
                
                <div className="relative group hidden md:block">
                  <Link to="/profile" className="flex items-center text-gray-600 hover:text-primary">
                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{user?.name || user?.email?.split('@')[0]}</span>
                  </Link>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                    <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Dashboard
                    </Link>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      My Profile
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      My Orders
                    </Link>
                    <Link to="/appointments" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      My Appointments
                    </Link>
                    <button 
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden md:block">
                <Link 
                  to="/login" 
                  className="text-primary font-medium text-sm mr-4"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button 
              onClick={toggleMenu}
              className="md:hidden text-gray-600 hover:text-primary p-1"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="container mx-auto px-4 py-3">
              <nav className="flex flex-col space-y-3">
                <Link 
                  to="/" 
                  className={`text-sm font-medium py-2 ${isActive('/') ? 'text-primary' : 'text-gray-600'}`}
                  onClick={closeMenu}
                >
                  Home
                </Link>
                <Link 
                  to="/medicines" 
                  className={`text-sm font-medium py-2 ${isActive('/medicines') ? 'text-primary' : 'text-gray-600'}`}
                  onClick={closeMenu}
                >
                  Medicines
                </Link>
                <Link 
                  to="/doctors" 
                  className={`text-sm font-medium py-2 ${isActive('/doctors') ? 'text-primary' : 'text-gray-600'}`}
                  onClick={closeMenu}
                >
                  Doctors
                </Link>
                <Link 
                  to="/lab-tests" 
                  className={`text-sm font-medium py-2 ${isActive('/lab-tests') ? 'text-primary' : 'text-gray-600'}`}
                  onClick={closeMenu}
                >
                  Lab Tests
                </Link>
                <Link 
                  to="/health-plans" 
                  className={`text-sm font-medium py-2 ${isActive('/health-plans') ? 'text-primary' : 'text-gray-600'}`}
                  onClick={closeMenu}
                >
                  Health Plans
                </Link>
                
                {isAuthenticated ? (
                  <>
                    <hr className="border-gray-200" />
                    <Link 
                      to="/dashboard" 
                      className="text-sm font-medium py-2 text-gray-600"
                      onClick={closeMenu}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/profile" 
                      className="text-sm font-medium py-2 text-gray-600"
                      onClick={closeMenu}
                    >
                      My Profile
                    </Link>
                    <Link 
                      to="/orders" 
                      className="text-sm font-medium py-2 text-gray-600"
                      onClick={closeMenu}
                    >
                      My Orders
                    </Link>
                    <Link 
                      to="/appointments" 
                      className="text-sm font-medium py-2 text-gray-600"
                      onClick={closeMenu}
                    >
                      My Appointments
                    </Link>
                    <button 
                      onClick={() => {
                        logout();
                        closeMenu();
                      }}
                      className="text-sm font-medium py-2 text-red-600 text-left"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <hr className="border-gray-200" />
                    <div className="flex space-x-4 pt-2">
                      <Link 
                        to="/login" 
                        className="bg-white border border-primary text-primary px-4 py-2 rounded-md text-sm font-medium flex-1 text-center"
                        onClick={closeMenu}
                      >
                        Sign In
                      </Link>
                      <Link 
                        to="/signup" 
                        className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium flex-1 text-center"
                        onClick={closeMenu}
                      >
                        Sign Up
                      </Link>
                    </div>
                  </>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
