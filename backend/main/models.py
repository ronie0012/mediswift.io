from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s profile"


class MedicineCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Medicine Categories"
        ordering = ['name']

    def __str__(self):
        return self.name


class Medicine(models.Model):
    name = models.CharField(max_length=200)
    brand = models.CharField(max_length=100, blank=True)
    category = models.ForeignKey(MedicineCategory, on_delete=models.SET_NULL, null=True, related_name='medicines')
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock = models.PositiveIntegerField(default=0)
    quantity = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to='medicines/', null=True, blank=True)
    image_url = models.URLField(blank=True)
    requires_prescription = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    review_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_featured', '-created_at']

    def __str__(self):
        return self.name

    def get_image(self):
        if self.image:
            return self.image.url
        if self.image_url:
            return self.image_url
        return '/Paracetamol.webp'


class Prescription(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='prescriptions')
    file = models.FileField(upload_to='prescriptions/')
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Prescription by {self.user.username} - {self.status}"


class CustomerFeedback(models.Model):
    CATEGORY_CHOICES = [
        ('wrong_medicine', 'Wrong Medicine'),
        ('late_delivery', 'Late Delivery'),
        ('payment_issue', 'Payment Issue'),
        ('app_bug', 'App Bug'),
        ('other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
    ]
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    subject = models.CharField(max_length=200)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.category} - {self.subject[:50]}"


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending / Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled')
    ]
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    customer_name = models.CharField(max_length=150)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20)
    shipping_address = models.TextField()
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=50, default='Cash on Delivery')
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} by {self.customer_name}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    medicine = models.ForeignKey(Medicine, on_delete=models.SET_NULL, null=True, blank=True)
    medicine_name = models.CharField(max_length=200)  # stored in case medicine is deleted
    price = models.DecimalField(max_digits=10, decimal_places=2)  # price at time of purchase
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.medicine_name} (Order #{self.order.id})"
