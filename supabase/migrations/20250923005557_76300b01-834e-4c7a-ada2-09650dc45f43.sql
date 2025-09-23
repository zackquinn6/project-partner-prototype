-- Option 2: Remove the security definer view entirely
-- The application can handle this aggregation instead of the database
DROP VIEW IF EXISTS public.market_pricing_summary;

-- Comment explaining why the view was removed
-- Applications should query tool_models, pricing_data, and variation_instances
-- directly and perform aggregation in application code to maintain proper security context