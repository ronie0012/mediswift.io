import { motion } from "framer-motion";
import { Users, Clock, Award, Heart } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "1M+",
    label: "Happy Patients",
    description: "Trusted by over a million patients worldwide"
  },
  {
    icon: Clock,
    value: "10min",
    label: "Delivery Time",
    description: "Fastest medicine delivery in the industry"
  },
  {
    icon: Award,
    value: "500+",
    label: "Expert Doctors",
    description: "Verified healthcare professionals"
  },
  {
    icon: Heart,
    value: "98%",
    label: "Satisfaction Rate",
    description: "Based on patient feedback"
  }
];

const StatisticsSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Millions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our commitment to excellence has made us the preferred healthcare platform for patients worldwide.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-medical-100 rounded-full flex items-center justify-center mb-4">
                  <stat.icon className="w-8 h-8 text-medical-500" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{stat.label}</h4>
                <p className="text-sm text-gray-600">{stat.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection; 