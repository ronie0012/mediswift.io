import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0];

    // Get appointments for tomorrow
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        start_time,
        end_time,
        type,
        patient_id (id, first_name, last_name, email, phone),
        doctor_id (id, first_name, last_name, specialty)
      `)
      .eq('appointment_date', tomorrowFormatted)
      .eq('status', 'scheduled');

    if (error) throw error;

    if (!appointments || appointments.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No appointments scheduled for tomorrow',
          count: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create notifications and send reminders
    const notificationPromises = appointments.map(async (appointment) => {
      // Create notification in the database
      const notificationData = {
        user_id: appointment.patient_id.id,
        title: 'Appointment Reminder',
        message: `You have an appointment with Dr. ${appointment.doctor_id.last_name} tomorrow at ${appointment.start_time}`,
        notification_type: 'appointment',
        related_id: appointment.id,
      };

      await supabase.from('notifications').insert(notificationData);

      // Send email notification if SendGrid API key is available
      if (sendgridApiKey) {
        // This would normally use the SendGrid API to send an email
        console.log(`Email would be sent to ${appointment.patient_id.email}`);
      }

      // Send SMS notification if Twilio credentials are available
      if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber && appointment.patient_id.phone) {
        // This would normally use the Twilio API to send an SMS
        console.log(`SMS would be sent to ${appointment.patient_id.phone}`);
      }

      return notificationData;
    });

    await Promise.all(notificationPromises);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Appointment reminders sent successfully',
        count: appointments.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending appointment reminders:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}); 