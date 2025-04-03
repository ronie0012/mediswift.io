import React, { useEffect } from 'react';
import { useAppointments } from '../context/AppointmentContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';

const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    appointments, 
    isLoading, 
    error, 
    fetchUpcomingAppointments,
    cancelAppointment 
  } = useAppointments();

  useEffect(() => {
    if (user) {
      fetchUpcomingAppointments();
    }
  }, [user, fetchUpcomingAppointments]);

  const handleCancelAppointment = async (id: number) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await cancelAppointment(id);
      } catch (error) {
        console.error('Failed to cancel appointment:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading appointments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Error: {error}</p>
        <Button 
          onClick={() => fetchUpcomingAppointments()}
          variant="outline"
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Appointments</h1>
      
      {appointments.length === 0 ? (
        <div className="p-6 bg-muted rounded-lg text-center">
          <p className="text-muted-foreground">You don't have any upcoming appointments.</p>
          <Button className="mt-4" onClick={() => window.location.href = '/book-appointment'}>
            Book an Appointment
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {appointments.map((appointment) => (
            <div 
              key={appointment.id} 
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium">
                  Dr. {appointment.doctor?.user?.first_name} {appointment.doctor?.user?.last_name}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {appointment.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-1">
                {appointment.doctor?.specialization?.name}
              </p>
              
              <div className="my-3 border-t pt-3">
                <p className="text-sm mb-1">
                  <span className="font-medium">Date:</span> {format(new Date(appointment.appointment_date), 'PPP')}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-medium">Time:</span> {appointment.start_time} - {appointment.end_time}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Reason:</span> {appointment.reason}
                </p>
              </div>
              
              {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                <div className="mt-4">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancelAppointment(appointment.id)}
                  >
                    Cancel Appointment
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage; 