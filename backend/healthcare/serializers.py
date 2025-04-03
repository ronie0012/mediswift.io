from rest_framework import serializers
from .models import (
    Specialization,
    Doctor,
    Patient,
    Appointment,
    MedicalRecord,
    Medication,
    Prescription
)
from django.contrib.auth.models import User
from authentication.serializers import UserSerializer


class SpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialization
        fields = ['id', 'name', 'description', 'created_at']


class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    specialization = SpecializationSerializer(read_only=True)
    specialization_id = serializers.PrimaryKeyRelatedField(
        queryset=Specialization.objects.all(),
        write_only=True,
        source='specialization',
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Doctor
        fields = [
            'id', 'user', 'specialization', 'specialization_id', 'license_number',
            'years_of_experience', 'bio', 'is_available', 'created_at', 'updated_at'
        ]


class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Patient
        fields = [
            'id', 'user', 'date_of_birth', 'gender', 'phone_number',
            'address', 'emergency_contact_name', 'emergency_contact_number',
            'blood_group', 'allergies', 'medical_conditions', 
            'created_at', 'updated_at'
        ]


class AppointmentSerializer(serializers.ModelSerializer):
    doctor = DoctorSerializer(read_only=True)
    patient = PatientSerializer(read_only=True)
    doctor_id = serializers.PrimaryKeyRelatedField(
        queryset=Doctor.objects.all(),
        write_only=True,
        source='doctor'
    )
    patient_id = serializers.PrimaryKeyRelatedField(
        queryset=Patient.objects.all(),
        write_only=True,
        source='patient'
    )
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'doctor', 'patient', 'doctor_id', 'patient_id',
            'appointment_date', 'start_time', 'end_time', 'status',
            'reason', 'notes', 'created_at', 'updated_at'
        ]
        
    def validate(self, data):
        """
        Check that the appointment times don't overlap with existing appointments
        """
        doctor = data.get('doctor')
        appointment_date = data.get('appointment_date')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        # Check if start_time is before end_time
        if start_time >= end_time:
            raise serializers.ValidationError({"time_error": "End time must be after start time"})
        
        # Check if doctor has overlapping appointments
        overlapping_appointments = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date,
            status__in=['scheduled', 'confirmed']
        ).exclude(id=self.instance.id if self.instance else None)
        
        for appointment in overlapping_appointments:
            if (start_time < appointment.end_time and end_time > appointment.start_time):
                raise serializers.ValidationError(
                    {"time_conflict": "This time slot conflicts with an existing appointment"}
                )
        
        return data


class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = ['id', 'name', 'description', 'dosage_instructions', 'side_effects', 'created_at']


class PrescriptionSerializer(serializers.ModelSerializer):
    medication = MedicationSerializer(read_only=True)
    medication_id = serializers.PrimaryKeyRelatedField(
        queryset=Medication.objects.all(),
        write_only=True,
        source='medication'
    )
    
    class Meta:
        model = Prescription
        fields = [
            'id', 'medical_record', 'medication', 'medication_id',
            'dosage', 'frequency', 'duration', 'special_instructions', 'created_at'
        ]


class MedicalRecordSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    doctor = DoctorSerializer(read_only=True)
    patient_id = serializers.PrimaryKeyRelatedField(
        queryset=Patient.objects.all(),
        write_only=True,
        source='patient'
    )
    doctor_id = serializers.PrimaryKeyRelatedField(
        queryset=Doctor.objects.all(),
        write_only=True,
        source='doctor'
    )
    appointment_id = serializers.PrimaryKeyRelatedField(
        queryset=Appointment.objects.all(),
        write_only=True,
        source='appointment',
        required=False,
        allow_null=True
    )
    prescriptions = PrescriptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = MedicalRecord
        fields = [
            'id', 'patient', 'doctor', 'patient_id', 'doctor_id', 'appointment', 'appointment_id',
            'visit_date', 'symptoms', 'diagnosis', 'treatment', 'prescription',
            'notes', 'follow_up_date', 'prescriptions', 'created_at', 'updated_at'
        ]
        
    def to_representation(self, instance):
        """
        Override to include nested appointment data
        """
        data = super().to_representation(instance)
        if instance.appointment:
            from .serializers import AppointmentSerializer
            data['appointment'] = AppointmentSerializer(instance.appointment).data
        return data 