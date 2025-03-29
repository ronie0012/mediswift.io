import { motion } from "framer-motion";
import { Clock, Stethoscope, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  {
    icon: Stethoscope,
    value: "24/7",
    label: "Medical Support",
    description: "Round-the-clock healthcare assistance",
    color: "from-blue-400 to-indigo-500"
  },
  {
    icon: Clock,
    value: "10min",
    label: "Delivery Time",
    description: "Fastest medicine delivery in the industry",
    color: "from-emerald-400 to-teal-500"
  },
  {
    icon: ShieldCheck,
    value: "100%",
    label: "Secure Service",
    description: "HIPAA compliant medical platform",
    color: "from-violet-400 to-purple-500"
  }
];

const StatisticsSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-blue-100 opacity-70"></div>
        <div className="absolute top-20 right-10 w-20 h-20 rounded-full bg-green-100 opacity-50"></div>
        <div className="absolute bottom-10 left-1/4 w-32 h-32 rounded-full bg-purple-100 opacity-60"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-medical-100 text-medical-700 font-medium text-sm mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Why Choose <span className="text-medical-600">MediSwift</span>
          </h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Reliable healthcare services designed with your needs in mind
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ 
                y: -8,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-20 h-20 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mb-6 transform rotate-3 shadow-lg`}>
                  <stat.icon className="w-10 h-10 text-white" />
                </div>
                <motion.h3 
                  initial={{ scale: 0.9 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, delay: index * 0.2 + 0.2 }}
                  className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-medical-600 to-blue-600 mb-3"
                >
                  {stat.value}
                </motion.h3>
                <h4 className="text-xl font-semibold text-gray-800 mb-3">{stat.label}</h4>
                <p className="text-base text-gray-600 leading-relaxed">{stat.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <Link 
            to="/#services" 
            className="inline-block px-8 py-3 bg-medical-600 hover:bg-medical-700 text-white font-medium rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
            onClick={(e) => {
              e.preventDefault();
              const servicesSection = document.getElementById('services');
              if (servicesSection) {
                servicesSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Explore Our Services
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default StatisticsSection;
