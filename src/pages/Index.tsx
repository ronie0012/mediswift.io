import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import ServiceFeatures from "@/components/home/ServiceFeatures";
import EmergencyCall from "@/components/home/EmergencyCall";
import FeaturedMedicines from "@/components/home/FeaturedMedicines";
import DoctorsSection from "@/components/home/DoctorsSection";
import StatisticsSection from "@/components/home/StatisticsSection";
import NewsSection from "@/components/home/NewsSection";
import PrescriptionBanner from "@/components/home/PrescriptionBanner";
import ApiTest from '@/components/ApiTest';
import { lazy, Suspense, useState, useEffect } from "react";
import { ErrorBoundary } from 'react-error-boundary';
import { HeartPulse, Sparkles, Stethoscope, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

// Lazy load the 3D animation component to improve initial page load
const MedicalAnimation = lazy(() => import("@/components/home/MedicalAnimation"));

// Fallback component if 3D animation fails
const FallbackComponent = () => (
  <div className="h-[400px] w-full bg-gradient-to-br from-medical-50 via-blue-50 to-indigo-50 flex items-center justify-center rounded-2xl relative overflow-hidden">
    <div className="absolute inset-0">
      <div className="absolute top-10 right-10 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-32 h-32 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-1000"></div>
    </div>
    
    <div className="relative z-10 text-center space-y-6 px-6 max-w-lg">
      <div className="flex items-center justify-center">
        <span className="relative inline-flex">
          <HeartPulse className="h-16 w-16 text-medical-600" />
          <span className="absolute top-0 right-0">
            <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
          </span>
        </span>
      </div>
      
      <h3 className="text-3xl font-bold text-gray-900 font-display">
        Revolutionizing Healthcare Delivery
      </h3>
      
      <p className="text-gray-700 leading-relaxed">
        Experience the future of healthcare with MediSwift. Our cutting-edge platform combines technology and compassion to deliver exceptional medical services right when you need them.
      </p>
      
      <div className="flex flex-wrap justify-center gap-4 pt-2">
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full flex items-center shadow-sm">
          <Stethoscope className="h-4 w-4 text-medical-500 mr-2" />
          <span className="text-sm font-medium text-gray-800">Expert Care</span>
        </div>
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full flex items-center shadow-sm">
          <span className="h-4 w-4 text-medical-500 mr-2 flex items-center justify-center">
            <span className="block h-2 w-2 bg-medical-500 rounded-full animate-pulse"></span>
          </span>
          <span className="text-sm font-medium text-gray-800">Live Assistance</span>
        </div>
      </div>
      
      <div className="flex justify-center items-center space-x-2 pt-2">
        <div className="h-2 w-2 bg-medical-500 rounded-full animate-bounce"></div>
        <div className="h-2 w-2 bg-medical-500 rounded-full animate-bounce delay-150"></div>
        <div className="h-2 w-2 bg-medical-500 rounded-full animate-bounce delay-300"></div>
      </div>
    </div>
  </div>
);

// Use the ErrorBoundary correctly with FallbackComponent prop
const Index = () => {
  const [isClient, setIsClient] = useState(false);

  // Ensure we only try to render the 3D component on the client side
  useEffect(() => {
    setIsClient(true);
    console.log("Index page rendered");
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <HeroSection />

      {/* Categories */}
      <CategorySection />

      {/* Statistics Section */}
      <StatisticsSection />

      {/* 3D Experience Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-medical-100 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-1 rounded-full bg-medical-100 text-medical-700 font-medium text-sm mb-4">
              Interactive Experience
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Experience the Future of <span className="text-medical-600">Healthcare</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our state-of-the-art healthcare platform leverages cutting-edge technology to provide you with seamless medical services.
            </p>

            <motion.div 
              className="mt-8 mb-1 flex justify-center"
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown className="h-6 w-6 text-medical-500" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl"
          >
            <ErrorBoundary FallbackComponent={FallbackComponent}>
              {isClient ? (
                <Suspense fallback={
                  <div className="h-[500px] w-full bg-gradient-to-b from-blue-50 to-indigo-50 flex items-center justify-center rounded-2xl">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="w-16 h-16 border-4 border-medical-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-medical-600 text-lg font-medium">Loading 3D Experience...</p>
                    </div>
                  </div>
                }>
                  <MedicalAnimation />
                </Suspense>
              ) : (
                <div className="h-[500px] w-full bg-gradient-to-b from-blue-50 to-indigo-50 flex items-center justify-center rounded-2xl">
                  <div className="text-medical-600 text-xl font-medium">Preparing MediSwift Visualization...</div>
                </div>
              )}
            </ErrorBoundary>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <div className="py-12 lg:py-20">
        <ServiceFeatures />
      </div>

      {/* Emergency Call Section with enhanced shadow */}
      <div className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50/50 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]"></div>
        <motion.div 
          className="container mx-auto px-4 relative z-10"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="shadow-2xl shadow-medical-500/10 rounded-[2.5rem] overflow-hidden border border-gray-100">
            <EmergencyCall />
          </div>
        </motion.div>
      </div>

      {/* Featured Medicines Section */}
      <div className="py-4 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Prescription Upload Banner */}
          <PrescriptionBanner />
          <div id="medicines-section">
            <FeaturedMedicines />
          </div>
        </motion.div>
      </div>

      {/* Doctors Section with background gradient */}
      <div className="bg-gradient-to-b from-medical-50/30 to-white py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div id="doctors-section">
            <DoctorsSection />
          </div>
        </motion.div>
      </div>

      {/* News Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <NewsSection />
      </motion.div>
      
      {/* API Test (temporary for debugging) */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Backend Connection Test</h2>
            <p className="text-gray-600">Testing the connection to our backend API</p>
          </div>
          <ApiTest />
        </div>
      </section>
      
      {/* Back to top indicator */}
      <motion.div 
        className="fixed bottom-8 right-8 z-50 bg-medical-500 text-white rounded-full p-3 shadow-lg cursor-pointer"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ChevronDown className="h-6 w-6 transform rotate-180" />
      </motion.div>
    </Layout>
  );
};

export default Index;