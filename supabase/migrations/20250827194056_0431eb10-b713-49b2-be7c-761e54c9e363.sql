-- Add admin_response column to feature_requests
ALTER TABLE public.feature_requests 
ADD COLUMN admin_response TEXT;

-- Create feature_votes table to track individual user votes
CREATE TABLE public.feature_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    item_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('roadmap', 'request')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, item_id, item_type)
);

-- Enable RLS
ALTER TABLE public.feature_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feature_votes
CREATE POLICY "Users can view all votes" ON public.feature_votes
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own votes" ON public.feature_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON public.feature_votes
    FOR DELETE USING (auth.uid() = user_id);

-- Function to update vote counts
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
$$ LANGUAGE plpgsql;

-- Create trigger for vote count updates
CREATE TRIGGER feature_votes_count_trigger
    AFTER INSERT OR DELETE ON public.feature_votes
    FOR EACH ROW EXECUTE FUNCTION update_vote_count();