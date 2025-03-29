-- Add comprehensive RLS policies for all tables in the MediSwift database

-- Doctors table policies
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view verified doctors"
    ON public.doctors FOR SELECT
    USING (is_verified = TRUE);

CREATE POLICY "Doctors can update their own profiles"
    ON public.doctors FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can update all doctor profiles"
    ON public.doctors FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Medical records policies
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own medical records"
    ON public.medical_records FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view medical records of their patients"
    ON public.medical_records FOR SELECT
    USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can create medical records for their patients"
    ON public.medical_records FOR INSERT
    WITH CHECK (
        auth.uid() = doctor_id AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'doctor'
        )
    );

CREATE POLICY "Doctors can update medical records they created"
    ON public.medical_records FOR UPDATE
    USING (
        auth.uid() = doctor_id AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'doctor'
        )
    );

CREATE POLICY "Admins can access all medical records"
    ON public.medical_records FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Appointments policies
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own appointments"
    ON public.appointments FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create their own appointments"
    ON public.appointments FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update their own appointments"
    ON public.appointments FOR UPDATE
    USING (
        auth.uid() = patient_id AND
        status <> 'completed'::appointment_status AND
        status <> 'in_progress'::appointment_status
    );

CREATE POLICY "Doctors can view their appointments"
    ON public.appointments FOR SELECT
    USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update appointment status"
    ON public.appointments FOR UPDATE
    USING (
        auth.uid() = doctor_id AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'doctor'
        )
    );

CREATE POLICY "Admins can access all appointments"
    ON public.appointments FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Prescriptions policies
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own prescriptions"
    ON public.prescriptions FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view prescriptions they created"
    ON public.prescriptions FOR SELECT
    USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can create prescriptions"
    ON public.prescriptions FOR INSERT
    WITH CHECK (
        auth.uid() = doctor_id AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'doctor'
        )
    );

CREATE POLICY "Doctors can update prescriptions they created"
    ON public.prescriptions FOR UPDATE
    USING (
        auth.uid() = doctor_id AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'doctor'
        )
    );

CREATE POLICY "Pharmacists can view all prescriptions"
    ON public.prescriptions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'pharmacy'
    ));

CREATE POLICY "Admins can access all prescriptions"
    ON public.prescriptions FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Prescription items policies
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prescription item access follows prescription access"
    ON public.prescription_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.prescriptions
            WHERE id = prescription_id AND (
                patient_id = auth.uid() OR
                doctor_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND (role = 'admin' OR role = 'pharmacy')
                )
            )
        )
    );

CREATE POLICY "Doctors can create prescription items"
    ON public.prescription_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.prescriptions
            WHERE id = prescription_id AND doctor_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can update their prescription items"
    ON public.prescription_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.prescriptions
            WHERE id = prescription_id AND doctor_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all prescription items"
    ON public.prescription_items FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Pharmacy inventory policies
ALTER TABLE public.pharmacy_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pharmacy inventory"
    ON public.pharmacy_inventory FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "Only pharmacy staff and admins can manage inventory"
    ON public.pharmacy_inventory FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (role = 'admin' OR role = 'pharmacy')
        )
    );

-- Medicine orders policies
ALTER TABLE public.medicine_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own orders"
    ON public.medicine_orders FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create their own orders"
    ON public.medicine_orders FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Pharmacy staff can view all orders"
    ON public.medicine_orders FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'pharmacy'
    ));

CREATE POLICY "Pharmacy staff can update order status"
    ON public.medicine_orders FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'pharmacy'
    ));

CREATE POLICY "Admins can manage all orders"
    ON public.medicine_orders FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Order items policies
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order item access follows order access"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.medicine_orders
            WHERE id = order_id AND (
                patient_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND (role = 'admin' OR role = 'pharmacy')
                )
            )
        )
    );

CREATE POLICY "Patients can create order items for their orders"
    ON public.order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.medicine_orders
            WHERE id = order_id AND patient_id = auth.uid()
        )
    );

CREATE POLICY "Pharmacy staff can manage order items"
    ON public.order_items FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'pharmacy'
    ));

-- Ambulance services policies
ALTER TABLE public.ambulance_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active ambulance services"
    ON public.ambulance_services FOR SELECT
    TO authenticated
    USING (is_active = TRUE);

CREATE POLICY "Ambulance service providers can update their service"
    ON public.ambulance_services FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'ambulance_service'
    ));

CREATE POLICY "Admins can manage all ambulance services"
    ON public.ambulance_services FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Ambulance requests policies
ALTER TABLE public.ambulance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own ambulance requests"
    ON public.ambulance_requests FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create ambulance requests"
    ON public.ambulance_requests FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Ambulance services can view requests for their service"
    ON public.ambulance_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.ambulance_services
            WHERE id = service_id AND EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role = 'ambulance_service'
            )
        )
    );

CREATE POLICY "Ambulance services can update requests for their service"
    ON public.ambulance_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.ambulance_services
            WHERE id = service_id AND EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role = 'ambulance_service'
            )
        )
    );

CREATE POLICY "Admins can manage all ambulance requests"
    ON public.ambulance_requests FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Reviews policies
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-anonymous reviews"
    ON public.reviews FOR SELECT
    TO authenticated
    USING (is_anonymous = FALSE OR auth.uid() = reviewer_id);

CREATE POLICY "Users can create their own reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews"
    ON public.reviews FOR UPDATE
    USING (auth.uid() = reviewer_id);

CREATE POLICY "Admins can manage all reviews"
    ON public.reviews FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Notifications policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark as read)"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications"
    ON public.notifications FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Payments policies
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
    ON public.payments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments"
    ON public.payments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payments"
    ON public.payments FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Create function to handle updating doctor rating after a review
CREATE OR REPLACE FUNCTION update_doctor_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.doctor_id IS NOT NULL THEN
        UPDATE public.doctors
        SET 
            total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE doctor_id = NEW.doctor_id),
            average_rating = (SELECT AVG(rating) FROM public.reviews WHERE doctor_id = NEW.doctor_id)
        WHERE id = NEW.doctor_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating doctor rating
CREATE TRIGGER on_review_created_or_updated
    AFTER INSERT OR UPDATE ON public.reviews
    FOR EACH ROW
    WHEN (NEW.doctor_id IS NOT NULL)
    EXECUTE FUNCTION update_doctor_rating();

-- Create function to handle updating appointment payment info
CREATE OR REPLACE FUNCTION update_appointment_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.appointment_id IS NOT NULL THEN
        UPDATE public.appointments
        SET 
            payment_id = NEW.id,
            payment_status = NEW.status,
            amount_paid = NEW.amount
        WHERE id = NEW.appointment_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating appointment payment
CREATE TRIGGER on_payment_created_or_updated
    AFTER INSERT OR UPDATE ON public.payments
    FOR EACH ROW
    WHEN (NEW.appointment_id IS NOT NULL)
    EXECUTE FUNCTION update_appointment_payment();

-- Create function to handle updating order payment info
CREATE OR REPLACE FUNCTION update_order_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_id IS NOT NULL THEN
        UPDATE public.medicine_orders
        SET 
            payment_id = NEW.id,
            payment_status = NEW.status
        WHERE id = NEW.order_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating order payment
CREATE TRIGGER on_order_payment_created_or_updated
    AFTER INSERT OR UPDATE ON public.payments
    FOR EACH ROW
    WHEN (NEW.order_id IS NOT NULL)
    EXECUTE FUNCTION update_order_payment();

-- Create function to handle updating ambulance request payment info
CREATE OR REPLACE FUNCTION update_ambulance_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ambulance_request_id IS NOT NULL THEN
        UPDATE public.ambulance_requests
        SET 
            payment_id = NEW.id,
            payment_status = NEW.status
        WHERE id = NEW.ambulance_request_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating ambulance request payment
CREATE TRIGGER on_ambulance_payment_created_or_updated
    AFTER INSERT OR UPDATE ON public.payments
    FOR EACH ROW
    WHEN (NEW.ambulance_request_id IS NOT NULL)
    EXECUTE FUNCTION update_ambulance_payment(); 