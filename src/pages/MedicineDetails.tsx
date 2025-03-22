import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ShoppingCart, Star, AlertCircle, Info, ChevronLeft, Plus, Minus, Truck, Shield, Clock, Calendar, Check } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Sample medicine data (in real app, this would come from an API or database)
const medicineData = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    brand: "Generic",
    price: 15,
    discountPrice: 12,
    rating: 4.8,
    category: "Pain Relief",
    quantity: "10 tablets",
    image: "/Paracetamol.webp",
    description: "Paracetamol is used to treat headaches, muscle aches, arthritis, backache, toothaches, colds, and fevers.",
    usage: "Take 1-2 tablets every 4-6 hours as needed. Do not exceed 8 tablets in 24 hours.",
    sideEffects: "Rare side effects may include nausea, stomach pain, and rash. Seek medical attention if experiencing severe side effects.",
    contraindications: "Do not use if allergic to paracetamol. Consult doctor if you have liver disease, kidney disease, or consume alcohol regularly.",
    stock: 50,
    reviews: [
      { id: 1, user: "John D.", rating: 5, comment: "Works great for headaches!", date: "2023-05-15" },
      { id: 2, user: "Sarah M.", rating: 4, comment: "Effective pain relief, but takes some time to kick in.", date: "2023-06-22" },
      { id: 3, user: "Robert T.", rating: 5, comment: "Always keep this in my medicine cabinet.", date: "2023-07-10" }
    ]
  },
  {
    id: 2,
    name: "Amoxicillin 500mg",
    brand: "Generic",
    price: 50,
    discountPrice: 45,
    rating: 4.7,
    category: "Antibiotics",
    quantity: "10 capsules",
    image: "/Amoxicillin.webp",
    description: "Amoxicillin is a penicillin antibiotic that fights bacteria in the body. It is used to treat bacterial infections such as bronchitis and pneumonia.",
    usage: "Take as directed by your doctor, usually every 8 or 12 hours with or without food. Complete the full course even if you feel better.",
    sideEffects: "Side effects may include diarrhea, stomach upset, or allergic reactions. Contact your doctor if experiencing severe rash, persistent diarrhea, or difficulty breathing.",
    contraindications: "Do not use if allergic to penicillin antibiotics. Inform your doctor about your medical history, especially of kidney disease.",
    stock: 35,
    reviews: [
      { id: 1, user: "Emily P.", rating: 5, comment: "Cleared my infection within days.", date: "2023-04-18" },
      { id: 2, user: "Michael R.", rating: 4, comment: "Effective but caused some stomach upset.", date: "2023-05-30" }
    ]
  },
  {
    id: 3,
    name: "Azithromycin 500mg",
    brand: "Generic",
    price: 60,
    discountPrice: 55,
    rating: 4.7,
    category: "Antibiotics",
    quantity: "3 tablets",
    image: "/Azithromycin.webp",
    description: "Azithromycin is used to treat a wide variety of bacterial infections. It works by stopping the growth of bacteria.",
    usage: "Take as directed by your doctor, usually once daily with or without food. Complete the full course even if symptoms improve.",
    sideEffects: "Common side effects include diarrhea, nausea, abdominal pain, and vomiting. Serious allergic reactions are rare.",
    contraindications: "Do not use if allergic to azithromycin or similar antibiotics. Inform your doctor about liver or kidney problems.",
    stock: 20,
    reviews: [
      { id: 1, user: "Alex T.", rating: 5, comment: "Quick and effective for my sinus infection.", date: "2023-06-05" }
    ]
  },
  {
    id: 4,
    name: "Ciprofloxacin 500mg",
    brand: "Generic",
    price: 55,
    discountPrice: 50,
    rating: 4.5,
    category: "Antibiotics",
    quantity: "10 tablets",
    image: "/Ciprofloxacin.webp",
    description: "Ciprofloxacin is used to treat a variety of bacterial infections. It belongs to a class of drugs called fluoroquinolone antibiotics.",
    usage: "Take as prescribed, usually twice daily. Take with or without food. Drink plenty of fluids while taking this medication.",
    sideEffects: "May cause nausea, diarrhea, headache, or dizziness. Serious side effects include tendon problems, nerve damage, and allergic reactions.",
    contraindications: "Not recommended for pregnant women, children, or people with certain medical conditions. Avoid taking with dairy products or antacids.",
    stock: 15,
    reviews: [
      { id: 1, user: "Patricia L.", rating: 4, comment: "Worked well for my UTI but caused some stomach issues.", date: "2023-05-22" }
    ]
  },
  {
    id: 5,
    name: "Metformin 500mg",
    brand: "Generic",
    price: 12,
    discountPrice: 10,
    rating: 4.6,
    category: "Diabetes",
    quantity: "10 tablets",
    image: "/Metformin.webp",
    description: "Metformin is used to treat type 2 diabetes by improving blood sugar control. It helps your body respond better to insulin.",
    usage: "Take with meals to decrease stomach upset. Start with a low dose and gradually increase as directed by your doctor.",
    sideEffects: "Common side effects include nausea, vomiting, stomach upset, diarrhea, and metallic taste in mouth. These usually improve with time.",
    contraindications: "Not suitable for people with severe kidney disease, liver disease, or metabolic acidosis.",
    stock: 45,
    reviews: [
      { id: 1, user: "David K.", rating: 5, comment: "Helps control my blood sugar without major side effects.", date: "2023-07-01" },
      { id: 2, user: "Linda M.", rating: 4, comment: "Effective but causes some stomach discomfort when first starting.", date: "2023-05-11" }
    ]
  },
  {
    id: 6,
    name: "Amlodipine 5mg",
    brand: "Generic",
    price: 20,
    discountPrice: 18,
    rating: 4.8,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Amlodipine.webp",
    description: "Amlodipine is a calcium channel blocker used to treat high blood pressure and certain types of chest pain (angina).",
    usage: "Take once daily with or without food. Take at the same time each day for best results.",
    sideEffects: "May cause dizziness, flushing, headache, swelling of ankles/feet, or fatigue. These effects usually improve with continued use.",
    contraindications: "Tell your doctor if you have liver disease, heart disease, or are pregnant or planning to become pregnant.",
    stock: 30,
    reviews: [
      { id: 1, user: "Thomas B.", rating: 5, comment: "Keeps my blood pressure well controlled.", date: "2023-06-18" }
    ]
  },
  {
    id: 7,
    name: "Atorvastatin 10mg",
    brand: "Generic",
    price: 25,
    discountPrice: 22,
    rating: 4.7,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Atorvastatin.webp",
    description: "Atorvastatin is used to lower cholesterol and triglycerides in the blood, reducing the risk of heart disease, stroke, and heart attacks.",
    usage: "Take once daily, with or without food. Evening doses may be more effective. Follow a cholesterol-lowering diet for best results.",
    sideEffects: "May cause muscle pain, diarrhea, or upset stomach. Report unexplained muscle pain, tenderness, or weakness to your doctor immediately.",
    contraindications: "Not recommended during pregnancy. Tell your doctor if you have liver disease or drink large amounts of alcohol.",
    stock: 25,
    reviews: [
      { id: 1, user: "James W.", rating: 5, comment: "Effectively lowered my cholesterol with minimal side effects.", date: "2023-07-05" },
      { id: 2, user: "Mary L.", rating: 4, comment: "Works great but occasionally causes muscle soreness.", date: "2023-06-10" }
    ]
  },
  {
    id: 8,
    name: "Omeprazole 20mg",
    brand: "Generic",
    price: 18,
    discountPrice: 15,
    rating: 4.7,
    category: "Gastro",
    quantity: "10 capsules",
    image: "/Omeprazole.webp",
    description: "Omeprazole reduces stomach acid production and is used to treat conditions like heartburn, acid reflux, and ulcers.",
    usage: "Take before meals, preferably in the morning. Swallow whole with water, do not crush or chew.",
    sideEffects: "May cause headache, stomach pain, nausea, vomiting, or diarrhea. Long-term use may increase risk of certain infections.",
    contraindications: "Tell your doctor if you have liver problems or low magnesium levels. May interact with certain medications.",
    stock: 40,
    reviews: [
      { id: 1, user: "Susan R.", rating: 5, comment: "Complete relief from my acid reflux.", date: "2023-05-25" },
      { id: 2, user: "Mark D.", rating: 4, comment: "Works well but takes a few days to reach full effect.", date: "2023-06-30" }
    ]
  },
  {
    id: 9,
    name: "Pantoprazole 40mg",
    brand: "Generic",
    price: 35,
    discountPrice: 30,
    rating: 4.6,
    category: "Gastro",
    quantity: "10 tablets",
    image: "/Pantoprazole.webp",
    description: "Pantoprazole is a proton pump inhibitor that decreases stomach acid production. Used to treat conditions like GERD and stomach ulcers.",
    usage: "Take once daily, with or without food. Swallow whole, do not crush or chew tablets.",
    sideEffects: "Side effects may include headache, diarrhea, and stomach pain. Long-term use may increase risk of vitamin B12 deficiency.",
    contraindications: "Inform your doctor if you have liver disease or osteoporosis. May interact with certain HIV medications and blood thinners.",
    stock: 25,
    reviews: [
      { id: 1, user: "Jennifer K.", rating: 4, comment: "Effective for my stomach issues with minimal side effects.", date: "2023-06-15" }
    ]
  },
  {
    id: 10,
    name: "Cetirizine 10mg",
    brand: "Generic",
    price: 15,
    discountPrice: 12,
    rating: 4.8,
    category: "Allergy",
    quantity: "10 tablets",
    image: "/Cetirizine.webp",
    description: "Cetirizine is an antihistamine used to relieve allergy symptoms such as watery eyes, runny nose, itching, sneezing, hives, and other symptoms of allergies.",
    usage: "Take once daily with or without food. Best taken at the same time each day.",
    sideEffects: "May cause drowsiness, dry mouth, or fatigue. These effects usually improve as your body adjusts to the medication.",
    contraindications: "Tell your doctor if you have kidney or liver disease. May increase the effects of alcohol.",
    stock: 55,
    reviews: [
      { id: 1, user: "Rachel G.", rating: 5, comment: "Works great for my seasonal allergies without making me too drowsy.", date: "2023-07-20" },
      { id: 2, user: "Daniel P.", rating: 4, comment: "Effective, but does cause some dry mouth.", date: "2023-08-15" }
    ]
  },
  {
    id: 11,
    name: "Levocetirizine 5mg",
    brand: "Generic",
    price: 25,
    discountPrice: 22,
    rating: 4.7,
    category: "Allergy",
    quantity: "10 tablets",
    image: "/Levocetirizine.webp",
    description: "Levocetirizine is an antihistamine used to relieve allergy symptoms such as watery eyes, runny nose, itching, and sneezing.",
    usage: "Take once daily in the evening with or without food. Do not take more than recommended dose.",
    sideEffects: "May cause drowsiness, dry mouth, or fatigue. Serious side effects are rare but may include rapid heartbeat or vision changes.",
    contraindications: "Not recommended for people with severe kidney disease. Use caution if you have asthma or breathing problems.",
    stock: 35,
    reviews: [
      { id: 1, user: "Jessica T.", rating: 5, comment: "More effective than regular cetirizine for my severe allergies.", date: "2023-06-28" },
      { id: 2, user: "Kevin R.", rating: 4, comment: "Works overnight and lasts all day long.", date: "2023-05-17" }
    ]
  },
  {
    id: 12,
    name: "Montelukast 10mg",
    brand: "Generic",
    price: 70,
    discountPrice: 65,
    rating: 4.6,
    category: "Allergy",
    quantity: "10 tablets",
    image: "/Montelukast.webp",
    description: "Montelukast is a leukotriene receptor antagonist used to prevent wheezing, difficulty breathing, chest tightness, and coughing caused by asthma.",
    usage: "Take once daily in the evening with or without food. For asthma, continue to take even when you have no symptoms.",
    sideEffects: "May cause headache, dizziness, or stomach pain. Can rarely cause serious mood or behavior changes - contact your doctor if these occur.",
    contraindications: "Tell your doctor if you have liver disease or if you're pregnant or breastfeeding. May interact with other medications.",
    stock: 20,
    reviews: [
      { id: 1, user: "Michael B.", rating: 5, comment: "Greatly improved my asthma symptoms and seasonal allergies.", date: "2023-07-12" },
      { id: 2, user: "Amanda S.", rating: 4, comment: "Works well but a bit expensive compared to other allergy medications.", date: "2023-08-03" }
    ]
  },
  {
    id: 13,
    name: "Losartan 50mg",
    brand: "Generic",
    price: 30,
    discountPrice: 28,
    rating: 4.6,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Losartan.webp",
    description: "Losartan is an angiotensin II receptor blocker (ARB) that treats high blood pressure and protects the kidneys from damage due to diabetes.",
    usage: "Take once daily with or without food. Take at the same time each day. Do not stop taking without consulting your doctor.",
    sideEffects: "May cause dizziness, fatigue, or diarrhea. Serious side effects include fainting, swelling of face/throat, or changes in kidney function.",
    contraindications: "Not safe during pregnancy. Tell your doctor if you have liver or kidney disease, or if you're taking potassium supplements.",
    stock: 30,
    reviews: [
      { id: 1, user: "Robert J.", rating: 5, comment: "Effectively controls my blood pressure with fewer side effects than other medications I've tried.", date: "2023-06-10" },
      { id: 2, user: "Carol W.", rating: 4, comment: "Works well but occasionally causes mild dizziness when I stand up quickly.", date: "2023-07-25" }
    ]
  },
  {
    id: 14,
    name: "Telmisartan 40mg",
    brand: "Generic",
    price: 45,
    discountPrice: 40,
    rating: 4.7,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Telmisartan.webp",
    description: "Telmisartan is an angiotensin II receptor blocker (ARB) used to treat high blood pressure and reduce the risk of cardiovascular events.",
    usage: "Take once daily with or without food. Can be taken morning or evening, but at the same time each day.",
    sideEffects: "May cause dizziness, lightheadedness, or back pain. Serious side effects are rare but may include fainting or swelling.",
    contraindications: "Not recommended during pregnancy. Use with caution if you have liver or kidney problems.",
    stock: 28,
    reviews: [
      { id: 1, user: "Peter S.", rating: 5, comment: "Great medication for controlling my blood pressure with very few side effects.", date: "2023-08-10" },
      { id: 2, user: "Nancy F.", rating: 4, comment: "Works better than other blood pressure medications I've tried.", date: "2023-07-15" }
    ]
  },
  {
    id: 15,
    name: "Metoprolol 50mg",
    brand: "Generic",
    price: 25,
    discountPrice: 22,
    rating: 4.6,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Metoprolol.webp",
    description: "Metoprolol is a beta-blocker that treats high blood pressure, angina, and heart failure. It works by blocking the action of certain natural chemicals that affect the heart and blood vessels.",
    usage: "Take with or immediately after meals. Take at the same times each day. Do not suddenly stop taking this medication without consulting your doctor.",
    sideEffects: "May cause dizziness, tiredness, or slow heartbeat. Contact your doctor if you experience shortness of breath or swelling of the feet.",
    contraindications: "Tell your doctor if you have asthma, diabetes, or thyroid problems before taking this medication.",
    stock: 35,
    reviews: [
      { id: 1, user: "George H.", rating: 4, comment: "Effectively manages my heart rhythm issues but does cause some fatigue.", date: "2023-06-22" },
      { id: 2, user: "Barbara K.", rating: 5, comment: "This medication has been life-changing for my heart condition.", date: "2023-07-30" }
    ]
  },
  {
    id: 16,
    name: "Atenolol 50mg",
    brand: "Generic",
    price: 20,
    discountPrice: 18,
    rating: 4.7,
    category: "Cardiac",
    quantity: "14 tablets",
    image: "/Atenolol.webp",
    description: "Atenolol is a beta-blocker that affects the heart and circulation. It is used to treat angina and hypertension, and to improve survival after a heart attack.",
    usage: "Take once daily with or without food. Take at the same time each day for best results.",
    sideEffects: "May cause dizziness, fatigue, or slow heartbeat. Less likely to cause sleep problems than some other beta-blockers.",
    contraindications: "Not recommended for people with certain heart rhythm disorders, heart failure, or asthma. Use with caution in diabetes.",
    stock: 42,
    reviews: [
      { id: 1, user: "Sandra M.", rating: 5, comment: "Very effective at controlling my blood pressure with minimal side effects.", date: "2023-05-14" },
      { id: 2, user: "William T.", rating: 4, comment: "Works well but caused some cold hands and feet initially.", date: "2023-06-20" }
    ]
  },
  {
    id: 17,
    name: "Furosemide 40mg",
    brand: "Generic",
    price: 15,
    discountPrice: 12,
    rating: 4.6,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Furosemide.webp",
    description: "Furosemide is a loop diuretic that treats fluid retention and swelling caused by congestive heart failure, liver disease, or kidney disease.",
    usage: "Take in the morning to prevent nighttime urination. Take with food if stomach upset occurs. May increase urination frequency.",
    sideEffects: "May cause increased urination, thirst, muscle cramps, or dizziness. Can cause electrolyte imbalances that need monitoring.",
    contraindications: "Tell your doctor if you have kidney disease, liver disease, gout, or diabetes. May interact with many medications.",
    stock: 50,
    reviews: [
      { id: 1, user: "Dorothy L.", rating: 4, comment: "Effective at reducing my swelling, but I do need to stay near a bathroom.", date: "2023-08-05" },
      { id: 2, user: "Richard B.", rating: 5, comment: "Works quickly and effectively for my heart failure symptoms.", date: "2023-07-12" }
    ]
  },
  {
    id: 18,
    name: "Hydrochlorothiazide 25mg",
    brand: "Generic",
    price: 12,
    discountPrice: 10,
    rating: 4.5,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Hydrochlorothiazide.webp",
    description: "Hydrochlorothiazide is a thiazide diuretic that treats high blood pressure and fluid retention by helping your body get rid of excess salt and water.",
    usage: "Take once daily in the morning with food. May increase urination frequency, so best taken early in the day.",
    sideEffects: "May cause increased urination, dizziness, headache, or increased sensitivity to sunlight. May affect blood sugar and cholesterol levels.",
    contraindications: "Tell your doctor if you have kidney or liver disease, gout, diabetes, or lupus. May interact with many medications.",
    stock: 45,
    reviews: [
      { id: 1, user: "Elizabeth W.", rating: 4, comment: "Simple and effective for controlling my blood pressure.", date: "2023-06-30" },
      { id: 2, user: "Joseph C.", rating: 4, comment: "Works well but does require staying hydrated throughout the day.", date: "2023-05-25" }
    ]
  },
  {
    id: 19,
    name: "Spironolactone 25mg",
    brand: "Generic",
    price: 30,
    discountPrice: 28,
    rating: 4.6,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Spironolactone.webp",
    description: "Spironolactone is a potassium-sparing diuretic that treats high blood pressure, heart failure, and conditions that cause your body to make too much aldosterone.",
    usage: "Take once or twice daily with food. Regular blood tests may be needed to monitor potassium levels.",
    sideEffects: "May cause increased urination, dizziness, headache, or breast enlargement in men. May increase potassium levels in blood.",
    contraindications: "Not recommended for people with high potassium levels, severe kidney disease, or Addison's disease. Don't take with potassium supplements.",
    stock: 25,
    reviews: [
      { id: 1, user: "Margaret D.", rating: 5, comment: "Great for managing my edema from heart failure.", date: "2023-07-15" },
      { id: 2, user: "Thomas J.", rating: 4, comment: "Effective but requires regular blood tests to monitor potassium.", date: "2023-08-02" }
    ]
  },
  {
    id: 20,
    name: "Clopidogrel 75mg",
    brand: "Generic",
    price: 50,
    discountPrice: 45,
    rating: 4.7,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Clopidogrel.webp",
    description: "Clopidogrel is an antiplatelet medication that prevents blood clots. It's used to reduce the risk of heart attack and stroke in people at high risk.",
    usage: "Take once daily with or without food. Do not stop taking without consulting your doctor, especially if you have a stent.",
    sideEffects: "May cause bleeding more easily, bruising, or rash. Serious side effects include unusual bleeding or signs of blood in urine or stool.",
    contraindications: "Use with caution if you have a history of bleeding disorders, recent surgery, or ulcers. May interact with many medications.",
    stock: 30,
    reviews: [
      { id: 1, user: "Charles R.", rating: 5, comment: "Essential medication after my heart stent placement. No issues so far.", date: "2023-06-08" },
      { id: 2, user: "Betty M.", rating: 4, comment: "Does cause some bruising but worth it for heart protection.", date: "2023-07-22" }
    ]
  },
  {
    id: 21,
    name: "Aspirin 75mg",
    brand: "Generic",
    price: 10,
    discountPrice: 8,
    rating: 4.6,
    category: "Pain Relief",
    quantity: "14 tablets",
    image: "/Aspirin.webp",
    description: "Low-dose aspirin is used to prevent blood clots, reducing the risk of heart attack and stroke in high-risk individuals.",
    usage: "Take once daily with food to reduce stomach irritation. Take with a full glass of water.",
    sideEffects: "May cause stomach upset, heartburn, or easy bruising. Serious side effects include stomach bleeding or allergic reactions.",
    contraindications: "Do not use if allergic to NSAIDs, have bleeding disorders, stomach ulcers, or are about to have surgery. Not recommended for children.",
    stock: 60,
    reviews: [
      { id: 1, user: "Donald T.", rating: 5, comment: "Simple, affordable heart protection as recommended by my doctor.", date: "2023-07-05" },
      { id: 2, user: "Helen P.", rating: 4, comment: "Takes some getting used to but an essential part of my heart health regimen.", date: "2023-06-15" }
    ]
  },
  {
    id: 22,
    name: "Rosuvastatin 10mg",
    brand: "Generic",
    price: 50,
    discountPrice: 45,
    rating: 4.7,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Rosuvastatin.webp",
    description: "Rosuvastatin is a statin that lowers cholesterol and triglycerides in the blood, reducing the risk of heart disease, stroke, and vascular disease.",
    usage: "Take once daily, at the same time each day, with or without food. Follow a low-cholesterol diet for best results.",
    sideEffects: "May cause muscle pain, constipation, or mild stomach pain. Serious side effects include severe muscle pain or weakness with fever.",
    contraindications: "Tell your doctor if you have liver disease, kidney disease, or thyroid disorder. May interact with certain medications.",
    stock: 35,
    reviews: [
      { id: 1, user: "Steven R.", rating: 5, comment: "Significantly improved my cholesterol levels within two months.", date: "2023-08-10" },
      { id: 2, user: "Linda G.", rating: 4, comment: "Very effective but occasionally causes some muscle soreness.", date: "2023-07-18" }
    ]
  },
  {
    id: 23,
    name: "Simvastatin 20mg",
    brand: "Generic",
    price: 30,
    discountPrice: 28,
    rating: 4.6,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Simvastatin.webp",
    description: "Simvastatin is a statin medication that lowers cholesterol and triglycerides in the blood, reducing the risk of heart disease and stroke.",
    usage: "Take once daily in the evening. Avoid grapefruit products which can increase side effects. Follow a low-cholesterol diet.",
    sideEffects: "May cause muscle pain, stomach pain, or constipation. Report any unexplained muscle pain, tenderness, or weakness promptly.",
    contraindications: "Not recommended during pregnancy. Tell your doctor if you have liver disease or drink large amounts of alcohol.",
    stock: 40,
    reviews: [
      { id: 1, user: "Edward F.", rating: 5, comment: "Effective and affordable for managing my cholesterol.", date: "2023-06-25" },
      { id: 2, user: "Susan B.", rating: 4, comment: "Works well but I have to be careful about grapefruit juice interactions.", date: "2023-07-30" }
    ]
  },
  {
    id: 24,
    name: "Doxycycline 100mg",
    brand: "Generic",
    price: 40,
    discountPrice: 35,
    rating: 4.6,
    category: "Antibiotics",
    quantity: "10 capsules",
    image: "/Doxycycline.webp",
    description: "Doxycycline is a tetracycline antibiotic that treats a wide variety of bacterial infections, including respiratory and urinary tract infections.",
    usage: "Take with a full glass of water. Take with food if stomach upset occurs. Do not lie down for at least 30 minutes after taking.",
    sideEffects: "May cause nausea, vomiting, diarrhea, or increased sensitivity to sunlight. Use sunscreen and protective clothing when outdoors.",
    contraindications: "Not recommended during pregnancy or for children under 8. Tell your doctor if you have liver or kidney disease.",
    stock: 25,
    reviews: [
      { id: 1, user: "Paul M.", rating: 4, comment: "Effective for my skin infection but did cause some stomach upset.", date: "2023-06-18" },
      { id: 2, user: "Jennifer L.", rating: 5, comment: "Quickly resolved my respiratory infection.", date: "2023-08-05" }
    ]
  },
  {
    id: 25,
    name: "Levofloxacin 500mg",
    brand: "Generic",
    price: 70,
    discountPrice: 65,
    rating: 4.7,
    category: "Antibiotics",
    quantity: "5 tablets",
    image: "/Levofloxacin.jpg",
    description: "Levofloxacin is a fluoroquinolone antibiotic used to treat bacterial infections of the sinuses, lungs, urinary tract, and skin.",
    usage: "Take with a full glass of water. Can be taken with or without food. Take at least 2 hours before or after antacids, iron, or zinc products.",
    sideEffects: "May cause nausea, diarrhea, headache, or dizziness. Serious side effects include tendon problems, nerve damage, and allergic reactions.",
    contraindications: "Not recommended for people with myasthenia gravis or a history of tendon problems. Use with caution in elderly patients.",
    stock: 20,
    reviews: [
      { id: 1, user: "Kenneth W.", rating: 5, comment: "Powerful antibiotic that quickly cleared my severe sinus infection.", date: "2023-07-15" },
      { id: 2, user: "Maria S.", rating: 4, comment: "Effective but did cause some tendon discomfort while taking it.", date: "2023-08-03" }
    ]
  },
  // Add more medicines with details as needed
];

const MedicineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [medicine, setMedicine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState(0);

  useEffect(() => {
    // In a real app, this would be an API call
    const loadMedicine = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        const foundMedicine = medicineData.find(m => m.id === Number(id));
        if (foundMedicine) {
          setMedicine(foundMedicine);
          
          // Generate random estimated delivery time between 10-20 minutes
          const minutes = Math.floor(Math.random() * 11) + 10; // 10-20 minutes
          setEstimatedMinutes(minutes);
        } else {
          // If medicine not found, go back to medicines page
          toast({
            variant: "destructive",
            title: "Medicine not found",
            description: "The requested medicine could not be found."
          });
          navigate('/medicines');
        }
      } catch (error) {
        console.error("Error loading medicine:", error);
        toast({
          variant: "destructive",
          title: "Error loading medicine",
          description: "There was an error loading the medicine details."
        });
      } finally {
        setLoading(false);
      }
    };

    loadMedicine();
  }, [id, navigate, toast]);

  const incrementQuantity = () => {
    if (medicine && quantity < medicine.stock) {
      setQuantity(prev => prev + 1);
    } else {
      toast({
        variant: "destructive", // Changed from "warning" to "destructive" to fix the error
        title: "Maximum quantity reached",
        description: "You've reached the maximum available quantity for this product."
      });
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (medicine) {
      addToCart(medicine, quantity);
      toast({
        title: "Added to cart",
        description: `${quantity} ${quantity === 1 ? 'unit' : 'units'} of ${medicine.name} added to your cart.`
      });
    }
  };

  const handleOrderNow = () => {
    if (medicine) {
      // Add to cart and then open checkout dialog
      addToCart(medicine, quantity);
      setShowCheckoutDialog(true);
    }
  };

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: `${medicine?.name} has been ${isWishlisted ? "removed from" : "added to"} your wishlist.`
    });
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
  };

  const handleProceedToPayment = () => {
    if (!deliveryAddress.trim()) {
      toast({
        variant: "destructive",
        title: "Address required",
        description: "Please enter a delivery address to continue."
      });
      return;
    }
    setCheckoutStep(2);
  };

  const handlePlaceOrder = () => {
    // Simulate payment processing
    setCheckoutStep(3);
    
    // Generate random order number
    const randomOrderNumber = "MED" + Math.floor(100000 + Math.random() * 900000);
    setOrderNumber(randomOrderNumber);
    
    // Simulate order confirmation after 2 seconds
    setTimeout(() => {
      setOrderPlaced(true);
    }, 2000);
  };

  const handleCloseCheckout = () => {
    if (orderPlaced) {
      // If order was placed, navigate to medicines page
      setShowCheckoutDialog(false);
      setOrderPlaced(false);
      setCheckoutStep(1);
      setDeliveryAddress("");
      navigate('/medicines');
    } else {
      // Just close the dialog
      setShowCheckoutDialog(false);
      setCheckoutStep(1);
      setDeliveryAddress("");
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-2/5">
                <Skeleton className="w-full aspect-square rounded-lg" />
              </div>
              <div className="w-full md:w-3/5 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <div className="pt-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!medicine) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Medicine Not Found</h1>
          <p className="text-gray-600 mb-6">The medicine you're looking for could not be found.</p>
          <Button onClick={() => navigate('/medicines')}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Medicines
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Button 
            variant="outline" 
            className="mb-6" 
            onClick={() => navigate('/medicines')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Medicines
          </Button>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Product Image */}
            <div className="w-full md:w-2/5">
              <motion.div 
                className="bg-white border rounded-lg overflow-hidden shadow-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative aspect-square">
                  <img 
                    src={medicine.image} 
                    alt={medicine.name} 
                    className="w-full h-full object-contain p-8"
                  />
                  {medicine.discountPrice < medicine.price && (
                    <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600">
                      {Math.round(((medicine.price - medicine.discountPrice) / medicine.price) * 100)}% OFF
                    </Badge>
                  )}
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute top-4 right-4"
                    onClick={handleToggleWishlist}
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Product Details */}
            <div className="w-full md:w-3/5">
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{medicine.name}</h1>
                  <p className="text-gray-500">{medicine.brand}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 font-medium">{medicine.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    ({medicine.reviews?.length || 0} reviews)
                  </span>
                  <Badge variant="outline" className="ml-2">{medicine.category}</Badge>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">₹{medicine.discountPrice}</span>
                  {medicine.discountPrice < medicine.price && (
                    <span className="text-lg text-gray-500 line-through">₹{medicine.price}</span>
                  )}
                  <span className="text-sm text-gray-600">per {medicine.quantity}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <span className={`mr-2 ${medicine.stock > 10 ? 'text-green-600' : medicine.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {medicine.stock > 10 
                      ? 'In Stock' 
                      : medicine.stock > 0 
                        ? `Only ${medicine.stock} left` 
                        : 'Out of Stock'}
                  </span>
                </div>

                <div className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-md">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10"
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-10 text-center font-medium">{quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10"
                        onClick={incrementQuantity}
                        disabled={medicine.stock <= quantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button 
                      className="bg-medical-500 hover:bg-medical-600 text-white"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button 
                      className="bg-medical-600 hover:bg-medical-700 text-white"
                      onClick={handleOrderNow}
                    >
                      Order Now
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="flex items-center">
                    <Truck className="h-5 w-5 text-medical-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium">Free Delivery</div>
                      <div className="text-xs text-gray-500">On orders above ₹199</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-medical-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium">Genuine Products</div>
                      <div className="text-xs text-gray-500">100% authentic</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-medical-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium">Express Delivery</div>
                      <div className="text-xs text-gray-500">In {estimatedMinutes} minutes</div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <Tabs defaultValue="description" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="usage">Usage</TabsTrigger>
                  <TabsTrigger value="sideEffects">Side Effects</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="pt-4">
                  <div className="text-gray-700 space-y-4">
                    <p>{medicine.description}</p>
                    <p>{medicine.contraindications}</p>
                  </div>
                </TabsContent>
                <TabsContent value="usage" className="pt-4">
                  <div className="text-gray-700 space-y-4">
                    <h3 className="font-medium">How to use {medicine.name}</h3>
                    <p>{medicine.usage}</p>
                    <div className="flex items-start gap-2 bg-blue-50 p-4 rounded-md">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        Always consult with a healthcare professional before starting any medication.
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="sideEffects" className="pt-4">
                  <div className="text-gray-700 space-y-4">
                    <h3 className="font-medium">Possible Side Effects</h3>
                    <p>{medicine.sideEffects}</p>
                    <div className="flex items-start gap-2 bg-yellow-50 p-4 rounded-md">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div className="text-sm text-yellow-700">
                        If you experience severe or persistent side effects, stop taking the medication and contact your doctor immediately.
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="reviews" className="pt-4">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center bg-medical-50 rounded-full h-16 w-16">
                        <div className="text-center">
                          <div className="text-xl font-bold text-medical-600">{medicine.rating}</div>
                          <div className="flex items-center justify-center">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const reviewCount = medicine.reviews?.filter((r: any) => r.rating === star).length || 0;
                            const percentage = medicine.reviews?.length ? (reviewCount / medicine.reviews.length) * 100 : 0;
                            
                            return (
                              <div key={star} className="flex items-center gap-2">
                                <div className="text-sm text-gray-600 w-6">{star}</div>
                                <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                                <Progress value={percentage} className="h-2 flex-1" />
                                <div className="text-sm text-gray-600 w-10">{reviewCount}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="divide-y">
                      {medicine.reviews && medicine.reviews.length > 0 ? (
                        medicine.reviews.map((review: any) => (
                          <div key={review.id} className="py-4">
                            <div className="flex justify-between mb-1">
                              <div className="font-medium">{review.user}</div>
                              <div className="text-sm text-gray-500">{review.date}</div>
                            </div>
                            <div className="flex items-center mb-2">
                              {Array.from({ length: 5 }).map((_, index) => (
                                <Star 
                                  key={index} 
                                  className={`h-4 w-4 ${index < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center text-gray-500">
                          No reviews available for this product yet.
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {orderPlaced 
                ? "Order Placed Successfully!" 
                : checkoutStep === 3 
                  ? "Processing Payment" 
                  : checkoutStep === 2 
                    ? "Payment Details" 
                    : "Shipping Details"}
            </DialogTitle>
            <DialogDescription>
              {orderPlaced 
                ? `Your order #${orderNumber} has been placed successfully.` 
                : checkoutStep === 3 
                  ? "Please wait while we process your payment." 
                  : checkoutStep === 2 
                    ? "Enter your payment details to complete your order." 
                    : "Enter your shipping address to proceed with your order."}
            </DialogDescription>
          </DialogHeader>

          {checkoutStep === 1 && (
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label htmlFor="address">Delivery Address</Label>
                <Input
                  id="address"
                  placeholder="Enter your full address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-1">
                <Label>Delivery Option</Label>
                <div className="flex items-center justify-between space-x-2 rounded-md border p-3 bg-medical-50">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-medical-600" />
                    <Label className="font-medium text-medical-700">Express Delivery</Label>
                  </div>
                  <div className="text-sm font-medium text-medical-700">In {estimatedMinutes} minutes</div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Our quick delivery service ensures your medicine will arrive in {estimatedMinutes} minutes or less</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{medicine.discountPrice * quantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>₹40</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>₹{medicine.discountPrice * quantity + 40}</span>
                </div>
              </div>
            </div>
          )}

          {checkoutStep === 2 && (
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label>Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={handlePaymentMethodChange} className="space-y-2">
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="font-normal">Credit/Debit Card</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="font-normal">UPI</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="font-normal">Cash on Delivery</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {paymentMethod === 'card' && (
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input id="cardName" placeholder="John Doe" />
                  </div>
                </div>
              )}
              
              {paymentMethod === 'upi' && (
                <div className="space-y-1">
                  <Label htmlFor="upiId">UPI ID</Label>
                  <Input id="upiId" placeholder="yourname@upi" />
                </div>
              )}
              
              {paymentMethod === 'cod' && (
                <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-700">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-1" />
                    <div>
                      <p className="font-medium">Cash on Delivery Available</p>
                      <p>Please keep exact change ready at the time of delivery.</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Total Amount</span>
                  <span className="font-medium">₹{medicine.discountPrice * quantity + 40}</span>
                </div>
              </div>
            </div>
          )}

          {checkoutStep === 3 && !orderPlaced && (
            <div className="py-6 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical-600"></div>
                <p className="text-gray-500">Processing your payment, please wait...</p>
              </div>
            </div>
          )}

          {orderPlaced && (
            <div className="py-4 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-green-100 rounded-full p-3">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-lg">Thank you for your order!</p>
                  <p className="text-gray-600">Order #: {orderNumber}</p>
                  <p className="text-gray-600 text-sm mt-1">
                    Your order will arrive in approximately {estimatedMinutes} minutes
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {orderPlaced ? (
              <Button 
                onClick={handleCloseCheckout}
                className="w-full bg-medical-600 hover:bg-medical-700"
              >
                Continue Shopping
              </Button>
            ) : checkoutStep === 3 ? (
              <Button disabled className="w-full">
                Processing...
              </Button>
            ) : checkoutStep === 2 ? (
              <div className="flex w-full gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setCheckoutStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handlePlaceOrder}
                  className="flex-1 bg-medical-600 hover:bg-medical-700"
                >
                  Place Order
                </Button>
              </div>
            ) : (
              <div className="flex w-full gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleCloseCheckout}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleProceedToPayment}
                  className="flex-1 bg-medical-600 hover:bg-medical-700"
                >
                  Proceed to Payment
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default MedicineDetails;
