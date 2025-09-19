import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const clearAllToolVariations = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('variation_instances')
      .delete()
      .eq('item_type', 'tools');

    if (error) {
      console.error('Error clearing tool variations:', error);
      toast.error('Failed to clear tool variations');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error clearing tool variations:', error);
    toast.error('Failed to clear tool variations');
    return false;
  }
};

export const clearAllMaterialVariations = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('variation_instances')
      .delete()
      .eq('item_type', 'materials');

    if (error) {
      console.error('Error clearing material variations:', error);
      toast.error('Failed to clear material variations');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error clearing material variations:', error);
    toast.error('Failed to clear material variations');
    return false;
  }
};

export const clearAllTools = async (): Promise<boolean> => {
  try {
    // Delete tool models first (foreign key dependency)
    await supabase
      .from('tool_models')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    // Delete variations
    await supabase
      .from('variation_instances')
      .delete()
      .eq('item_type', 'tools');

    // Delete core tools
    const { error } = await supabase
      .from('tools')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('Error clearing tools:', error);
      toast.error('Failed to clear tools');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error clearing tools:', error);
    toast.error('Failed to clear tools');
    return false;
  }
};