
import PageTemplate from "@/components/layout/PageTemplate";
import { Clock, MapPin, Truck, ShieldCheck, PiggyBank, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const MedicineDelivery = () => {
  const features = [
    {
      icon: <Clock className="h-8 w-8 text-medical-500" />,
      title: "24/7 Service",
      description: "Order medicines any time, day or night, with our round-the-clock delivery service."
    },
    {
      icon: <MapPin className="h-8 w-8 text-medical-500" />,
      title: "Wide Coverage",
      description: "We deliver to most locations within the city, including remote areas."
    },
    {
      icon: <Truck className="h-8 w-8 text-medical-500" />,
      title: "Fast Delivery",
      description: "Get your medicines delivered within 1-2 hours in emergency cases."
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-medical-500" />,
      title: "Genuine Medicines",
      description: "All our medicines are sourced directly from authorized manufacturers."
    },
    {
      icon: <PiggyBank className="h-8 w-8 text-medical-500" />,
      title: "Competitive Prices",
      description: "Enjoy special discounts and loyalty benefits on all orders."
    },
    {
      icon: <Headphones className="h-8 w-8 text-medical-500" />,
      title: "Customer Support",
      description: "Our customer support team is available 24/7 to assist you with your orders."
    }
  ];

  return (
    <PageTemplate title="Medicine Delivery" subtitle="Fast and reliable delivery of prescription and OTC medicines">
      <div className="space-y-8">
        <section>
          <p className="text-gray-600">
            MediSwift offers a convenient medicine delivery service that brings prescription and over-the-counter 
            medications right to your doorstep. Simply upload your prescription, place your order, and we'll handle 
            the rest. With our extensive network of pharmacy partners, we ensure timely delivery of genuine medicines.
          </p>
          
          <div className="mt-6 flex justify-center">
            <Link to="/medicines">
              <Button className="bg-medical-500 hover:bg-medical-600 text-white px-6 py-2">
                Browse Medicines
              </Button>
            </Link>
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Our Delivery Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="font-medium text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">How It Works</h2>
          <div className="space-y-4">
            <div className="flex">
              <div className="bg-medical-100 text-medical-600 rounded-full h-8 w-8 flex items-center justify-center font-bold mr-4 shrink-0">1</div>
              <div>
                <h3 className="font-medium text-gray-800">Upload Your Prescription</h3>
                <p className="text-sm text-gray-600">Take a clear photo of your prescription and upload it during checkout.</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="bg-medical-100 text-medical-600 rounded-full h-8 w-8 flex items-center justify-center font-bold mr-4 shrink-0">2</div>
              <div>
                <h3 className="font-medium text-gray-800">Pharmacist Verification</h3>
                <p className="text-sm text-gray-600">Our licensed pharmacists will verify your prescription and prepare your order.</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="bg-medical-100 text-medical-600 rounded-full h-8 w-8 flex items-center justify-center font-bold mr-4 shrink-0">3</div>
              <div>
                <h3 className="font-medium text-gray-800">Doorstep Delivery</h3>
                <p className="text-sm text-gray-600">Our delivery partners will deliver your medicines in sealed packages.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
};

export default MedicineDelivery;
