
import PageTemplate from "@/components/layout/PageTemplate";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const Careers = () => {
  const openings = [
    {
      id: "med-rep",
      title: "Medical Representative",
      department: "Sales",
      location: "Multiple Locations",
      requirements: [
        "Bachelor's degree in Pharmacy, Life Sciences, or related field",
        "1-3 years of experience in pharmaceutical sales",
        "Excellent communication and interpersonal skills",
        "Valid driver's license and ability to travel"
      ],
      responsibilities: [
        "Promote and sell pharmaceutical products to healthcare professionals",
        "Build and maintain relationships with healthcare providers",
        "Provide product information and address customer queries",
        "Achieve sales targets and expand market presence",
        "Keep up-to-date with market trends and competitor activities"
      ]
    },
    {
      id: "pharmacist",
      title: "Online Pharmacist",
      department: "Pharmacy",
      location: "Remote",
      requirements: [
        "Doctor of Pharmacy (Pharm.D.) or equivalent degree",
        "Valid pharmacist license",
        "2+ years of experience in retail or online pharmacy",
        "Excellent knowledge of medications and their interactions",
        "Strong digital skills and familiarity with e-prescription systems"
      ],
      responsibilities: [
        "Review and verify prescription orders",
        "Provide medication counseling to patients via phone or chat",
        "Ensure compliance with pharmacy laws and regulations",
        "Collaborate with healthcare professionals to address patient needs",
        "Monitor and report adverse drug reactions"
      ]
    },
    {
      id: "full-stack",
      title: "Full Stack Developer",
      department: "Technology",
      location: "Hybrid",
      requirements: [
        "Bachelor's degree in Computer Science or related field",
        "3+ years of experience in full stack development",
        "Proficiency in React, Node.js, and SQL/NoSQL databases",
        "Experience with RESTful APIs and microservices architecture",
        "Familiarity with healthcare systems is a plus"
      ],
      responsibilities: [
        "Develop and maintain web and mobile applications",
        "Implement responsive UI designs and ensure cross-browser compatibility",
        "Optimize applications for performance and scalability",
        "Collaborate with product and design teams to implement new features",
        "Participate in code reviews and ensure code quality"
      ]
    }
  ];

  return (
    <PageTemplate title="Careers at MediSwift" subtitle="Join our team and make a difference in healthcare">
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Why Join MediSwift?</h2>
          <p className="text-gray-600">
            At MediSwift, we're revolutionizing healthcare delivery through technology. We offer an inclusive 
            work environment where innovation is encouraged, and your ideas matter. Join us to build solutions 
            that impact millions of lives while growing your career with industry leaders.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-medical-600 mb-2">Competitive Benefits</h3>
              <p className="text-sm text-gray-600">Comprehensive health insurance, retirement plans, and paid time off.</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-medical-600 mb-2">Professional Growth</h3>
              <p className="text-sm text-gray-600">Continuous learning opportunities, mentorship, and career advancement.</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-medical-600 mb-2">Work-Life Balance</h3>
              <p className="text-sm text-gray-600">Flexible work arrangements, wellness programs, and team activities.</p>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Current Openings</h2>
          <Accordion type="single" collapsible className="w-full">
            {openings.map((job) => (
              <AccordionItem key={job.id} value={job.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="text-left">
                    <div className="font-medium">{job.title}</div>
                    <div className="text-xs text-gray-500">{job.department} • {job.location}</div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 px-1">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Requirements:</h4>
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                        {job.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Responsibilities:</h4>
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                        {job.responsibilities.map((resp, index) => (
                          <li key={index}>{resp}</li>
                        ))}
                      </ul>
                    </div>
                    <Button className="bg-medical-500 hover:bg-medical-600 mt-2">
                      Apply Now
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </PageTemplate>
  );
};

export default Careers;
