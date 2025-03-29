import { Button } from "@/components/ui/button";
import { PhoneCall, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const EmergencyCall = () => {
  return (
    <section className="py-12 bg-emergency-50">
      <div className="container mx-auto px-4">
        <div className="bg-emergency-500 rounded-2xl p-8 md:p-12 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-20 -top-20 text-emergency-600 opacity-20">
            <Heart className="h-64 w-64" />
          </div>
          
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Need Emergency Assistance?</h2>
            <p className="text-white/85 text-lg mb-8">
              Our emergency response team is available 24/7. Get immediate medical assistance and ambulance service.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
              <Button asChild size="lg" className="bg-white text-emergency-500 hover:bg-gray-100 emergency-button">
                <Link to="/ambulance" className="flex items-center">
                  <PhoneCall className="h-5 w-5 mr-2" />
                  Book Ambulance Now
                </Link>
              </Button>
              <a href="tel:+911800123456" className="inline-flex items-center justify-center h-12 px-6 text-lg font-medium text-white border-2 border-white rounded-lg hover:bg-emergency-600 hover:border-white/90 transition-colors">
                <PhoneCall className="h-5 w-5 mr-2" />
                Call: +91 1800 123 456
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmergencyCall;
