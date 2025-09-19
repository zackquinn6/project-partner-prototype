// Direct import script - executes immediately
import { supabase } from './src/integrations/supabase/client.js';
import { EnhancedToolParser } from './src/utils/enhancedToolParser.js';
import { importEnhancedToolsToDatabase } from './src/utils/enhancedToolParser.js';

console.log('🚀 Starting direct import of Book1-7.xlsx...');

async function executeDirectImport() {
  try {
    // Load and parse the new Excel file
    console.log('📄 Loading new Excel file...');
    const response = await fetch('/src/assets/new-import.xlsx');
    const blob = await response.blob();
    const file = new File([blob], 'new-import.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    console.log('🔧 Parsing tools with enhanced parser...');
    const parsedTools = await EnhancedToolParser.parseEnhancedToolListExcel(file);
    console.log(`✅ Parsed ${parsedTools.length} tools with variants`);

    // Import directly to database
    console.log('💾 Importing to database...');
    const results = await importEnhancedToolsToDatabase(parsedTools, (current, total) => {
      console.log(`📥 Importing tool ${current + 1} of ${total}...`);
    });

    console.log(`✅ Import completed: ${results.success} tools imported`);
    if (results.errors.length > 0) {
      console.log(`⚠️ ${results.errors.length} errors encountered`);
    }

    // Trigger immediate web scraping for pricing and estimates
    console.log('🔍 Starting web scraping for estimates...');
    const { data: variations } = await supabase
      .from('variation_instances')
      .select('id, name')
      .eq('item_type', 'tools');

    if (variations && variations.length > 0) {
      console.log(`🌐 Scraping ${variations.length} tool variations...`);
      
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

    console.log('🎉 Direct import completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Direct import failed:', error);
    return false;
  }
}

// Execute immediately
executeDirectImport();