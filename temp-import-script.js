// One-time import script - execute directly
import { EnhancedToolParser, importEnhancedToolsToDatabase } from './src/utils/enhancedToolParser.js';
import { clearAllTools } from './src/utils/variationUtils.js';
import { supabase } from './src/integrations/supabase/client.js';

async function executeOneTimeImport() {
  console.log('🔄 Starting one-time tool import...');
  
  try {
    // Step 1: Clear existing tools
    console.log('1️⃣ Clearing existing tools...');
    const cleared = await clearAllTools();
    if (!cleared) {
      throw new Error('Failed to clear existing tools');
    }
    console.log('✅ Existing tools cleared');

    // Step 2: Load and parse Excel file
    console.log('2️⃣ Loading Excel file...');
    const response = await fetch('/src/assets/temp-import.xlsx');
    const blob = await response.blob();
    const file = new File([blob], 'temp-import.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    console.log('📄 Parsing Excel file...');
    const parsedTools = await EnhancedToolParser.parseEnhancedToolListExcel(file);
    console.log(`✅ Parsed ${parsedTools.length} tools with variants`);

    // Step 3: Import to database
    console.log('3️⃣ Importing tools to database...');
    const results = await importEnhancedToolsToDatabase(parsedTools, (current, total) => {
      console.log(`📥 Importing tool ${current + 1} of ${total}...`);
    });
    console.log(`✅ Imported ${results.success} tools successfully`);
    if (results.errors.length > 0) {
      console.log(`⚠️ ${results.errors.length} import errors:`, results.errors);
    }

    // Step 4: Trigger web scraping for all variations
    console.log('4️⃣ Starting web scraping for pricing and estimates...');
    
    const { data: variations } = await supabase
      .from('variation_instances')
      .select('id, name')
      .eq('item_type', 'tools');

    if (variations && variations.length > 0) {
      console.log(`🔍 Triggering scrape for ${variations.length} tool variations...`);
      
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
        console.log('📊 Scraping will add models, weight, cost, and rental lifespan data');
      }
    }

    console.log('🎉 One-time import completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    return false;
  }
}

// Execute the import
executeOneTimeImport();