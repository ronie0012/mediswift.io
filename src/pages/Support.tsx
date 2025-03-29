import PageTemplate from "@/components/layout/PageTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MessageCircle, Clock, FileText, HelpCircle } from "lucide-react";

const Support = () => {
  return (
    <PageTemplate title="Customer Support" subtitle="We're here to help you with any issues or questions">
      <div className="space-y-8">
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Phone className="h-5 w-5 text-medical-500" />
                  Call Us
                </CardTitle>
                <CardDescription>Speak directly with our support team</CardDescription>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold mb-1 flex items-center gap-2 text-gray-800">
                  <Phone className="h-5 w-5 text-medical-500" />
                  Customer Support Hotline
                </h3>
                <p className="text-gray-700 font-medium mb-2">+91 1800 123 4567</p>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>24/7 Customer Support</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mail className="h-5 w-5 text-medical-500" />
                  Email Us
                </CardTitle>
                <CardDescription>Get detailed answers to complex questions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 font-medium mb-2">support@mediswift.com</p>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Response within 24 hours</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="h-5 w-5 text-medical-500" />
                  Live Chat
                </CardTitle>
                <CardDescription>Instant assistance for quick queries</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-medical-500 hover:bg-medical-600 mb-2">
                  Start Chat
                </Button>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Available 24/7</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Contact Us</h2>
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <Input id="name" placeholder="Your full name" />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input id="phone" placeholder="Your phone number" />
                </div>
                
                <div>
                  <label htmlFor="issue-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Type
                  </label>
                  <Select>
                    <SelectTrigger id="issue-type">
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="order">Order Issue</SelectItem>
                      <SelectItem value="delivery">Delivery Problem</SelectItem>
                      <SelectItem value="payment">Payment Concern</SelectItem>
                      <SelectItem value="appointment">Appointment Issue</SelectItem>
                      <SelectItem value="account">Account Problem</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="order-id" className="block text-sm font-medium text-gray-700 mb-1">
                    Order/Appointment ID (if applicable)
                  </label>
                  <Input id="order-id" placeholder="Enter ID if relevant to your query" />
                </div>
                
                <div className="flex-grow">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <Textarea id="message" placeholder="Please describe your issue in detail" className="min-h-[120px]" />
                </div>
                
                <div className="pt-4">
                  <Button className="w-full bg-medical-500 hover:bg-medical-600">
                    Submit Request
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Help</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-5 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-medical-500" />
                Common Issues
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-medical-600 hover:text-medical-700 hover:underline flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>How to track my order?</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-medical-600 hover:text-medical-700 hover:underline flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>Cancellation and refund policy</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-medical-600 hover:text-medical-700 hover:underline flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>How to reschedule an appointment?</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-medical-600 hover:text-medical-700 hover:underline flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>Issues with payment processing</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-medical-600 hover:text-medical-700 hover:underline flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>How to update my account information?</span>
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-5 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-medical-500" />
                Self-Service
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Save time by using our self-service options for common tasks:
              </p>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Track Your Order
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  View/Cancel Appointments
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Download Invoices
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Update Payment Methods
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Manage Prescriptions
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <section className="bg-gray-50 p-6 rounded-lg text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Emergency Support</h2>
          <p className="text-gray-600 mb-4">
            For medical emergencies, please call our emergency hotline immediately:
          </p>
          <div className="inline-block bg-emergency-500 text-white px-6 py-3 rounded-lg font-bold text-xl">
            1-800-911-MEDI
          </div>
          <p className="text-sm text-gray-500 mt-4">
            For non-emergency issues, please use the contact methods above.
          </p>
        </section>
      </div>
    </PageTemplate>
  );
};

export default Support;
