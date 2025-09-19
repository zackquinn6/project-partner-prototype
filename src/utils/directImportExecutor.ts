import { supabase } from '@/integrations/supabase/client';
import { EnhancedToolParser } from './enhancedToolParser';
import { importEnhancedToolsToDatabase } from './enhancedToolParser';
import { toast } from 'sonner';

export const executeDirectImport = async (): Promise<boolean> => {
  try {
    console.log('🚀 DIRECT IMPORT: Starting immediate import of new tools...');

    // Load and parse the new Excel file
    console.log('📄 Loading Excel file from assets...');
    const response = await fetch('/src/assets/new-import.xlsx');
    if (!response.ok) {
      throw new Error('Failed to load Excel file');
    }
    
    const blob = await response.blob();
    const file = new File([blob], 'new-import.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    console.log('🔧 Parsing tools with enhanced parser...');
    const parsedTools = await EnhancedToolParser.parseEnhancedToolListExcel(file);
    console.log(`✅ Parsed ${parsedTools.length} tools with variants`);

    if (parsedTools.length === 0) {
      throw new Error('No tools found in Excel file');
    }

    // Import directly to database
    console.log('💾 Importing to database...');
    const results = await importEnhancedToolsToDatabase(parsedTools, (current, total) => {
      console.log(`📥 Importing tool ${current + 1} of ${total}...`);
    });

    console.log(`✅ Import completed: ${results.success} tools imported`);
    
    if (results.errors.length > 0) {
      console.log(`⚠️ ${results.errors.length} errors encountered:`, results.errors);
      // Don't fail completely for duplicate errors
    }

    // Trigger immediate web scraping for pricing and estimates
    console.log('🔍 Starting web scraping for estimates...');
    const { data: variations } = await supabase
      .from('variation_instances')
      .select('id, name')
      .eq('item_type', 'tools');

    if (variations && variations.length > 0) {
      console.log(`🌐 Initiating scrape for ${variations.length} tool variations...`);
      
      const { data, error } = await supabase.functions.invoke('scrape-tool-pricing', {
        body: { 
          mode: 'bulk',
          variationIds: variations.map(v => v.id)
        }
      });

      if (error) {
        console.error('❌ Web scraping failed:', error);
      } else {
        console.log('✅ Web scraping initiated successfully');
      }
    }

    console.log('🎉 DIRECT IMPORT: Completed successfully!');
    toast.success(`Imported ${results.success} tools with variants and initiated web scraping`);
    return true;

  } catch (error) {
    console.error('❌ DIRECT IMPORT: Failed:', error);
    toast.error('Direct import failed: ' + (error as Error).message);
    return false;
  }
};

// Execute the import immediately when this module loads
console.log('🎯 Executing direct import on module load...');
executeDirectImport();