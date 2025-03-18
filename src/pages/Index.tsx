
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import ServiceFeatures from "@/components/home/ServiceFeatures";
import EmergencyCall from "@/components/home/EmergencyCall";
import FeaturedMedicines from "@/components/home/FeaturedMedicines";
import DoctorsSection from "@/components/home/DoctorsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import DownloadApp from "@/components/home/DownloadApp";
import { lazy, Suspense, useState, useEffect } from "react";
import { ErrorBoundary } from 'react-error-boundary';

// Lazy load the 3D animation component to improve initial page load
const MedicalAnimation = lazy(() => import("@/components/home/MedicalAnimation"));

// Fallback component if 3D animation fails
const FallbackComponent = () => (
  <div className="h-[400px] w-full bg-gradient-to-b from-blue-50 to-indigo-50 flex items-center justify-center rounded-2xl">
    <div className="text-center">
      <div className="text-blue-500 text-xl mb-2">MediSwift Healthcare</div>
      <p className="text-gray-600">Innovative medical solutions at your fingertips</p>
    </div>
  </div>
);

const Index = () => {
  const [isClient, setIsClient] = useState(false);

  // Ensure we only try to render the 3D component on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Layout>
      <HeroSection />
      <div className="container mx-auto px-4 py-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">MediSwift Technology</h2>
        <p className="text-gray-600 text-center max-w-3xl mx-auto mb-10">
          Our state-of-the-art healthcare platform leverages the latest technology to provide you with seamless medical services.
        </p>
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
      <TestimonialsSection />
      <DownloadApp />
    </Layout>
  );
};

export default Index;
