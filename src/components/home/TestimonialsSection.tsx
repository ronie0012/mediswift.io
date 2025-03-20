import { useState, useEffect } from "react";
import { 
  Heart, 
  MessageCircle, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight, 
  ThumbsUp
} from "lucide-react";
import { 
  Card, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Sample testimonial data
const testimonials = [
  {
    id: 1,
    name: "Sarah Thompson",
    role: "Regular Customer",
    image: "https://randomuser.me/api/portraits/women/11.jpg",
    quote: "MediSwift has been a lifesaver for me! Being a busy professional, I never find time to go to a pharmacy. With their 10-minute delivery, I get my medications right when I need them.",
    rating: 5,
    icon: ThumbsUp
  },
  {
    id: 2,
    name: "James Wilson",
    role: "Patient",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    quote: "The online doctor consultation saved me a trip to the clinic. The doctor was very thorough and professional. I received my prescription within minutes after the consultation.",
    rating: 4,
    icon: CheckCircle
  },
  {
    id: 3,
    name: "Emily Davis",
    role: "Parent",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    quote: "As a mom of two young kids, MediSwift has made managing their medications so much easier. The app is user-friendly and the delivery is always prompt and reliable.",
    rating: 5,
    icon: Heart
  },
  {
    id: 4,
    name: "Michael Rodriguez",
    role: "Elderly Care",
    image: "https://randomuser.me/api/portraits/men/67.jpg",
    quote: "I take care of my elderly parents, and MediSwift's medicine delivery service ensures they never miss their daily medications. The reminders and tracking feature are very helpful.",
    rating: 5,
    icon: CheckCircle
  },
  {
    id: 5,
    name: "Jennifer Lee",
    role: "Regular User",
    image: "https://randomuser.me/api/portraits/women/28.jpg",
    quote: "I had to book an ambulance for my grandfather during an emergency, and MediSwift's quick response saved precious time. The tracking feature kept us updated on the ambulance's location.",
    rating: 4,
    icon: MessageCircle
  }
];

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  
  // Auto-rotate testimonials
  useEffect(() => {
    if (!autoplay) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoplay]);
  
  const goToPrev = () => {
    setAutoplay(false);
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };
  
  const goToNext = () => {
    setAutoplay(false);
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  // Get current testimonial
  const currentTestimonial = testimonials[activeIndex];
  const Icon = currentTestimonial.icon;
  
  return (
    <section className="py-20 bg-gradient-to-b from-white to-medical-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-block bg-medical-100 text-medical-700 px-4 py-1 rounded-full text-sm font-medium mb-4">
            SUCCESS STORIES
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from people who have experienced the convenience and reliability of MediSwift's services.
          </p>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          <div className="absolute -left-4 md:-left-8 top-1/2 -translate-y-1/2 z-10">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={goToPrev}
              className="bg-white hover:bg-gray-100 shadow-md hover:shadow-lg transition-all rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="absolute -right-4 md:-right-8 top-1/2 -translate-y-1/2 z-10">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={goToNext}
              className="bg-white hover:bg-gray-100 shadow-md hover:shadow-lg transition-all rounded-full"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
          
          <Card className="overflow-hidden hover:shadow-xl transition-all bg-white/80 backdrop-blur-sm border-medical-100">
            <div className="relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-medical-300 via-medical-500 to-indigo-500"></div>
              <div className="absolute top-0 left-0 h-1 bg-medical-600 transition-all duration-5000" style={{ width: `${(activeIndex + 1) / testimonials.length * 100}%` }}></div>
            </div>
            
            <CardContent className="p-8 md:p-12">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16 ring-4 ring-medical-100">
                    <AvatarImage src={currentTestimonial.image} alt={currentTestimonial.name} />
                    <AvatarFallback>{currentTestimonial.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-xl text-gray-900">{currentTestimonial.name}</h4>
                    <p className="text-gray-500">{currentTestimonial.role}</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`w-5 h-5 ${i < currentTestimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute -top-4 -left-2 text-medical-200 opacity-40">
                  <Icon size={60} />
                </div>
                <blockquote className="text-xl md:text-2xl text-gray-700 italic relative z-10 leading-relaxed">
                  "{currentTestimonial.quote}"
                </blockquote>
              </div>
            </CardContent>
            
            <CardFooter className="px-8 md:px-12 pb-8 md:pb-12 pt-0 flex flex-wrap justify-between items-center">
              <div className="flex md:hidden items-center space-x-1 mb-4 md:mb-0">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    className={`w-5 h-5 ${i < currentTestimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              
              <div className="flex justify-center w-full md:w-auto">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 w-10 mx-1 rounded-full transition-all ${
                      index === activeIndex ? "bg-medical-500" : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    onClick={() => {
                      setAutoplay(false);
                      setActiveIndex(index);
                    }}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
