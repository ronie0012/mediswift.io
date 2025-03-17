
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const DownloadApp = () => {
  return (
    <section className="py-16 bg-medical-500 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Download the MediSwift App</h2>
            <p className="text-white/90 text-lg mb-6">
              Get medicines delivered in 10 minutes, consult doctors online, and book ambulances instantly - all from your phone.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mr-4">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-bold text-xl">Quick 10-min Medicine Delivery</h3>
                  <p className="text-white/80">Get your medications delivered right to your doorstep</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mr-4">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-bold text-xl">Online Doctor Consultations</h3>
                  <p className="text-white/80">Connect with specialists from the comfort of your home</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mr-4">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-bold text-xl">Instant Ambulance Booking</h3>
                  <p className="text-white/80">Emergency services with real-time tracking</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button className="bg-white text-medical-600 hover:bg-gray-100">
                <Download className="h-5 w-5 mr-2" />
                Google Play
              </Button>
              <Button className="bg-white text-medical-600 hover:bg-gray-100">
                <Download className="h-5 w-5 mr-2" />
                App Store
              </Button>
            </div>
          </div>
          
          <div className="hidden md:flex justify-center">
            <img 
              src="https://images.unsplash.com/photo-1558562805-4bf1e2a724eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1935&q=80" 
              alt="MediSwift Mobile App" 
              className="max-w-full rounded-xl shadow-2xl"
              style={{ maxHeight: '600px' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadApp;
