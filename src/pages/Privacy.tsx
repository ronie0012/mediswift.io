
import PageTemplate from "@/components/layout/PageTemplate";

const Privacy = () => {
  return (
    <PageTemplate title="Privacy Policy" subtitle="How we collect, use, and protect your personal information">
      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">1. Introduction</h2>
          <p>
            At MediSwift, we are committed to protecting your privacy and the security of your personal information. This Privacy Policy explains how we collect, use, share, and protect your information when you use our website, mobile applications, and services (collectively, the "Services").
          </p>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">2. Information We Collect</h2>
          <h3 className="font-medium text-gray-800 mt-3 mb-1">2.1 Personal Information</h3>
          <p className="mb-2">
            We collect personal information that you provide directly to us, such as:
          </p>
          <ul className="list-disc pl-5 space-y-1 mb-3">
            <li>Contact information (name, email address, phone number, mailing address)</li>
            <li>Account information (username, password)</li>
            <li>Payment information (credit card details, billing address)</li>
            <li>Health information (medical history, prescriptions, health records)</li>
            <li>Demographic information (age, gender)</li>
          </ul>
          
          <h3 className="font-medium text-gray-800 mt-3 mb-1">2.2 Automatically Collected Information</h3>
          <p className="mb-2">
            When you use our Services, we automatically collect certain information, such as:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Device information (device type, operating system, browser type)</li>
            <li>Log information (IP address, access dates and times, pages viewed)</li>
            <li>Location information (with your consent)</li>
            <li>Usage information (features used, search queries, clicking behavior)</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">3. How We Use Your Information</h2>
          <p className="mb-2">
            We use your information for various purposes, including:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Providing and improving our Services</li>
            <li>Processing orders and payments</li>
            <li>Facilitating doctor consultations and appointments</li>
            <li>Coordinating ambulance services</li>
            <li>Managing your health records</li>
            <li>Communicating with you about our Services</li>
            <li>Sending promotional materials (with your consent)</li>
            <li>Analyzing usage patterns to improve user experience</li>
            <li>Protecting the security and integrity of our Services</li>
            <li>Complying with legal obligations</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">4. How We Share Your Information</h2>
          <p className="mb-2">
            We may share your information with:
          </p>
          <ul className="list-disc pl-5 space-y-1 mb-3">
            <li>Healthcare providers (doctors, pharmacists, hospitals) to facilitate your care</li>
            <li>Service providers who perform services on our behalf (payment processors, delivery partners)</li>
            <li>Business partners (with your consent)</li>
            <li>Legal authorities when required by law or to protect our rights</li>
          </ul>
          <p>
            We do not sell your personal information to third parties.
          </p>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">5. Security of Your Information</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, disclosure, alteration, and destruction. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
          </p>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">6. Your Rights and Choices</h2>
          <p className="mb-2">
            Depending on your location, you may have certain rights regarding your personal information, including:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access to your personal information</li>
            <li>Correction of inaccurate or incomplete information</li>
            <li>Deletion of your personal information</li>
            <li>Restriction or objection to certain processing activities</li>
            <li>Data portability</li>
            <li>Withdrawal of consent</li>
          </ul>
          <p className="mt-2">
            To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
          </p>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">7. Cookies and Similar Technologies</h2>
          <p>
            We use cookies and similar technologies to collect information about your browsing activities and to remember your preferences. You can manage your cookie preferences through your browser settings. However, if you disable cookies, some features of our Services may not function properly.
          </p>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">8. Children's Privacy</h2>
          <p>
            Our Services are not intended for children under the age of 18. We do not knowingly collect personal information from children under 18. If we learn that we have collected personal information from a child under 18, we will take steps to delete that information as soon as possible.
          </p>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">9. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated Privacy Policy on our website and changing the "Last Updated" date. Your continued use of our Services after such modifications will constitute your acknowledgment of the modified Privacy Policy.
          </p>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">10. Contact Us</h2>
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at privacy@mediswift.com or by mail at MediSwift Privacy Office, 123 Healthcare Ave, Medical District, NY 10001.
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

export default Privacy;
