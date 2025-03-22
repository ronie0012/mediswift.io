'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { 
  Users, 
  Stethoscope, 
  Pill, 
  Calendar,
  CreditCard,
  ShoppingBag,
  PlusCircle,
  LayoutDashboard,
  RefreshCw,
  AlertTriangle,
  Package,
  DollarSign,
  Clock,
  TrendingUp,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Percent
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsData {
  totalUsers: number;
  totalDoctors: number;
  totalMedicines: number;
  totalAppointments: number;
  totalOrders: number;
  totalRevenue: number;
  recentAppointments: any[];
  recentOrders: any[];
  appointmentStats: {
    scheduled: number;
    completed: number;
    cancelled: number;
  };
  orderStats: {
    processing: number;
    delivered: number;
    cancelled: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalDoctors: 0,
    totalMedicines: 0,
    totalAppointments: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentAppointments: [],
    recentOrders: [],
    appointmentStats: {
      scheduled: 0,
      completed: 0,
      cancelled: 0,
    },
    orderStats: {
      processing: 0,
      delivered: 0,
      cancelled: 0,
    },
  });
  
  const supabase = createClientComponentClient<Database>();
  
  useEffect(() => {
    // Check if user is an admin
    if (!user) {
      router.push('/login?redirect=/admin/dashboard');
      return;
    }
    
    if (user && !isAdmin) {
      router.push('/dashboard');
      return;
    }
    
    fetchStats();
  }, [user, isAdmin, router]);
  
  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch total users
      const { count: userCount, error: userError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (userError) throw userError;
      
      // Fetch total doctors
      const { count: doctorCount, error: doctorError } = await supabase
        .from('doctors')
        .select('*', { count: 'exact', head: true });
      
      if (doctorError) throw doctorError;
      
      // Fetch total medicines
      const { count: medicineCount, error: medicineError } = await supabase
        .from('medicines')
        .select('*', { count: 'exact', head: true });
      
      if (medicineError) throw medicineError;
      
      // Fetch total appointments
      const { count: appointmentCount, error: appointmentError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true });
      
      if (appointmentError) throw appointmentError;
      
      // Fetch total orders
      const { count: orderCount, error: orderError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      if (orderError) throw orderError;
      
      // Fetch total revenue
      const { data: revenueData, error: revenueError } = await supabase
        .from('orders')
        .select('total_amount');
      
      if (revenueError) throw revenueError;
      
      const totalRevenue = revenueData.reduce((sum, order) => sum + order.total_amount, 0);
      
      // Fetch recent appointments
      const { data: recentAppointments, error: recentAppointmentsError } = await supabase
        .from('appointments')
        .select('*, doctors(name, specialty), users(name)')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (recentAppointmentsError) throw recentAppointmentsError;
      
      // Fetch recent orders
      const { data: recentOrders, error: recentOrdersError } = await supabase
        .from('orders')
        .select('*, users(name)')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (recentOrdersError) throw recentOrdersError;
      
      // Fetch appointment stats
      const { data: appointmentStatsData, error: appointmentStatsError } = await supabase
        .from('appointments')
        .select('status, count(*)')
        .filter('status', 'in', ['scheduled', 'completed', 'cancelled']);
      
      if (appointmentStatsError) throw appointmentStatsError;
      
      // Fetch order stats
      const { data: orderStatsData, error: orderStatsError } = await supabase
        .from('orders')
        .select('status, count(*)')
        .filter('status', 'in', ['processing', 'delivered', 'cancelled']);
      
      if (orderStatsError) throw orderStatsError;
      
      // Process appointment stats
      const appointmentStatusCounts = {
        scheduled: 0,
        completed: 0,
        cancelled: 0,
      };
      
      appointmentStatsData.forEach((stat: any) => {
        if (stat.status in appointmentStatusCounts) {
          appointmentStatusCounts[stat.status as keyof typeof appointmentStatusCounts] = stat.count;
        }
      });
      
      // Process order stats
      const orderStatusCounts = {
        processing: 0,
        delivered: 0,
        cancelled: 0,
      };
      
      orderStatsData.forEach((stat: any) => {
        if (stat.status in orderStatusCounts) {
          orderStatusCounts[stat.status as keyof typeof orderStatusCounts] = stat.count;
        }
      });
      
      // Set all stats
      setStats({
        totalUsers: userCount || 0,
        totalDoctors: doctorCount || 0,
        totalMedicines: medicineCount || 0,
        totalAppointments: appointmentCount || 0,
        totalOrders: orderCount || 0,
        totalRevenue,
        recentAppointments: recentAppointments || [],
        recentOrders: recentOrders || [],
        appointmentStats: appointmentStatusCounts,
        orderStats: orderStatusCounts,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      setError('Failed to load admin statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Prepare data for charts
  const appointmentChartData = [
    { name: 'Scheduled', value: stats.appointmentStats.scheduled },
    { name: 'Completed', value: stats.appointmentStats.completed },
    { name: 'Cancelled', value: stats.appointmentStats.cancelled },
  ];
  
  const orderChartData = [
    { name: 'Processing', value: stats.orderStats.processing },
    { name: 'Delivered', value: stats.orderStats.delivered },
    { name: 'Cancelled', value: stats.orderStats.cancelled },
  ];
  
  const revenueData = [
    { name: 'Jan', revenue: 12500 },
    { name: 'Feb', revenue: 15000 },
    { name: 'Mar', revenue: 18000 },
    { name: 'Apr', revenue: 16000 },
    { name: 'May', revenue: 21000 },
    { name: 'Jun', revenue: 19500 },
  ];
  
  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        </div>
        <div className="mt-6">
          <Button 
            onClick={fetchStats}
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <Stethoscope className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Doctors</p>
              <h3 className="text-2xl font-bold">{stats.totalDoctors}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <Pill className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Medicines</p>
              <h3 className="text-2xl font-bold">{stats.totalMedicines}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Appointments</p>
              <h3 className="text-2xl font-bold">{stats.totalAppointments}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <ShoppingBag className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-teal-100 p-3 rounded-full mr-4">
              <CreditCard className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</h3>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Dashboard Tabs */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="appointments">
            <Calendar className="h-4 w-4 mr-2" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`₹${value}`, 'Revenue']}
                      />
                      <Bar dataKey="revenue" fill="#4f46e5" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Appointment & Order Status Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Appointment Status</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={appointmentChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {appointmentChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Order Status</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {orderChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link href="/admin/users">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Users className="h-8 w-8 text-blue-600 mb-2" />
                  <h3 className="font-medium">Manage Users</h3>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/admin/doctors">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Stethoscope className="h-8 w-8 text-green-600 mb-2" />
                  <h3 className="font-medium">Manage Doctors</h3>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/admin/medicines">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Pill className="h-8 w-8 text-purple-600 mb-2" />
                  <h3 className="font-medium">Manage Medicines</h3>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/admin/orders">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <ShoppingBag className="h-8 w-8 text-red-600 mb-2" />
                  <h3 className="font-medium">Manage Orders</h3>
                </CardContent>
              </Card>
            </Link>
          </div>
        </TabsContent>
        
        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Appointment Management</h2>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Appointment
            </Button>
          </div>
          
          {/* Recent Appointments */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Appointments</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">Patient</th>
                      <th className="text-left py-3 px-4">Doctor</th>
                      <th className="text-left py-3 px-4">Date & Time</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentAppointments.map((appointment) => (
                      <tr key={appointment.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">#{appointment.id}</td>
                        <td className="py-3 px-4">{appointment.users?.name || 'Unknown'}</td>
                        <td className="py-3 px-4">{appointment.doctors?.name || 'Unknown'}</td>
                        <td className="py-3 px-4">
                          {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
                        </td>
                        <td className="py-3 px-4">{appointment.type}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4">
                <Link href="/admin/appointments">
                  <Button variant="outline" size="sm">View All Appointments</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Order Management</h2>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </div>
          
          {/* Recent Orders */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Order ID</th>
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Total</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">#{order.id}</td>
                        <td className="py-3 px-4">{order.users?.name || 'Unknown'}</td>
                        <td className="py-3 px-4">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">₹{order.total_amount.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4">
                <Link href="/admin/orders">
                  <Button variant="outline" size="sm">View All Orders</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 