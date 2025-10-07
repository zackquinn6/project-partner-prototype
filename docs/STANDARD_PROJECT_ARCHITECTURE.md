# Standard Project Template Architecture

## Overview

The Standard Project Template Architecture is a three-layer system that ensures all DIY projects include consistent standard phases (Kickoff, Planning, Ordering, Close Project) while allowing customization with project-specific phases.

## Three-Layer Architecture

### Layer 1: Standard Project Foundation
- **Purpose**: Single source of truth for standard phases
- **Database Record**: Special project with `is_standard_template = true`
- **ID**: `00000000-0000-0000-0000-000000000001`
- **Contains**: 
  - Kickoff Phase: DIY Profile, Project Overview, Project Profile, Service Terms
  - Planning Phase: Initial Planning, Measure & Assess, Final Planning, Project Customizer, Project Scheduler
  - Ordering Phase: Shopping Checklist, Tool & Material Ordering
  - Close Project Phase: Tool & Material Closeout, Celebration
- **Characteristics**:
  - Cannot be deleted or archived
  - Cannot have revisions created
  - All operations linked to `standard_phase_id` in `template_operations` table
  - Editable by admins via "Edit Standard Project" button in Admin Panel

### Layer 2: Project Templates
- **Purpose**: Reusable project templates that combine standard phases with custom phases
- **Creation**: 
  - New projects automatically copy standard phases from Layer 1
  - Uses `create_project_with_standard_foundation()` backend function
  - Custom phases can be added via Project Customizer
- **Standard Phase Positioning**:
  - Kickoff: Always first (`position_rule = 'first'`)
  - Planning: Always second (`position_rule = 'nth'`, `position_value = 2`)
  - Ordering: Second-to-last (`position_rule = 'last_minus_n'`, `position_value = 1`)
  - Close Project: Always last (`position_rule = 'last'`)
- **Revisions**:
  - Can create revisions via `create_project_revision()`
  - Revisions preserve links to standard phases (via `standard_phase_id`)
  - Custom phases are also copied

### Layer 3: Project Runs
- **Purpose**: Immutable snapshots of project templates for user execution
- **Creation**: Uses `create_project_run_snapshot()` backend function
- **Characteristics**:
  - Completely immutable - no structural changes allowed after creation
  - Contains full `phases` JSON snapshot from template at time of creation
  - Users can only mark steps complete, cannot edit workflow
  - Not linked to templates - pure snapshot

## Standard Phases Table

The `standard_phases` table contains the four locked standard phases:

| Name | Position Rule | Position Value | Is Locked | Display Order |
|------|---------------|----------------|-----------|---------------|
| Kickoff | first | NULL | true | 1 |
| Planning | nth | 2 | true | 2 |
| Ordering | last_minus_n | 1 | true | 3 |
| Close Project | last | NULL | true | 4 |

## Key Database Functions

### `get_standard_project_template()`
Returns the Standard Project Foundation with all phases, operations, and steps.

### `create_project_with_standard_foundation()`
Creates a new project template by:
1. Creating project record
2. Copying all standard operations and steps from Standard Project
3. Linking operations to `standard_phase_id`
4. Rebuilding `phases` JSON via `rebuild_phases_json_from_templates()`

### `create_project_run_snapshot()`
Creates an immutable project run by:
1. Fetching template project
2. Creating `project_runs` record with complete `phases` JSON snapshot
3. No links to template - pure immutable copy

### `apply_standard_phase_positioning()`
Merges standard phases with custom phases according to position rules.

## Editing Workflows

### Editing the Standard Project
1. Admin clicks "Edit Standard Project" in Admin Panel
2. System loads Standard Project Foundation
3. Opens EditWorkflowView in standard project mode
4. Shows lock icons (🔒) next to standard phase names
5. Standard phases cannot be deleted or reordered
6. Operations and steps within standard phases can be edited
7. Changes propagate to new projects created after edit

### Editing Project Templates
1. Admin navigates to Project Management
2. Selects a draft project/revision
3. Clicks "Edit Workflow"
4. Can edit custom phases freely
5. Standard phases show lock icons and cannot be deleted/reordered
6. Can edit operations/steps within any phase

### Project Runs Are Immutable
- Users cannot edit workflow structure in project runs
- Only step completion tracking is allowed
- If template changes, existing runs are unaffected (snapshot model)

## Phase Revision Alerts

When standard phases are updated in the Standard Project Foundation:
- System tracks which project templates might need updates
- Admins can review via Action Center
- Decision to update templates is manual (prevents unwanted changes to in-progress work)

## Benefits

1. **Consistency**: All projects have the same kickoff/planning/ordering/close structure
2. **Flexibility**: Custom phases can be inserted between standard phases
3. **Immutability**: Project runs preserve exact workflow at time of creation
4. **Maintainability**: Single source of truth for standard phases
5. **Propagation**: Changes to standard content automatically apply to new projects
6. **Safety**: Existing project runs unaffected by template changes
