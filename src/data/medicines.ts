export interface Medicine {
  id: number;
  name: string;
  brand: string;
  price: number;
  discountPrice: number;
  rating: number;
  category: string;
  quantity: string;
  image: string;
  description?: string;
  usage?: string;
  sideEffects?: string;
  contraindications?: string;
  stock?: number;
  reviews?: Array<{
    id: number;
    user: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}

export const medicineData: Medicine[] = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    brand: "Generic",
    price: 35,
    discountPrice: 30,
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
    price: 84,
    discountPrice: 75,
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
    price: 90,
    discountPrice: 80,
    rating: 4.7,
    category: "Antibiotics",
    quantity: "3 tablets",
    image: "/Azithromycin.webp",
    description: "Azithromycin is an antibiotic that fights bacteria. It's used to treat a wide variety of bacterial infections.",
    usage: "Take one tablet daily, with or without food. Complete the full course prescribed by your doctor.",
    sideEffects: "Common side effects include diarrhea, nausea, abdominal pain, and vomiting.",
    contraindications: "Do not use if you have a history of allergic reactions to azithromycin or similar antibiotics.",
    stock: 20,
    reviews: [
      { id: 1, user: "James W.", rating: 5, comment: "Worked well for my infection.", date: "2023-03-12" }
    ]
  },
  {
    id: 4,
    name: "Ciprofloxacin 500mg",
    brand: "Generic",
    price: 70,
    discountPrice: 65,
    rating: 4.5,
    category: "Antibiotics",
    quantity: "10 tablets",
    image: "/Ciprofloxacin.webp",
    description: "Ciprofloxacin is a fluoroquinolone antibiotic used to treat bacterial infections.",
    usage: "Take one tablet twice daily, with or without food, as directed by your doctor.",
    sideEffects: "May cause tendon damage, nervous system effects, and other serious side effects.",
    contraindications: "Not recommended for those with a history of tendon disorders related to fluoroquinolone use.",
    stock: 25,
    reviews: [
      { id: 1, user: "Patricia L.", rating: 4, comment: "Effective for UTI, but had some mild side effects.", date: "2023-02-15" }
    ]
  },
  {
    id: 5,
    name: "Metformin 500mg",
    brand: "Generic",
    price: 25,
    discountPrice: 22,
    rating: 4.6,
    category: "Diabetes",
    quantity: "10 tablets",
    image: "/Metformin.webp",
    description: "Metformin is used to control blood sugar levels in people with type 2 diabetes.",
    usage: "Take with meals to minimize stomach upset. Follow your doctor's instructions carefully.",
    sideEffects: "May cause stomach upset, diarrhea, and metallic taste which usually improve with time.",
    contraindications: "Not suitable for those with severe kidney disease or metabolic acidosis.",
    stock: 40,
    reviews: [
      { id: 1, user: "David C.", rating: 5, comment: "Helps control my blood sugar effectively.", date: "2023-01-20" }
    ]
  },
  {
    id: 6,
    name: "Amlodipine 5mg",
    brand: "Generic",
    price: 15,
    discountPrice: 12,
    rating: 4.8,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Amlodipine.webp",
    description: "Amlodipine is a calcium channel blocker used to treat high blood pressure and angina.",
    usage: "Take once daily with or without food at the same time each day.",
    sideEffects: "May cause swelling in ankles or feet, dizziness, and flushing.",
    contraindications: "Inform your doctor if you have liver disease or severe heart problems.",
    stock: 55,
    reviews: [
      { id: 1, user: "Susan K.", rating: 4, comment: "Keeps my blood pressure well controlled.", date: "2023-04-05" }
    ]
  },
  {
    id: 7,
    name: "Atorvastatin 10mg",
    brand: "Generic",
    price: 55,
    discountPrice: 48,
    rating: 4.7,
    category: "Cardiac",
    quantity: "10 tablets",
    image: "/Atorvastatin.webp",
    description: "Atorvastatin is used to lower cholesterol and reduce the risk of heart disease.",
    usage: "Take once daily, with or without food, preferably in the evening.",
    sideEffects: "May cause muscle pain, weakness, and liver enzyme abnormalities.",
    contraindications: "Not suitable for pregnant women or those with active liver disease.",
    stock: 30,
    reviews: [
      { id: 1, user: "Thomas H.", rating: 5, comment: "Helped lower my cholesterol significantly.", date: "2023-03-18" }
    ]
  },
  {
    id: 8,
    name: "Omeprazole 20mg",
    brand: "Generic",
    price: 20,
    discountPrice: 18,
    rating: 4.7,
    category: "Gastro",
    quantity: "10 capsules",
    image: "/Omeprazole.webp",
    description: "Omeprazole reduces stomach acid production and treats conditions like GERD and peptic ulcers.",
    usage: "Take before meals, typically once daily in the morning.",
    sideEffects: "May cause headache, abdominal pain, and nausea.",
    contraindications: "Inform your doctor if you're taking other medications as interactions may occur.",
    stock: 45,
    reviews: [
      { id: 1, user: "Nancy P.", rating: 5, comment: "Great relief for my acid reflux.", date: "2023-02-10" }
    ]
  },
  {
    id: 9,
    name: "Pantoprazole 40mg",
    brand: "Generic",
    price: 40,
    discountPrice: 35,
    rating: 4.6,
    category: "Gastro",
    quantity: "10 tablets",
    image: "/Pantoprazole.webp",
    description: "Pantoprazole is a proton pump inhibitor that reduces stomach acid production.",
    usage: "Take once daily, with or without food. Swallow whole with water.",
    sideEffects: "May cause headache, diarrhea, and stomach pain.",
    contraindications: "Inform your doctor of all medications you take to avoid potential interactions.",
    stock: 38,
    reviews: [
      { id: 1, user: "Karen L.", rating: 4, comment: "Works well for my stomach issues.", date: "2023-01-25" }
    ]
  }
]; 