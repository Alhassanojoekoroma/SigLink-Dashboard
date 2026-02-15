-- Create subscriptions table for SigLink
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  organization_name TEXT NOT NULL,
  station_nickname TEXT NOT NULL DEFAULT '',
  service_location TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  gps_coordinates TEXT,
  package_name TEXT NOT NULL,
  amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Pending', 'Inactive')),
  customer_type TEXT NOT NULL DEFAULT 'individual' CHECK (customer_type IN ('business', 'individual')),
  admin_email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (no auth required for this app)
CREATE POLICY "allow_public_select" ON public.subscriptions FOR SELECT USING (true);
CREATE POLICY "allow_public_insert" ON public.subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_public_update" ON public.subscriptions FOR UPDATE USING (true);
CREATE POLICY "allow_public_delete" ON public.subscriptions FOR DELETE USING (true);

-- Create notification_emails table to store email recipients
CREATE TABLE IF NOT EXISTS public.notification_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  label TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_public_select_emails" ON public.notification_emails FOR SELECT USING (true);
CREATE POLICY "allow_public_insert_emails" ON public.notification_emails FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_public_update_emails" ON public.notification_emails FOR UPDATE USING (true);
CREATE POLICY "allow_public_delete_emails" ON public.notification_emails FOR DELETE USING (true);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON public.subscriptions (organization_name);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON public.subscriptions (end_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_type ON public.subscriptions (customer_type);
