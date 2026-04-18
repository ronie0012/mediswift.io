import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TestLogin from "./pages/TestLogin";
import Medicines from "./pages/Medicines";
import Doctors from "./pages/Doctors";
import DoctorAppointment from "./pages/DoctorAppointment";
import AmbulanceBooking from "./pages/AmbulanceBooking";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { AppointmentProvider } from "./context/AppointmentContext";
import MyAppointments from "./pages/MyAppointments";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";
import RescheduleAppointment from "./pages/RescheduleAppointment";
import MedicineDetails from "./pages/MedicineDetails";
import AppointmentSuccess from "./pages/AppointmentSuccess";
import { Suspense, lazy } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";
import { AddressProvider } from "@/context/AddressContext";
import { OrderProvider } from "@/context/OrderContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Lazy load the new pages
const About = lazy(() => import("./pages/About"));
const HealthPackages = lazy(() => import("./pages/HealthPackages"));
const Careers = lazy(() => import("./pages/Careers"));
const MedicineDelivery = lazy(() => import("./pages/MedicineDelivery"));
const OnlineConsultation = lazy(() => import("./pages/OnlineConsultation"));
const EmergencyServices = lazy(() => import("./pages/EmergencyServices"));
const HealthRecords = lazy(() => import("./pages/HealthRecords"));
const LabTests = lazy(() => import("./pages/LabTests"));
const HealthBlogs = lazy(() => import("./pages/HealthBlogs"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Support = lazy(() => import("./pages/Support"));
const Refund = lazy(() => import("./pages/Refund"));
// Admin pages
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const MarketingDashboard = lazy(() => import("./pages/admin/MarketingDashboard"));
const RevenueDashboard = lazy(() => import("./pages/admin/RevenueDashboard"));
const CRMDashboard = lazy(() => import("./pages/admin/CRMDashboard"));
const InventoryDashboard = lazy(() => import("./pages/admin/InventoryDashboard"));
const OrdersDashboard = lazy(() => import("./pages/admin/OrdersDashboard"));
const Security = lazy(() => import("./pages/Security"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <AddressProvider>
              <OrderProvider>
                <AppointmentProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Suspense fallback={<LoadingSpinner size={32} />}>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/test-login" element={<TestLogin />} />
                        <Route path="/medicines" element={<Medicines />} />
                        <Route path="/medicines/:id" element={<MedicineDetails />} />
                        <Route path="/doctors" element={<Doctors />} />
                        <Route path="/doctors/:id" element={<DoctorAppointment />} />
                        <Route path="/appointment-success" element={<AppointmentSuccess />} />
                        <Route path="/ambulance" element={<AmbulanceBooking />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/my-appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
                        <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/reschedule-appointment/:id" element={<ProtectedRoute><RescheduleAppointment /></ProtectedRoute>} />
                        
                        {/* New routes for footer links */}
                        <Route path="/about" element={<About />} />
                        <Route path="/health-packages" element={<HealthPackages />} />
                        <Route path="/careers" element={<Careers />} />
                        <Route path="/medicine-delivery" element={<MedicineDelivery />} />
                        <Route path="/online-consultation" element={<OnlineConsultation />} />
                        <Route path="/emergency-services" element={<EmergencyServices />} />
                        <Route path="/health-records" element={<HealthRecords />} />
                        <Route path="/lab-tests" element={<LabTests />} />
                        <Route path="/health-blogs" element={<HealthBlogs />} />
                        <Route path="/faq" element={<FAQ />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/refund" element={<Refund />} />
                        {/* Security page */}
                        <Route path="/security" element={<Security />} />
                        {/* Admin pages */}
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin/marketing" element={<MarketingDashboard />} />
                        <Route path="/admin/revenue" element={<RevenueDashboard />} />
                        <Route path="/admin/crm" element={<CRMDashboard />} />
                        <Route path="/admin/inventory" element={<InventoryDashboard />} />
                        <Route path="/admin/orders" element={<OrdersDashboard />} />
                        
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </BrowserRouter>
                </AppointmentProvider>
              </OrderProvider>
            </AddressProvider>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
