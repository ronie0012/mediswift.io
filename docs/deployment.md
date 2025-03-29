# MediSwift Deployment Guide

This guide covers how to deploy the MediSwift backend to Supabase.

## Prerequisites

- A Supabase account
- The Supabase CLI installed
- Git installed
- Node.js and npm installed

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/mediswift.git
cd mediswift
```

## Step 2: Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign in or create an account.
2. Create a new project.
3. Take note of your project URL and API keys (anon key and service_role key).

## Step 3: Set Up Environment Variables

1. Create a `.env` file based on the example:

```bash
cp .env.example .env
```

2. Fill in your Supabase URL and API keys in the `.env` file:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Step 4: Link Your Local Project to Supabase

```bash
npx supabase login
npx supabase link --project-ref your-project-ref
```

You can find your project reference in the Supabase dashboard URL when viewing your project.

## Step 5: Deploy Database Migrations

```bash
npx supabase db push
```

This will apply all the migrations from the `supabase/migrations` directory to your Supabase project.

## Step 6: Set Up Storage Buckets

Run the SQL script to create the necessary storage buckets and policies:

```bash
npx supabase db run --file supabase/storage.sql
```

## Step 7: Deploy Edge Functions

Deploy the Edge Functions to your Supabase project:

```bash
cd supabase/functions
npx supabase functions deploy appointment-reminders
npx supabase functions deploy payment-webhook
```

## Step 8: Configure Edge Function Secrets

Set up the environment variables for your Edge Functions:

```bash
npx supabase secrets set SENDGRID_API_KEY=your_sendgrid_api_key
npx supabase secrets set TWILIO_ACCOUNT_SID=your_twilio_account_sid
npx supabase secrets set TWILIO_AUTH_TOKEN=your_twilio_auth_token
npx supabase secrets set TWILIO_PHONE_NUMBER=your_twilio_phone_number
npx supabase secrets set STRIPE_SECRET_KEY=your_stripe_secret_key
npx supabase secrets set STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Step 9: Set Up Scheduled Functions

To set up the appointment reminder function to run daily:

1. Go to your Supabase dashboard.
2. Navigate to SQL Editor.
3. Run the following SQL to create a cron job:

```sql
SELECT cron.schedule(
  'daily-appointment-reminders',
  '0 8 * * *',  -- Run at 8 AM every day
  'https://your-project-ref.functions.supabase.co/appointment-reminders'
);
```

## Step 10: Configure Webhook URLs

1. Set up your Stripe webhook to point to your Supabase Edge Function:
   ```
   https://your-project-ref.functions.supabase.co/payment-webhook
   ```

2. In your Stripe dashboard, make sure to add the following events to your webhook:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

## Step 11: Deploy Web Application

If you're using Vercel or Netlify for the frontend:

### Vercel

1. Push your repository to GitHub.
2. Connect Vercel to your GitHub repository.
3. Set up your environment variables in Vercel.
4. Deploy your application.

### Netlify

1. Push your repository to GitHub.
2. Connect Netlify to your GitHub repository.
3. Set up your environment variables in Netlify.
4. Deploy your application.

## Step 12: Verify Deployment

1. Test the authentication features.
2. Ensure that database tables have been created correctly.
3. Verify that the storage buckets are working.
4. Test the Edge Functions.

## Additional Configuration

### Email Configuration

For email sending to work properly, you need to configure Supabase Auth SMTP settings:

1. Go to your Supabase dashboard.
2. Navigate to Authentication → Email Templates.
3. Set up your SMTP credentials and customize email templates.

### Stripe Integration

To process payments, set up your Stripe account and configure the following:

1. Create products and prices in your Stripe dashboard.
2. Update your frontend to use Stripe Elements or Checkout.
3. Ensure your webhook is correctly configured.

### Security

1. Review and adjust the Row Level Security (RLS) policies if needed.
2. Ensure that sensitive operations use the service_role key and are performed securely.
3. Regularly update your dependencies to patch security vulnerabilities.

## Troubleshooting

### Database Migrations Fail

If database migrations fail, check the error messages and ensure that:
- You're not trying to recreate tables that already exist.
- Your SQL syntax is correct.
- You have the necessary permissions.

### Edge Functions Not Working

If Edge Functions don't work:
- Check the function logs in the Supabase dashboard.
- Ensure all required environment variables are set.
- Verify that the function is properly deployed.

### Authentication Issues

If users can't sign up or log in:
- Check the auth logs in the Supabase dashboard.
- Ensure your email provider is correctly configured.
- Verify that your frontend is using the correct API keys.

## Maintenance

### Database Backups

Supabase automatically creates backups, but you can also set up additional backup procedures:

1. Use the Supabase CLI to create manual backups:
   ```bash
   npx supabase db dump -f backup.sql
   ```

2. Schedule regular backups using your own scripts or services.

### Monitoring

Set up monitoring for your application:

1. Use Supabase's built-in metrics dashboard.
2. Configure alerts for unusual activity.
3. Consider setting up additional monitoring tools for your frontend application.

## Additional Notes

### Deno Development

If you need to develop/test locally, install the Deno CLI and run with:
```bash
cd supabase/functions/appointment-reminders
deno run --allow-net --allow-env index.ts
``` 