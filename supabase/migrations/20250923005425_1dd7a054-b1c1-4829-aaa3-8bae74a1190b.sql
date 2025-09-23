-- Fix the ownership of the market_pricing_summary view
-- Change owner from postgres to authenticator role to remove security definer behavior
ALTER VIEW public.market_pricing_summary OWNER TO authenticator;

-- Verify the view follows the underlying table permissions
-- The view will now run with the permissions of the querying user
-- rather than elevated postgres privileges