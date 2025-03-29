import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Ambulance, Clock, Phone } from "lucide-react";
import Layout from "@/components/layout/Layout";

const AmbulanceBooking = () => {
  const { toast } = useToast();
  const [bookingType, setBookingType] = useState("emergency");
  const [loading, setLoading] = useState(false);
  
  const handleEmergencyBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Emergency ambulance dispatched",
        description: "An ambulance has been dispatched to your location. ETA: 8 minutes",
        variant: "default",
      });
    }, 1500);
  };
  
  const handleScheduledBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Ambulance scheduled successfully",
        description: "Your ambulance has been scheduled. You will receive a confirmation shortly.",
        variant: "default",
      });
    }, 1500);
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Ambulance Booking</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Book an ambulance for emergency situations or schedule for planned hospital visits.
            </p>
          </div>
          
          <Tabs defaultValue="emergency" className="w-full" onValueChange={setBookingType}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="emergency" className="text-base py-3">Emergency</TabsTrigger>
              <TabsTrigger value="scheduled" className="text-base py-3">Scheduled</TabsTrigger>
            </TabsList>
            
            <TabsContent value="emergency">
              <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <Clock className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                    <p className="text-red-700 text-sm">
                      <strong>Emergency Response:</strong> Ambulances are typically dispatched within 2 minutes and arrive in 8-15 minutes depending on location.
                    </p>
                  </div>
                </div>
                
                <form onSubmit={handleEmergencyBooking}>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label>Your Location</Label>
                      <div className="flex gap-3">
                        <Button type="button" className="bg-medical-500 hover:bg-medical-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          Use Current Location
                        </Button>
                        <div className="flex-1">
                          <Input placeholder="Or enter address manually" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Label>Emergency Type</Label>
                      <RadioGroup defaultValue="medical">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="medical" id="medical" />
                            <Label htmlFor="medical" className="font-normal">Medical Emergency</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="accident" id="accident" />
                            <Label htmlFor="accident" className="font-normal">Accident/Trauma</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="cardiac" id="cardiac" />
                            <Label htmlFor="cardiac" className="font-normal">Cardiac Emergency</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="other" />
                            <Label htmlFor="other" className="font-normal">Other</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emergency-notes">Additional Notes (optional)</Label>
                      <Textarea 
                        id="emergency-notes" 
                        placeholder="Provide any relevant details about the emergency..." 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emergency-phone">Contact Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <div className="flex">
                          <div className="flex items-center justify-center bg-gray-100 border border-r-0 rounded-l-md px-3 text-gray-500">+91</div>
                          <Input
                            id="emergency-phone"
                            type="tel"
                            placeholder="9876543210"
                            className="rounded-l-none"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full text-lg py-6 bg-emergency-500 hover:bg-emergency-600"
                      disabled={loading}
                    >
                      {loading ? "Booking..." : "Book Emergency Ambulance Now"}
                    </Button>
                    
                    <p className="text-center text-sm text-gray-500">
                      By booking, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                    </p>
                  </div>
                </form>
              </div>
            </TabsContent>
            
            <TabsContent value="scheduled">
              <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                <form onSubmit={handleScheduledBooking}>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="pickup-location">Pickup Location</Label>
                        <Input id="pickup-location" placeholder="Enter pickup address" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="destination">Destination</Label>
                        <Input id="destination" placeholder="Enter hospital/destination" required />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="pickup-date">Pickup Date</Label>
                        <Input id="pickup-date" type="date" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pickup-time">Pickup Time</Label>
                        <Input id="pickup-time" type="time" required />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Ambulance Type</Label>
                      <RadioGroup defaultValue="basic">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2 border rounded-lg p-4">
                            <RadioGroupItem value="basic" id="basic" />
                            <div>
                              <Label htmlFor="basic" className="font-medium">Basic</Label>
                              <p className="text-sm text-gray-500">For non-emergency transport</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-lg p-4">
                            <RadioGroupItem value="advanced" id="advanced" />
                            <div>
                              <Label htmlFor="advanced" className="font-medium">Advanced</Label>
                              <p className="text-sm text-gray-500">With medical equipment</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-lg p-4">
                            <RadioGroupItem value="cardiac" id="cardiac-amb" />
                            <div>
                              <Label htmlFor="cardiac-amb" className="font-medium">Cardiac</Label>
                              <p className="text-sm text-gray-500">With specialized care</p>
                            </div>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="patient-details">Patient Details</Label>
                      <Textarea 
                        id="patient-details" 
                        placeholder="Patient name, age, medical condition, special requirements..." 
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="scheduled-phone">Contact Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <div className="flex">
                          <div className="flex items-center justify-center bg-gray-100 border border-r-0 rounded-l-md px-3 text-gray-500">+91</div>
                          <Input
                            id="scheduled-phone"
                            type="tel"
                            placeholder="9876543210"
                            className="rounded-l-none"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-medical-500 hover:bg-medical-600"
                      disabled={loading}
                    >
                      {loading ? "Scheduling..." : "Schedule Ambulance"}
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-12">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-emergency-500" />
                Emergency Hotline
              </h3>
              <p className="text-gray-600 mb-4">
                For immediate ambulance dispatch in emergencies, call our 24/7 hotline:
              </p>
              <a href="tel:+911800123456" className="text-3xl font-bold text-emergency-500 hover:underline flex items-center">
                Call: +91 1800 123 456
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AmbulanceBooking;
