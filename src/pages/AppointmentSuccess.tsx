import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Calendar, Clock, User, Video, MapPin } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { format } from "date-fns";

const AppointmentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<any>(null);

  useEffect(() => {
    // Get the latest appointment from localStorage
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    console.log('All Appointments:', appointments);
    
    if (appointments.length > 0) {
      const latestAppointment = appointments[appointments.length - 1];
      console.log('Latest Appointment:', latestAppointment);
      setAppointment(latestAppointment);
    } else {
      console.log('No appointments found, redirecting to doctors page');
      navigate('/doctors');
    }
  }, [navigate]);

  if (!appointment) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Appointment Booked Successfully!
                </h1>
                <p className="text-gray-600">
                  Your appointment has been confirmed. You will receive a confirmation email shortly.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center text-gray-600">
                  <User className="h-5 w-5 mr-3 text-medical-500" />
                  <div>
                    <p className="font-medium text-gray-900">Doctor</p>
                    <p>{appointment.doctorName}</p>
                    <p className="text-sm text-gray-500">{appointment.doctorSpecialty}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3 text-medical-500" />
                  <div>
                    <p className="font-medium text-gray-900">Date</p>
                    <p>{format(new Date(appointment.appointmentDate), "PPP")}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-3 text-medical-500" />
                  <div>
                    <p className="font-medium text-gray-900">Time</p>
                    <p>{appointment.appointmentTime}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  {appointment.appointmentType === "video" ? (
                    <Video className="h-5 w-5 mr-3 text-medical-500" />
                  ) : (
                    <MapPin className="h-5 w-5 mr-3 text-medical-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">Consultation Type</p>
                    <p>{appointment.appointmentType === "video" ? "Video Consultation" : "In-Clinic Visit"}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="font-medium text-gray-900">Consultation Fee</p>
                  <p className="text-xl font-bold text-medical-600">₹{appointment.consultationFee}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  className="flex-1 bg-medical-500 hover:bg-medical-600"
                  onClick={() => navigate('/my-appointments')}
                >
                  View All Appointments
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/doctors')}
                >
                  Book Another Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AppointmentSuccess; 