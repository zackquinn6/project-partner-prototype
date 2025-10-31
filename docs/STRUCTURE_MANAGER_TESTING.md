# Structure Manager Testing Guide

## Manual Testing Protocol

### Prerequisites
- Admin access to the application
- A project template to test with (not the Standard Project Foundation)
- Browser console open to monitor operations

## Test Suite

### 1. Add Phase Tests

#### Test 1.1: Add Phase Respects Standard Phase Ordering
**Steps:**
1. Navigate to Project Management → Edit a project
2. Click "Add Phase" button
3. Observe the new phase location in the phase list

**Expected Result:**
- New custom phase should appear AFTER "Ordering" phase
- New custom phase should appear BEFORE "Close Project" phase
- Order should be: Kickoff → Planning → Ordering → **[New Phase]** → Close Project

**Validation:**
```javascript
// Run in browser console after adding phase
const phases = currentProject.phases.map(p => p.name);
console.log('Phase order:', phases);
// Should show: ['Kickoff', 'Planning', 'Ordering', 'New Phase', 'Close Project']
```

#### Test 1.2: Multiple Custom Phases
**Steps:**
1. Add a custom phase (Test 1.1)
2. Add another custom phase
3. Add a third custom phase

**Expected Result:**
- All custom phases appear between Ordering and Close Project
- Order: Kickoff → Planning → Ordering → Custom1 → Custom2 → Custom3 → Close Project

**Validation:**
```javascript
const customPhases = currentProject.phases.filter(p => !p.isStandard && !p.isLinked);
console.log('Custom phases count:', customPhases.length);
// Should be 3
```

#### Test 1.3: Phase Persists in Database
**Steps:**
1. Add a custom phase
2. Refresh the page
3. Navigate back to the project

**Expected Result:**
- Custom phase still exists after refresh
- Phase data is loaded from `template_operations` table
- Order is still correct

**Validation:**
```sql
-- Run in Supabase SQL Editor
SELECT 
  custom_phase_name,
  custom_phase_display_order,
  name as operation_name
FROM template_operations
WHERE project_id = 'YOUR_PROJECT_ID'
  AND custom_phase_name IS NOT NULL
ORDER BY custom_phase_display_order;
```

### 2. Add Operation Tests

#### Test 2.1: Add Operation to Custom Phase
**Steps:**
1. Create a custom phase (Test 1.1)
2. Click "Add Operation" for the custom phase
3. Observe the new operation

**Expected Result:**
- New operation appears in the custom phase
- Operation has default name "New Operation"
- Phase order remains correct

**Validation:**
```javascript
const customPhase = currentProject.phases.find(p => p.name === 'New Phase');
console.log('Operations in custom phase:', customPhase.operations.length);
// Should be at least 1
```

#### Test 2.2: Add Operation Persists
**Steps:**
1. Add operation (Test 2.1)
2. Refresh page
3. Navigate back to project

**Expected Result:**
- Operation still exists
- Operation data loaded from database

**Validation:**
```sql
-- Run in Supabase SQL Editor
SELECT 
  to.name as operation_name,
  to.custom_phase_name,
  COUNT(ts.id) as step_count
FROM template_operations to
LEFT JOIN template_steps ts ON ts.operation_id = to.id
WHERE to.project_id = 'YOUR_PROJECT_ID'
  AND to.custom_phase_name = 'New Phase'
GROUP BY to.id, to.name, to.custom_phase_name;
```

### 3. Add Step Tests

#### Test 3.1: Add Step to Operation
**Steps:**
1. Create custom phase with operation (Tests 1.1, 2.1)
2. Click "Add Step" for the operation
3. Observe the new step

**Expected Result:**
- New step appears in the operation
- Step has default title "New Step"
- Step uses correct database operation_id (not memory ID)

**Validation:**
```javascript
const customPhase = currentProject.phases.find(p => p.name === 'New Phase');
const operation = customPhase.operations[0];
console.log('Steps in operation:', operation.steps.length);
// Should be at least 1
```

#### Test 3.2: Add Step Uses Correct Operation ID
**Steps:**
1. Add step to operation (Test 3.1)
2. Check console for any foreign key errors
3. Verify step was added

**Expected Result:**
- No foreign key constraint errors in console
- Step successfully added to database
- `template_steps.operation_id` matches `template_operations.id`

**Validation:**
```sql
-- Run in Supabase SQL Editor
SELECT 
  ts.step_title,
  ts.operation_id,
  to.name as operation_name,
  to.custom_phase_name
FROM template_steps ts
JOIN template_operations to ON to.id = ts.operation_id
WHERE to.project_id = 'YOUR_PROJECT_ID'
  AND to.custom_phase_name = 'New Phase'
ORDER BY ts.display_order;
```

#### Test 3.3: Add Multiple Steps
**Steps:**
1. Add first step (Test 3.1)
2. Add second step
3. Add third step

**Expected Result:**
- All steps appear in operation
- Steps are numbered sequentially
- Display order is correct

**Validation:**
```javascript
const operation = currentProject.phases
  .find(p => p.name === 'New Phase')
  .operations[0];
console.log('Step count:', operation.steps.length);
console.log('Step numbers:', operation.steps.map(s => s.stepNumber || s.step_number));
```

### 4. Database Architecture Tests

#### Test 4.1: Verify Relational Structure
**Steps:**
1. Add phase, operation, and step
2. Query database to verify structure

**Expected Result:**
- Data stored in `template_operations` and `template_steps` tables
- `projects.phases` contains JSON built from relational data
- Foreign keys properly linked

**Validation:**
```sql
-- Verify complete structure
WITH project_structure AS (
  SELECT 
    p.id as project_id,
    p.name as project_name,
    jsonb_array_length(p.phases) as json_phase_count,
    COUNT(DISTINCT to.id) as operation_count,
    COUNT(DISTINCT ts.id) as step_count
  FROM projects p
  LEFT JOIN template_operations to ON to.project_id = p.id
  LEFT JOIN template_steps ts ON ts.operation_id = to.id
  WHERE p.id = 'YOUR_PROJECT_ID'
  GROUP BY p.id, p.name, p.phases
)
SELECT * FROM project_structure;
```

#### Test 4.2: Verify Phase Ordering After Rebuild
**Steps:**
1. Add custom phase
2. Manually call rebuild function

**Expected Result:**
- Phases rebuilt from relational tables
- Standard phase ordering enforced
- Order: Kickoff → Planning → Ordering → Custom → Close

**Validation:**
```sql
-- Rebuild phases and check
SELECT rebuild_phases_json_from_templates('YOUR_PROJECT_ID');

-- Check the result
SELECT 
  jsonb_array_elements(phases)->>'name' as phase_name,
  jsonb_array_elements(phases)->>'isStandard' as is_standard
FROM projects
WHERE id = 'YOUR_PROJECT_ID';
```

### 5. Standard Phase Rules Tests

#### Test 5.1: First Three Phases Are Always Standard
**Steps:**
1. View any project with standard phases
2. Observe first three phases

**Expected Result:**
- Position 1: Kickoff
- Position 2: Planning
- Position 3: Ordering

**Validation:**
```javascript
const phases = currentProject.phases;
console.log('First 3 phases:', phases.slice(0, 3).map(p => p.name));
// Should be: ['Kickoff', 'Planning', 'Ordering']
```

#### Test 5.2: Close Project Always Last
**Steps:**
1. Add multiple custom phases
2. Add linked phases
3. Observe phase order

**Expected Result:**
- "Close Project" is always the last phase
- No phases appear after it

**Validation:**
```javascript
const phases = currentProject.phases;
const lastPhase = phases[phases.length - 1];
console.log('Last phase:', lastPhase.name);
console.log('Is Close Project:', lastPhase.name === 'Close Project');
// Should be: true
```

#### Test 5.3: Custom Phases Between Ordering and Close
**Steps:**
1. Add custom phase
2. Check its position

**Expected Result:**
- Custom phase appears after position 3 (after Ordering)
- Custom phase appears before last position (before Close Project)

**Validation:**
```javascript
const phases = currentProject.phases;
const customPhaseIndex = phases.findIndex(p => p.name === 'New Phase');
const orderingIndex = phases.findIndex(p => p.name === 'Ordering');
const closeIndex = phases.findIndex(p => p.name === 'Close Project');

console.log('Custom phase index:', customPhaseIndex);
console.log('Is after Ordering:', customPhaseIndex > orderingIndex);
console.log('Is before Close:', customPhaseIndex < closeIndex);
// Both should be: true
```

### 6. Error Handling Tests

#### Test 6.1: Cannot Add to Linked Phases
**Steps:**
1. Incorporate a phase from another project
2. Try to add operation to linked phase

**Expected Result:**
- Error toast: "Cannot add operations to incorporated phases"
- No operation added

#### Test 6.2: Cannot Add to Standard Phases (Non-Admin)
**Steps:**
1. Edit a non-standard project (not Standard Project Foundation)
2. Try to add operation to "Kickoff" phase

**Expected Result:**
- Error toast: "Cannot add operations to standard phases"
- No operation added

#### Test 6.3: Can Add to Standard Phases (When Editing Standard)
**Steps:**
1. Navigate to Edit Standard Project Foundation
2. Add operation to "Kickoff" phase

**Expected Result:**
- Operation successfully added
- Changes persist to Standard Project Foundation

## Automated Testing Checklist

When implementing automated tests, ensure coverage of:

- [ ] Phase ordering logic (`enforceStandardPhaseOrdering`)
- [ ] Phase validation (`validateStandardPhaseOrdering`)
- [ ] Database operation ID lookup
- [ ] Rebuild phases from templates function
- [ ] Standard phase rules enforcement
- [ ] Custom phase insertion logic
- [ ] Linked phase positioning
- [ ] Error handling for invalid operations

## Console Debugging Commands

```javascript
// Check current phase order
console.table(currentProject.phases.map((p, i) => ({
  index: i,
  name: p.name,
  isStandard: p.isStandard,
  isLinked: p.isLinked,
  operationCount: p.operations.length
})));

// Find custom phases
console.table(currentProject.phases.filter(p => !p.isStandard && !p.isLinked));

// Verify Close Project is last
const last = currentProject.phases[currentProject.phases.length - 1];
console.log('Last phase is Close Project:', last.name === 'Close Project');

// Count total operations and steps
const totalOps = currentProject.phases.reduce((sum, p) => sum + p.operations.length, 0);
const totalSteps = currentProject.phases.reduce((sum, p) => 
  sum + p.operations.reduce((s, o) => s + o.steps.length, 0), 0);
console.log({ totalOps, totalSteps });
```

## Common Issues & Solutions

### Issue: "stack depth limit exceeded"
**Cause:** Database triggers causing infinite recursion
**Solution:** Triggers have been removed; rebuild function called manually

### Issue: "foreign key constraint violation"
**Cause:** Using in-memory operation IDs instead of database IDs
**Solution:** Look up actual database operation_id before inserting steps

### Issue: Phases out of order
**Cause:** Not calling `enforceStandardPhaseOrdering` after rebuild
**Solution:** Always enforce ordering after rebuilding phases JSON

### Issue: Custom phase disappears after refresh
**Cause:** Not synced to `template_operations` table
**Solution:** Ensure phase is inserted into database before rebuilding JSON
