import PageTemplate from "@/components/layout/PageTemplate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowDownNarrowWide, Banknote, RefreshCcw, AlertCircle, Clock, Check, X, HelpCircle } from "lucide-react";

const Refund = () => {
  const medicineFaq = [
    {
      question: "How long does it take to process a refund for medicines?",
      answer: "Refunds for medicines are typically processed within 5-7 business days after your return is received and inspected. Once processed, it may take an additional 3-5 business days for the refund to appear in your account, depending on your payment method."
    },
    {
      question: "Can I return opened medicine packages?",
      answer: "For safety and quality reasons, we cannot accept returns of opened medicine packages or medications that have been dispensed from their original packaging. This policy is in place to ensure the safety and integrity of all medicines we distribute."
    },
    {
      question: "What if I receive damaged or incorrect medicines?",
      answer: "If you receive damaged or incorrect medicines, please contact our customer support within 24 hours of delivery with photos of the damaged items or details of the incorrect items. We will arrange for a replacement or refund as appropriate."
    },
    {
      question: "Are there any medicines that cannot be returned?",
      answer: "Yes, certain categories of medicines cannot be returned, including refrigerated medications, controlled substances, and custom-compounded medications. Additionally, any medicine requiring special storage conditions cannot be returned once delivered."
    }
  ];

  const consultationFaq = [
    {
      question: "What is your cancellation policy for doctor consultations?",
      answer: "You can cancel a scheduled consultation up to 2 hours before the appointment time for a full refund. Cancellations made less than 2 hours before the appointment will incur a 50% cancellation fee. No refunds are provided for missed appointments without prior notice."
    },
    {
      question: "What if I experience technical issues during my consultation?",
      answer: "If you experience technical issues that significantly impact your consultation (e.g., video/audio not working properly), please report it to our support team within 1 hour after the scheduled appointment. We will investigate and may offer a free rescheduling or partial/full refund depending on the circumstances."
    },
    {
      question: "Can I get a refund if the doctor doesn't join the consultation?",
      answer: "Yes, if the doctor fails to join the scheduled consultation, you will receive a full refund automatically. You'll also have the option to reschedule with the same doctor or choose a different healthcare provider."
    },
    {
      question: "Are follow-up consultations refundable?",
      answer: "Complimentary follow-up consultations are not refundable as they are provided free of charge. For paid follow-up consultations, the same refund policy applies as for regular consultations."
    }
  ];

  return (
    <PageTemplate title="Refund Policy" subtitle="Our guidelines for returns, cancellations, and refunds">
      <div className="space-y-8">
        <section>
          <p className="text-gray-600">
            At MediSwift, we strive to ensure your complete satisfaction with our services. This Refund Policy 
            outlines the conditions under which we provide refunds for different services including medicine 
            orders, doctor consultations, and other healthcare services.
          </p>
        </section>
        
        <section>
          <Tabs defaultValue="medicines">
            <TabsList className="mb-6 w-full justify-start">
              <TabsTrigger value="medicines">Medicine Orders</TabsTrigger>
              <TabsTrigger value="consultations">Doctor Consultations</TabsTrigger>
              <TabsTrigger value="tests">Lab Tests</TabsTrigger>
              <TabsTrigger value="packages">Health Packages</TabsTrigger>
            </TabsList>
            
            <TabsContent value="medicines" className="space-y-6">
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Medicine Refund Policy</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-medical-100 p-2 rounded-full mr-3">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">Eligible for Refund</h3>
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                        <li>Damaged medicines reported within 24 hours of delivery</li>
                        <li>Incorrect medicines or wrong items shipped</li>
                        <li>Order cancellation before shipment</li>
                        <li>Expired or near-expiry medications (less than 3 months to expiry date)</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-red-100 p-2 rounded-full mr-3">
                      <X className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">Not Eligible for Refund</h3>
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                        <li>Opened medicine packages or tampered seals</li>
                        <li>Refrigerated medicines once delivered</li>
                        <li>Controlled substances and narcotic drugs</li>
                        <li>Custom-compounded medications</li>
                        <li>Issues reported after 24 hours of delivery</li>
                        <li>Personal preferences (e.g., changed mind about the medication)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">How to Request a Refund for Medicines</h2>
                <ol className="space-y-3">
                  <li className="flex items-start">
                    <div className="bg-blue-100 rounded-full h-6 w-6 flex items-center justify-center font-medium text-medical-600 mr-3 mt-0.5">1</div>
                    <div>
                      <h3 className="font-medium text-gray-800">Contact Customer Support</h3>
                      <p className="text-sm text-gray-600">Reach out to our customer support team within 24 hours of delivery through phone, email, or chat.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-100 rounded-full h-6 w-6 flex items-center justify-center font-medium text-medical-600 mr-3 mt-0.5">2</div>
                    <div>
                      <h3 className="font-medium text-gray-800">Provide Order Details</h3>
                      <p className="text-sm text-gray-600">Share your order ID, details of the issue, and supporting photos if applicable.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-100 rounded-full h-6 w-6 flex items-center justify-center font-medium text-medical-600 mr-3 mt-0.5">3</div>
                    <div>
                      <h3 className="font-medium text-gray-800">Return the Product (if required)</h3>
                      <p className="text-sm text-gray-600">In some cases, we may arrange for the pickup of the incorrect or damaged items.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-100 rounded-full h-6 w-6 flex items-center justify-center font-medium text-medical-600 mr-3 mt-0.5">4</div>
                    <div>
                      <h3 className="font-medium text-gray-800">Refund Processing</h3>
                      <p className="text-sm text-gray-600">Once approved, refunds will be processed to the original payment method within 5-7 business days.</p>
                    </div>
                  </li>
                </ol>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible>
                  {medicineFaq.map((faq, index) => (
                    <AccordionItem key={index} value={`medicine-faq-${index}`}>
                      <AccordionTrigger className="text-left font-medium text-gray-800 hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </TabsContent>
            
            <TabsContent value="consultations" className="space-y-6">
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Doctor Consultation Refund Policy</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-medical-100 p-2 rounded-full mr-3">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">Eligible for Refund</h3>
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                        <li>Cancellation more than 2 hours before appointment (full refund)</li>
                        <li>Doctor unavailability during scheduled appointment</li>
                        <li>Significant technical issues that prevent consultation</li>
                        <li>Doctor recommends in-person visit before starting consultation</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-red-100 p-2 rounded-full mr-3">
                      <X className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">Not Eligible for Full Refund</h3>
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                        <li>Cancellation less than 2 hours before appointment (50% refund)</li>
                        <li>No-show for scheduled appointment</li>
                        <li>Consultation completed but patient dissatisfied with advice</li>
                        <li>Minor technical issues that don't significantly impact consultation</li>
                        <li>Complimentary follow-up consultations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Cancellation and Rescheduling</h2>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg md:flex-1">
                    <div className="flex items-center mb-2">
                      <RefreshCcw className="h-5 w-5 text-medical-500 mr-2" />
                      <h3 className="font-medium text-gray-800">Rescheduling</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      You can reschedule your appointment up to 1 hour before the scheduled time without any charges.
                      Rescheduling is done through your account dashboard under "My Appointments."
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg md:flex-1">
                    <div className="flex items-center mb-2">
                      <Clock className="h-5 w-5 text-medical-500 mr-2" />
                      <h3 className="font-medium text-gray-800">Cancellation Timeline</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• More than 2 hours before: 100% refund</li>
                      <li>• 1-2 hours before: 50% refund</li>
                      <li>• Less than 1 hour before: No refund</li>
                      <li>• Missed appointment: No refund</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible>
                  {consultationFaq.map((faq, index) => (
                    <AccordionItem key={index} value={`consultation-faq-${index}`}>
                      <AccordionTrigger className="text-left font-medium text-gray-800 hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </TabsContent>
            
            <TabsContent value="tests" className="space-y-6">
              <p className="text-gray-600 p-4 text-center">
                Lab test refund policy information will appear here.
              </p>
            </TabsContent>
            
            <TabsContent value="packages" className="space-y-6">
              <p className="text-gray-600 p-4 text-center">
                Health package refund policy information will appear here.
              </p>
            </TabsContent>
          </Tabs>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Refund Processing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 text-center">
              <div className="bg-blue-100 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-3">
                <ArrowDownNarrowWide className="h-6 w-6 text-medical-600" />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Request Submission</h3>
              <p className="text-sm text-gray-600">
                Submit your refund request through our customer support channels with all necessary details.
              </p>
            </div>
            
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 text-center">
              <div className="bg-blue-100 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="h-6 w-6 text-medical-600" />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Request Review</h3>
              <p className="text-sm text-gray-600">
                Our team reviews your request within 24-48 hours against our refund eligibility criteria.
              </p>
            </div>
            
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 text-center">
              <div className="bg-blue-100 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-3">
                <Banknote className="h-6 w-6 text-medical-600" />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Refund Processing</h3>
              <p className="text-sm text-gray-600">
                Once approved, refunds are processed to the original payment method within 5-7 business days.
              </p>
            </div>
          </div>
        </section>
        
        <section className="flex items-center gap-4 bg-blue-50 p-5 rounded-lg">
          <HelpCircle className="h-8 w-8 text-medical-500 flex-shrink-0" />
          <div>
            <h2 className="font-medium text-gray-800 mb-1">Need Assistance with Refunds?</h2>
            <p className="text-gray-600">If you have any questions about our refund policy, please contact our customer service team at <a href="mailto:support@mediswift.com" className="text-medical-500 hover:underline">support@mediswift.com</a> or call <span className="font-medium">+91 1800 123 4567</span>.</p>
          </div>
        </section>
        
        <section>
          <p className="text-sm text-gray-500">
            Last Updated: July 1, 2023. MediSwift reserves the right to modify this refund policy at any time. Any changes will be effective immediately upon posting.
          </p>
        </section>
      </div>
    </PageTemplate>
  );
};

export default Refund;
