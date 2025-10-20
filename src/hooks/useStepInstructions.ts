import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StepInstruction {
  id: string;
  template_step_id: string;
  instruction_level: 'quick' | 'detailed' | 'contractor';
  content: {
    text: string;
    sections: Array<{
      title: string;
      content: string;
      type?: 'warning' | 'tip' | 'standard';
    }>;
    photos: Array<{
      url: string;
      caption: string;
      alt: string;
    }>;
    videos: Array<{
      url: string;
      title: string;
      embed?: string;
    }>;
    links: Array<{
      url: string;
      title: string;
      description?: string;
    }>;
  };
  created_at: string;
  updated_at: string;
}

export function useStepInstructions(stepId: string, instructionLevel: 'quick' | 'detailed' | 'contractor') {
  const [instruction, setInstruction] = useState<StepInstruction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchInstruction() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('step_instructions')
          .select('*')
          .eq('template_step_id', stepId)
          .eq('instruction_level', instructionLevel)
          .maybeSingle();

        if (fetchError) throw fetchError;

        setInstruction(data as StepInstruction | null);
      } catch (err) {
        console.error('Error fetching step instruction:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch instruction'));
      } finally {
        setLoading(false);
      }
    }

    if (stepId) {
      fetchInstruction();
    }
  }, [stepId, instructionLevel]);

  return { instruction, loading, error };
}
