
import PageTemplate from "@/components/layout/PageTemplate";

const About = () => {
  return (
    <PageTemplate title="About MediSwift" subtitle="Learn more about our mission and vision">
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Our Mission</h2>
          <p className="text-gray-600">
            At MediSwift, our mission is to make healthcare accessible to everyone through innovative technology solutions. 
            We strive to connect patients with healthcare providers and services in the most efficient and convenient way possible.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Our Vision</h2>
          <p className="text-gray-600">
            We envision a world where quality healthcare is just a few clicks away. By leveraging technology, 
            we aim to bridge the gap between patients and healthcare providers, making healthcare more accessible, 
            affordable, and efficient for everyone.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Our Values</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li><span className="font-medium">Patient-Centered:</span> We put patients at the center of everything we do.</li>
            <li><span className="font-medium">Innovation:</span> We continuously innovate to improve healthcare delivery.</li>
            <li><span className="font-medium">Accessibility:</span> We believe quality healthcare should be accessible to all.</li>
            <li><span className="font-medium">Quality:</span> We maintain the highest standards in all our services.</li>
            <li><span className="font-medium">Integrity:</span> We operate with honesty, transparency, and ethical standards.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Our Team</h2>
          <p className="text-gray-600">
            MediSwift is powered by a diverse team of healthcare professionals, technology experts, and customer service specialists. 
            Our team is dedicated to providing you with the best healthcare experience possible.
          </p>
        </section>
      </div>
    </PageTemplate>
  );
};

export default About;
