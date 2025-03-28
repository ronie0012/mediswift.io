import { Link } from "react-router-dom";
import { 
  Phone, Mail, MapPin, Facebook, Twitter, Instagram, 
  Linkedin, Youtube, ArrowRight, Send 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Footer = () => {
  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnimation = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-blue-50 pt-16 pb-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-[-5%] w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute bottom-1/4 left-[-5%] w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Newsletter subscription */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto mb-16 bg-white p-8 rounded-2xl shadow-lg border border-blue-100"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">Subscribe to our Newsletter</h3>
            <p className="text-gray-600">Get the latest updates on new medicines and health tips.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="email"
              placeholder="Your email address" 
              className="flex-grow px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent"
            />
            <Button className="bg-medical-500 hover:bg-medical-600 py-3 px-5 rounded-xl">
              <Send className="mr-2 h-5 w-5" />
              Subscribe
            </Button>
          </div>
        </motion.div>

        {/* Main footer links */}
        <motion.div 
          variants={containerAnimation}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-10 py-8"
        >
          {/* First column - About */}
          <motion.div variants={itemAnimation}>
            <div className="flex items-center mb-6">
              <span className="text-medical-600 font-display font-bold text-2xl">Medi<span className="text-medical-500">Swift</span></span>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">MediSwift provides 24/7 healthcare services including medicine delivery, doctor consultations, and ambulance booking.</p>
            <div className="space-y-4">
              <div className="flex items-center group">
                <Phone className="h-5 w-5 text-medical-500 mr-3 group-hover:scale-110 transition-transform" />
                <span className="text-gray-700">+91 98765 43210</span>
              </div>
              <div className="flex items-center group">
                <Mail className="h-5 w-5 text-medical-500 mr-3 group-hover:scale-110 transition-transform" />
                <span className="text-gray-700">support@mediswift.com</span>
              </div>
              <div className="flex items-start group">
                <MapPin className="h-5 w-5 text-medical-500 mr-3 mt-1 group-hover:scale-110 transition-transform" />
                <span className="text-gray-700">B-101, Shree Ram Complex, Andheri West, Mumbai - 400053</span>
              </div>
            </div>
          </motion.div>

          {/* Second column - Quick Links */}
          <motion.div variants={itemAnimation}>
            <h3 className="text-xl font-bold mb-6 text-gray-900">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-700 hover:text-medical-500 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 text-medical-400 transition-transform duration-300 group-hover:translate-x-1" /> 
                  <span className="transition-colors duration-300">About Us</span>
                </Link>
              </li>
              <li>
                <Link to="/medicines" className="text-gray-700 hover:text-medical-500 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 text-medical-400 transition-transform duration-300 group-hover:translate-x-1" /> 
                  <span className="transition-colors duration-300">Browse Medicines</span>
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="text-gray-700 hover:text-medical-500 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 text-medical-400 transition-transform duration-300 group-hover:translate-x-1" /> 
                  <span className="transition-colors duration-300">Find Doctors</span>
                </Link>
              </li>
              <li>
                <Link to="/ambulance" className="text-gray-700 hover:text-medical-500 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 text-medical-400 transition-transform duration-300 group-hover:translate-x-1" /> 
                  <span className="transition-colors duration-300">Book Ambulance</span>
                </Link>
              </li>
              <li>
                <Link to="/health-packages" className="text-gray-700 hover:text-medical-500 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 text-medical-400 transition-transform duration-300 group-hover:translate-x-1" /> 
                  <span className="transition-colors duration-300">Health Packages</span>
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-700 hover:text-medical-500 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 text-medical-400 transition-transform duration-300 group-hover:translate-x-1" /> 
                  <span className="transition-colors duration-300">Careers</span>
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Third column - Our Services */}
          <motion.div variants={itemAnimation}>
            <h3 className="text-xl font-bold mb-6 text-gray-900">Our Services</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/medicine-delivery" className="text-gray-700 hover:text-medical-500 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 text-medical-400 transition-transform duration-300 group-hover:translate-x-1" /> 
                  <span className="transition-colors duration-300">Medicine Delivery</span>
                </Link>
              </li>
              <li>
                <Link to="/online-consultation" className="text-gray-700 hover:text-medical-500 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 text-medical-400 transition-transform duration-300 group-hover:translate-x-1" /> 
                  <span className="transition-colors duration-300">Online Consultation</span>
                </Link>
              </li>
              <li>
                <Link to="/emergency-services" className="text-gray-700 hover:text-medical-500 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 text-medical-400 transition-transform duration-300 group-hover:translate-x-1" /> 
                  <span className="transition-colors duration-300">Emergency Services</span>
                </Link>
              </li>
              <li>
                <Link to="/health-records" className="text-gray-700 hover:text-medical-500 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 text-medical-400 transition-transform duration-300 group-hover:translate-x-1" /> 
                  <span className="transition-colors duration-300">Health Records</span>
                </Link>
              </li>
              <li>
                <Link to="/lab-tests" className="text-gray-700 hover:text-medical-500 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 text-medical-400 transition-transform duration-300 group-hover:translate-x-1" /> 
                  <span className="transition-colors duration-300">Lab Tests</span>
                </Link>
              </li>
              <li>
                <Link to="/health-blogs" className="text-gray-700 hover:text-medical-500 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 text-medical-400 transition-transform duration-300 group-hover:translate-x-1" /> 
                  <span className="transition-colors duration-300">Health Blogs</span>
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Fourth column - For Patients */}
          <motion.div variants={itemAnimation}>
            <h3 className="text-xl font-bold mb-6 text-gray-900">For Patients</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/faq" className="text-gray-700 hover:text-medical-500 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 text-medical-400 transition-transform duration-300 group-hover:translate-x-1" /> 
                  <span className="transition-colors duration-300">FAQs</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-700 hover:text-medical-500 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 text-medical-400 transition-transform duration-300 group-hover:translate-x-1" /> 
                  <span className="transition-colors duration-300">Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-700 hover:text-medical-500 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 text-medical-400 transition-transform duration-300 group-hover:translate-x-1" /> 
                  <span className="transition-colors duration-300">Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-gray-700 hover:text-medical-500 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 text-medical-400 transition-transform duration-300 group-hover:translate-x-1" /> 
                  <span className="transition-colors duration-300">Customer Support</span>
                </Link>
              </li>
              <li>
                <Link to="/refund" className="text-gray-700 hover:text-medical-500 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 text-medical-400 transition-transform duration-300 group-hover:translate-x-1" /> 
                  <span className="transition-colors duration-300">Refund Policy</span>
                </Link>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Social media & copyright */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex space-x-5 mb-6 md:mb-0"
            >
              <a href="#" className="text-gray-500 hover:text-medical-500 transition-colors duration-300 hover:scale-110 transform">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-500 hover:text-medical-500 transition-colors duration-300 hover:scale-110 transform">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-500 hover:text-medical-500 transition-colors duration-300 hover:scale-110 transform">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-500 hover:text-medical-500 transition-colors duration-300 hover:scale-110 transform">
                <Linkedin className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-500 hover:text-medical-500 transition-colors duration-300 hover:scale-110 transform">
                <Youtube className="h-6 w-6" />
              </a>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-gray-600 text-sm"
            >
              &copy; {new Date().getFullYear()} MediSwift. All rights reserved.
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
