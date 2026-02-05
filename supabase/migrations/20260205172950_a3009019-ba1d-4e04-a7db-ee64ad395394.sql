-- Create OTP codes table for phone verification
CREATE TABLE public.otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0,
  anonymous_user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for phone lookups
CREATE INDEX idx_otp_codes_phone ON public.otp_codes(phone);

-- Add index for cleanup of expired codes
CREATE INDEX idx_otp_codes_expires_at ON public.otp_codes(expires_at);

-- Enable RLS (public table, but limited access)
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Only allow service role to manage OTP codes (no direct client access)
-- Edge functions use service role, so they can insert/update/delete
CREATE POLICY "Service role only" ON public.otp_codes
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Add cleanup function to delete expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.otp_codes WHERE expires_at < now();
END;
$$;