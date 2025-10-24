# Workflow Editor - Step Content Detail Level Testing Protocol

## Overview
This document provides a comprehensive testing protocol for verifying the Step Content Detail Level dropdown functionality in the Workflow Editor.

## Feature Description
The Workflow Editor allows administrators to configure three levels of instructional detail for each step in a project workflow:
- **Quick**: Brief, essential instructions
- **Detailed**: Comprehensive step-by-step instructions (default)
- **Contractor**: Professional-level technical instructions

Each step can have different content for each detail level, stored in the `step_instructions` table with the corresponding `instruction_level` value.

## Prerequisites
1. User must be logged in as an administrator
2. At least one project template must exist with phases, operations, and steps
3. Database access to verify `step_instructions` table entries

## Testing Steps

### Phase 1: Access the Workflow Editor

1. **Navigate to Admin Area**
   - Log in as an admin user
   - Navigate to the admin section where Decision Tree Manager is accessible

2. **Open Decision Tree Manager**
   - Click the button/icon to open the Decision Tree Manager dialog
   - Verify the dialog opens successfully

3. **Navigate to Workflow Editor Tab**
   - In the Decision Tree Manager, locate the tab navigation
   - Click on the "Workflow Editor" tab (icon: Settings)
   - Verify the Workflow Editor interface loads

**Expected Result**: Workflow Editor displays with a list of phases, legend showing flow types, and header with "Save Changes" button

### Phase 2: Expand Project Structure

1. **Expand a Phase**
   - Click on any phase card header
   - Verify the phase expands to show its operations
   
2. **Locate an Operation**
   - Within the expanded phase, find an operation card
   - Note the operation name and description displayed

3. **Open Operation Editor**
   - Click the Settings icon (gear icon) on the right side of the operation card header
   - Verify the operation editing panel expands below the operation header

**Expected Result**: Operation editing panel opens showing:
- Operation Type selector
- User Decision Prompt (if applicable for alternate/if-necessary operations)
- Step Content section

### Phase 3: Verify Step Content Dropdown Existence

1. **Locate Step Content Section**
   - Scroll down within the operation editing panel
   - Find the "Step Content" section with border-top separator
   - Verify the section header reads "Step Content"
   - Verify the description text mentions "Configure instruction content for each detail level"

2. **Count Steps**
   - Note how many steps are listed in the Step Content section
   - Each step should be in a separate card with muted background

3. **Verify Dropdown for Each Step**
   For each step card:
   - **Left side**: Verify step title displays (e.g., "Step 1: [step name]")
   - **Right side**: Verify dropdown selector is visible
   - Verify the dropdown shows the current selection (default: "Detailed")
   - Verify the dropdown has width of approximately 140px and small height

**Expected Result**: Each step has a visible dropdown selector on the right side of its header

### Phase 4: Test Dropdown Functionality

1. **Click Dropdown**
   - Click on the dropdown for Step 1
   - Verify dropdown menu opens with 3 options visible:
     - Quick
     - Detailed  
     - Contractor

2. **Verify Visual Properties**
   - Confirm dropdown menu has:
     - Solid background (not transparent)
     - High z-index (appears above other content)
     - Clear border
     - Shadow effect
   - All text is readable with proper contrast

3. **Select Different Level**
   - Click "Quick" option
   - Verify dropdown closes
   - Verify "Quick" is now displayed in the dropdown trigger
   - Verify the alert message below updates to mention "Quick level instructions"

4. **Repeat for Other Levels**
   - Click dropdown again
   - Select "Contractor"
   - Verify it updates properly
   - Select "Detailed" to return to default

**Expected Result**: Dropdown functions smoothly with all selections working and UI updating accordingly

### Phase 5: Test Multiple Steps

1. **Change Different Steps to Different Levels**
   - Set Step 1 to "Quick"
   - Set Step 2 to "Contractor" (if exists)
   - Set Step 3 to "Detailed" (if exists)
   - Keep Step 4+ at default "Detailed" (if exist)

2. **Verify Each Step Maintains Its Selection**
   - Scroll through all steps
   - Confirm each shows the correct level in its dropdown
   - Confirm each alert message references the correct level

**Expected Result**: Each step independently maintains its selected detail level

### Phase 6: Verify Database Context

1. **Read Alert Messages**
   - For each step, read the alert box below the dropdown
   - Verify it states: "[Level] level instructions are stored in the step_instructions table with instruction_level='[level]'"

2. **Understand Data Structure**
   - The alert explains where content is stored
   - Content management happens in Step Content Editor or database directly
   - This dropdown indicates which level you're configuring

**Expected Result**: Clear messaging about where content is stored in the database

### Phase 7: Test Persistence (State Management)

1. **Collapse and Re-expand Operation**
   - Click Settings icon to collapse the operation editor
   - Verify panel collapses
   - Click Settings icon again to re-expand
   - Verify all step detail level selections are preserved

2. **Switch to Different Operation**
   - Collapse current operation
   - Expand a different operation in the same or different phase
   - Verify it has its own step content dropdowns
   - Return to original operation
   - Verify selections are still preserved

**Expected Result**: Detail level selections persist while editing within the same session

### Phase 8: Visual Verification Checklist

Use this checklist when inspecting the Step Content section:

- [ ] "Step Content" section header is visible
- [ ] Description text explains the feature clearly
- [ ] Each step displays in a separate card with muted background
- [ ] Step number and title are on the left side of each card
- [ ] Dropdown selector is on the right side of each card
- [ ] Dropdown trigger shows current selection
- [ ] Dropdown trigger has proper styling (border, background, text)
- [ ] Clicking dropdown opens menu with 3 options
- [ ] Dropdown menu has solid background (not transparent)
- [ ] Dropdown menu items are readable
- [ ] Selecting an option updates the trigger display
- [ ] Alert message below each dropdown shows correct level
- [ ] Alert message mentions step_instructions table
- [ ] No visual glitches or overlapping elements

### Phase 9: Edge Cases

1. **Test with Operation with Only 1 Step**
   - Find an operation with single step
   - Verify dropdown still works properly

2. **Test with Operation with Many Steps**
   - Find an operation with 5+ steps
   - Verify all dropdowns are accessible
   - Verify scrolling works within operation panel

3. **Test Rapid Selection Changes**
   - Rapidly click and change dropdown selections
   - Verify no errors occur
   - Verify UI remains stable

**Expected Result**: Dropdowns work reliably in all scenarios

## Troubleshooting Guide

### Issue: Dropdown Not Visible
**Check:**
1. Is the operation expanded? (Settings icon clicked)
2. Did you scroll down to Step Content section?
3. Is the browser window wide enough to display the full layout?

### Issue: Dropdown Menu Transparent/Not Visible
**Check:**
1. Browser developer tools - verify z-index is 100
2. Check if bg-popover color is defined in theme
3. Try clicking dropdown and moving mouse - menu should appear

### Issue: Selections Not Persisting
**Check:**
1. Are you collapsing/re-expanding within same session?
2. Have you clicked "Save Changes" button?
3. Note: Selections are UI state only until saved

### Issue: Step Content Section Missing
**Check:**
1. Ensure you're in Workflow Editor tab (not Decision Tree)
2. Ensure operation is expanded (Settings icon clicked)
3. Scroll down within the operation editing panel

## Database Verification

To verify the data structure supports this feature:

```sql
-- Check step_instructions table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'step_instructions';

-- Expected columns include:
-- id, template_step_id, instruction_level, content, created_at, updated_at

-- Check existing instruction levels for a step
SELECT template_step_id, instruction_level, 
       jsonb_pretty(content) as content
FROM step_instructions 
WHERE template_step_id = '[some-step-id]'
ORDER BY instruction_level;

-- Should return up to 3 rows: quick, detailed, contractor
```

## Success Criteria

The Step Content Detail Level dropdown feature is functioning correctly when:

✅ Dropdown selector is visible for every step in the Step Content section  
✅ Dropdown displays 3 options: Quick, Detailed, Contractor  
✅ Dropdown has solid background and high z-index  
✅ Selecting an option updates the display immediately  
✅ Alert message correctly shows selected level  
✅ Each step can have independent detail level selection  
✅ Selections persist when collapsing/re-expanding operations  
✅ No visual glitches or transparency issues  
✅ Works across different operations and phases  

## Notes for Developers

- Component: `src/components/DecisionTree/AdminWorkflowEditor.tsx`
- Lines 212-245 contain the step content dropdown implementation
- State managed by: `stepDetailLevels` (Record<string, 'quick' | 'detailed' | 'contractor'>)
- Default value: 'detailed'
- UI Component: Shadcn Select component
- Z-index for dropdown: 100 (to ensure visibility)

## Related Documentation

- Database Schema: `step_instructions` table in Supabase
- RLS Policies: Admins can manage step instructions
- UI Components: `src/components/ui/select.tsx`
- Parent Component: `src/components/DecisionTree/DecisionTreeManager.tsx`
