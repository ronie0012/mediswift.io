import { useState } from "react";
import PageTemplate from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";

// Define the Package type
interface Package {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
}

const HealthPackages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  const packages = [
    {
      id: "basic",
      name: "Basic Health Checkup",
      price: "₹1,999",
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
      price: "₹3,999",
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
      price: "₹6,999",
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

  const handleBookNow = (pkg: Package) => {
    if (!user) {
      toast.error("Please login to book a health package");
      navigate('/login');
      return;
    }
    setSelectedPackage(pkg);
  };

  const handleConfirmBooking = async () => {
    if (!selectedPackage) return;

    setIsBooking(true);
    try {
      // Simulate a booking process with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would make an API call here
      
      toast.success(`${selectedPackage.name} booked successfully!`);
      setSelectedPackage(null);
      
      // Redirect to appointments page
      navigate('/my-appointments');
    } catch (error) {
      toast.error("Failed to book the health package. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

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

        {/* Booking Confirmation Dialog */}
        <Dialog open={!!selectedPackage} onOpenChange={(open) => !open && setSelectedPackage(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Booking</DialogTitle>
              <DialogDescription>
                You are about to book the following health package
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Package:</span>
                <span className="font-medium">{selectedPackage?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Price:</span>
                <span className="font-medium">{selectedPackage?.price}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Next available slot:</span>
                <span className="font-medium">
                  {new Date(Date.now() + 86400000).toLocaleDateString('en-IN', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedPackage(null)}
                disabled={isBooking}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmBooking}
                disabled={isBooking}
                className="bg-medical-500 hover:bg-medical-600"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTemplate>
  );
};

export default HealthPackages;
