import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, MapPin, Phone } from "lucide-react";
import { format } from "date-fns";

interface Appointment {
  id: string;
  doctorId: number;
  doctorName: string;
  date: string;
  time: string;
  consultationType: string;
  status: "upcoming" | "completed" | "cancelled";
  symptoms: string;
}

const MyAppointments = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  // In a real app, this would come from an API
  const appointments: Appointment[] = [
    {
      id: "1",
      doctorId: 1,
      doctorName: "Dr. Emily Watson",
      date: "2024-03-20",
      time: "10:00",
      consultationType: "video",
      status: "upcoming",
      symptoms: "Regular checkup"
    },
    {
      id: "2",
      doctorId: 2,
      doctorName: "Dr. Michael Chen",
      date: "2024-03-15",
      time: "14:30",
      consultationType: "in-clinic",
      status: "completed",
      symptoms: "Fever and cold"
    }
  ];

  const upcomingAppointments = appointments.filter(
    app => app.status === "upcoming"
  );

  const pastAppointments = appointments.filter(
    app => app.status === "completed" || app.status === "cancelled"
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
            {(activeTab === "upcoming" ? upcomingAppointments : pastAppointments).map((appointment) => (
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
                        ${appointment.status === "upcoming" ? "bg-blue-100 text-blue-800" :
                          appointment.status === "completed" ? "bg-green-100 text-green-800" :
                          "bg-red-100 text-red-800"
                        }`}
                    >
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                </div>

                {appointment.status === "upcoming" && (
                  <div className="mt-4 flex space-x-4">
                    <Button variant="outline" className="w-full">
                      Reschedule
                    </Button>
                    <Button variant="destructive" className="w-full">
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