import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";

const news = [
  {
    date: "March 15, 2024",
    title: "New Telemedicine Features",
    description: "We've launched advanced video consultation features with HD quality and real-time chat support.",
    image: "/lovable-uploads/91062ee0-9c38-4dc0-87fb-7422f3920b42.png"
  },
  {
    date: "March 10, 2024",
    title: "24/7 Emergency Support",
    description: "Our emergency support team is now available round the clock to assist you with any medical emergencies.",
    image: "/lovable-uploads/91062ee0-9c38-4dc0-87fb-7422f3920b42.png"
  },
  {
    date: "March 5, 2024",
    title: "New Medicine Categories",
    description: "We've expanded our medicine inventory with new categories including Ayurvedic and Homeopathic medicines.",
    image: "/lovable-uploads/91062ee0-9c38-4dc0-87fb-7422f3920b42.png"
  }
];

const NewsSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest Updates
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay informed about our latest features, services, and healthcare innovations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-1" />
                  {item.date}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {item.description}
                </p>
                <button className="flex items-center text-medical-500 hover:text-medical-600 font-medium">
                  Read More
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
