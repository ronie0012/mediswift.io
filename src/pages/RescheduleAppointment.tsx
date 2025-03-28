import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useAppointments } from "@/context/AppointmentContext";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { format } from "date-fns";
import { doctorsData } from "@/data/doctors";

const RescheduleAppointment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { appointments, cancelAppointment, addAppointment } = useAppointments();
  const [loading, setLoading] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  // Find the current appointment
  const currentAppointment = appointments.find(apt => apt.id === parseInt(id || "", 10));

  // Find the doctor data
  const doctorData = doctorsData.find(doctor => doctor.id === currentAppointment?.doctorId);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Get date 30 days from now in YYYY-MM-DD format
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  useEffect(() => {
    if (!currentAppointment) {
      toast.error("Appointment not found");
      navigate("/my-appointments");
      return;
    }

    if (!doctorData) {
      toast.error("Doctor not found");
      navigate("/my-appointments");
      return;
    }
  }, [currentAppointment, doctorData, navigate, toast]);

  useEffect(() => {
    if (doctorData && appointmentDate) {
      const slots = doctorData.availableSlots[appointmentDate] || [];
      setAvailableTimeSlots(slots);
      setAppointmentTime(""); // Reset time when date changes
    } else {
      setAvailableTimeSlots([]);
      setAppointmentTime("");
    }
  }, [appointmentDate, doctorData]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setAppointmentDate(selectedDate);
    setAppointmentTime(""); // Reset time when date changes
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAppointmentTime(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentAppointment || !doctorData) {
      return;
    }

    if (!appointmentDate || !appointmentTime) {
      toast.error("Please select both date and time");
      return;
    }

    setLoading(true);
    
    try {
      // Cancel the current appointment
      await cancelAppointment(currentAppointment.id);

      // Create a new appointment with the updated date and time
      await addAppointment({
        doctorId: doctorData.id,
        doctorName: doctorData.name,
        patientName: currentAppointment.patientName,
        patientAge: currentAppointment.patientAge,
        patientPhone: currentAppointment.patientPhone,
        symptoms: currentAppointment.symptoms,
        date: appointmentDate,
        time: appointmentTime,
        consultationType: currentAppointment.consultationType,
      });

      toast.success("Appointment rescheduled successfully");
      navigate("/my-appointments");
    } catch (error) {
      toast.error("Failed to reschedule appointment");
    } finally {
      setLoading(false);
    }
  };

  if (!currentAppointment || !doctorData) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate("/my-appointments")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Appointments
          </Button>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h1 className="text-2xl font-bold">Reschedule Appointment</h1>
              <p className="text-gray-600 mt-2">
                Current appointment with {doctorData.name} on{" "}
                {format(new Date(currentAppointment.date), "MMMM d, yyyy")} at{" "}
                {currentAppointment.time}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date">New Date</Label>
                  <Input
                    id="date"
                    type="date"
                    min={today}
                    max={maxDate}
                    value={appointmentDate}
                    onChange={handleDateChange}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">New Time</Label>
                  <select
                    id="time"
                    value={appointmentTime}
                    onChange={handleTimeChange}
                    className="w-full p-2 border rounded-md"
                    disabled={!appointmentDate}
                  >
                    <option value="">Select a time slot</option>
                    {availableTimeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={loading || !appointmentDate || !appointmentTime}
              >
                {loading ? "Rescheduling..." : "Confirm Reschedule"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RescheduleAppointment; 