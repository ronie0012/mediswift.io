from django.contrib import admin
from .models import (
    Specialization,
    Doctor,
    Patient,
    Appointment,
    MedicalRecord,
    Medication,
    Prescription
)

@admin.register(Specialization)
class SpecializationAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name', 'description')


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'specialization', 'license_number', 'years_of_experience', 'is_available')
    list_filter = ('specialization', 'is_available')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'license_number')


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'gender', 'date_of_birth', 'blood_group')
    list_filter = ('gender', 'blood_group')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'phone_number')


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('doctor', 'patient', 'appointment_date', 'start_time', 'end_time', 'status')
    list_filter = ('status', 'appointment_date')
    search_fields = ('doctor__user__last_name', 'patient__user__last_name', 'reason')
    date_hierarchy = 'appointment_date'


@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'visit_date', 'diagnosis')
    list_filter = ('visit_date',)
    search_fields = ('patient__user__last_name', 'doctor__user__last_name', 'diagnosis', 'symptoms')
    date_hierarchy = 'visit_date'


@admin.register(Medication)
class MedicationAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name', 'description')


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ('medication', 'medical_record', 'dosage', 'frequency', 'duration')
    list_filter = ('frequency',)
    search_fields = ('medication__name', 'medical_record__patient__user__last_name', 'dosage')
