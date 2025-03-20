
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import ServiceFeatures from "@/components/home/ServiceFeatures";
import EmergencyCall from "@/components/home/EmergencyCall";
import FeaturedMedicines from "@/components/home/FeaturedMedicines";
import DoctorsSection from "@/components/home/DoctorsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import DownloadApp from "@/components/home/DownloadApp";
import StatisticsSection from "@/components/home/StatisticsSection";
import NewsSection from "@/components/home/NewsSection";
import { lazy, Suspense, useState, useEffect } from "react";
import { ErrorBoundary } from 'react-error-boundary';
import { HeartPulse, Sparkles, Stethoscope } from "lucide-react";

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

// Fix the ErrorBoundary to use the correct prop (FallbackComponent instead of fallback)
const Index = () => {
  const [isClient, setIsClient] = useState(false);

  // Ensure we only try to render the 3D component on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Layout>
      <HeroSection />
      <StatisticsSection />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Experience the Future of Healthcare
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our state-of-the-art healthcare platform leverages cutting-edge technology to provide you with seamless medical services.
          </p>
        </div>
        <ErrorBoundary FallbackComponent={() => <FallbackComponent />}>
          {isClient ? (
            <Suspense fallback={
              <div className="h-[400px] w-full bg-gradient-to-b from-blue-50 to-indigo-50 flex items-center justify-center rounded-2xl">
                <div className="animate-pulse text-blue-500 text-xl">Loading 3D Experience...</div>
              </div>
            }>
              <MedicalAnimation />
            </Suspense>
          ) : (
            <div className="h-[400px] w-full bg-gradient-to-b from-blue-50 to-indigo-50 flex items-center justify-center rounded-2xl">
              <div className="text-blue-500 text-xl">Preparing MediSwift Visualization...</div>
            </div>
          )}
        </ErrorBoundary>
      </div>
      <ServiceFeatures />
      <EmergencyCall />
      <FeaturedMedicines />
      <DoctorsSection />
      <NewsSection />
      <TestimonialsSection />
      <DownloadApp />
    </Layout>
  );
};

export default Index;
