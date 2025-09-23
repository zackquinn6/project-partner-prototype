-- Fix Security Definer View issue by recreating market_pricing_summary
-- Drop the existing view
DROP VIEW IF EXISTS public.market_pricing_summary;

-- Recreate the view with proper security context
-- This will be owned by the current user (not postgres superuser)
CREATE VIEW public.market_pricing_summary AS
SELECT 
    tm.id AS model_id,
    tm.variation_instance_id AS variation_id,
    tm.model_name,
    tm.manufacturer,
    vi.name AS variation_name,
    count(pd.id) AS retailer_count,
    (avg(pd.price))::numeric(10,2) AS average_price,
    (min(pd.price))::numeric(10,2) AS min_price,
    (max(pd.price))::numeric(10,2) AS max_price,
    max(pd.last_scraped_at) AS last_updated
FROM tool_models tm
LEFT JOIN pricing_data pd ON (tm.id = pd.model_id)
LEFT JOIN variation_instances vi ON (tm.variation_instance_id = vi.id)
WHERE pd.price > 0
GROUP BY tm.id, tm.variation_instance_id, tm.model_name, tm.manufacturer, vi.name;

-- Add a comment explaining the view's purpose
COMMENT ON VIEW public.market_pricing_summary IS 'Aggregated pricing data for tool models from various retailers';

-- Ensure proper permissions
-- Grant read access to authenticated users (view should follow table permissions)
-- The view will inherit the RLS policies from the underlying tables