
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
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
import { Suspense, lazy } from "react";

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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <AppointmentProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading MediSwift...</div>}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/medicines" element={<Medicines />} />
                  <Route path="/medicines/:id" element={<MedicineDetails />} />
                  <Route path="/doctors" element={<Doctors />} />
                  <Route path="/doctors/:id" element={<DoctorAppointment />} />
                  <Route path="/ambulance" element={<AmbulanceBooking />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/my-appointments" element={<MyAppointments />} />
                  <Route path="/my-orders" element={<MyOrders />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/reschedule-appointment/:id" element={<RescheduleAppointment />} />
                  
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
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AppointmentProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
