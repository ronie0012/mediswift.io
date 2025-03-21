import { Link } from "react-router-dom";
import { 
  Phone, Mail, MapPin, Facebook, Twitter, Instagram, 
  Linkedin, Youtube, ArrowRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-gray-50 pt-12 pb-8 border-t">
      <div className="container mx-auto px-4">
        {/* Newsletter subscription */}
        <div className="max-w-lg mx-auto pb-8 border-b border-gray-200">
          <h3 className="text-lg font-bold mb-3">Subscribe to our Newsletter</h3>
          <p className="text-gray-600 mb-4">Get the latest updates on new medicines and health tips.</p>
          <div className="flex">
            <input 
              type="email"
              placeholder="Your email address" 
              className="flex-grow px-4 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent"
            />
            <Button className="rounded-l-none bg-medical-500 hover:bg-medical-600">
              Subscribe
            </Button>
          </div>
        </div>

        {/* Main footer links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8">
          {/* First column - About */}
          <div>
            <div className="flex items-center mb-4">
              <span className="text-medical-600 font-display font-bold text-xl">Medi<span className="text-medical-500">Swift</span></span>
            </div>
            <p className="text-gray-600 mb-4">MediSwift provides 24/7 healthcare services including medicine delivery, doctor consultations, and ambulance booking.</p>
            <div className="space-y-2">
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-medical-500 mr-2" />
                <span className="text-gray-600">1-800-123-456</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-medical-500 mr-2" />
                <span className="text-gray-600">support@mediswift.com</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-medical-500 mr-2 mt-1" />
                <span className="text-gray-600">123 Healthcare Ave, Medical District, NY 10001</span>
              </div>
            </div>
          </div>

          {/* Second column - Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-medical-500 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" /> About Us
                </Link>
              </li>
              <li>
                <Link to="/medicines" className="text-gray-600 hover:text-medical-500 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" /> Browse Medicines
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="text-gray-600 hover:text-medical-500 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" /> Find Doctors
                </Link>
              </li>
              <li>
                <Link to="/ambulance" className="text-gray-600 hover:text-medical-500 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" /> Book Ambulance
                </Link>
              </li>
              <li>
                <Link to="/health-packages" className="text-gray-600 hover:text-medical-500 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" /> Health Packages
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-600 hover:text-medical-500 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" /> Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Third column - Our Services */}
          <div>
            <h3 className="text-lg font-bold mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/medicine-delivery" className="text-gray-600 hover:text-medical-500 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" /> Medicine Delivery
                </Link>
              </li>
              <li>
                <Link to="/online-consultation" className="text-gray-600 hover:text-medical-500 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" /> Online Consultation
                </Link>
              </li>
              <li>
                <Link to="/emergency-services" className="text-gray-600 hover:text-medical-500 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" /> Emergency Services
                </Link>
              </li>
              <li>
                <Link to="/health-records" className="text-gray-600 hover:text-medical-500 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" /> Health Records
                </Link>
              </li>
              <li>
                <Link to="/lab-tests" className="text-gray-600 hover:text-medical-500 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" /> Lab Tests
                </Link>
              </li>
              <li>
                <Link to="/health-blogs" className="text-gray-600 hover:text-medical-500 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" /> Health Blogs
                </Link>
              </li>
            </ul>
          </div>

          {/* Fourth column - For Patients */}
          <div>
            <h3 className="text-lg font-bold mb-4">For Patients</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-medical-500 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" /> FAQs
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-medical-500 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" /> Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-medical-500 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-gray-600 hover:text-medical-500 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" /> Customer Support
                </Link>
              </li>
              <li>
                <Link to="/refund" className="text-gray-600 hover:text-medical-500 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" /> Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social media & copyright */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="flex space-x-4 mb-4 md:mb-0">
              <a href="#" className="text-gray-500 hover:text-medical-500">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-medical-500">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-medical-500">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-medical-500">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-medical-500">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            <div className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} MediSwift. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
