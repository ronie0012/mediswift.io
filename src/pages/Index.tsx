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

// Lazy load the 3D animation component to improve initial page load
const MedicalAnimation = lazy(() => import("@/components/home/MedicalAnimation"));

// Fallback component if 3D animation fails
// ... existing code ...

// Fallback component if 3D animation fails
const FallbackComponent = () => (
  <div className="h-[400px] w-full bg-gradient-to-br from-medical-50 via-blue-50 to-indigo-50 flex items-center justify-center rounded-2xl relative overflow-hidden">
    <div className="absolute inset-0">
      <div className="absolute top-10 right-10 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-32 h-32 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-1000"></div>
    </div>
    <div className="relative z-10 text-center space-y-4 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/90 shadow-lg mb-4">
        <svg className="w-8 h-8 text-medical-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      <div className="text-2xl font-bold text-gray-900">MediSwift Healthcare</div>
      <p className="text-gray-600 max-w-md">
        We're preparing something special for you. Our innovative medical solutions will be ready in a moment.
      </p>
      <div className="flex justify-center space-x-2 mt-4">
        <div className="w-2 h-2 bg-medical-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-medical-500 rounded-full animate-bounce animation-delay-200"></div>
        <div className="w-2 h-2 bg-medical-500 rounded-full animate-bounce animation-delay-400"></div>
      </div>
    </div>
  </div>
);

// ... rest of the existing code ...

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
        <ErrorBoundary FallbackComponent={FallbackComponent}>
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
