
import PageTemplate from "@/components/layout/PageTemplate";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Lock, Share2, Upload, Download, PlusCircle } from "lucide-react";

const HealthRecords = () => {
  const mockRecords = [
    {
      id: "rec1",
      type: "Lab Test",
      name: "Complete Blood Count",
      date: "May 15, 2023",
      provider: "MediLab Diagnostics"
    },
    {
      id: "rec2",
      type: "Prescription",
      name: "Medication for Hypertension",
      date: "April 3, 2023",
      provider: "Dr. Sarah Johnson"
    },
    {
      id: "rec3",
      type: "Vaccination",
      name: "COVID-19 Booster",
      date: "March 22, 2023",
      provider: "City Health Center"
    },
    {
      id: "rec4",
      type: "Medical Imaging",
      name: "Chest X-Ray",
      date: "February 10, 2023",
      provider: "Regional Hospital"
    }
  ];

  return (
    <PageTemplate title="Health Records" subtitle="Securely store and manage your medical records in one place">
      <div className="space-y-8">
        <section>
          <p className="text-gray-600">
            MediSwift's Health Records feature allows you to digitally store, organize, and access your medical 
            records anytime, anywhere. Keep track of your prescriptions, lab results, vaccination history, 
            and more in a secure, HIPAA-compliant platform.
          </p>
        </section>
        
        <section className="bg-blue-50 p-5 rounded-lg border border-blue-100 flex flex-col md:flex-row items-center gap-4">
          <Lock className="h-10 w-10 text-medical-600" />
          <div>
            <h3 className="font-medium text-gray-800 mb-1">Bank-Level Security</h3>
            <p className="text-sm text-gray-600">
              Your health records are protected with 256-bit encryption, multi-factor authentication, and strict access controls.
              We comply with all healthcare privacy regulations to ensure your information remains confidential.
            </p>
          </div>
        </section>
        
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Your Records</h2>
            <Button className="bg-medical-500 hover:bg-medical-600">
              <PlusCircle className="h-4 w-4 mr-2" /> Add New Record
            </Button>
          </div>
          
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Records</TabsTrigger>
              <TabsTrigger value="lab">Lab Tests</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
              <TabsTrigger value="imaging">Medical Imaging</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {mockRecords.map(record => (
                <Card key={record.id} className="hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{record.name}</CardTitle>
                        <CardDescription>{record.type}</CardDescription>
                      </div>
                      <span className="text-xs text-gray-500">{record.date}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-gray-600">Provider: {record.provider}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" /> View
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="lab">
              <p className="text-gray-600 text-center py-4">
                Filter showing Lab Test records
              </p>
            </TabsContent>
            
            <TabsContent value="prescriptions">
              <p className="text-gray-600 text-center py-4">
                Filter showing Prescription records
              </p>
            </TabsContent>
            
            <TabsContent value="vaccinations">
              <p className="text-gray-600 text-center py-4">
                Filter showing Vaccination records
              </p>
            </TabsContent>
            
            <TabsContent value="imaging">
              <p className="text-gray-600 text-center py-4">
                Filter showing Medical Imaging records
              </p>
            </TabsContent>
          </Tabs>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Your Records</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center text-center">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="font-medium text-gray-800 mb-2">Drag and drop files here</h3>
            <p className="text-sm text-gray-600 mb-4">
              Support for PDF, JPG, PNG files up to 10MB
            </p>
            <Button className="bg-medical-500 hover:bg-medical-600">
              Browse Files
            </Button>
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <Upload className="h-6 w-6 text-medical-500 mb-2" />
              <h3 className="font-medium text-gray-800 mb-1">Easy Upload</h3>
              <p className="text-sm text-gray-600">
                Quickly upload and categorize your medical documents, prescriptions, and test results.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <Share2 className="h-6 w-6 text-medical-500 mb-2" />
              <h3 className="font-medium text-gray-800 mb-1">Secure Sharing</h3>
              <p className="text-sm text-gray-600">
                Safely share your records with healthcare providers with temporary access links.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <FileText className="h-6 w-6 text-medical-500 mb-2" />
              <h3 className="font-medium text-gray-800 mb-1">Health Timeline</h3>
              <p className="text-sm text-gray-600">
                View your complete medical history chronologically on an interactive timeline.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
};

export default HealthRecords;
