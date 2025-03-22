'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Send, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }).optional(),
  subject: z.string().min(1, { message: "Please select a subject" }),
  orderId: z.string().optional(),
  message: z.string().min(20, { message: "Message must be at least 20 characters" })
    .max(1000, { message: "Message must be less than 1000 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContactPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Check if there's an order ID in the search params
  const orderId = searchParams.get('order');
  
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      phone: '',
      subject: orderId ? 'order' : '',
      orderId: orderId || '',
      message: '',
    },
  });
  
  // Submit handler
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Submit to database
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          user_id: user?.id,
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          subject: data.subject,
          order_id: data.orderId || null,
          message: data.message,
          status: 'new',
        });
      
      if (error) throw error;
      
      // Show success message
      setIsSubmitted(true);
      
      // Reset form
      form.reset();
      
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: "There was a problem submitting your message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3">Contact Us</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have a question or need assistance? Our team is here to help you.
            Fill out the form below and we'll get back to you as soon as possible.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  We'll respond to your inquiry within 24 hours
                </CardDescription>
              </CardHeader>
              
              {isSubmitted ? (
                <CardContent className="pt-6">
                  <div className="text-center py-6">
                    <div className="mx-auto mb-4 bg-green-100 rounded-full h-20 w-20 flex items-center justify-center">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Message Sent Successfully!</h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for contacting us. We've received your message and will respond as soon as possible.
                    </p>
                    <Button onClick={() => setIsSubmitted(false)}>Send Another Message</Button>
                  </div>
                </CardContent>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <CardContent className="space-y-6">
                      {/* Name and Email */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="your@email.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {/* Phone and Subject */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Your phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select subject" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="general">General Inquiry</SelectItem>
                                  <SelectItem value="order">Order Support</SelectItem>
                                  <SelectItem value="prescription">Prescription Help</SelectItem>
                                  <SelectItem value="product">Product Information</SelectItem>
                                  <SelectItem value="technical">Technical Support</SelectItem>
                                  <SelectItem value="feedback">Feedback</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {/* Order ID (conditional) */}
                      {form.watch('subject') === 'order' && (
                        <FormField
                          control={form.control}
                          name="orderId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Order ID</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your order ID" {...field} />
                              </FormControl>
                              <FormDescription>
                                Enter the order ID if you're inquiring about a specific order
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      {/* Message */}
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="How can we help you? Please provide details about your inquiry..." 
                                className="min-h-[120px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              {1000 - field.value.length} characters remaining
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full" 
                        size="lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>Sending Message...</>
                        ) : (
                          <>
                            Send Message
                            <Send className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              )}
            </Card>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Reach us through various channels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-sm text-gray-600 mt-1">+91 1234 567 890</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Monday to Saturday: 9:00 AM - 6:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-sm text-gray-600 mt-1">support@mediswift.com</p>
                    <p className="text-xs text-gray-500 mt-1">
                      We aim to respond within 24 hours
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Address</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      123 Health Avenue, Wellness Park<br />
                      Mumbai, 400001<br />
                      India
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 text-primary mt-0.5" />
                    <h3 className="font-medium text-sm">How long does delivery take?</h3>
                  </div>
                  <p className="text-sm text-gray-600 pl-6">
                    Standard delivery usually takes 3-7 business days, depending on your location.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 text-primary mt-0.5" />
                    <h3 className="font-medium text-sm">Can I cancel my order?</h3>
                  </div>
                  <p className="text-sm text-gray-600 pl-6">
                    Orders can be cancelled within 24 hours of placement, as long as they haven't been shipped.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 text-primary mt-0.5" />
                    <h3 className="font-medium text-sm">Do you accept returns?</h3>
                  </div>
                  <p className="text-sm text-gray-600 pl-6">
                    For safety reasons, we generally do not accept returns of medications. Please contact us if you received damaged items.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 text-primary mt-0.5" />
                    <h3 className="font-medium text-sm">How do I submit a prescription?</h3>
                  </div>
                  <p className="text-sm text-gray-600 pl-6">
                    You can upload your prescription during checkout or from your account dashboard for prescription-required medications.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 