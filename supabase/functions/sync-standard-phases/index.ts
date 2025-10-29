import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncResult {
  success: boolean;
  templatesUpdated: number;
  templatesFailed: number;
  failedTemplates: Array<{
    name: string;
    id: string;
    error: string;
  }>;
  details: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('SYNC: Starting standard phase sync by admin:', user.id);

    const standardProjectId = '00000000-0000-0000-0000-000000000001';
    const result: SyncResult = {
      success: true,
      templatesUpdated: 0,
      templatesFailed: 0,
      failedTemplates: [],
      details: [],
    };

    // Step 1: Rebuild Standard Project phases
    result.details.push('Rebuilding Standard Project phases...');
    const { error: rebuildError } = await supabase.rpc('rebuild_phases_json_from_templates', {
      p_project_id: standardProjectId
    });

    if (rebuildError) {
      console.error('SYNC: Failed to rebuild Standard Project:', rebuildError);
      throw new Error(`Failed to rebuild Standard Project: ${rebuildError.message}`);
    }

    // Get the rebuilt Standard Project phases
    const { data: standardProject, error: standardError } = await supabase
      .from('projects')
      .select('phases')
      .eq('id', standardProjectId)
      .single();

    if (standardError || !standardProject) {
      throw new Error('Failed to fetch Standard Project');
    }

    result.details.push('Standard Project phases rebuilt successfully');

    // Step 2: Get all project templates (not revisions, not Standard Project)
    const { data: templates, error: templatesError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('is_standard_template', false)
      .is('parent_project_id', null)
      .neq('id', standardProjectId);

    if (templatesError) {
      throw new Error(`Failed to fetch templates: ${templatesError.message}`);
    }

    result.details.push(`Found ${templates?.length || 0} templates to update`);

    // Step 3: Update each template
    for (const template of templates || []) {
      try {
        console.log(`SYNC: Updating template "${template.name}" (${template.id})`);
        
        // Rebuild this template's phases
        const { error: templateRebuildError } = await supabase.rpc('rebuild_phases_json_from_templates', {
          p_project_id: template.id
        });

        if (templateRebuildError) {
          throw new Error(templateRebuildError.message);
        }

        // Update the template's updated_at timestamp
        const { error: updateError } = await supabase
          .from('projects')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', template.id);

        if (updateError) {
          throw new Error(updateError.message);
        }

        result.templatesUpdated++;
        result.details.push(`✓ Updated: ${template.name}`);
        console.log(`SYNC: Successfully updated "${template.name}"`);
      } catch (error) {
        result.templatesFailed++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        result.failedTemplates.push({
          name: template.name,
          id: template.id,
          error: errorMessage,
        });
        result.details.push(`✗ Failed: ${template.name} - ${errorMessage}`);
        console.error(`SYNC: Failed to update "${template.name}":`, error);
      }
    }

    // Log to security events
    await supabase.rpc('log_comprehensive_security_event', {
      event_type_param: 'manual_standard_phase_sync',
      severity_param: 'high',
      description_param: `Admin manually synced standard phases to ${result.templatesUpdated} templates`,
      user_id_param: user.id,
      user_email_param: user.email || null,
      ip_address_param: null,
      user_agent_param: req.headers.get('user-agent') || null,
      additional_data_param: result,
    });

    result.details.push(
      `\nSync completed: ${result.templatesUpdated} updated, ${result.templatesFailed} failed`
    );

    console.log('SYNC: Completed -', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('SYNC: Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
