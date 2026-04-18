import os
import django
from decimal import Decimal

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mediswift_backend.settings')
django.setup()

from main.models import Medicine, MedicineCategory

print("Seeding database with medicines...")

# Clear existing data just in case
Medicine.objects.all().delete()
MedicineCategory.objects.all().delete()

categories_data = [
    {"name": "Pain Relief", "slug": "pain-relief", "description": "Medicines for passing pain and fever."},
    {"name": "Antibiotics", "slug": "antibiotics", "description": "Medicines that fight bacterial infections."},
    {"name": "Cardiac", "slug": "cardiac", "description": "Medications for heart conditions and hypertension."},
    {"name": "Gastro", "slug": "gastro", "description": "Digestive system medications and antacids."},
    {"name": "Allergy", "slug": "allergy", "description": "Antihistamines and allergy relief."},
    {"name": "Diabetes", "slug": "diabetes", "description": "Medications for managing blood sugar levels."},
]

category_objs = {}
for cat in categories_data:
    obj, created = MedicineCategory.objects.get_or_create(
        name=cat['name'],
        slug=cat['slug'],
        defaults={'description': cat['description']}
    )
    category_objs[cat['name']] = obj

medicine_data = [
    {
        "name": "Paracetamol 500mg", "brand": "Generic", "price": 35, "discount_price": 32, "rating": 4.8, 
        "category": "Pain Relief", "quantity": "10 tablets", "image_url": "/Paracetamol.webp", "is_featured": True
    },
    {
        "name": "Amoxicillin 500mg", "brand": "Generic", "price": 84, "discount_price": 79, "rating": 4.7, 
        "category": "Antibiotics", "quantity": "10 capsules", "image_url": "/Amoxicillin.webp", "requires_prescription": True, "is_featured": True
    },
    {
        "name": "Azithromycin 500mg", "brand": "Generic", "price": 90, "discount_price": 85, "rating": 4.7, 
        "category": "Antibiotics", "quantity": "3 tablets", "image_url": "/Azithromycin.webp", "requires_prescription": True, "is_featured": True
    },
    {
        "name": "Ciprofloxacin 500mg", "brand": "Generic", "price": 70, "discount_price": 65, "rating": 4.5, 
        "category": "Antibiotics", "quantity": "10 tablets", "image_url": "/Ciprofloxacin.webp", "requires_prescription": True
    },
    {
        "name": "Metformin 500mg", "brand": "Generic", "price": 25, "discount_price": 22, "rating": 4.6, 
        "category": "Diabetes", "quantity": "10 tablets", "image_url": "/Metformin.webp", "requires_prescription": True, "is_featured": True
    },
    {
        "name": "Amlodipine 5mg", "brand": "Generic", "price": 15, "discount_price": 12, "rating": 4.8, 
        "category": "Cardiac", "quantity": "10 tablets", "image_url": "/Amlodipine.webp", "requires_prescription": True
    },
    {
        "name": "Atorvastatin 10mg", "brand": "Generic", "price": 55, "discount_price": 50, "rating": 4.7, 
        "category": "Cardiac", "quantity": "10 tablets", "image_url": "/Atorvastatin.webp", "requires_prescription": True
    },
    {
        "name": "Omeprazole 20mg", "brand": "Generic", "price": 20, "discount_price": 18, "rating": 4.7, 
        "category": "Gastro", "quantity": "10 capsules", "image_url": "/Omeprazole.webp"
    },
    {
        "name": "Pantoprazole 40mg", "brand": "Generic", "price": 40, "discount_price": 36, "rating": 4.6, 
        "category": "Gastro", "quantity": "10 tablets", "image_url": "/Pantoprazole.webp"
    },
    {
        "name": "Cetirizine 10mg", "brand": "Generic", "price": 10, "discount_price": 8, "rating": 4.8, 
        "category": "Allergy", "quantity": "10 tablets", "image_url": "/Cetirizine.webp"
    },
    {
        "name": "Levocetirizine 5mg", "brand": "Generic", "price": 12, "discount_price": 10, "rating": 4.7, 
        "category": "Allergy", "quantity": "10 tablets", "image_url": "/Levocetirizine.webp"
    },
    {
        "name": "Montelukast 10mg", "brand": "Generic", "price": 35, "discount_price": 30, "rating": 4.6, 
        "category": "Allergy", "quantity": "10 tablets", "image_url": "/Montelukast.webp"
    },
    {
        "name": "Losartan 50mg", "brand": "Generic", "price": 28, "discount_price": 25, "rating": 4.6, 
        "category": "Cardiac", "quantity": "10 tablets", "image_url": "/Losartan.webp", "requires_prescription": True
    },
    {
        "name": "Telmisartan 40mg", "brand": "Generic", "price": 38, "discount_price": 34, "rating": 4.7, 
        "category": "Cardiac", "quantity": "10 tablets", "image_url": "/Telmisartan.webp", "requires_prescription": True
    },
    {
        "name": "Metoprolol 50mg", "brand": "Generic", "price": 30, "discount_price": 27, "rating": 4.6, 
        "category": "Cardiac", "quantity": "10 tablets", "image_url": "/Metoprolol.webp", "requires_prescription": True
    },
    {
        "name": "Aspirin 75mg", "brand": "Generic", "price": 5, "discount_price": 4, "rating": 4.6, 
        "category": "Pain Relief", "quantity": "14 tablets", "image_url": "/Aspirin.webp"
    },
]

for item in medicine_data:
    cat_obj = category_objs.get(item['category'])
    if not cat_obj:
        continue
    
    Medicine.objects.create(
        name=item['name'],
        brand=item['brand'],
        price=Decimal(item['price']),
        discount_price=Decimal(item['discount_price']),
        rating=Decimal(item['rating']),
        category=cat_obj,
        quantity=item['quantity'],
        image_url=item['image_url'],
        requires_prescription=item.get('requires_prescription', False),
        is_featured=item.get('is_featured', False),
        stock=100,
        review_count=120
    )

print(f"Successfully seeded {MedicineCategory.objects.count()} categories and {Medicine.objects.count()} medicines.")
