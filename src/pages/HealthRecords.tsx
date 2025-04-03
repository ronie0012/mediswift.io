import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Calendar, FileText, Plus, User, PlusCircle, ChevronDown } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import healthcareService from "@/lib/healthcare.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MedicalRecord {
  id: number;
  patient: any;
  doctor: any;
  appointment: any;
  visit_date: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  prescription?: string;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
}

interface Prescription {
  id: number;
  medical_record: number;
  medication: any;
  dosage: string;
  frequency: string;
  duration: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

const HealthRecords = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("records");
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [prescriptions, setPrescriptions] = useState<{[key: number]: Prescription[]}>({});
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false);
  
  useEffect(() => {
    if (!user) {
      toast.error("Please login to access your health records");
      navigate("/login");
      return;
    }
    
    fetchMedicalRecords();
  }, [user, navigate]);
  
  const fetchMedicalRecords = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // First, get the current patient's profile
      const patientProfile = await healthcareService.getCurrentPatientProfile();
      
      // Then get the medical records for this patient
      const records = await healthcareService.getPatientMedicalRecords(patientProfile.id);
      setMedicalRecords(records);
    } catch (error) {
      console.error("Error fetching medical records:", error);
      setError("Failed to load medical records. Please try again later.");
      toast.error("Failed to load medical records");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchPrescriptionsForRecord = async (recordId: number) => {
    if (prescriptions[recordId]) {
      // Already fetched
      return;
    }
    
    setIsLoadingPrescriptions(true);
    try {
      const data = await healthcareService.getMedicalRecordPrescriptions(recordId);
      setPrescriptions(prev => ({
        ...prev,
        [recordId]: data
      }));
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      toast.error("Failed to load prescriptions");
    } finally {
      setIsLoadingPrescriptions(false);
    }
  };
  
  const handleRecordClick = (record: MedicalRecord) => {
    setSelectedRecord(record);
    fetchPrescriptionsForRecord(record.id);
  };
  
  const renderMedicalRecordsList = () => {
    if (medicalRecords.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Medical Records Found</h3>
          <p className="text-muted-foreground mb-6">You don't have any medical records yet.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {medicalRecords.map((record) => (
          <Card key={record.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                Visit on {format(parseISO(record.visit_date), "MMMM d, yyyy")}
              </CardTitle>
              <CardDescription>
                Dr. {record.doctor?.user?.first_name} {record.doctor?.user?.last_name} - {record.doctor?.specialization?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="font-medium">Diagnosis</p>
                  <p className="text-muted-foreground">{record.diagnosis}</p>
                </div>
                {record.follow_up_date && (
                  <div className="text-right">
                    <p className="font-medium">Follow-up</p>
                    <p className="text-muted-foreground">{format(parseISO(record.follow_up_date), "MMM d, yyyy")}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => handleRecordClick(record)}
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };
  
  const renderPrescriptionList = () => {
    // Flatten all prescriptions from all medical records for the prescriptions tab
    const allPrescriptions: (Prescription & { medical_record_data: MedicalRecord })[] = [];
    
    Object.keys(prescriptions).forEach(recordId => {
      const record = medicalRecords.find(r => r.id === parseInt(recordId));
      if (record) {
        prescriptions[parseInt(recordId)].forEach(prescription => {
          allPrescriptions.push({
            ...prescription,
            medical_record_data: record
          });
        });
      }
    });
    
    if (allPrescriptions.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Prescriptions Found</h3>
          <p className="text-muted-foreground mb-6">You don't have any prescriptions yet.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {allPrescriptions.map((prescription) => (
          <Card key={prescription.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {prescription.medication?.name}
              </CardTitle>
              <CardDescription>
                Prescribed on {format(parseISO(prescription.medical_record_data.visit_date), "MMMM d, yyyy")} by 
                {" "}Dr. {prescription.medical_record_data.doctor?.user?.first_name} {prescription.medical_record_data.doctor?.user?.last_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="font-medium">Dosage</p>
                    <p className="text-muted-foreground">{prescription.dosage}</p>
                  </div>
                  <div>
                    <p className="font-medium">Frequency</p>
                    <p className="text-muted-foreground">{prescription.frequency}</p>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Duration</p>
                  <p className="text-muted-foreground">{prescription.duration}</p>
                </div>
                {prescription.special_instructions && (
                  <div>
                    <p className="font-medium">Special Instructions</p>
                    <p className="text-muted-foreground">{prescription.special_instructions}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-3xl mx-auto">
            <Skeleton className="h-10 w-1/2 mb-6" />
            <Skeleton className="h-[600px] w-full rounded-lg" />
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-red-50 text-red-600 rounded-lg p-6 border border-red-100">
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p className="mb-4">{error}</p>
              <Button onClick={fetchMedicalRecords}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">My Health Records</h1>
            <p className="text-muted-foreground">
              Access and manage your medical history and prescriptions
            </p>
          </div>
          
          <Tabs defaultValue="records" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="records">Medical Records</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            </TabsList>
            <TabsContent value="records" className="mt-6">
              {renderMedicalRecordsList()}
            </TabsContent>
            <TabsContent value="prescriptions" className="mt-6">
              {renderPrescriptionList()}
            </TabsContent>
          </Tabs>
          
          {/* Record Details Dialog */}
          {selectedRecord && (
            <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Medical Record Details</DialogTitle>
                  <DialogDescription>
                    Visit on {format(parseISO(selectedRecord.visit_date), "MMMM d, yyyy")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Doctor</h4>
                      <p>Dr. {selectedRecord.doctor?.user?.first_name} {selectedRecord.doctor?.user?.last_name}</p>
                      <p className="text-sm text-muted-foreground">{selectedRecord.doctor?.specialization?.name}</p>
                    </div>
                    {selectedRecord.follow_up_date && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Follow-up Date</h4>
                        <p>{format(parseISO(selectedRecord.follow_up_date), "MMMM d, yyyy")}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Symptoms</h4>
                    <p>{selectedRecord.symptoms}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Diagnosis</h4>
                    <p>{selectedRecord.diagnosis}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Treatment</h4>
                    <p>{selectedRecord.treatment}</p>
                  </div>
                  
                  {selectedRecord.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Additional Notes</h4>
                      <p>{selectedRecord.notes}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Prescriptions</h4>
                    {isLoadingPrescriptions ? (
                      <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : prescriptions[selectedRecord.id]?.length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {prescriptions[selectedRecord.id].map((prescription) => (
                          <AccordionItem key={prescription.id} value={prescription.id.toString()}>
                            <AccordionTrigger className="text-left">
                              <div>
                                <span className="font-medium">{prescription.medication?.name}</span>
                                <span className="ml-2 text-sm text-muted-foreground">
                                  {prescription.dosage}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 p-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-sm font-medium">Dosage</p>
                                    <p className="text-sm">{prescription.dosage}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Frequency</p>
                                    <p className="text-sm">{prescription.frequency}</p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Duration</p>
                                  <p className="text-sm">{prescription.duration}</p>
                                </div>
                                {prescription.special_instructions && (
                                  <div>
                                    <p className="text-sm font-medium">Special Instructions</p>
                                    <p className="text-sm">{prescription.special_instructions}</p>
                                  </div>
                                )}
                                {prescription.medication?.description && (
                                  <div className="mt-2 pt-2 border-t">
                                    <p className="text-sm font-medium">About this Medication</p>
                                    <p className="text-sm">{prescription.medication.description}</p>
                                  </div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No prescriptions for this visit.</p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedRecord(null)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HealthRecords;
