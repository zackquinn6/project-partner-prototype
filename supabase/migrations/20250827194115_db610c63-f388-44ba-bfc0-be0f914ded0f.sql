-- Fix function security by setting search_path
CREATE OR REPLACE FUNCTION update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment vote count
        IF NEW.item_type = 'roadmap' THEN
            UPDATE public.feature_roadmap 
            SET votes = votes + 1 
            WHERE id = NEW.item_id;
        ELSIF NEW.item_type = 'request' THEN
            UPDATE public.feature_requests 
            SET votes = votes + 1 
            WHERE id = NEW.item_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement vote count
        IF OLD.item_type = 'roadmap' THEN
            UPDATE public.feature_roadmap 
            SET votes = votes - 1 
            WHERE id = OLD.item_id;
        ELSIF OLD.item_type = 'request' THEN
            UPDATE public.feature_requests 
            SET votes = votes - 1 
            WHERE id = OLD.item_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql
SET search_path = public;