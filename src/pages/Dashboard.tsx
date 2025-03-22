import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAppointments } from "@/context/AppointmentContext";
import Layout from "@/components/layout/Layout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Calendar,
  ClipboardList,
  Clock,
  FileText,
  PackageOpen,
  Pill,
  Plus,
  User,
  Heart,
  Stethoscope,
  ArrowRight,
  BarChart3,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

// Updated medications array with prices from the provided list
const healthData = {
  vitals: {
    bloodPressure: {
      systolic: 120,
      diastolic: 80,
      lastChecked: "2024-03-20"
    },
    heartRate: {
      value: 72,
      lastChecked: "2024-03-20"
    },
    bloodSugar: {
      value: 95,
      lastChecked: "2024-03-19"
    }
  },
  medications: [
    {
      id: 1,
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      timeOfDay: "Morning and Evening",
      refillDate: "2024-04-10",
      price: 25
    },
    {
      id: 2,
      name: "Amlodipine",
      dosage: "5mg",
      frequency: "Once daily",
      timeOfDay: "Morning",
      refillDate: "2024-04-15",
      price: 15
    },
    {
      id: 5,
      name: "Telmisartan",
      dosage: "40mg",
      frequency: "Once daily",
      timeOfDay: "Morning",
      refillDate: "2024-04-20",
      price: 38
    }
  ],
  upcomingActions: [
    {
      id: 1,
      title: "Take Medication",
      description: "Metformin 500mg",
      time: "08:00 AM",
      completed: true
    },
    {
      id: 2,
      title: "Check Blood Pressure",
      description: "Log your morning reading",
      time: "09:00 AM",
      completed: false
    },
    {
      id: 3,
      title: "Take Medication",
      description: "Amlodipine 5mg",
      time: "08:00 PM",
      completed: false
    }
  ],
  recentReports: [
    {
      id: 1,
      title: "Blood Test Results",
      date: "2024-03-15",
      doctor: "Dr. Sarah Johnson",
      summary: "All values within normal range."
    },
    {
      id: 2,
      title: "Annual Checkup",
      date: "2024-02-10",
      doctor: "Dr. Michael Lee",
      summary: "Overall health is good. Follow up in 12 months."
    }
  ]
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { appointments } = useAppointments();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Filter upcoming appointments
    if (appointments && user) {
      const upcoming = appointments
        .filter(app => app.status === "confirmed" && app.patientName === user.name)
        .slice(0, 3); // Get only the 3 most recent
      setUpcomingAppointments(upcoming);
    }

    // In a real app, fetch orders from API
    // For now, use mock data with updated medications and prices
    setRecentOrders([
      {
        id: "ORD001",
        date: "2024-03-18",
        status: "processing",
        items: [
          { name: "Paracetamol 500mg", quantity: 2, price: 35 },
          { name: "Cetirizine 10mg", quantity: 1, price: 10 }
        ],
        totalAmount: 80 // 35*2 + 10
      },
      {
        id: "ORD002",
        date: "2024-03-15",
        status: "delivered",
        items: [
          { name: "Azithromycin 500mg", quantity: 1, price: 90 },
          { name: "Pantoprazole 40mg", quantity: 2, price: 40 }
        ],
        totalAmount: 170 // 90 + 40*2
      }
    ]);
  }, [appointments, user]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4 text-center">
          <div className="animate-pulse">Loading your health dashboard...</div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your dashboard</h1>
          <Button onClick={() => navigate("/login")}>Login</Button>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Health Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user.name}</p>
          </div>
          <div className="space-x-2">
            <Button asChild variant="outline">
              <Link to="/health-records">
                <FileText className="mr-2 h-4 w-4" />
                Health Records
              </Link>
            </Button>
            <Button asChild>
              <Link to="/online-consultation">
                <Plus className="mr-2 h-4 w-4" />
                New Consultation
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-xl mx-auto">
            <TabsTrigger value="overview" className="flex gap-2 items-center">
              <Activity className="h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex gap-2 items-center">
              <Calendar className="h-4 w-4" /> Appointments
            </TabsTrigger>
            <TabsTrigger value="medications" className="flex gap-2 items-center">
              <Pill className="h-4 w-4" /> Medications
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex gap-2 items-center">
              <PackageOpen className="h-4 w-4" /> Orders
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Health Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <Heart className="h-5 w-5 text-red-500 mr-2" />
                    Heart Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{healthData.vitals.heartRate.value} <span className="text-sm font-normal text-gray-500">bpm</span></div>
                  <p className="text-sm text-gray-500 mt-1">Last checked: {format(new Date(healthData.vitals.heartRate.lastChecked), "MMM d, yyyy")}</p>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Status</span>
                      <span className="font-medium text-green-600">Normal</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <Heart className="h-5 w-5 text-blue-500 mr-2" />
                    Blood Pressure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {healthData.vitals.bloodPressure.systolic}/{healthData.vitals.bloodPressure.diastolic} 
                    <span className="text-sm font-normal text-gray-500 ml-1">mmHg</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Last checked: {format(new Date(healthData.vitals.bloodPressure.lastChecked), "MMM d, yyyy")}</p>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Status</span>
                      <span className="font-medium text-green-600">Normal</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <BarChart3 className="h-5 w-5 text-purple-500 mr-2" />
                    Blood Sugar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{healthData.vitals.bloodSugar.value} <span className="text-sm font-normal text-gray-500">mg/dL</span></div>
                  <p className="text-sm text-gray-500 mt-1">Last checked: {format(new Date(healthData.vitals.bloodSugar.lastChecked), "MMM d, yyyy")}</p>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Status</span>
                      <span className="font-medium text-green-600">Normal</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/my-appointments" className="text-sm font-medium text-blue-600 hover:text-blue-800">View All</Link>
                    </Button>
                  </div>
                  <CardDescription>Your next scheduled consultations</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Stethoscope className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{appointment.doctorName}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {format(new Date(appointment.date), "MMM d, yyyy")} at {appointment.time}
                            </p>
                            <div className="flex items-center mt-2">
                              <Badge variant="outline" className="capitalize flex items-center gap-1">
                                {appointment.consultationType === "online" ? (
                                  <Sparkles className="h-3 w-3" />
                                ) : (
                                  <User className="h-3 w-3" />
                                )}
                                {appointment.consultationType}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">No upcoming appointments</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild 
                        className="mt-2"
                      >
                        <Link to="/doctors">Book Appointment</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Today's Schedule</CardTitle>
                    <Button variant="ghost" size="sm" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      Manage
                    </Button>
                  </div>
                  <CardDescription>Medications and health checks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {healthData.upcomingActions.map((action) => (
                      <div key={action.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                        <div className={`p-2 rounded-full ${action.completed ? 'bg-green-100' : 'bg-amber-100'}`}>
                          {action.title.includes("Medication") ? (
                            <Pill className={`h-5 w-5 ${action.completed ? 'text-green-600' : 'text-amber-600'}`} />
                          ) : (
                            <ClipboardList className={`h-5 w-5 ${action.completed ? 'text-green-600' : 'text-amber-600'}`} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className={`font-medium ${action.completed ? 'line-through text-gray-500' : ''}`}>{action.title}</p>
                            <Badge variant={action.completed ? "default" : "outline"} className={action.completed ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
                              {action.completed ? "Completed" : action.time}
                            </Badge>
                          </div>
                          <p className={`text-sm mt-1 ${action.completed ? 'text-gray-400' : 'text-gray-600'}`}>{action.description}</p>
                          {!action.completed && (
                            <Button variant="ghost" size="sm" className="text-xs mt-2 h-7 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                              Mark as Done
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Medical Reports</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/health-records" className="text-sm font-medium text-blue-600 hover:text-blue-800">View All</Link>
                  </Button>
                </div>
                <CardDescription>Your latest medical reports and test results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthData.recentReports.map((report) => (
                    <div key={report.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                      <div className="bg-indigo-100 p-2 rounded-full">
                        <FileText className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">{report.title}</p>
                          <p className="text-sm text-gray-500">{format(new Date(report.date), "MMM d, yyyy")}</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Doctor: {report.doctor}</p>
                        <p className="text-sm mt-1">{report.summary}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <Button asChild>
                    <Link to="/doctors">
                      <Plus className="mr-2 h-4 w-4" />
                      Book New
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4">
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
                                <User className="h-5 w-5 mr-2" />
                                <span className="capitalize">{appointment.consultationType} Consultation</span>
                              </div>
                            </div>
                          </div>
                          <Badge>Confirmed</Badge>
                        </div>
                        <div className="mt-4 flex space-x-4">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => navigate(`/reschedule-appointment/${appointment.id}`)}
                          >
                            Reschedule
                          </Button>
                          <Button 
                            variant="destructive" 
                            className="w-full"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">You don't have any upcoming appointments</p>
                    <Button asChild>
                      <Link to="/doctors">Book an Appointment</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-6">
                <Button variant="outline" asChild>
                  <Link to="/my-appointments">
                    View All Appointments
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Current Medications</CardTitle>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Medication
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthData.medications.map((medication) => (
                    <div key={medication.id} className="border rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-3 rounded-lg mr-4">
                          <Pill className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="text-lg font-semibold">
                              {medication.name} <span className="text-medical-500 font-medium">{medication.dosage}</span>
                            </h3>
                            <span className="font-medium text-medical-600">₹{medication.price}</span>
                          </div>
                          <p className="text-gray-600">{medication.frequency}</p>
                          <p className="text-sm text-gray-500 mt-1">Time: {medication.timeOfDay}</p>
                          <div className="mt-3 flex items-center">
                            <span className="text-sm text-gray-600">Refill by: </span>
                            <span className="text-sm font-medium ml-1">{format(new Date(medication.refillDate), "MMMM d, yyyy")}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-6">
                <Button variant="outline" asChild>
                  <Link to="/medicines">
                    Browse Medicines
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Orders</CardTitle>
                  <Button asChild>
                    <Link to="/medicines">
                      <Plus className="mr-2 h-4 w-4" />
                      New Order
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Order #{order.id}</h3>
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-5 w-5 mr-2" />
                              Ordered on {format(new Date(order.date), "MMMM d, yyyy")}
                            </div>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mt-4">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-t">
                              <div className="flex items-center">
                                <Pill className="h-5 w-5 text-gray-400 mr-3" />
                                <span>{item.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-gray-600">₹{item.price}</span>
                                <span className="text-gray-600 px-2 border-l border-gray-300">x{item.quantity}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 pt-3 border-t flex justify-between items-center">
                          <span className="font-medium">Total</span>
                          <span className="font-bold">₹{order.totalAmount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
                    <Button asChild>
                      <Link to="/medicines">Order Medicines</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-6">
                <Button variant="outline" asChild>
                  <Link to="/my-orders">
                    View All Orders
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard; 