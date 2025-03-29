import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import Stripe from 'https://esm.sh/stripe@11.18.0';

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
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!supabaseUrl || !supabaseServiceKey || !stripeSecretKey || !stripeWebhookSecret) {
      throw new Error('Missing environment variables');
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create Stripe client
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2022-11-15',
    });

    // Get the signature from the header
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No Stripe signature found in request');
    }

    // Get the request body
    const body = await req.text();

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Webhook signature verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle the event
    console.log(`Processing event type ${event.type}`);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      
      // Extract the metadata from the payment intent
      const { payment_id, payment_type } = paymentIntent.metadata || {};
      
      if (!payment_id || !payment_type) {
        throw new Error('Payment metadata not found');
      }
      
      // Update the payment record in the database
      const { error: paymentError } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          transaction_id: paymentIntent.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment_id);
        
      if (paymentError) throw paymentError;
      
      // Create a notification for the user
      const { data: paymentData } = await supabase
        .from('payments')
        .select('user_id')
        .eq('id', payment_id)
        .single();
        
      if (paymentData && paymentData.user_id) {
        await supabase.from('notifications').insert({
          user_id: paymentData.user_id,
          title: 'Payment Successful',
          message: `Your payment of $${(paymentIntent.amount / 100).toFixed(2)} has been processed successfully.`,
          notification_type: 'payment',
          related_id: payment_id,
        });
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      const { payment_id } = paymentIntent.metadata || {};
      
      if (payment_id) {
        // Update the payment record in the database
        const { error: paymentError } = await supabase
          .from('payments')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment_id);
          
        if (paymentError) throw paymentError;
        
        // Create a notification for the user
        const { data: paymentData } = await supabase
          .from('payments')
          .select('user_id')
          .eq('id', payment_id)
          .single();
          
        if (paymentData && paymentData.user_id) {
          await supabase.from('notifications').insert({
            user_id: paymentData.user_id,
            title: 'Payment Failed',
            message: 'Your payment could not be processed. Please try again or use a different payment method.',
            notification_type: 'payment',
            related_id: payment_id,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}); 