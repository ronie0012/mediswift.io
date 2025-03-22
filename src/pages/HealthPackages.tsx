import PageTemplate from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Calendar, User, Phone, MapPin, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const HealthPackages = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    preferredDate: "",
    preferredTime: "",
    location: "clinic",
    additionalNotes: ""
  });

  const packages = [
    {
      id: "basic",
      name: "Basic Health Checkup",
      price: "₹7,999",
      description: "Essential health screening for individuals",
      features: [
        "Complete Blood Count (CBC)",
        "Lipid Profile",
        "Blood Glucose Test",
        "Liver Function Test",
        "Kidney Function Test",
        "Basic Physical Examination"
      ]
    },
    {
      id: "comprehensive",
      name: "Comprehensive Health Checkup",
      price: "₹15,999",
      description: "Complete health assessment for adults",
      features: [
        "All Basic Health Checkup Tests",
        "Thyroid Function Test",
        "Vitamin D, B12 Levels",
        "ECG",
        "Chest X-Ray",
        "Detailed Physical Examination",
        "Doctor Consultation"
      ]
    },
    {
      id: "executive",
      name: "Executive Health Checkup",
      price: "₹27,999",
      description: "Premium health assessment for busy professionals",
      features: [
        "All Comprehensive Health Checkup Tests",
        "Tumor Markers",
        "Stress Test",
        "Abdominal Ultrasound",
        "Diet and Nutrition Consultation",
        "Follow-up Consultation",
        "Digital Health Records",
        "Priority Appointment Scheduling"
      ]
    }
  ];

  const handleBookNow = (pkg: any) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to book a health package",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setSelectedPackage(pkg);
    
    // Pre-fill form with user data if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        phone: user.phone || ""
      }));
    }
    
    setShowDialog(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleLocationChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      location: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.phone.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.preferredDate) {
      toast({
        title: "Date required",
        description: "Please select your preferred date",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.preferredTime) {
      toast({
        title: "Time required",
        description: "Please select your preferred time",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    // Simulate API call to book health package
    setTimeout(() => {
      setLoading(false);
      setShowDialog(false);
      
      toast({
        title: "Health package booked successfully",
        description: `Your ${selectedPackage.name} has been scheduled for ${formData.preferredDate} at ${formData.preferredTime}. You will receive a confirmation shortly.`,
        variant: "default",
      });
      
      // Reset form
      setFormData({
        name: "",
        phone: "",
        preferredDate: "",
        preferredTime: "",
        location: "clinic",
        additionalNotes: ""
      });
    }, 1500);
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Get date 60 days from now in YYYY-MM-DD format
  const maxDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <PageTemplate title="Health Packages" subtitle="Comprehensive health check-up packages for you and your family">
      <div className="space-y-8">
        <p className="text-gray-600">
          Our health packages are designed to provide comprehensive health assessments tailored to different needs and budgets. 
          Regular health check-ups help in early detection of health issues and maintaining overall wellbeing.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-medical-600 mb-4">{pkg.price}</p>
                <ul className="space-y-2">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-medical-500 hover:bg-medical-600"
                  onClick={() => handleBookNow(pkg)}
                >
                  Book Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book Health Package</DialogTitle>
            <DialogDescription>
              {selectedPackage?.name} - {selectedPackage?.price}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input 
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input 
                  id="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferredDate">Preferred Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input 
                    id="preferredDate"
                    type="date"
                    min={today}
                    max={maxDate}
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferredTime">Preferred Time</Label>
                <Input 
                  id="preferredTime"
                  type="time"
                  min="09:00"
                  max="18:00"
                  value={formData.preferredTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Preferred Location</Label>
              <RadioGroup value={formData.location} onValueChange={handleLocationChange}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value="clinic" id="clinic" />
                    <div>
                      <Label htmlFor="clinic" className="font-medium">Clinic Visit</Label>
                      <p className="text-xs text-gray-500">Visit our medical center</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value="home" id="home" />
                    <div>
                      <Label htmlFor="home" className="font-medium">Home Visit</Label>
                      <p className="text-xs text-gray-500">Medical team visits you</p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Information</Label>
              <Textarea 
                id="additionalNotes"
                placeholder="Any specific requirements or medical history we should know about"
                value={formData.additionalNotes}
                onChange={handleInputChange}
              />
            </div>
            
            <DialogFooter className="mt-6">
              <Button 
                type="submit" 
                className="w-full bg-medical-500 hover:bg-medical-600"
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm Booking"}
              </Button>
            </DialogFooter>
            
            <p className="text-xs text-gray-500 text-center">
              By booking, you agree to our{" "}
              <a href="/terms" className="text-medical-600 hover:underline">Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy" className="text-medical-600 hover:underline">Privacy Policy</a>
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
};

export default HealthPackages;
