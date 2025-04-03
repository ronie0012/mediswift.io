from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth.models import User
from datetime import date

from .models import (
    Specialization,
    Doctor,
    Patient,
    Appointment,
    MedicalRecord,
    Medication,
    Prescription
)

from .serializers import (
    SpecializationSerializer,
    DoctorSerializer,
    PatientSerializer,
    AppointmentSerializer,
    MedicalRecordSerializer,
    MedicationSerializer,
    PrescriptionSerializer
)


class IsOwnerOrStaff(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or staff to access it.
    """
    def has_object_permission(self, request, view, obj):
        # Staff can access any object
        if request.user.is_staff:
            return True
        
        # Check if the object has a user field
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # Check if the object is a medical record belonging to a patient
        if hasattr(obj, 'patient') and hasattr(obj.patient, 'user'):
            return obj.patient.user == request.user
        
        # Check if the object is an appointment
        if hasattr(obj, 'doctor') and hasattr(obj.doctor, 'user'):
            if obj.doctor.user == request.user:
                return True
            
        if hasattr(obj, 'patient') and hasattr(obj.patient, 'user'):
            if obj.patient.user == request.user:
                return True
        
        return False


class SpecializationViewSet(viewsets.ModelViewSet):
    queryset = Specialization.objects.all()
    serializer_class = SpecializationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    
    def get_permissions(self):
        """
        Only allow admin users to create/update/delete specializations
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__first_name', 'user__last_name', 'specialization__name', 'bio']
    ordering_fields = ['user__last_name', 'years_of_experience', 'created_at']
    
    def get_permissions(self):
        """
        Only allow admin users to create/update/delete doctors or doctor details to be updated by the doctor
        """
        if self.action in ['create', 'destroy']:
            return [permissions.IsAdminUser()]
        elif self.action in ['update', 'partial_update']:
            return [IsOwnerOrStaff()]
        return [permissions.IsAuthenticated()]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Get the doctor profile for the currently authenticated user
        """
        try:
            doctor = Doctor.objects.get(user=request.user)
            serializer = self.get_serializer(doctor)
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            return Response(
                {"detail": "You do not have a doctor profile."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def appointments(self, request, pk=None):
        """
        Get all appointments for a specific doctor
        """
        doctor = self.get_object()
        appointments = Appointment.objects.filter(doctor=doctor)
        
        # Filter by status if provided
        status_param = request.query_params.get('status', None)
        if status_param:
            appointments = appointments.filter(status=status_param)
        
        # Filter by date range if provided
        date_from = request.query_params.get('date_from', None)
        date_to = request.query_params.get('date_to', None)
        
        if date_from:
            appointments = appointments.filter(appointment_date__gte=date_from)
        if date_to:
            appointments = appointments.filter(appointment_date__lte=date_to)
        
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrStaff]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__first_name', 'user__last_name', 'user__email']
    ordering_fields = ['user__last_name', 'created_at']
    
    def get_queryset(self):
        """
        Filter patients to only show a patient's own record unless staff
        """
        user = self.request.user
        if user.is_staff:
            return Patient.objects.all()
        
        # Check if the user is a doctor
        try:
            doctor = Doctor.objects.get(user=user)
            # Doctors can see patients they have appointments with
            patients = Patient.objects.filter(
                appointments__doctor=doctor
            ).distinct()
            return patients
        except Doctor.DoesNotExist:
            pass
        
        # Regular users can only see their own patient profile
        return Patient.objects.filter(user=user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Get the patient profile for the currently authenticated user
        """
        try:
            patient = Patient.objects.get(user=request.user)
            serializer = self.get_serializer(patient)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            return Response(
                {"detail": "You do not have a patient profile."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def appointments(self, request, pk=None):
        """
        Get all appointments for a specific patient
        """
        patient = self.get_object()
        appointments = Appointment.objects.filter(patient=patient)
        
        # Filter by status if provided
        status_param = request.query_params.get('status', None)
        if status_param:
            appointments = appointments.filter(status=status_param)
        
        # Filter by date range if provided
        date_from = request.query_params.get('date_from', None)
        date_to = request.query_params.get('date_to', None)
        
        if date_from:
            appointments = appointments.filter(appointment_date__gte=date_from)
        if date_to:
            appointments = appointments.filter(appointment_date__lte=date_to)
        
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def medical_records(self, request, pk=None):
        """
        Get all medical records for a specific patient
        """
        patient = self.get_object()
        medical_records = MedicalRecord.objects.filter(patient=patient)
        serializer = MedicalRecordSerializer(medical_records, many=True)
        return Response(serializer.data)


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrStaff]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['reason', 'notes', 'patient__user__first_name', 'patient__user__last_name', 'doctor__user__last_name']
    ordering_fields = ['appointment_date', 'start_time', 'status']
    
    def get_queryset(self):
        """
        Filter appointments to show only those relevant to the user
        """
        user = self.request.user
        if user.is_staff:
            return Appointment.objects.all()
        
        # Check if the user is a doctor
        try:
            doctor = Doctor.objects.get(user=user)
            return Appointment.objects.filter(doctor=doctor)
        except Doctor.DoesNotExist:
            pass
        
        # Check if the user is a patient
        try:
            patient = Patient.objects.get(user=user)
            return Appointment.objects.filter(patient=patient)
        except Patient.DoesNotExist:
            pass
        
        return Appointment.objects.none()
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """
        Get all upcoming appointments for the authenticated user
        """
        user = request.user
        today = date.today()
        
        # Check if the user is a doctor
        try:
            doctor = Doctor.objects.get(user=user)
            appointments = Appointment.objects.filter(
                doctor=doctor,
                appointment_date__gte=today,
                status__in=['scheduled', 'confirmed']
            ).order_by('appointment_date', 'start_time')
            serializer = self.get_serializer(appointments, many=True)
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            pass
        
        # Check if the user is a patient
        try:
            patient = Patient.objects.get(user=user)
            appointments = Appointment.objects.filter(
                patient=patient,
                appointment_date__gte=today,
                status__in=['scheduled', 'confirmed']
            ).order_by('appointment_date', 'start_time')
            serializer = self.get_serializer(appointments, many=True)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            pass
        
        return Response([])
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel an appointment
        """
        appointment = self.get_object()
        
        if appointment.status == 'completed':
            return Response(
                {"detail": "Cannot cancel a completed appointment."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'cancelled'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)


class MedicalRecordViewSet(viewsets.ModelViewSet):
    queryset = MedicalRecord.objects.all()
    serializer_class = MedicalRecordSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrStaff]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['diagnosis', 'treatment', 'symptoms']
    ordering_fields = ['visit_date', 'created_at']
    
    def get_queryset(self):
        """
        Filter medical records to show only those relevant to the user
        """
        user = self.request.user
        if user.is_staff:
            return MedicalRecord.objects.all()
        
        # Check if the user is a doctor
        try:
            doctor = Doctor.objects.get(user=user)
            return MedicalRecord.objects.filter(doctor=doctor)
        except Doctor.DoesNotExist:
            pass
        
        # Check if the user is a patient
        try:
            patient = Patient.objects.get(user=user)
            return MedicalRecord.objects.filter(patient=patient)
        except Patient.DoesNotExist:
            pass
        
        return MedicalRecord.objects.none()
    
    @action(detail=True, methods=['get'])
    def prescriptions(self, request, pk=None):
        """
        Get all prescriptions for a specific medical record
        """
        medical_record = self.get_object()
        prescriptions = Prescription.objects.filter(medical_record=medical_record)
        serializer = PrescriptionSerializer(prescriptions, many=True)
        return Response(serializer.data)


class MedicationViewSet(viewsets.ModelViewSet):
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    
    def get_permissions(self):
        """
        Only allow admin users to create/update/delete medications
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]


class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrStaff]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['medication__name', 'dosage', 'special_instructions']
    ordering_fields = ['created_at']
    
    def get_queryset(self):
        """
        Filter prescriptions to show only those relevant to the user
        """
        user = self.request.user
        if user.is_staff:
            return Prescription.objects.all()
        
        # Check if the user is a doctor
        try:
            doctor = Doctor.objects.get(user=user)
            return Prescription.objects.filter(medical_record__doctor=doctor)
        except Doctor.DoesNotExist:
            pass
        
        # Check if the user is a patient
        try:
            patient = Patient.objects.get(user=user)
            return Prescription.objects.filter(medical_record__patient=patient)
        except Patient.DoesNotExist:
            pass
        
        return Prescription.objects.none()
