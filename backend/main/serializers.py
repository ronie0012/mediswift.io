from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Medicine, MedicineCategory, Prescription, CustomerFeedback, Order, OrderItem


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = '__all__'


class MedicineCategorySerializer(serializers.ModelSerializer):
    medicine_count = serializers.SerializerMethodField()

    class Meta:
        model = MedicineCategory
        fields = ['id', 'name', 'slug', 'description', 'icon', 'medicine_count']

    def get_medicine_count(self, obj):
        return obj.medicines.count()


class MedicineSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    image = serializers.SerializerMethodField()
    discount_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Medicine
        fields = [
            'id', 'name', 'brand', 'category', 'category_name',
            'description', 'price', 'discount_price', 'stock',
            'quantity', 'image', 'requires_prescription',
            'is_featured', 'rating', 'review_count',
            'discount_percentage', 'created_at'
        ]

    def get_image(self, obj):
        return obj.get_image()

    def get_discount_percentage(self, obj):
        if obj.discount_price and obj.price:
            return round((1 - float(obj.discount_price) / float(obj.price)) * 100)
        return 0


class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = ['id', 'file', 'notes', 'status', 'uploaded_at']
        read_only_fields = ['status', 'uploaded_at']


class CustomerFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerFeedback
        fields = ['id', 'name', 'email', 'category', 'subject', 'message', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'medicine', 'medicine_name', 'price', 'quantity']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'customer_name', 'customer_email', 'customer_phone',
            'shipping_address', 'total_amount', 'status', 'payment_method',
            'is_paid', 'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['created_at', 'updated_at', 'total_amount', 'user']