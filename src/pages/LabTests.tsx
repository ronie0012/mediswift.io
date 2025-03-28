import PageTemplate from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Search, FileText, TestTube, AlertCircle, Calendar, Beaker, Home } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const LabTests = () => {
  const popularTests = [
    {
      id: "test1",
      name: "Complete Blood Count (CBC)",
      price: "$25",
      description: "Measures red and white blood cells, hemoglobin, and platelets",
      preparationTime: "No special preparation",
      reportTime: "Same day"
    },
    {
      id: "test2",
      name: "Lipid Profile",
      price: "$35",
      description: "Measures cholesterol levels and triglycerides",
      preparationTime: "8-12 hours fasting required",
      reportTime: "Next day"
    },
    {
      id: "test3",
      name: "HbA1c",
      price: "$40",
      description: "Measures average blood sugar levels over the past 3 months",
      preparationTime: "No special preparation",
      reportTime: "Next day"
    },
    {
      id: "test4",
      name: "Thyroid Function Test",
      price: "$45",
      description: "Measures thyroid hormone levels",
      preparationTime: "No special preparation",
      reportTime: "1-2 days"
    }
  ];

  const packages = [
    {
      id: "pkg1",
      name: "Basic Health Checkup",
      price: "$99",
      tests: ["Complete Blood Count", "Lipid Profile", "Blood Glucose", "Liver Function Test", "Kidney Function Test"],
      description: "Essential tests to assess overall health status"
    },
    {
      id: "pkg2",
      name: "Women's Health Package",
      price: "$149",
      tests: ["Complete Blood Count", "Lipid Profile", "Thyroid Function Test", "Vitamin D", "Calcium", "Iron Profile"],
      description: "Comprehensive screening for women's health"
    },
    {
      id: "pkg3",
      name: "Diabetes Care Package",
      price: "$129",
      tests: ["Fasting Blood Glucose", "HbA1c", "Lipid Profile", "Kidney Function Test", "Urine Microalbumin"],
      description: "Specialized tests for diabetes monitoring and management"
    }
  ];

  return (
    <PageTemplate title="Lab Tests" subtitle="Book diagnostic tests and health packages with doorstep sample collection">
      <div className="space-y-8">
        <section>
          <p className="text-gray-600">
            MediSwift offers a wide range of diagnostic tests with convenient home sample collection. Our certified 
            phlebotomists collect samples at your preferred time and location, and test results are shared digitally
            within the promised turnaround time.
          </p>
        </section>
        
        <section className="bg-blue-50 p-6 rounded-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Search for Tests</h2>
              <div className="flex gap-2">
                <div className="flex-grow">
                  <Input placeholder="Search for tests, packages or health concerns" />
                </div>
                <Button className="bg-medical-500 hover:bg-medical-600">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Home Sample Collection</h2>
              <div className="flex gap-2">
                <div className="flex-grow">
                  <Input type="text" placeholder="Enter your pincode" />
                </div>
                <Button className="bg-medical-500 hover:bg-medical-600">
                  <Home className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <section>
          <Tabs defaultValue="individual">
            <TabsList className="mb-6">
              <TabsTrigger value="individual">Individual Tests</TabsTrigger>
              <TabsTrigger value="packages">Health Packages</TabsTrigger>
            </TabsList>
            
            <TabsContent value="individual">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Popular Tests</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popularTests.map(test => (
                  <Card key={test.id} className="hover:shadow-md transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TestTube className="h-5 w-5 text-medical-500" />
                        {test.name}
                      </CardTitle>
                      <CardDescription>{test.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <AlertCircle className="h-4 w-4 text-medical-500" />
                          <span>{test.preparationTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-medical-500" />
                          <span>Report: {test.reportTime}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <span className="font-bold text-lg text-medical-600">{test.price}</span>
                      <Button className="bg-medical-500 hover:bg-medical-600">
                        Book Now
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="packages">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Health Packages</h2>
              <div className="grid grid-cols-1 gap-4">
                {packages.map(pkg => (
                  <Card key={pkg.id} className="hover:shadow-md transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Beaker className="h-5 w-5 text-medical-500" />
                        {pkg.name}
                      </CardTitle>
                      <CardDescription>{pkg.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-medium text-gray-700 mb-2">Includes:</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-4 mb-4">
                        {pkg.tests.map((test, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <Badge className="h-4 w-4 text-medical-500 mr-2" />
                            {test}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <span className="font-bold text-lg text-medical-600">{pkg.price}</span>
                      <Button className="bg-medical-500 hover:bg-medical-600">
                        Book Package
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-medical-600" />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Book Your Test</h3>
              <p className="text-sm text-gray-600">
                Select your test and schedule sample collection at your preferred time and location.
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-medical-600" />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Home Sample Collection</h3>
              <p className="text-sm text-gray-600">
                Our trained phlebotomist will visit your home to collect samples safely.
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-medical-600" />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">View Reports Online</h3>
              <p className="text-sm text-gray-600">
                Receive your test results digitally, with the option to consult a doctor for interpretation.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
};

export default LabTests;
