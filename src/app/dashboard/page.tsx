'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { format } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  User, 
  Package, 
  CreditCard, 
  ChevronRight,
  Activity,
  Calendar as CalendarIcon,
  Pill,
  FileText,
  Home,
  AlertTriangle
} from 'lucide-react';

interface Appointment {
  id: number;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  status: string;
  type: string;
  notes: string | null;
  doctors: {
    name: string;
    specialty: string;
    image: string;
  };
}

interface Order {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: {
    id: number;
    medicine_id: number;
    quantity: number;
    medicines: {
      name: string;
    };
  }[];
}

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processing: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  'out-for-delivery': 'bg-blue-100 text-blue-800 border-blue-200',
  'pending-payment': 'bg-orange-100 text-orange-800 border-orange-200',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClientComponentClient<Database>();
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*, doctors(name, specialty, image)')
          .eq('user_id', user.id)
          .order('appointment_date', { ascending: false });
        
        if (appointmentsError) throw appointmentsError;
        
        // Fetch orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*, order_items(id, medicine_id, quantity, medicines(name))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (ordersError) throw ordersError;
        
        setAppointments(appointmentsData as Appointment[]);
        setOrders(ordersData as Order[]);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load your data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, supabase]);
  
  // Show loading state
  if (loading || profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* User Overview Section */}
      <div className="mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  Welcome back, {profile?.name || user?.email?.split('@')[0] || 'User'}!
                </h2>
                <p className="text-gray-600">
                  {user?.email}
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex gap-2">
                <Link href="/medicines">
                  <Button variant="outline">
                    <Pill className="mr-2 h-4 w-4" />
                    Browse Medicines
                  </Button>
                </Link>
                <Link href="/doctors">
                  <Button>
                    <User className="mr-2 h-4 w-4" />
                    Find Doctors
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Dashboard Tabs */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="appointments">
            <Calendar className="h-4 w-4 mr-2" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="orders">
            <Package className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
        </TabsList>
        
        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Your Appointments</h2>
            <Link href="/doctors">
              <Button variant="outline">
                Book New Appointment
              </Button>
            </Link>
          </div>
          
          {appointments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-4 bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center">
                  <CalendarIcon className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Appointments Yet</h3>
                <p className="text-gray-600 mb-4">You haven't booked any appointments yet.</p>
                <Link href="/doctors">
                  <Button>Find a Doctor</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex gap-4 items-start">
                        <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={appointment.doctors.image || '/placeholder-doctor.jpg'}
                            alt={appointment.doctors.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        
                        <div>
                          <h3 className="font-medium">{appointment.doctors.name}</h3>
                          <p className="text-sm text-gray-600">{appointment.doctors.specialty}</p>
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              <span>{format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{appointment.appointment_time}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Activity className="h-4 w-4 mr-1" />
                              <span>{appointment.type}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:items-end gap-2">
                        <Badge className={`${statusColors[appointment.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Badge>
                        
                        <Link href={`/appointments/${appointment.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Your Orders</h2>
            <Link href="/medicines">
              <Button variant="outline">
                Order Medicines
              </Button>
            </Link>
          </div>
          
          {orders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-4 bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Orders Yet</h3>
                <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                <Link href="/medicines">
                  <Button>Browse Medicines</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">Order #{order.id}</h3>
                          <Badge className={`${statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          Placed on {format(new Date(order.created_at), 'MMM dd, yyyy')}
                        </p>
                        
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            {order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'}:
                            {order.order_items.slice(0, 2).map((item, i) => (
                              <span key={item.id}>
                                {i > 0 && ', '}
                                {item.quantity}x {item.medicines.name}
                              </span>
                            ))}
                            {order.order_items.length > 2 && `, and ${order.order_items.length - 2} more`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:items-end gap-2">
                        <p className="font-medium">₹{order.total_amount.toFixed(2)}</p>
                        
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <h2 className="text-2xl font-semibold">Your Profile</h2>
          
          <ProfileForm />
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FileText className="h-5 w-5 text-blue-700" />
                  </div>
                  <h3 className="font-medium">Medical Records</h3>
                </div>
                <p className="text-gray-600 mb-4">Store and access your medical records securely.</p>
                <Button variant="outline" className="w-full">
                  Manage Records
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Home className="h-5 w-5 text-purple-700" />
                  </div>
                  <h3 className="font-medium">Delivery Addresses</h3>
                </div>
                <p className="text-gray-600 mb-4">Manage your delivery addresses for medicine orders.</p>
                <Button variant="outline" className="w-full">
                  Manage Addresses
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CreditCard className="h-5 w-5 text-green-700" />
                  </div>
                  <h3 className="font-medium">Payment Methods</h3>
                </div>
                <p className="text-gray-600 mb-4">Manage your saved payment methods for easier checkout.</p>
                <Button variant="outline" className="w-full">
                  Manage Payments
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 