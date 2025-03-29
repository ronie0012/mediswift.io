import PageTemplate from "@/components/layout/PageTemplate";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PhoneCall, AlertCircle, FileText, MapPin, HelpCircle } from "lucide-react";

const EmergencyServices = () => {
  return (
    <PageTemplate title="Emergency Services" subtitle="24/7 emergency medical assistance">
      <div className="space-y-8">
        <section className="bg-emergency-50 p-6 rounded-lg border border-emergency-100">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
            <AlertCircle className="h-10 w-10 text-emergency-500" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Emergency Hotline</h2>
              <p className="text-gray-600">For immediate medical emergencies, please call:</p>
            </div>
          </div>
          
          <div className="flex justify-center mb-4">
            <a href="tel:+911800123456" className="bg-emergency-500 hover:bg-emergency-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 text-xl font-bold transition-colors duration-300">
              <PhoneCall className="h-6 w-6" />
              +91 1800 123 4567
            </a>
          </div>
          
          <p className="text-sm text-center text-gray-600">
            Our emergency line is staffed 24/7 by trained medical professionals
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Our Emergency Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
              <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                <PhoneCall className="h-5 w-5 text-medical-500" />
                Ambulance Booking
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Book an ambulance for emergency transportation to the nearest hospital. Our ambulances are equipped with advanced life support systems and staffed by trained paramedics.
              </p>
              <Link to="/ambulance">
                <Button className="w-full bg-medical-500 hover:bg-medical-600">
                  Book Ambulance
                </Button>
              </Link>
            </div>
            
            <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
              <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-medical-500" />
                Emergency Teleconsultation
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Get immediate medical advice from emergency physicians via video call. Useful for determining if symptoms require hospital visit or can be managed at home.
              </p>
              <Link to="/online-consultation">
                <Button className="w-full bg-medical-500 hover:bg-medical-600">
                  Start Teleconsultation
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">What to Do in an Emergency</h2>
          <div className="space-y-4">
            <div className="flex">
              <div className="bg-emergency-100 text-emergency-600 rounded-full h-8 w-8 flex items-center justify-center font-bold mr-4 shrink-0">1</div>
              <div>
                <h3 className="font-medium text-gray-800">Stay Calm</h3>
                <p className="text-sm text-gray-600">Take deep breaths and try to remain calm to make clear decisions.</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="bg-emergency-100 text-emergency-600 rounded-full h-8 w-8 flex items-center justify-center font-bold mr-4 shrink-0">2</div>
              <div>
                <h3 className="font-medium text-gray-800">Assess the Situation</h3>
                <p className="text-sm text-gray-600">Determine if it's a life-threatening emergency requiring immediate attention.</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="bg-emergency-100 text-emergency-600 rounded-full h-8 w-8 flex items-center justify-center font-bold mr-4 shrink-0">3</div>
              <div>
                <h3 className="font-medium text-gray-800">Call for Help</h3>
                <p className="text-sm text-gray-600">Call our emergency hotline or local emergency services immediately.</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="bg-emergency-100 text-emergency-600 rounded-full h-8 w-8 flex items-center justify-center font-bold mr-4 shrink-0">4</div>
              <div>
                <h3 className="font-medium text-gray-800">Provide First Aid</h3>
                <p className="text-sm text-gray-600">If trained, provide basic first aid while waiting for professional help.</p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-5 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-medical-500" />
              Nearest Emergency Centers
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Find emergency rooms and urgent care centers near your location. Our app can guide you to the closest facility with the shortest waiting time.
            </p>
            <Button className="w-full bg-medical-500 hover:bg-medical-600">
              Find Nearest Center
            </Button>
          </div>
          
          <div className="bg-blue-50 p-5 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-medical-500" />
              Emergency Care Guidelines
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Access our comprehensive guide on handling common emergency situations, including CPR instructions, choking management, and more.
            </p>
            <Button className="w-full bg-medical-500 hover:bg-medical-600">
              View Guidelines
            </Button>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
};

export default EmergencyServices;
