import { Link, useLocation } from "react-router-dom";
import { BarChart3, TrendingUp, Users, Shield, Home, ChevronRight, Package, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { label: "Inventory", href: "/admin/inventory", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Marketing", href: "/admin/marketing", icon: TrendingUp },
  { label: "Revenue", href: "/admin/revenue", icon: BarChart3 },
  { label: "CRM & Feedback", href: "/admin/crm", icon: Users },
];

const AdminLayout = ({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 shadow-sm flex-shrink-0 hidden lg:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-display font-bold text-medical-600">MediSwift</span>
          </Link>
          <span className="text-xs text-gray-400 font-medium mt-0.5 block">Admin Dashboard</span>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors text-sm font-medium"
          >
            <Home className="h-4 w-4" />
            Back to Website
          </Link>

          <div className="pt-4 pb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">Analytics</span>
          </div>

          {navItems.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-medical-50 text-medical-700 shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <item.icon className={`h-4 w-4 ${active ? "text-medical-600" : ""}`} />
                {item.label}
                {active && <ChevronRight className="h-3 w-3 ml-auto text-medical-400" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link
            to="/security"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-500 hover:bg-gray-50 text-sm font-medium"
          >
            <Shield className="h-4 w-4" />
            Security Policy
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-8 py-5 flex items-center gap-4">
          {/* Mobile nav pills */}
          <div className="flex gap-2 lg:hidden overflow-x-auto pb-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full ${
                  location.pathname === item.href
                    ? "bg-medical-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="ml-auto">
            <div>
              <h1 className="text-lg font-display font-bold text-gray-900 leading-tight">{title}</h1>
              {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
