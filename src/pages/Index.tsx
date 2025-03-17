
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import ServiceFeatures from "@/components/home/ServiceFeatures";
import EmergencyCall from "@/components/home/EmergencyCall";
import FeaturedMedicines from "@/components/home/FeaturedMedicines";
import DoctorsSection from "@/components/home/DoctorsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import DownloadApp from "@/components/home/DownloadApp";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
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
