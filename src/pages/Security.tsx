import Layout from "@/components/layout/Layout";
import { Shield, Lock, Eye, Database, CreditCard, FileText, Check } from "lucide-react";
import { motion } from "framer-motion";

const Section = ({
  icon: Icon,
  title,
  color,
  children,
}: {
  icon: React.ElementType;
  title: string;
  color: string;
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
  >
    <div className={`${color} px-6 py-4 flex items-center gap-3`}>
      <Icon className="h-5 w-5 text-white" />
      <h2 className="font-display font-bold text-white text-lg">{title}</h2>
    </div>
    <div className="p-6 space-y-3 text-gray-600 text-sm leading-relaxed">{children}</div>
  </motion.div>
);

const Point = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2">
    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
    <span>{children}</span>
  </div>
);

const Security = () => (
  <Layout>
    <div className="bg-gradient-to-b from-medical-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-medical-100 mb-4">
            <Shield className="h-8 w-8 text-medical-600" />
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-3">Security Practices</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            At MediSwift, protecting your health data and personal information is our highest priority. Here's a
            transparent overview of the security measures we employ.
          </p>
        </motion.div>

        <div className="space-y-5">
          <Section icon={Lock} title="1. Encryption" color="bg-blue-500">
            <Point>
              <strong>Passwords hashed with bcrypt</strong>: All user passwords are never stored in plain text. We use Django's
              built-in PBKDF2-SHA256 algorithm (compatible with bcrypt standards) with a random salt per user,
              making brute-force attacks computationally infeasible.
            </Point>
            <Point>
              <strong>Data in transit — HTTPS / TLS 1.3</strong>: Every API call between your browser and our
              servers is encrypted using TLS 1.3. Unencrypted HTTP traffic is automatically redirected to HTTPS.
            </Point>
            <Point>
              <strong>Prescriptions encrypted at rest</strong>: Uploaded prescription files are stored with
              server-side AES-256 encryption. Only authenticated pharmacists with the correct role can decrypt
              and access them.
            </Point>
            <Point>
              <strong>JWT Tokens</strong>: Authentication uses short-lived JSON Web Tokens (30-minute expiry).
              Refresh tokens are stored securely and rotated on use.
            </Point>
          </Section>

          <Section icon={Eye} title="2. Data Validation & Input Security" color="bg-purple-500">
            <Point>
              <strong>XSS Prevention</strong>: All user-supplied input is sanitized on both the frontend (React's
              JSX auto-escaping) and backend (Django's template engine) before being rendered, preventing
              Cross-Site Scripting attacks.
            </Point>
            <Point>
              <strong>SQL Injection Prevention</strong>: We use Django ORM's parameterized queries exclusively. No
              raw SQL is crafted from user input, eliminating SQL injection vectors.
            </Point>
            <Point>
              <strong>CSRF Protection</strong>: Django's built-in CSRF middleware is active. All state-changing
              API calls require a valid CSRF token or a Bearer JWT, preventing cross-site request forgery.
            </Point>
            <Point>
              <strong>File Upload Validation</strong>: Prescription uploads are validated for MIME type and file
              size limits server-side to prevent malicious file injection.
            </Point>
          </Section>

          <Section icon={CreditCard} title="3. Payment Security" color="bg-green-500">
            <Point>
              <strong>PCI-DSS Compliance</strong>: Payments are processed through Razorpay (India) and Stripe
              (International), both of which are PCI-DSS Level 1 certified. MediSwift never stores raw card
              details on our servers.
            </Point>
            <Point>
              <strong>Tokenization</strong>: Card data is immediately tokenized at the browser level by the
              payment gateway's SDK before reaching our API. We only store a non-sensitive payment token.
            </Point>
            <Point>
              <strong>Webhook Signature Verification</strong>: All payment gateway webhooks are verified using
              HMAC-SHA256 signatures to ensure they originate from the legitimate provider.
            </Point>
          </Section>

          <Section icon={Database} title="4. Data Privacy & GDPR" color="bg-amber-500">
            <Point>
              <strong>Data Minimization</strong>: We collect only the data necessary to provide healthcare
              services. No unnecessary personal attributes are stored.
            </Point>
            <Point>
              <strong>No Data Selling</strong>: MediSwift strictly prohibits selling, renting, or sharing
              customer personal data with third parties for advertising purposes.
            </Point>
            <Point>
              <strong>User Rights</strong>: Users can request data export, correction, or deletion at any time
              via our Support page. Requests are processed within 72 hours.
            </Point>
            <Point>
              <strong>Data Retention Policy</strong>: Personal data is retained only as long as necessary for
              legal, medical, and business purposes. Expired records are permanently deleted.
            </Point>
          </Section>

          <Section icon={FileText} title="5. Prescription Data Handling" color="bg-red-500">
            <Point>
              <strong>Access Control</strong>: Prescriptions are accessible only to the uploading patient and
              licensed pharmacists with verified credentials. Admin-level role checks are enforced at the API layer.
            </Point>
            <Point>
              <strong>Audit Logging</strong>: Every access to a prescription file is logged with a timestamp,
              IP address, and user ID for compliance and forensic purposes.
            </Point>
            <Point>
              <strong>Automatic Expiry</strong>: Prescription files are automatically archived and removed from
              active storage after 90 days, or upon patient request.
            </Point>
            <Point>
              <strong>HIPAA-aligned Practices</strong>: While primarily operating under Indian healthcare
              regulations (DPDP Act 2023), our data handling follows HIPAA-aligned best practices for
              Protected Health Information (PHI).
            </Point>
          </Section>
        </div>
      </div>
    </div>
  </Layout>
);

export default Security;
