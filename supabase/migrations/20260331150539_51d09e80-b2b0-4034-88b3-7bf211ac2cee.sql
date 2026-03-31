
-- Add address fields to profiles table
ALTER TABLE public.profiles
  ADD COLUMN address_line1 text,
  ADD COLUMN address_line2 text,
  ADD COLUMN city text,
  ADD COLUMN state text,
  ADD COLUMN pincode text,
  ADD COLUMN phone text;

-- Add delivery fields to art_requests table
ALTER TABLE public.art_requests
  ADD COLUMN delivery_address_line1 text,
  ADD COLUMN delivery_address_line2 text,
  ADD COLUMN delivery_city text,
  ADD COLUMN delivery_state text,
  ADD COLUMN delivery_pincode text,
  ADD COLUMN delivery_phone text,
  ADD COLUMN delivery_tracking_id text,
  ADD COLUMN delivery_provider text,
  ADD COLUMN delivery_booked_at timestamptz;
