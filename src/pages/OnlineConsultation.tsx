import { useState, useEffect } from "react";
import PageTemplate from "@/components/layout/PageTemplate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Video, Phone, MessageSquare, Clock, CreditCard, History, Check, Search, User, FileText, CreditCard as CreditCardIcon, Calendar as CalendarIcon, Clock as ClockIcon, Smartphone, Mail, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format, addDays, isValid, parseISO } from "date-fns";
import { useAppointments } from "@/context/AppointmentContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FormData {
  name: string;
  age: string;
  gender: string;
  phone: string;
  email: string;
  symptoms: string;
  date: string;
  time: string;
  consultationType: string;
  doctorId?: number;
  doctorName?: string;
}

interface FormError {
  name?: string;
  age?: string;
  phone?: string;
  email?: string;
  symptoms?: string;
  date?: string;
  time?: string;
}

const OnlineConsultation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { addAppointment } = useAppointments();
  const [activeTab, setActiveTab] = useState("video");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    age: "",
    gender: "male",
    phone: "",
    email: "",
    symptoms: "",
    date: "",
    time: "",
    consultationType: "video"
  });
  const [formErrors, setFormErrors] = useState<FormError>({});
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState<any>(null);
  const [appointmentId, setAppointmentId] = useState<number | null>(null);

  // Populate form with user data if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone
      }));
    }
  }, [isAuthenticated, user]);

  // Available time slots
  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", 
    "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"
  ];

  // Available dates (next 7 days)
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i);
    return format(date, "yyyy-MM-dd");
  });

  const specialties = [
    "General Medicine", "Pediatrics", "Dermatology", "Psychiatry", 
    "Orthopedics", "Gynecology", "Cardiology", "Neurology"
  ];

  // Sample doctor data
  const doctors = [
    { id: 1, name: "Dr. Anil Sharma", specialty: "General Medicine", experience: "12 years", rating: 4.5, price: 500, available: true },
    { id: 2, name: "Dr. Priya Patel", specialty: "Pediatrics", experience: "8 years", rating: 4.7, price: 600, available: true },
    { id: 3, name: "Dr. Rajesh Kumar", specialty: "Dermatology", experience: "15 years", rating: 4.3, price: 700, available: true },
    { id: 4, name: "Dr. Sunita Singh", specialty: "Psychiatry", experience: "10 years", rating: 4.8, price: 800, available: true },
    { id: 5, name: "Dr. Vikram Mehta", specialty: "Orthopedics", experience: "14 years", rating: 4.6, price: 700, available: true },
    { id: 6, name: "Dr. Neha Joshi", specialty: "Gynecology", experience: "12 years", rating: 4.9, price: 900, available: true },
    { id: 7, name: "Dr. Kiran Reddy", specialty: "Cardiology", experience: "18 years", rating: 4.7, price: 1000, available: true },
    { id: 8, name: "Dr. Mohan Desai", specialty: "Neurology", experience: "16 years", rating: 4.5, price: 900, available: true }
  ];

  const filteredDoctors = selectedSpecialty
    ? doctors.filter(doctor => doctor.specialty === selectedSpecialty)
    : doctors;

  // Enhanced validation function
  const validateForm = (): boolean => {
    const errors: FormError = {};
    let isValid = true;
    
    if (!formData.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }
    
    if (!formData.age) {
      errors.age = "Age is required";
      isValid = false;
    } else if (parseInt(formData.age) <= 0 || parseInt(formData.age) > 120) {
      errors.age = "Please enter a valid age";
      isValid = false;
    }
    
    if (!formData.phone) {
      errors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = "Please enter a valid 10-digit phone number";
      isValid = false;
    }
    
    if (!formData.email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }
    
    if (!formData.symptoms.trim()) {
      errors.symptoms = "Please describe your symptoms";
      isValid = false;
    } else if (formData.symptoms.length < 10) {
      errors.symptoms = "Please provide more details about your symptoms";
      isValid = false;
    }
    
    if (!formData.date) {
      errors.date = "Please select an appointment date";
      isValid = false;
    }
    
    if (!formData.time) {
      errors.time = "Please select an appointment time";
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSpecialtySelect = (specialty) => {
    setSelectedSpecialty(specialty);
    setBookingStep(2); // Move to doctor selection
  };

  const handleDoctorSelect = (doctor) => {
    setFormData(prev => ({ ...prev, doctorId: doctor.id, doctorName: doctor.name }));
    setCurrentDoctor(doctor);
    setBookingStep(3); // Move to consultation type
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    setFormData(prev => ({ ...prev, consultationType: value }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book an appointment.",
        variant: "destructive",
      });
      
      // Redirect to login with a return path
      navigate(`/login?returnTo=${encodeURIComponent('/online-consultation')}`);
      return;
    }
    
    // Enhanced validation
    if (!validateForm()) {
      toast({
        title: "Form Validation Failed",
        description: "Please correct the errors in the form.",
        variant: "destructive",
      });
      
      // Scroll to the first error
      const firstErrorField = Object.keys(formErrors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      return;
    }
    
    // Show payment dialog instead of proceeding immediately
    setShowPaymentDialog(true);
  };
  
  const processPayment = async () => {
    try {
      setPaymentProcessing(true);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create appointment object matching the expected format
      const appointmentData = {
        doctorId: formData.doctorId || 0,
        doctorName: formData.doctorName || "",
        patientName: formData.name,
        patientAge: formData.age,
        patientPhone: formData.phone,
        symptoms: formData.symptoms,
        date: formData.date,
        time: formData.time,
        consultationType: formData.consultationType
      };
      
      // Submit appointment
      await addAppointment(appointmentData);
      
      // Set a mock appointment ID for now - in a real app this would come from the backend
      setAppointmentId(Date.now());
      
      setShowPaymentDialog(false);
      setBookingComplete(true);
      
      // Scroll to top of confirmation
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPaymentProcessing(false);
    }
  };

  const renderBookingSteps = () => {
    switch (bookingStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Select a Specialty</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {specialties.map((specialty, index) => (
                <button
                  key={index}
                  onClick={() => handleSpecialtySelect(specialty)}
                  className={`bg-white border ${selectedSpecialty === specialty ? 'border-medical-500 bg-medical-50' : 'border-gray-200'} rounded p-3 text-center hover:border-medical-300 hover:bg-blue-50 transition-colors duration-300`}
                >
                  <span className="text-sm text-gray-700">{specialty}</span>
                </button>
              ))}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">Select a Doctor</h3>
              <button 
                onClick={() => setBookingStep(1)} 
                className="text-sm text-medical-600 hover:underline"
              >
                Change Specialty
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.map(doctor => (
                <div 
                  key={doctor.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-medical-300 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => handleDoctorSelect(doctor)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{doctor.name}</h4>
                      <p className="text-sm text-gray-600">{doctor.specialty} • {doctor.experience}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm text-gray-600 ml-1">{doctor.rating}</span>
                    </div>
                    <div className="text-medical-600 font-medium">₹{doctor.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">Book Appointment</h3>
              <button 
                onClick={() => setBookingStep(2)} 
                className="text-sm text-medical-600 hover:underline"
              >
                Change Doctor
              </button>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-medical-100 rounded-full flex items-center justify-center text-medical-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{formData.doctorName}</h4>
                  <p className="text-sm text-gray-600">{selectedSpecialty}</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Consultation Type</h4>
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
                </Tabs>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    required 
                    className={formErrors.name ? "border-red-500" : ""}
                  />
                  {renderError('name', formErrors)}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input 
                    id="age" 
                    name="age" 
                    type="number" 
                    value={formData.age} 
                    onChange={handleInputChange} 
                    required 
                    className={formErrors.age ? "border-red-500" : ""}
                  />
                  {renderError('age', formErrors)}
                </div>
                
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <RadioGroup 
                    defaultValue="male" 
                    name="gender" 
                    value={formData.gender}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">Other</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    required 
                    className={formErrors.phone ? "border-red-500" : ""}
                  />
                  {renderError('phone', formErrors)}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    required 
                    className={formErrors.email ? "border-red-500" : ""}
                  />
                  {renderError('email', formErrors)}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Appointment Date</Label>
                  <Select 
                    name="date" 
                    value={formData.date} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, date: value }))}
                    required
                  >
                    <SelectTrigger className={formErrors.date ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select date" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDates.map((date, index) => (
                        <SelectItem key={index} value={date}>
                          {format(new Date(date), "EEEE, MMMM d, yyyy")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {renderError('date', formErrors)}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Appointment Time</Label>
                  <Select 
                    name="time" 
                    value={formData.time} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}
                    required
                  >
                    <SelectTrigger className={formErrors.time ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time, index) => (
                        <SelectItem key={index} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {renderError('time', formErrors)}
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="symptoms">Symptoms & Issues</Label>
                  <Textarea 
                    id="symptoms" 
                    name="symptoms" 
                    placeholder="Briefly describe your symptoms or reasons for consultation" 
                    value={formData.symptoms} 
                    onChange={handleInputChange} 
                    required 
                    className={formErrors.symptoms ? "border-red-500" : ""}
                  />
                  {renderError('symptoms', formErrors)}
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-medical-500 hover:bg-medical-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Book Appointment"}
                </Button>
              </div>
            </form>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderBookingSuccess = () => (
    <div className="text-center py-8 space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <Check className="h-8 w-8 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-2xl font-semibold text-gray-800">Appointment Confirmed!</h3>
        <p className="text-gray-600 mt-2">
          Your appointment details have been sent to your email.
        </p>
        {appointmentId && (
          <p className="text-gray-600 mt-1">
            Appointment ID: <span className="font-medium">{appointmentId}</span>
          </p>
        )}
      </div>
      
      <Card className="max-w-lg mx-auto bg-blue-50 border-blue-100">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-blue-200">
              <h4 className="font-medium text-lg text-gray-800">Appointment Details</h4>
              <Badge variant="outline" className="bg-medical-100 text-medical-700 border-medical-200">
                {formData.consultationType.charAt(0).toUpperCase() + formData.consultationType.slice(1)} Consultation
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <User className="h-5 w-5 text-medical-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Doctor</p>
                  <p className="font-medium text-gray-800">{formData.doctorName}</p>
                  <p className="text-sm text-gray-600">{selectedSpecialty}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <CalendarIcon className="h-5 w-5 text-medical-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-800">
                    {formData.date && format(new Date(formData.date), "EEEE, MMMM d, yyyy")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <ClockIcon className="h-5 w-5 text-medical-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium text-gray-800">{formData.time}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Smartphone className="h-5 w-5 text-medical-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="font-medium text-gray-800">{formData.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-medical-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">{formData.email}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 max-w-lg mx-auto flex items-start">
        <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="text-sm text-yellow-700">
          <p className="font-medium">Important Information</p>
          <p className="mt-1">Please join 5 minutes before your scheduled time. You'll receive a link to join the consultation via email and SMS.</p>
        </div>
      </div>
      
      <div className="pt-4 space-y-4">
        <Button asChild className="bg-medical-500 hover:bg-medical-600">
          <Link to="/my-appointments">View All My Appointments</Link>
        </Button>
        <div className="flex justify-center">
          <Link to="/" className="text-medical-600 hover:text-medical-700 hover:underline text-sm">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );

  // Add error display helper
  const renderError = (field: string, errors: FormError) => {
    if (errors[field]) {
      return (
        <div className="text-red-500 text-sm mt-1 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {errors[field]}
        </div>
      );
    }
    return null;
  };

  return (
    <PageTemplate title="Online Consultation" subtitle="Connect with our specialists from the comfort of your home">
      <div className="space-y-8">
        <section>
          <p className="text-gray-600">
            MediSwift's online consultation service connects you with experienced doctors across various specialties.
            Whether you're seeking medical advice, follow-up consultations, or second opinions, our platform
            provides secure and convenient access to healthcare professionals.
          </p>
          
          <div className="mt-6 flex flex-col md:flex-row justify-center gap-4">
            <Button 
              onClick={() => {
                setBookingStep(1);
                setSelectedSpecialty("");
                setBookingComplete(false);
              }} 
              className="bg-medical-500 hover:bg-medical-600 text-white px-6 py-2"
            >
              Book Consultation Now
            </Button>
            <Link to="/doctors">
              <Button variant="outline" className="border-medical-500 text-medical-600 hover:bg-medical-50 px-6 py-2">
                Browse All Doctors
              </Button>
            </Link>
          </div>
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          {bookingComplete ? renderBookingSuccess() : renderBookingSteps()}
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
          <h2 className="text-xl font-semibold text-gray-800 mb-4">How It Works</h2>
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
        
        <section className="bg-medical-50 border border-medical-100 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FileText className="h-6 w-6 text-medical-600 mt-1" />
            <div>
              <h3 className="font-medium text-gray-800 mb-1">Consultation FAQs</h3>
              <div className="space-y-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="w-full text-left text-sm font-medium text-medical-600 hover:text-medical-800">
                      How secure is the online consultation platform?
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Security of Online Consultations</DialogTitle>
                    </DialogHeader>
                    <div className="text-sm text-gray-600">
                      <p>Our platform uses end-to-end encryption to ensure that your consultation remains private and secure. We comply with all healthcare data protection regulations and standards.</p>
                      <p className="mt-2">All medical data is stored securely and is only accessible to authorized healthcare professionals involved in your care.</p>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="w-full text-left text-sm font-medium text-medical-600 hover:text-medical-800">
                      Can I get medications prescribed online?
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Online Prescriptions</DialogTitle>
                    </DialogHeader>
                    <div className="text-sm text-gray-600">
                      <p>Yes, doctors can prescribe medications during online consultations when medically appropriate. The digital prescription will be sent to you after the consultation.</p>
                      <p className="mt-2">For certain medications that require in-person evaluation, the doctor may recommend you visit a clinic.</p>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="w-full text-left text-sm font-medium text-medical-600 hover:text-medical-800">
                      What if I need to reschedule my appointment?
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rescheduling Appointments</DialogTitle>
                    </DialogHeader>
                    <div className="text-sm text-gray-600">
                      <p>You can reschedule your appointment up to 2 hours before the scheduled time without any charges. Visit the "My Appointments" section to manage your bookings.</p>
                      <p className="mt-2">For last-minute cancellations, a small fee may be applicable as per our cancellation policy.</p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Complete your payment to confirm the appointment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-medium">Consultation Fee:</span>
                <span className="text-medical-600">₹{currentDoctor?.price || 800}</span>
              </div>
              <div className="text-sm text-gray-600">{formData.consultationType} consultation</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardName">Name on Card</Label>
              <Input id="cardName" placeholder="John Doe" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <div className="relative">
                <Input id="cardNumber" placeholder="4242 4242 4242 4242" />
                <CreditCardIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input id="expiryDate" placeholder="MM/YY" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="123" type="password" />
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setShowPaymentDialog(false)}
              disabled={paymentProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={processPayment} 
              className="bg-medical-500 hover:bg-medical-600"
              disabled={paymentProcessing}
            >
              {paymentProcessing ? (
                <>
                  <span className="mr-2">Processing...</span>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : (
                `Pay ₹${currentDoctor?.price || 800}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
};

export default OnlineConsultation;
