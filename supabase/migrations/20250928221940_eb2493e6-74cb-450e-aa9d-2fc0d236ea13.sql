-- Add phase incorporation tracking fields to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS phase_revision_alerts jsonb DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN public.projects.phase_revision_alerts IS 'Tracks phases that have newer revisions available for incorporation. Format: [{"phaseId": "id", "sourceProjectId": "id", "currentRevision": 1, "latestRevision": 2, "phaseName": "name"}]';

-- Create function to check for phase revision updates
CREATE OR REPLACE FUNCTION public.check_phase_revision_updates()
RETURNS TABLE(
    project_id uuid,
    project_name text,
    alerts jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Only admins can run this function
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    RETURN QUERY
    SELECT 
        p.id as project_id,
        p.name as project_name,
        p.phase_revision_alerts as alerts
    FROM public.projects p
    WHERE jsonb_array_length(p.phase_revision_alerts) > 0
    ORDER BY p.updated_at DESC;
END;
$$;

-- Create function to update phase revision alert status
CREATE OR REPLACE FUNCTION public.update_phase_revision_alert(
    p_project_id uuid,
    p_phase_id text,
    p_action text -- 'incorporate' or 'dismiss'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    current_alerts jsonb;
    updated_alerts jsonb;
BEGIN
    -- Only admins can run this function
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    -- Get current alerts
    SELECT phase_revision_alerts INTO current_alerts
    FROM public.projects
    WHERE id = p_project_id;

    -- Remove the alert for this phase
    SELECT jsonb_agg(alert)
    INTO updated_alerts
    FROM jsonb_array_elements(current_alerts) as alert
    WHERE alert->>'phaseId' != p_phase_id;

    -- Update the project
    UPDATE public.projects
    SET phase_revision_alerts = COALESCE(updated_alerts, '[]'::jsonb),
        updated_at = now()
    WHERE id = p_project_id;

    -- Log the action
    PERFORM log_comprehensive_security_event(
        'phase_revision_alert_' || p_action,
        'medium',
        'Admin ' || p_action || 'ed phase revision alert for phase: ' || p_phase_id,
        auth.uid(),
        NULL, NULL, NULL,
        jsonb_build_object(
            'project_id', p_project_id,
            'phase_id', p_phase_id,
            'action', p_action
        )
    );
END;
$$;