import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Share2, Bookmark, Clock } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

// Import the news data (same as in News.tsx)
const newsData = [
  {
    date: "March 15, 2024",
    title: "New Telemedicine Features",
    description: "We've launched advanced video consultation features with HD quality and real-time chat support.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    slug: "new-telemedicine-features",
    category: "Technology",
    content: `
      <p>MediSwift is proud to announce the launch of our advanced telemedicine features, designed to provide seamless healthcare experiences from the comfort of your home.</p>
      
      <h2>HD Video Quality</h2>
      <p>Our new HD video streaming capabilities ensure that doctors can observe symptoms clearly and make more accurate diagnoses remotely. The improved video quality makes virtual consultations feel more personal and effective.</p>
      
      <h2>Real-time Chat Support</h2>
      <p>We've added real-time chat functionality during video consultations, allowing patients to share important information without interrupting the flow of conversation. This feature is particularly helpful for sharing links to medical records or typing complex medical terms.</p>
      
      <h2>Enhanced Security</h2>
      <p>All our telemedicine features meet HIPAA compliance standards with end-to-end encryption, ensuring your medical consultations remain private and secure.</p>
      
      <h2>Scheduling Improvements</h2>
      <p>The new calendar integration makes it easier to schedule follow-up appointments directly from your consultation, with automatic reminders sent to your preferred devices.</p>
    `
  },
  {
    date: "March 10, 2024",
    title: "24/7 Emergency Support",
    description: "Our emergency support team is now available round the clock to assist you with any medical emergencies.",
    image: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
    slug: "24-7-emergency-support",
    category: "Services",
    content: `
      <p>MediSwift is committed to being there for you when you need us most. That's why we're excited to announce our new 24/7 Emergency Support service.</p>
      
      <h2>Always Available</h2>
      <p>Our team of medical professionals is now available round the clock, ensuring that you can get medical advice and assistance at any time of the day or night.</p>
      
      <h2>Rapid Response</h2>
      <p>With our enhanced emergency protocols, we aim to respond to all emergency requests within 3 minutes, connecting you with a qualified medical professional who can provide immediate guidance.</p>
      
      <h2>Ambulance Coordination</h2>
      <p>Our emergency support team can coordinate ambulance services for critical situations, ensuring you get to the nearest medical facility as quickly as possible.</p>
      
      <h2>Follow-up Care</h2>
      <p>After any emergency situation, our team will ensure proper follow-up care is arranged, including scheduling appointments with specialists if needed.</p>
    `
  },
  {
    date: "March 5, 2024",
    title: "New Medicine Categories",
    description: "We've expanded our medicine inventory with new categories including Ayurvedic and Homeopathic medicines.",
    image: "/OIG3.jpeg",
    slug: "new-medicine-categories",
    category: "Products",
    content: `
      <p>MediSwift is proud to announce a significant expansion of our medicine inventory, now featuring traditional and alternative medicine options alongside conventional pharmaceuticals.</p>
      
      <h2>Ayurvedic Medicines</h2>
      <p>We've partnered with certified Ayurvedic practitioners and manufacturers to bring you authentic Ayurvedic remedies. Our collection includes herbs, formulations, and wellness products that follow traditional Ayurvedic principles.</p>
      
      <h2>Homeopathic Options</h2>
      <p>Our new homeopathic section features remedies for various conditions, all sourced from reputable manufacturers who follow strict quality guidelines.</p>
      
      <h2>Traditional Chinese Medicine</h2>
      <p>Explore our selection of traditional Chinese herbs, supplements, and wellness products, carefully sourced and authenticated for quality and efficacy.</p>
      
      <h2>Natural Supplements</h2>
      <p>We've expanded our range of natural supplements, including vitamins, minerals, and herbal formulations to support overall health and wellness.</p>
    `
  },
  {
    date: "March 1, 2024",
    title: "Healthcare Tips for Summer",
    description: "Stay healthy during summer with these essential healthcare tips from our medical experts.",
    image: "https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    slug: "healthcare-tips-for-summer",
    category: "Health Tips",
    content: `
      <p>As temperatures rise, it's important to adjust your health routines to stay safe and comfortable. Our medical experts have compiled these essential tips for maintaining good health during the summer months.</p>
      
      <h2>Stay Hydrated</h2>
      <p>Drink at least 8-10 glasses of water daily, more if you're active outdoors. Look for signs of dehydration such as dark urine, fatigue, and dizziness.</p>
      
      <h2>Protect Your Skin</h2>
      <p>Apply broad-spectrum sunscreen with SPF 30 or higher every 2 hours when outdoors. Wear lightweight, light-colored clothing and a wide-brimmed hat for additional protection.</p>
      
      <h2>Watch for Heat-Related Illness</h2>
      <p>Know the signs of heat exhaustion and heat stroke. Move to a cool place and seek medical attention if you experience high body temperature, confusion, or fainting.</p>
      
      <h2>Eat Light, Fresh Foods</h2>
      <p>Include plenty of fruits, vegetables, and salads in your diet. These foods have high water content and can help keep you hydrated while providing essential nutrients.</p>
    `
  },
  {
    date: "February 25, 2024",
    title: "Introducing Health Packages",
    description: "Explore our new comprehensive health packages designed for individuals, families, and seniors.",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    slug: "introducing-health-packages",
    category: "Services",
    content: `
      <p>MediSwift is excited to introduce our new range of comprehensive health packages designed to make preventive healthcare more accessible and personalized.</p>
      
      <h2>Individual Health Packages</h2>
      <p>Our individual packages include annual check-ups, preventive screenings, and lifestyle assessments tailored to different age groups and health profiles.</p>
      
      <h2>Family Health Plans</h2>
      <p>Family packages cover healthcare needs for up to 6 family members, with special attention to children's health, women's health, and senior care all in one convenient package.</p>
      
      <h2>Senior Wellness Programs</h2>
      <p>Our senior packages focus on age-specific health concerns, including bone density screenings, cardiac health, vision and hearing assessments, and medication management.</p>
      
      <h2>Corporate Wellness</h2>
      <p>We offer customizable packages for businesses looking to invest in employee health, featuring on-site check-ups, mental health resources, and wellness programs.</p>
    `
  },
  {
    date: "February 20, 2024",
    title: "Updated Mobile App Features",
    description: "Our mobile app now includes dark mode, improved navigation, and personalized health recommendations.",
    image: "https://images.unsplash.com/photo-1616587226157-48e49175ee20?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    slug: "updated-mobile-app-features",
    category: "Technology",
    content: `
      <p>We're constantly working to improve your digital healthcare experience. Our latest mobile app update brings several new features and improvements based on user feedback.</p>
      
      <h2>Dark Mode</h2>
      <p>Reduce eye strain with our new dark mode option, perfect for checking symptoms or scheduling appointments at night without disturbing your sleep cycle.</p>
      
      <h2>Improved Navigation</h2>
      <p>We've redesigned the app interface for easier navigation, with quick access to your most-used features right from the home screen.</p>
      
      <h2>Personalized Health Recommendations</h2>
      <p>Our app now provides customized health tips and reminders based on your profile, recent appointments, and medication schedule.</p>
      
      <h2>Enhanced Appointment Management</h2>
      <p>Managing your appointments is now easier with our improved calendar integration, real-time updates on doctor availability, and simplified rescheduling process.</p>
    `
  }
];

const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<typeof newsData[0] | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<typeof newsData>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch for the article
    const timer = setTimeout(() => {
      const foundArticle = newsData.find(item => item.slug === slug);
      
      if (foundArticle) {
        setArticle(foundArticle);
        
        // Find related articles in the same category
        const related = newsData
          .filter(item => item.category === foundArticle.category && item.slug !== slug)
          .slice(0, 3);
        
        setRelatedArticles(related);
      }
      
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [slug]);

  const goBack = () => {
    navigate(-1);
  };

  const shareArticle = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="h-96 bg-gray-200 rounded mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or may have been removed.</p>
            <Button onClick={goBack}>Go Back</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goBack}
              className="mb-6 flex items-center gap-1 text-gray-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="relative h-[400px]">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={shareArticle}
                    className="bg-white/90 backdrop-blur-sm rounded-full hover:bg-white"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="bg-white/90 backdrop-blur-sm rounded-full hover:bg-white"
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-6 md:p-8">
                <div className="flex gap-3 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {article.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    5 min read
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {article.title}
                </h1>
                
                <div className="bg-medical-50 text-medical-600 px-3 py-1 rounded-full inline-block mb-6">
                  {article.category}
                </div>
                
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>
            </div>
            
            {relatedArticles.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedArticles.map((item, index) => (
                    <motion.div
                      key={item.slug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <Link to={`/news/${item.slug}`} className="block h-48 relative">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                        />
                      </Link>
                      <div className="p-4">
                        <Link to={`/news/${item.slug}`}>
                          <h3 className="font-semibold text-gray-900 mb-2 hover:text-medical-600 transition-colors">
                            {item.title}
                          </h3>
                        </Link>
                        <div className="text-sm text-gray-500 mb-2">
                          {item.date}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default NewsDetail; 