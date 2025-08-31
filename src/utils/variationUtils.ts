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