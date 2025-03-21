
import PageTemplate from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const HealthPackages = () => {
  const packages = [
    {
      id: "basic",
      name: "Basic Health Checkup",
      price: "$99",
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
      price: "$199",
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
      price: "$349",
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
                <Button className="w-full bg-medical-500 hover:bg-medical-600">
                  Book Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </PageTemplate>
  );
};

export default HealthPackages;
