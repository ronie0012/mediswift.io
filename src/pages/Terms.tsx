
import PageTemplate from "@/components/layout/PageTemplate";

const Terms = () => {
  return (
    <PageTemplate title="Terms of Service" subtitle="Please read these terms carefully before using our services">
      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">1. Introduction</h2>
          <p>
            Welcome to MediSwift. These Terms of Service ("Terms") govern your use of our website, mobile applications, and services (collectively, the "Services"). By using our Services, you agree to these Terms. If you do not agree to these Terms, you may not use our Services.
          </p>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">2. Use of Services</h2>
          <p className="mb-2">
            Our Services provide a platform for users to access healthcare services, including but not limited to medicine delivery, doctor consultations, ambulance booking, and health record management. You must be at least 18 years old to use our Services.
          </p>
          <p>
            You agree to use our Services only for lawful purposes and in accordance with these Terms. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">3. Medical Information</h2>
          <p className="mb-2">
            The medical information provided through our Services is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
          </p>
          <p>
            Never disregard professional medical advice or delay in seeking it because of something you have read or heard through our Services. If you think you may have a medical emergency, call your doctor or emergency services immediately.
          </p>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">4. Prescriptions and Medications</h2>
          <p className="mb-2">
            When you upload a prescription to our platform, you represent and warrant that it is valid, current, and issued by a licensed healthcare provider. We reserve the right to verify the authenticity of prescriptions before processing orders for prescription medications.
          </p>
          <p>
            You acknowledge that certain medications may require additional documentation or verification, and that we may refuse to process orders for prescription medications if we have reason to believe the prescription is invalid or inappropriate.
          </p>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">5. Doctor Consultations</h2>
          <p>
            Doctor consultations provided through our platform are for general health information and do not establish a doctor-patient relationship. The consulting doctors provide general advice based on the information you provide, but cannot perform physical examinations or procedures through our platform. The doctors reserve the right to refuse consultation if they determine your condition requires in-person evaluation.
          </p>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">6. Privacy</h2>
          <p>
            Your privacy is important to us. Our Privacy Policy describes how we collect, use, and share your personal information. By using our Services, you consent to our collection, use, and sharing of your information as described in our Privacy Policy.
          </p>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">7. Payments and Refunds</h2>
          <p className="mb-2">
            Payments for our Services are processed through secure payment gateways. By providing payment information, you represent and warrant that you are authorized to use the payment method and authorize us to charge your payment method for the total amount of your order or booking.
          </p>
          <p>
            Our refund policy varies depending on the service. For medicine orders, refunds are generally only provided for damaged or incorrect items reported within 24 hours of delivery. For doctor consultations, refunds may be provided for canceled appointments according to our cancellation policy.
          </p>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">8. Intellectual Property</h2>
          <p>
            All content, features, and functionality on our Services, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, and software, are owned by MediSwift, its licensors, or other providers of such material and are protected by copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">9. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by applicable law, MediSwift shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to, damages for loss of profits, goodwill, use, data, or other intangible losses, resulting from your access to or use of or inability to access or use the Services.
          </p>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">10. Changes to Terms</h2>
          <p>
            We may revise these Terms from time to time. The most current version will always be posted on our website. By continuing to use our Services after those revisions become effective, you agree to be bound by the revised Terms.
          </p>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">11. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at legal@mediswift.com or by mail at MediSwift Legal Department, 123 Healthcare Ave, Medical District, NY 10001.
          </p>
        </section>
        
        <section>
          <p className="text-sm text-gray-500 mt-8">
            Last Updated: July 1, 2023
          </p>
        </section>
      </div>
    </PageTemplate>
  );
};

export default Terms;
