import { EnhancedToolParser, importEnhancedToolsToDatabase } from './enhancedToolParser';
import { clearAllTools } from './variationUtils';
import { toast } from 'sonner';

export async function clearAndImportToolsFromFile(
  file: File, 
  progressCallback?: (current: number, total: number, step?: string) => void
): Promise<boolean> {
  try {
    // Step 1: Clear existing tools
    progressCallback?.(0, 100, 'Clearing existing tools...');
    const cleared = await clearAllTools();
    if (!cleared) {
      toast.error('Failed to clear existing tools');
      return false;
    }

    // Step 2: Parse the Excel file
    progressCallback?.(20, 100, 'Parsing Excel file...');
    const parsedTools = await EnhancedToolParser.parseEnhancedToolListExcel(file);
    
    if (parsedTools.length === 0) {
      toast.error('No tools found in the Excel file');
      return false;
    }

    // Step 3: Import tools to database
    progressCallback?.(40, 100, 'Importing tools to database...');
    const results = await importEnhancedToolsToDatabase(parsedTools, (current, total) => {
      const progress = 40 + ((current / total) * 60);
      progressCallback?.(progress, 100, `Importing tool ${current + 1} of ${total}...`);
    });

    progressCallback?.(100, 100, 'Import complete');

    if (results.errors.length > 0) {
      console.error('Import errors:', results.errors);
      toast.error(`Imported ${results.success} tools with ${results.errors.length} errors`);
    } else {
      toast.success(`Successfully imported ${results.success} tools with variants`);
    }

    return true;
  } catch (error) {
    console.error('Error importing tools:', error);
    toast.error(`Failed to import tools: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}