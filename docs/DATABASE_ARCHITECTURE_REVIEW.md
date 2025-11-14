# Database Architecture Review & Improvement Plan

## Executive Summary

**Current State**: Hybrid architecture with BOTH relational tables AND JSON storage, with COPY operations instead of dynamic linking.

**Design Intent**: Fully relational workflow structure with dynamic linking to standard foundation.

**Gap Analysis**: Significant deviations from design intent requiring architectural refactoring.

---

## Current Architecture Analysis

### ✅ What's Working

1. **Relational Tables Exist**:
   - `standard_phases` - 4 standard phases defined
   - `project_phases` - Phase instances per project
   - `template_operations` - Operations within phases
   - `template_steps` - Individual workflow steps
   - `project_run_steps` - User progress tracking

2. **Standard Project Foundation**:
   - ID: `00000000-0000-0000-0000-000000000001`
   - Flagged with `is_standard_template = true`
   - Contains all standard workflow content

3. **Project Runs as Immutable Snapshots**:
   - `project_runs.phases` stores JSONB snapshot (CORRECT)
   - Users can't modify template structure during runs

### ❌ Major Architectural Issues

#### Issue #1: Duplicate Storage (JSON + Relational)
```sql
-- PROBLEM: Same data exists in TWO places
projects.phases              -- JSONB column
project_phases table         -- Relational records
template_operations table    -- Relational records  
template_steps table         -- Relational records

-- This creates:
- Data synchronization burden
- Higher storage costs
- Potential inconsistencies
- Complex update logic
```

**Current Function**: `rebuild_phases_json_from_project_phases()` constantly rebuilds JSON from relational data.

**Design Intent**: JSON should only exist in `project_runs` for immutability. Templates should be purely relational.

---

#### Issue #2: COPYING Instead of Dynamic Linking

**Current Behavior** (`create_project_with_standard_foundation_v2`):
```sql
-- Lines 248-318: COPIES standard operations/steps into new project
FOR standard_operation IN
  SELECT * FROM template_operations
  WHERE project_id = standard_project_id  -- Standard foundation
LOOP
  INSERT INTO template_operations (...)  -- COPY to new project
  VALUES (...);
END LOOP;
```

**Problems**:
- Standard foundation updates DON'T propagate to existing templates
- Manual propagation function `cascade_standard_phase_updates()` required
- Each template stores duplicate standard content
- Database bloat (N projects × standard operations/steps)

**Design Intent**: 
- Templates REFERENCE standard foundation (foreign keys)
- Changes to standard foundation visible immediately
- No duplication
- Read-only view for standard content

---

#### Issue #3: Non-Relational Materials/Tools/Outputs

**Current Schema**:
```sql
template_steps (
  materials JSONB,  -- ❌ Should be relational
  tools JSONB,      -- ❌ Should be relational  
  outputs JSONB     -- ❌ Should be relational
)
```

**Design Intent**:
```sql
-- Proper normalization
step_materials (step_id, material_id, quantity, is_optional)
step_tools (step_id, tool_id, is_optional)
step_outputs (step_id, output_id, is_required)

materials (id, name, category, unit, avg_cost)
tools (id, name, category, rental_available)
outputs (id, name, type, description)
```

**Benefits of Relational**:
- Query all projects needing Tool X
- Aggregate material costs across steps
- Standardize tool/material names
- Track output dependencies
- Better reporting/analytics

---

#### Issue #4: Missing Tables

**Not Implemented**:
1. `step_types` - Categories of steps (measurement, installation, inspection, etc.)
2. `process_variables` - Dynamic variables for calculations (area, length, etc.)
3. `materials` - Master material catalog
4. `tools` - Master tool catalog
5. `outputs` - Master output catalog

---

## Design Intent Compliance Matrix

| Requirement | Current State | Compliant | Gap |
|-------------|---------------|-----------|-----|
| Phases in relational tables | ✅ `project_phases` | ✅ Yes | - |
| Operations in relational tables | ✅ `template_operations` | ✅ Yes | - |
| Steps in relational tables | ✅ `template_steps` | ✅ Yes | - |
| Materials in relational tables | ❌ JSONB in steps | ❌ No | Need `materials`, `step_materials` |
| Tools in relational tables | ❌ JSONB in steps | ❌ No | Need `tools`, `step_tools` |
| Outputs in relational tables | ❌ JSONB in steps | ❌ No | Need `outputs`, `step_outputs` |
| Step types in relational tables | ❌ Not implemented | ❌ No | Need `step_types` table |
| Process variables relational | ❌ Not implemented | ❌ No | Need `process_variables` |
| Instructions/content in JSON | ✅ `content_sections` JSONB | ✅ Yes | - |
| Standard foundation dynamic link | ❌ COPIES content | ❌ No | Major refactor needed |
| Templates show read-only foundation | ❌ Own editable copies | ❌ No | Need views/UI changes |
| Project runs as snapshots | ✅ JSONB in `project_runs` | ✅ Yes | - |

**Overall Compliance: 4/12 (33%)**

---

## Recommended Architecture

### Layer 1: Standard Project Foundation (Dynamic Source of Truth)

```
standard_phases (4 records, immutable)
  ↓ (one-to-many, belongs to standard foundation)
standard_operations (owned by project ID = standard_foundation_id)
  ↓ (one-to-many)
standard_steps (owned by standard_operations)
  ↓ (many-to-many)
step_materials, step_tools, step_outputs (join tables)
  ↓ (foreign keys)
materials, tools, outputs (master catalogs)
```

### Layer 2: Project Templates (Reference + Custom)

```
projects (template_id, NOT phases JSONB column)
  ↓
project_phases
  ├─ standard_phase_id (foreign key) → READ-ONLY link to standard
  └─ is_custom = true → EDITABLE custom phases
  ↓
template_operations
  ├─ Links to standard foundation operations (foreign key)
  └─ OR custom operations (is_custom = true)
  ↓
template_steps (same pattern)
```

**Key Change**: Instead of copying, templates REFERENCE standard content via foreign keys.

**UI Impact**: 
- Standard phases show as "locked" with view-only badge
- Custom phases show as editable
- Single source of truth for standard content

### Layer 3: Project Runs (Immutable Snapshots)

```
project_runs
  phases JSONB (snapshot at creation time - KEEP AS-IS)
  ↓
project_run_steps (progress tracking only)
```

**No Changes Needed**: This layer is already correct.

---

## Implementation Plan

### Phase 1: Create Master Catalogs (Low Risk)
**Estimated Time**: 2-3 hours

1. Create `materials` table
2. Create `tools` table  
3. Create `outputs` table
4. Create `step_types` table
5. Create `process_variables` table
6. Create junction tables (`step_materials`, `step_tools`, `step_outputs`)
7. Migrate existing JSONB data to relational tables
8. Add indexes and RLS policies

**No Breaking Changes**: Keep JSONB columns temporarily for backwards compatibility.

---

### Phase 2: Implement Dynamic Linking (Medium Risk)
**Estimated Time**: 4-6 hours

1. Add `source_operation_id` to `template_operations` (references standard foundation)
2. Add `source_step_id` to `template_steps` (references standard foundation)
3. Create `get_project_complete_workflow()` view that UNIONS:
   - Standard operations/steps (via foreign keys)
   - Custom operations/steps (where `is_custom = true`)
4. Update `create_project_with_standard_foundation_v2()` to:
   - Create phase records with `standard_phase_id` links (not copies)
   - Create operation/step records with `source_*_id` links
   - Do NOT copy standard content
5. Remove `cascade_standard_phase_updates()` function (no longer needed)

**Breaking Changes**: 
- Existing templates will need migration
- Client code needs to use new view

---

### Phase 3: Remove JSON Duplication (High Risk)
**Estimated Time**: 3-4 hours

1. Drop `projects.phases` JSONB column (or make it computed/generated)
2. Update all queries to use relational tables directly
3. Keep `rebuild_phases_json_from_project_phases()` ONLY for creating project run snapshots
4. Update client-side code to fetch workflow from relational structure
5. Add GraphQL/REST views for efficient querying

**Breaking Changes**:
- ALL client code accessing `projects.phases` must be updated
- May require multiple client-side PRs

---

### Phase 4: UI Updates (Medium Risk)
**Estimated Time**: 4-5 hours

1. Update project template editor to show:
   - Standard phases as "locked" / read-only
   - Custom phases as editable
   - Visual distinction (badges, icons, colors)
2. Add "View Standard Foundation" link for admins
3. Update "Add Custom Phase" workflow
4. Remove phase reordering for standard phases
5. Add tooltips explaining dynamic linking

---

### Phase 5: Testing & Validation (Critical)
**Estimated Time**: 3-4 hours

1. Test standard foundation updates propagate
2. Test new template creation
3. Test project run creation (snapshot generation)
4. Test custom phase addition
5. Performance testing (indexed views)
6. Regression testing on existing projects

---

## Migration Strategy

### Option A: Big Bang (Risky, Faster)
- Implement all phases at once
- Single large migration
- Downtime required
- Faster calendar time

### Option B: Gradual (Safer, Slower)
- Implement Phase 1 first (catalogs)
- Deploy and validate
- Implement Phase 2 (linking) with feature flag
- Migrate templates gradually
- Deploy Phase 3 (remove JSON) last
- Longer calendar time but safer

**Recommendation**: **Option B** - Gradual migration with feature flags

---

## Risk Assessment

### High Risk Items
1. ⚠️ Removing `projects.phases` column (breaks existing code)
2. ⚠️ Changing from copy to reference (different data access patterns)
3. ⚠️ Migrating existing templates (data integrity)

### Mitigation Strategies
1. **Feature Flags**: Gate new architecture behind flags
2. **Dual-Write Period**: Write to both old and new structures temporarily
3. **Rollback Plan**: Keep backup migrations
4. **Gradual Rollout**: Test with subset of projects first
5. **Monitoring**: Track query performance, error rates

---

## Performance Considerations

### Current Performance Issues
- `rebuild_phases_json_from_project_phases()` is expensive (multiple joins)
- Duplicate storage increases database size
- No indexes on JSONB columns

### Improved Performance
- ✅ Indexed foreign keys for fast lookups
- ✅ Materialized views for complex queries
- ✅ No JSON rebuild needed for templates
- ✅ Smaller database (no duplication)
- ✅ Better query planner optimization

**Estimated Performance Gain**: 40-60% faster template queries

---

## Database Size Impact

### Current Duplication
```
Standard Foundation: ~50 operations × ~200 steps = 10,000 step records
100 Templates copying standard: 100 × 10,000 = 1,000,000 duplicate step records
```

### After Dynamic Linking
```
Standard Foundation: 10,000 step records
100 Templates referencing standard: ~100 reference records
Custom content only: ~50,000 custom step records

Total: 60,100 records vs 1,010,000 records
Reduction: 94% fewer records
```

---

## Success Criteria

1. ✅ Standard foundation updates visible immediately in ALL templates
2. ✅ No duplicate storage of standard content
3. ✅ Materials, tools, outputs in relational tables with full query capability
4. ✅ Template creation time < 100ms (vs current ~2-3 seconds)
5. ✅ Project run snapshots remain immutable
6. ✅ UI clearly distinguishes standard vs custom content
7. ✅ Database size reduced by >50%
8. ✅ Zero data loss during migration

---

## Next Steps

1. **Approval**: Review this plan with stakeholders
2. **Phase 1 Implementation**: Start with master catalogs (lowest risk)
3. **Testing**: Validate Phase 1 thoroughly before proceeding
4. **Phase 2+ Planning**: Detailed technical design for dynamic linking
5. **Communication**: Inform users of upcoming changes

---

## Appendix: Technical Debt Cleanup

While implementing, also address:
1. Remove deprecated `addStandardPhasesToProjectRun()` function
2. Clean up unused `standard_phase_updates` table
3. Consolidate migration files (many are redundant)
4. Update documentation
5. Add database comments to all tables/columns

