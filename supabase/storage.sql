-- Create storage buckets for file uploads

-- Create a bucket for user avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create a bucket for medical records attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('medical-records', 'medical-records', false)
ON CONFLICT (id) DO NOTHING;

-- Create a bucket for medicine images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('medications', 'medications', true)
ON CONFLICT (id) DO NOTHING;

-- Create security policies for the avatars bucket
CREATE POLICY "Avatar images are publicly accessible." 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar." 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar." 
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar." 
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create security policies for medical records
CREATE POLICY "Only authenticated users can view their own medical records." 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'medical-records' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Doctors can view patient medical records they're associated with." 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'medical-records' 
  AND EXISTS (
    SELECT 1 FROM medical_records mr
    WHERE mr.patient_id = (storage.foldername(name))[1]::uuid
    AND mr.doctor_id = auth.uid()::uuid
  )
);

CREATE POLICY "Only doctors can upload medical records." 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'medical-records' 
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'doctor'
  )
);

CREATE POLICY "Only doctors can update medical records." 
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'medical-records' 
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'doctor'
  )
);

CREATE POLICY "Only doctors can delete medical records." 
ON storage.objects FOR DELETE
USING (
  bucket_id = 'medical-records' 
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'doctor'
  )
);

-- Create security policies for medication images
CREATE POLICY "Medication images are publicly accessible." 
ON storage.objects FOR SELECT 
USING (bucket_id = 'medications');

CREATE POLICY "Only admins and pharmacy users can upload medication images." 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'medications' 
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'pharmacy')
  )
);

CREATE POLICY "Only admins and pharmacy users can update medication images." 
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'medications' 
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'pharmacy')
  )
);

CREATE POLICY "Only admins and pharmacy users can delete medication images." 
ON storage.objects FOR DELETE
USING (
  bucket_id = 'medications' 
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'pharmacy')
  )
); 