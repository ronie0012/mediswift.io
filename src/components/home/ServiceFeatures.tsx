import { Pill, Stethoscope, Ambulance, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    title: "Medicine Delivery",
    description: "Get medicines delivered to your doorstep in just 10 minutes. Order now!",
    icon: Pill,
    link: "/medicines",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80"
  },
  {
    title: "Doctor Consultation",
    description: "Consult with verified specialists online from the comfort of your home.",
    icon: Stethoscope,
    link: "/doctors",
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
  },
  {
    title: "Ambulance Booking",
    description: "Book an ambulance for emergency situations with real-time tracking.",
    icon: Ambulance,
    link: "/ambulance",
    image: "/ambulance-neon.jpeg"
  },
  {
    title: "Health Packages",
    description: "Comprehensive health check-up packages for you and your family.",
    icon: Clock,
    link: "/health-packages",
    image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80"
  }
];

const ServiceFeatures = () => {
  return (
    <section id="services" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive healthcare solutions designed to meet all your medical needs conveniently and efficiently.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Link key={index} to={service.link} className="service-card group">
              <div className="h-48 overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="inline-flex items-center justify-center p-2 bg-medical-50 rounded-lg mb-4">
                  <service.icon className="h-6 w-6 text-medical-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-medical-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600">
                  {service.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceFeatures;
