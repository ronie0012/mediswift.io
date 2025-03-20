import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppointments } from "@/context/AppointmentContext";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, MapPin, Phone } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Appointment {
  id: number;
  doctorId: number;
  doctorName: string;
  patientName: string;
  date: string;
  time: string;
  consultationType: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  symptoms: string;
}

const MyAppointments = () => {
  const { user } = useAuth();
  const { appointments, cancelAppointment } = useAppointments();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const handleCancel = async (appointmentId: number) => {
    try {
      await cancelAppointment(appointmentId);
      toast.success("Appointment cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel appointment");
    }
  };

  const handleReschedule = (appointmentId: number) => {
    navigate(`/reschedule-appointment/${appointmentId}`);
  };

  const upcomingAppointments = appointments.filter(
    app => app.status === "confirmed"
  );

  const pastAppointments = appointments.filter(
    app => app.status === "cancelled"
  );

  const getConsultationIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5" />;
      case "in-clinic":
        return <MapPin className="h-5 w-5" />;
      case "phone":
        return <Phone className="h-5 w-5" />;
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to view your appointments</h1>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">My Appointments</h1>

          <div className="flex space-x-4 mb-6">
            <Button
              variant={activeTab === "upcoming" ? "default" : "outline"}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming
            </Button>
            <Button
              variant={activeTab === "past" ? "default" : "outline"}
              onClick={() => setActiveTab("past")}
            >
              Past
            </Button>
          </div>

          <div className="space-y-4">
            {(activeTab === "upcoming" ? upcomingAppointments : pastAppointments)
              .filter(appointment => appointment.patientName === user.name)
              .map(appointment => (
                <div
                  key={appointment.id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{appointment.doctorName}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-5 w-5 mr-2" />
                          {format(new Date(appointment.date), "MMMM d, yyyy")}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-5 w-5 mr-2" />
                          {appointment.time}
                        </div>
                        <div className="flex items-center text-gray-600">
                          {getConsultationIcon(appointment.consultationType)}
                          <span className="ml-2 capitalize">{appointment.consultationType} Consultation</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                          ${appointment.status === "confirmed" ? "bg-blue-100 text-blue-800" :
                            appointment.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }`}
                      >
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {appointment.status === "confirmed" && (
                    <div className="mt-4 flex space-x-4">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleReschedule(appointment.id)}
                      >
                        Reschedule
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => handleCancel(appointment.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              ))}

            {(activeTab === "upcoming" ? upcomingAppointments : pastAppointments).length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No {activeTab} appointments found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyAppointments; 