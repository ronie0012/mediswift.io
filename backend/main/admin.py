from django.contrib import admin
from .models import UserProfile, Medicine, MedicineCategory, Prescription, CustomerFeedback


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'created_at')
    search_fields = ('user__username', 'phone')
    list_filter = ('created_at',)


@admin.register(MedicineCategory)
class MedicineCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'category', 'price', 'discount_price', 'stock', 'is_featured', 'requires_prescription')
    list_filter = ('category', 'is_featured', 'requires_prescription')
    search_fields = ('name', 'brand')
    list_editable = ('is_featured', 'stock')


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'status', 'uploaded_at')
    list_filter = ('status',)
    search_fields = ('user__username',)


@admin.register(CustomerFeedback)
class CustomerFeedbackAdmin(admin.ModelAdmin):
    list_display = ('subject', 'category', 'status', 'created_at')
    list_filter = ('category', 'status')
    search_fields = ('subject', 'message', 'email')
