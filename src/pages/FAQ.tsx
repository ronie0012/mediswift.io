import PageTemplate from "@/components/layout/PageTemplate";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MessageCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FAQ = () => {
  const generalFaqs = [
    {
      question: "How do I place an order for medicines?",
      answer: "You can place an order for medicines by browsing our medicine section, adding items to your cart, and proceeding to checkout. You'll need to upload a valid prescription for prescription medications."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept credit/debit cards, net banking, UPI, and cash on delivery for your convenience. All online payments are secured with industry-standard encryption."
    },
    {
      question: "How long does medicine delivery take?",
      answer: "Standard delivery typically takes 24-48 hours depending on your location. We also offer express delivery within 2-4 hours in selected areas for an additional fee."
    },
    {
      question: "Can I return medicines if I don't need them?",
      answer: "For safety and quality reasons, we generally do not accept returns for medicines. However, if you receive damaged or incorrect items, please contact our customer support within 24 hours for assistance."
    },
    {
      question: "Do you need a prescription for all medicines?",
      answer: "Prescription medications require a valid prescription from a licensed doctor. Over-the-counter (OTC) medicines can be purchased without a prescription."
    }
  ];

  const doctorFaqs = [
    {
      question: "How do I book an appointment with a doctor?",
      answer: "You can book an appointment by visiting our 'Find Doctors' section, selecting a doctor, and choosing an available time slot. You'll need to provide some basic information and pay the consultation fee to confirm your booking."
    },
    {
      question: "Can I consult with a doctor online?",
      answer: "Yes, we offer video, audio, and chat consultations with doctors. You can choose your preferred mode during the booking process."
    },
    {
      question: "How do I reschedule or cancel my appointment?",
      answer: "You can reschedule or cancel appointments through your account dashboard. Please note that cancellations made less than 2 hours before the appointment may incur a fee."
    },
    {
      question: "What specialties do your doctors cover?",
      answer: "Our platform includes doctors from various specialties including general medicine, pediatrics, dermatology, cardiology, orthopedics, gynecology, and many more."
    },
    {
      question: "Are the doctors on your platform verified?",
      answer: "Yes, all doctors on our platform are verified healthcare professionals with valid medical licenses. We conduct thorough background checks and credential verification before onboarding any doctor."
    }
  ];

  const emergencyFaqs = [
    {
      question: "How do I book an ambulance?",
      answer: "You can book an ambulance through our app or website by navigating to the 'Ambulance' section, entering your location, and confirming the booking. For urgent cases, please call our emergency hotline for faster assistance."
    },
    {
      question: "What types of ambulances do you provide?",
      answer: "We offer basic life support (BLS) and advanced life support (ALS) ambulances. BLS ambulances are equipped for non-critical patients, while ALS ambulances have advanced medical equipment and paramedics for critical cases."
    },
    {
      question: "How quickly can an ambulance reach my location?",
      answer: "Our ambulances typically reach urban locations within 15-20 minutes and suburban areas within 20-30 minutes, depending on traffic conditions and distance."
    },
    {
      question: "What should I do while waiting for the ambulance?",
      answer: "Stay calm, keep the patient in a comfortable position, provide basic first aid if you're trained, and keep the phone line open for our team to guide you until the ambulance arrives."
    },
    {
      question: "Is the ambulance service available 24/7?",
      answer: "Yes, our ambulance service is available 24 hours a day, 7 days a week, including holidays and weekends."
    }
  ];

  return (
    <PageTemplate title="Frequently Asked Questions" subtitle="Find answers to common questions about our services">
      <div className="space-y-8">
        <section>
          <div className="bg-blue-50 p-6 rounded-lg flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-grow">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Search for Answers</h2>
              <div className="flex gap-2">
                <Input placeholder="Type your question here..." className="flex-grow" />
                <Button className="bg-medical-500 hover:bg-medical-600">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-shrink-0 border-l border-blue-200 pl-6 hidden md:block">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-medical-500" />
                <div>
                  <h3 className="font-medium text-gray-800 text-sm">Still have questions?</h3>
                  <Button variant="link" className="h-auto p-0 text-medical-500">
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section>
          <Tabs defaultValue="general">
            <TabsList className="mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="doctors">Doctor Consultations</TabsTrigger>
              <TabsTrigger value="emergency">Emergency Services</TabsTrigger>
              <TabsTrigger value="orders">Orders & Delivery</TabsTrigger>
              <TabsTrigger value="account">My Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="mt-0">
              <Accordion type="single" collapsible className="w-full">
                {generalFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`general-${index}`}>
                    <AccordionTrigger className="text-left font-medium text-gray-800 hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
            
            <TabsContent value="doctors" className="mt-0">
              <Accordion type="single" collapsible className="w-full">
                {doctorFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`doctor-${index}`}>
                    <AccordionTrigger className="text-left font-medium text-gray-800 hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
            
            <TabsContent value="emergency" className="mt-0">
              <Accordion type="single" collapsible className="w-full">
                {emergencyFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`emergency-${index}`}>
                    <AccordionTrigger className="text-left font-medium text-gray-800 hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
            
            <TabsContent value="orders" className="mt-0">
              <p className="text-gray-600 p-4 text-center">
                Order and delivery FAQ content will appear here.
              </p>
            </TabsContent>
            
            <TabsContent value="account" className="mt-0">
              <p className="text-gray-600 p-4 text-center">
                Account-related FAQ content will appear here.
              </p>
            </TabsContent>
          </Tabs>
        </section>
        
        <section className="md:flex md:gap-8">
          <div className="md:w-1/2 bg-gray-50 p-6 rounded-lg mb-6 md:mb-0">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Popular Questions</h2>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-medical-600 hover:text-medical-700 hover:underline text-sm">
                  How can I track my medicine order?
                </a>
              </li>
              <li>
                <a href="#" className="text-medical-600 hover:text-medical-700 hover:underline text-sm">
                  Do you deliver to my location?
                </a>
              </li>
              <li>
                <a href="#" className="text-medical-600 hover:text-medical-700 hover:underline text-sm">
                  How do I upload my prescription?
                </a>
              </li>
              <li>
                <a href="#" className="text-medical-600 hover:text-medical-700 hover:underline text-sm">
                  Can I get a refund for canceled appointments?
                </a>
              </li>
              <li>
                <a href="#" className="text-medical-600 hover:text-medical-700 hover:underline text-sm">
                  How do I view my medical records?
                </a>
              </li>
            </ul>
          </div>
          
          <div className="md:w-1/2 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Didn't Find Your Answer?</h2>
            <p className="text-sm text-gray-600 mb-4">
              Our customer support team is here to help you with any questions or concerns you may have.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <MessageCircle className="h-5 w-5 text-medical-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 text-sm">Live Chat</h3>
                  <p className="text-xs text-gray-600">Available 24/7</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Phone className="h-5 w-5 text-medical-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 text-sm">Call Us</h3>
                  <p className="text-xs text-gray-600">+91 1800 123 4567</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Mail className="h-5 w-5 text-medical-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 text-sm">Email</h3>
                  <p className="text-xs text-gray-600">support@mediswift.com</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
};

import { Phone, Mail } from "lucide-react";
export default FAQ;
