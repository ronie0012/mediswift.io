import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Calendar, Clock, MapPin, User, Video } from "lucide-react";
import Layout from "@/components/layout/Layout";

// Updated interface to match the actual structure in AppointmentContext
interface Appointment {
  id: number;
  doctorId: number;
  doctorName: string;
  patientName: string;
  patientEmail: string;
  patientAge: string;
  patientPhone: string;
  symptoms: string;
  date: string;
  time: string;
  consultationType: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

const AppointmentSuccess = () => {
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Get appointments from localStorage
      const storedAppointments = localStorage.getItem('appointments');
      if (!storedAppointments) {
        console.error('No appointments found in localStorage');
        setError('No appointments found');
        setLoading(false);
        return;
      }

      const appointments = JSON.parse(storedAppointments);
      if (!Array.isArray(appointments) || appointments.length === 0) {
        console.error('No appointments array or empty array');
        setError('No appointment data available');
        setLoading(false);
        return;
      }

      // Get the most recent confirmed appointment
      const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');
      const latestAppointment = confirmedAppointments[confirmedAppointments.length - 1];
      
      if (!latestAppointment || !latestAppointment.doctorName) {
        console.error('Invalid appointment data');
        setError('Invalid appointment data');
        setLoading(false);
        return;
      }

      console.log('Latest appointment:', latestAppointment);
      setAppointment(latestAppointment);
      setLoading(false);
    } catch (error) {
      console.error('Error retrieving appointment:', error);
      setError('Error retrieving appointment data');
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
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

  if (error || !appointment) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Appointment Information Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "We couldn't find your appointment information."}
            </p>
            <Button onClick={() => navigate('/doctors')}>
              Book an Appointment
            </Button>
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
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3 text-medical-500" />
                  <div>
                    <p className="font-medium text-gray-900">Date</p>
                    <p>{appointment.date}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-3 text-medical-500" />
                  <div>
                    <p className="font-medium text-gray-900">Time</p>
                    <p>{appointment.time}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  {appointment.consultationType === "video" ? (
                    <Video className="h-5 w-5 mr-3 text-medical-500" />
                  ) : (
                    <MapPin className="h-5 w-5 mr-3 text-medical-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">Consultation Type</p>
                    <p>{appointment.consultationType === "video" ? "Video Consultation" : "In-Clinic Visit"}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="font-medium text-gray-900">Patient Details</p>
                  <p className="text-gray-800">Name: {appointment.patientName}</p>
                  <p className="text-gray-800">Email: {appointment.patientEmail}</p>
                  <p className="text-gray-800">Phone: {appointment.patientPhone}</p>
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