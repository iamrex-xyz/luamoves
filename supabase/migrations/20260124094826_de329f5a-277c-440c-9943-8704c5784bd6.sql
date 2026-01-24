-- Drop the overly permissive RLS policy that exposes all household members
-- This policy allowed anyone to view ALL invited household members by simply checking if invite_token IS NOT NULL
-- Security fix: Use edge function verify-household-invite instead for token validation

DROP POLICY IF EXISTS "Anyone can view by invite token" ON public.household_members;