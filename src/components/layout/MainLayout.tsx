'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  Search, 
  ShoppingCart, 
  User, 
  ChevronDown, 
  Bell, 
  LogOut,
  Home,
  PillIcon,
  Users,
  Calendar,
  Package,
  Heart,
  Settings
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, isAdmin, signOut } = useAuth();
  const { totalItems } = useCart();
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Medicines', href: '/medicines' },
    { name: 'Doctors', href: '/doctors' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];
  
  const userMenuLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: <Home className="mr-2 h-4 w-4" /> },
    { name: 'My Profile', href: '/profile', icon: <User className="mr-2 h-4 w-4" /> },
    { name: 'My Orders', href: '/orders', icon: <Package className="mr-2 h-4 w-4" /> },
    { name: 'My Appointments', href: '/appointments', icon: <Calendar className="mr-2 h-4 w-4" /> },
    { name: 'Saved Items', href: '/saved', icon: <Heart className="mr-2 h-4 w-4" /> },
    { name: 'Settings', href: '/settings', icon: <Settings className="mr-2 h-4 w-4" /> },
  ];
  
  const adminMenuLinks = [
    { name: 'Admin Dashboard', href: '/admin/dashboard', icon: <Home className="mr-2 h-4 w-4" /> },
    { name: 'Manage Users', href: '/admin/users', icon: <Users className="mr-2 h-4 w-4" /> },
    { name: 'Manage Doctors', href: '/admin/doctors', icon: <Users className="mr-2 h-4 w-4" /> },
    { name: 'Manage Medicines', href: '/admin/medicines', icon: <PillIcon className="mr-2 h-4 w-4" /> },
    { name: 'Manage Orders', href: '/admin/orders', icon: <Package className="mr-2 h-4 w-4" /> },
    { name: 'Manage Appointments', href: '/admin/appointments', icon: <Calendar className="mr-2 h-4 w-4" /> },
  ];
  
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 py-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        isActive(link.href) 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                  {user && (
                    <>
                      <div className="h-px bg-gray-200 my-2" />
                      {(isAdmin ? adminMenuLinks : userMenuLinks).map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                            isActive(link.href) 
                              ? 'bg-primary/10 text-primary' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {link.icon}
                          {link.name}
                        </Link>
                      ))}
                      <Button 
                        variant="ghost" 
                        className="flex items-center justify-start px-4 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => signOut()}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
            
            <Link href="/" className="text-xl font-bold text-primary ml-2 md:ml-0">
              MediSwift
            </Link>
            
            <nav className="hidden md:flex items-center ml-8 space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(link.href) 
                      ? 'text-primary' 
                      : 'text-gray-700 hover:text-primary'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link href="/search">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </Link>
            
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
            
            {user ? (
              <div className="flex items-center">
                <Button variant="ghost" size="icon" className="hidden md:flex relative">
                  <Bell className="h-5 w-5" />
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    3
                  </Badge>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="hidden md:inline-block text-sm font-medium">
                        {user.email?.split('@')[0]}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {(isAdmin ? adminMenuLinks : userMenuLinks).map((link) => (
                      <DropdownMenuItem key={link.href} asChild>
                        <Link href={link.href} className="flex items-center cursor-pointer">
                          {link.icon}
                          {link.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="flex items-center text-red-500 focus:text-red-500 cursor-pointer"
                      onClick={() => signOut()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="hidden md:inline-flex">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link href="/auth/register">
                    <span className="hidden md:inline-block">Sign Up</span>
                    <span className="md:hidden">Sign In</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">MediSwift</h3>
              <p className="mb-4">Your complete healthcare solution - from doctor consultations to medicine delivery.</p>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li><Link href="/medicines" className="hover:text-white">Medicines</Link></li>
                <li><Link href="/doctors" className="hover:text-white">Doctors</Link></li>
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">My Account</h3>
              <ul className="space-y-2">
                <li><Link href="/dashboard" className="hover:text-white">My Dashboard</Link></li>
                <li><Link href="/profile" className="hover:text-white">My Profile</Link></li>
                <li><Link href="/orders" className="hover:text-white">My Orders</Link></li>
                <li><Link href="/appointments" className="hover:text-white">My Appointments</Link></li>
                <li><Link href="/saved" className="hover:text-white">Saved Items</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
              <address className="not-italic">
                <p className="mb-2">123 Healthcare Ave</p>
                <p className="mb-2">Medical District, CA 90210</p>
                <p className="mb-2">Email: info@mediswift.com</p>
                <p className="mb-2">Phone: +1 (555) 123-4567</p>
              </address>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} MediSwift. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="/terms" className="hover:text-white">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link href="/refund" className="hover:text-white">Refund Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 