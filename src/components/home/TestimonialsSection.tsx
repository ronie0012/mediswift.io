
import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
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
    rating: 5
  },
  {
    id: 2,
    name: "James Wilson",
    role: "Patient",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    quote: "The online doctor consultation saved me a trip to the clinic. The doctor was very thorough and professional. I received my prescription within minutes after the consultation.",
    rating: 4
  },
  {
    id: 3,
    name: "Emily Davis",
    role: "Parent",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    quote: "As a mom of two young kids, MediSwift has made managing their medications so much easier. The app is user-friendly and the delivery is always prompt and reliable.",
    rating: 5
  },
  {
    id: 4,
    name: "Michael Rodriguez",
    role: "Elderly Care",
    image: "https://randomuser.me/api/portraits/men/67.jpg",
    quote: "I take care of my elderly parents, and MediSwift's medicine delivery service ensures they never miss their daily medications. The reminders and tracking feature are very helpful.",
    rating: 5
  },
  {
    id: 5,
    name: "Jennifer Lee",
    role: "Regular User",
    image: "https://randomuser.me/api/portraits/women/28.jpg",
    quote: "I had to book an ambulance for my grandfather during an emergency, and MediSwift's quick response saved precious time. The tracking feature kept us updated on the ambulance's location.",
    rating: 4
  }
];

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const goToPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };
  
  const goToNext = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from people who have experienced the convenience and reliability of MediSwift's services.
          </p>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div className="flex items-center justify-between mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={testimonials[activeIndex].image} alt={testimonials[activeIndex].name} />
                <AvatarFallback>{testimonials[activeIndex].name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex">
                {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ))}
                {[...Array(5 - testimonials[activeIndex].rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-gray-300" />
                ))}
              </div>
            </div>
            
            <blockquote className="text-xl md:text-2xl font-medium text-gray-700 mb-6">
              "{testimonials[activeIndex].quote}"
            </blockquote>
            
            <div>
              <p className="font-bold text-gray-900">{testimonials[activeIndex].name}</p>
              <p className="text-gray-500">{testimonials[activeIndex].role}</p>
            </div>
          </div>
          
          <div className="flex justify-center mt-8 space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={goToPrev}
              className="bg-white hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={goToNext}
              className="bg-white hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex justify-center mt-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`h-2.5 w-2.5 rounded-full mx-1 ${
                  index === activeIndex ? "bg-medical-500" : "bg-gray-300"
                }`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
