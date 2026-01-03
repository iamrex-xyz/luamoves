-- Create household_members table for phone-based invitations
CREATE TABLE public.household_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_user_id UUID NOT NULL,
  member_user_id UUID,
  phone TEXT NOT NULL,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active')),
  invite_token UUID DEFAULT gen_random_uuid(),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint on owner + phone to prevent duplicate invites
CREATE UNIQUE INDEX idx_household_members_owner_phone ON public.household_members(owner_user_id, phone);

-- Enable RLS
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

-- Owner can manage their household members
CREATE POLICY "Owners can manage their household members"
ON public.household_members
FOR ALL
USING (auth.uid() = owner_user_id);

-- Members can view households they belong to
CREATE POLICY "Members can view their households"
ON public.household_members
FOR SELECT
USING (auth.uid() = member_user_id AND member_user_id IS NOT NULL);

-- Public can view by invite token (for accepting invites)
CREATE POLICY "Anyone can view by invite token"
ON public.household_members
FOR SELECT
USING (invite_token IS NOT NULL);

-- Trigger for updated_at
CREATE TRIGGER update_household_members_updated_at
BEFORE UPDATE ON public.household_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();