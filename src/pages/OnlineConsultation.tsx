
import PageTemplate from "@/components/layout/PageTemplate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, Video, Phone, MessageSquare, Clock, CreditCard, History } from "lucide-react";

const OnlineConsultation = () => {
  const specialties = [
    "General Medicine", "Pediatrics", "Dermatology", "Psychiatry", 
    "Orthopedics", "Gynecology", "Cardiology", "Neurology"
  ];

  return (
    <PageTemplate title="Online Consultation" subtitle="Connect with qualified doctors from the comfort of your home">
      <div className="space-y-8">
        <section>
          <p className="text-gray-600">
            MediSwift's online consultation service connects you with experienced doctors across various specialties.
            Whether you're seeking medical advice, follow-up consultations, or second opinions, our platform
            provides secure and convenient access to healthcare professionals.
          </p>
          
          <div className="mt-6 flex justify-center">
            <Link to="/doctors">
              <Button className="bg-medical-500 hover:bg-medical-600 text-white px-6 py-2">
                Find Doctors
              </Button>
            </Link>
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Consultation Options</h2>
          <Tabs defaultValue="video">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="video" className="flex items-center gap-2">
                <Video className="h-4 w-4" /> Video Call
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> Audio Call
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Chat
              </TabsTrigger>
            </TabsList>
            <TabsContent value="video" className="pt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Video Consultation</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Face-to-face consultation with doctors through our secure video platform. Ideal for detailed
                  assessments and personalized care.
                </p>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-medical-500" /> 
                  <span>15-30 minutes session</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="audio" className="pt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Audio Consultation</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Voice call with doctors when video isn't necessary or possible. Perfect for follow-ups
                  and discussing test results.
                </p>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-medical-500" /> 
                  <span>10-20 minutes session</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="chat" className="pt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Chat Consultation</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Text-based consultation for quick queries and discreet discussions. Convenient for
                  busy individuals and simple medical questions.
                </p>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-medical-500" /> 
                  <span>Flexible duration</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Specialties</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {specialties.map((specialty, index) => (
              <div 
                key={index} 
                className="bg-white border border-gray-200 rounded p-3 text-center hover:border-medical-300 hover:bg-blue-50 transition-colors duration-300"
              >
                <span className="text-sm text-gray-700">{specialty}</span>
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
                <h3 className="font-medium text-gray-800">Choose a Doctor</h3>
                <p className="text-sm text-gray-600">Browse through our list of specialists and select the one that matches your needs.</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="bg-medical-100 text-medical-600 rounded-full h-8 w-8 flex items-center justify-center font-bold mr-4 shrink-0">2</div>
              <div>
                <h3 className="font-medium text-gray-800">Book an Appointment</h3>
                <p className="text-sm text-gray-600">Select a convenient time slot and pay the consultation fee.</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="bg-medical-100 text-medical-600 rounded-full h-8 w-8 flex items-center justify-center font-bold mr-4 shrink-0">3</div>
              <div>
                <h3 className="font-medium text-gray-800">Attend Consultation</h3>
                <p className="text-sm text-gray-600">Connect with the doctor through video, audio, or chat at the scheduled time.</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="bg-medical-100 text-medical-600 rounded-full h-8 w-8 flex items-center justify-center font-bold mr-4 shrink-0">4</div>
              <div>
                <h3 className="font-medium text-gray-800">Receive Prescription</h3>
                <p className="text-sm text-gray-600">Get digital prescriptions and medical advice after your consultation.</p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="flex flex-col md:flex-row gap-4 bg-blue-50 p-4 rounded-lg">
          <div className="flex-1 flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-medical-500" />
            <div>
              <h3 className="font-medium text-gray-800">Pay Securely</h3>
              <p className="text-sm text-gray-600">Multiple payment options available</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-medical-500" />
            <div>
              <h3 className="font-medium text-gray-800">Flexible Scheduling</h3>
              <p className="text-sm text-gray-600">Morning to late evening slots</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-3">
            <History className="h-8 w-8 text-medical-500" />
            <div>
              <h3 className="font-medium text-gray-800">Follow-ups</h3>
              <p className="text-sm text-gray-600">Free follow-up consultations</p>
            </div>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
};

export default OnlineConsultation;
