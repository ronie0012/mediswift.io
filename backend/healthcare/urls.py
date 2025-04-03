from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SpecializationViewSet,
    DoctorViewSet,
    PatientViewSet,
    AppointmentViewSet,
    MedicalRecordViewSet,
    MedicationViewSet,
    PrescriptionViewSet
)

router = DefaultRouter()
router.register(r'specializations', SpecializationViewSet, basename='specialization')
router.register(r'doctors', DoctorViewSet, basename='doctor')
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'medical-records', MedicalRecordViewSet, basename='medical-record')
router.register(r'medications', MedicationViewSet, basename='medication')
router.register(r'prescriptions', PrescriptionViewSet, basename='prescription')

urlpatterns = [
    path('', include(router.urls)),
] 