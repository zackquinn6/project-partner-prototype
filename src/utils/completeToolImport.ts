import { EnhancedToolParser, importEnhancedToolsToDatabase } from './enhancedToolParser';
import { clearAllTools } from './variationUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function completeToolImportFromAssets(
  progressCallback?: (current: number, total: number, step?: string) => void
): Promise<boolean> {
  try {
    // Step 1: Clear existing tools
    progressCallback?.(10, 100, 'Clearing existing tools...');
    const cleared = await clearAllTools();
    if (!cleared) {
      toast.error('Failed to clear existing tools');
      return false;
    }

    // Step 2: Load and parse the Excel file from assets
    progressCallback?.(20, 100, 'Loading Excel file...');
    const response = await fetch('/src/assets/enhanced-tool-list.xlsx');
    const blob = await response.blob();
    const file = new File([blob], 'enhanced-tool-list.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    progressCallback?.(30, 100, 'Parsing Excel file...');
    const parsedTools = await EnhancedToolParser.parseEnhancedToolListExcel(file);
    
    if (parsedTools.length === 0) {
      toast.error('No tools found in the Excel file');
      return false;
    }

    // Step 3: Import tools to database
    progressCallback?.(40, 100, 'Importing tools to database...');
    const results = await importEnhancedToolsToDatabase(parsedTools, (current, total) => {
      const progress = 40 + ((current / total) * 40);
      progressCallback?.(progress, 100, `Importing tool ${current + 1} of ${total}...`);
    });

    // Step 4: Trigger web scraping for all tool models
    progressCallback?.(80, 100, 'Starting web scraping for pricing and estimates...');
    
    try {
      // Get all variation instances that were just created
      const { data: variations } = await supabase
        .from('variation_instances')
        .select(`
          id,
          name,
          core_item_id,
          tools!inner(item)
        `)
        .eq('item_type', 'tools');

      if (variations && variations.length > 0) {
        // Trigger pricing scrape for each variation
        const { data, error } = await supabase.functions.invoke('scrape-tool-pricing', {
          body: { 
            mode: 'bulk',
            variationIds: variations.map(v => v.id)
          }
        });

        if (error) {
          console.error('Error triggering pricing scrape:', error);
          toast.error('Tools imported but pricing scrape failed');
        } else {
          toast.success(`Successfully imported ${results.success} tools and started pricing scrape`);
        }
      }
    } catch (scrapeError) {
      console.error('Error with pricing scrape:', scrapeError);
      toast.error('Tools imported but pricing scrape failed');
    }

    progressCallback?.(100, 100, 'Import complete');

    if (results.errors.length > 0) {
      console.error('Import errors:', results.errors);
      toast.error(`Imported ${results.success} tools with ${results.errors.length} errors`);
    } else {
      toast.success(`Successfully imported ${results.success} tools with web scraping initiated`);
    }

    return true;
  } catch (error) {
    console.error('Error importing tools:', error);
    toast.error(`Failed to import tools: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}