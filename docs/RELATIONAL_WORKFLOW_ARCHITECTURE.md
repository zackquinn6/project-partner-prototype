# Relational Workflow Architecture

## Overview

This document describes the fully relational database architecture for Project Partner's workflow system, implementing the design intent of storing workflow structure, materials, tools, and outputs in relational tables while keeping complex content in JSON.

---

## Architecture Layers

### Layer 1: Master Catalogs (Shared Resources)

These tables contain reusable, standardized resources across all projects.

#### `step_types`
**Purpose**: Categorize workflow steps for filtering and UI presentation

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Unique type name (measurement, installation, etc.) |
| `description` | TEXT | Explanation of step type |
| `icon` | TEXT | Lucide icon name for UI |
| `color` | TEXT | Hex color for visual distinction |
| `display_order` | INTEGER | Sort order |

**Predefined Types**:
- measurement
- preparation
- installation
- inspection
- finishing
- documentation
- decision
- calculation

---

#### `materials`
**Purpose**: Master catalog of all materials used across projects

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Material name |
| `description` | TEXT | Detailed description |
| `category` | TEXT | lumber, fasteners, paint, electrical, etc. |
| `unit` | TEXT | each, linear feet, square feet, gallon, box, pound |
| `avg_cost_per_unit` | DECIMAL(10,2) | Average cost for budgeting |
| `is_rental_available` | BOOLEAN | Can this be rented? |
| `supplier_link` | TEXT | Product page URL |
| `notes` | TEXT | Additional information |

**Benefits**:
- Standardized naming across projects
- Centralized cost tracking
- Easy querying ("Which projects need lumber?")
- Aggregate cost analysis

---

#### `tools`
**Purpose**: Master catalog of all tools

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Tool name (unique) |
| `description` | TEXT | Tool description |
| `category` | TEXT | power, hand, measuring, safety |
| `is_rental_available` | BOOLEAN | Available for rent? |
| `avg_rental_cost_per_day` | DECIMAL(10,2) | Daily rental cost |
| `purchase_cost_estimate` | DECIMAL(10,2) | Purchase price estimate |
| `rental_supplier_link` | TEXT | Rental source URL |
| `purchase_supplier_link` | TEXT | Purchase source URL |
| `safety_notes` | TEXT | Safety considerations |

**Benefits**:
- Track tool requirements across projects
- Rental vs purchase analysis
- Safety information centralized
- User tool library matching

---

#### `outputs`
**Purpose**: Master catalog of step outputs (deliverables)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Output name (unique) |
| `description` | TEXT | What this output represents |
| `type` | ENUM | none, measurement, decision, document, photo, inspection, material_list, tool_list, calculation, approval, schedule |
| `is_required` | BOOLEAN | Must this output be completed? |
| `validation_rules` | JSONB | JSON schema for validation |

**Output Types**:
- `none`: No specific output
- `measurement`: Numerical measurements
- `decision`: User choice/selection
- `document`: Document creation
- `photo`: Photo upload
- `inspection`: Quality check result
- `material_list`: List of materials
- `tool_list`: List of tools
- `calculation`: Calculated values
- `approval`: Approval/sign-off
- `schedule`: Timeline/schedule

---

#### `process_variables`
**Purpose**: Dynamic variables used in calculations and decisions

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Variable name (unique, snake_case) |
| `display_name` | TEXT | Human-readable name |
| `description` | TEXT | What this variable represents |
| `variable_type` | ENUM | number, text, boolean, date, measurement, list |
| `unit` | TEXT | For measurements (ft, sqft, etc.) |
| `default_value` | TEXT | Default if not provided |
| `validation_rules` | JSONB | Min/max, regex, etc. |
| `used_in_calculations` | BOOLEAN | Used in formulas? |

**Example Variables**:
- `room_length` (measurement, ft)
- `room_width` (measurement, ft)
- `room_area` (measurement, sqft) - calculated
- `paint_color` (text)
- `number_of_outlets` (number)

---

### Layer 2: Workflow Structure (Relational)

#### Hierarchy

```
standard_phases
  ↓ (reference)
project_phases (per project)
  ↓ (one-to-many)
template_operations
  ↓ (one-to-many)
template_steps
  ↓ (many-to-many via junction tables)
step_materials, step_tools, step_outputs, step_variables
  ↓ (foreign keys)
materials, tools, outputs, process_variables (catalogs)
```

---

#### Junction Tables

##### `step_materials`
Links steps to required materials with quantities

| Column | Type | Description |
|--------|------|-------------|
| `step_id` | UUID | Foreign key to template_steps |
| `material_id` | UUID | Foreign key to materials |
| `quantity` | DECIMAL(10,2) | Fixed quantity |
| `quantity_formula` | TEXT | Dynamic formula (e.g., "room_area * 1.1") |
| `is_optional` | BOOLEAN | Optional material? |
| `notes` | TEXT | Special instructions |

**Example**:
```sql
-- Step requires paint based on room area + 10% overage
INSERT INTO step_materials (step_id, material_id, quantity_formula, notes)
VALUES (
  'paint-step-id',
  'paint-material-id',
  'room_area * 1.1',  -- Formula
  'Add 10% for overage'
);
```

---

##### `step_tools`
Links steps to required tools

| Column | Type | Description |
|--------|------|-------------|
| `step_id` | UUID | Foreign key to template_steps |
| `tool_id` | UUID | Foreign key to tools |
| `is_optional` | BOOLEAN | Optional tool? |
| `notes` | TEXT | Usage notes |

---

##### `step_outputs`
Links steps to expected outputs

| Column | Type | Description |
|--------|------|-------------|
| `step_id` | UUID | Foreign key to template_steps |
| `output_id` | UUID | Foreign key to outputs |
| `is_required` | BOOLEAN | Must be completed? |
| `notes` | TEXT | Completion notes |

---

##### `step_variables`
Links steps to process variables they collect or use

| Column | Type | Description |
|--------|------|-------------|
| `step_id` | UUID | Foreign key to template_steps |
| `variable_id` | UUID | Foreign key to process_variables |
| `is_input` | BOOLEAN | true = step collects value, false = step uses value |
| `is_required` | BOOLEAN | Must be provided? |

**Example**:
```sql
-- Measurement step COLLECTS room dimensions
INSERT INTO step_variables (step_id, variable_id, is_input, is_required)
VALUES 
  ('measurement-step-id', 'room_length-var-id', true, true),
  ('measurement-step-id', 'room_width-var-id', true, true);

-- Calculation step USES dimensions and OUTPUTS area
INSERT INTO step_variables (step_id, variable_id, is_input, is_required)
VALUES 
  ('calculation-step-id', 'room_length-var-id', false, true),  -- Uses
  ('calculation-step-id', 'room_width-var-id', false, true),   -- Uses
  ('calculation-step-id', 'room_area-var-id', true, true);     -- Outputs
```

---

### Layer 3: Content Storage (JSON)

#### `template_steps.content_sections`
**Purpose**: Store rich content (text, images, videos) that changes frequently

```json
{
  "content_sections": [
    {
      "type": "text",
      "content": "Measure the length and width of the room..."
    },
    {
      "type": "image",
      "url": "https://...",
      "caption": "Proper measuring technique"
    },
    {
      "type": "video",
      "url": "https://...",
      "duration": 120
    }
  ]
}
```

**Why JSON?**
- Complex, nested structures
- Flexible content types
- Fast retrieval
- Easy to evolve schema

---

### Layer 4: Project Runs (Immutable Snapshots)

#### `project_runs.phases` (JSONB)
**Purpose**: Store complete workflow snapshot at project creation time

**Why JSONB for Runs?**
- ✅ Immutability: Once created, structure never changes
- ✅ Performance: Single query to load entire workflow
- ✅ Consistency: User sees exactly what they started with
- ✅ No dependency issues: Works even if template is deleted/modified

---

## Querying Patterns

### Get All Materials for a Step

```sql
SELECT 
  m.name,
  m.category,
  sm.quantity,
  sm.quantity_formula,
  m.avg_cost_per_unit,
  (sm.quantity * m.avg_cost_per_unit) as estimated_cost
FROM step_materials sm
JOIN materials m ON sm.material_id = m.id
WHERE sm.step_id = 'step-uuid';
```

### Find All Projects Using a Specific Tool

```sql
SELECT DISTINCT p.name as project_name
FROM projects p
JOIN project_phases pp ON pp.project_id = p.id
JOIN template_operations op ON op.phase_id = pp.id
JOIN template_steps s ON s.operation_id = op.id
JOIN step_tools st ON st.step_id = s.id
JOIN tools t ON st.tool_id = t.id
WHERE t.name = 'Power Drill';
```

### Calculate Total Material Cost for Project

```sql
SELECT 
  p.name as project_name,
  SUM(sm.quantity * m.avg_cost_per_unit) as total_material_cost
FROM projects p
JOIN project_phases pp ON pp.project_id = p.id
JOIN template_operations op ON op.phase_id = pp.id
JOIN template_steps s ON s.operation_id = op.id
JOIN step_materials sm ON sm.step_id = s.id
JOIN materials m ON sm.material_id = m.id
WHERE p.id = 'project-uuid'
GROUP BY p.id, p.name;
```

### Get Steps by Type

```sql
SELECT 
  s.step_title,
  st.name as step_type,
  st.icon,
  st.color
FROM template_steps s
JOIN step_types st ON s.step_type_id = st.id
WHERE st.name = 'measurement'
ORDER BY s.step_number;
```

---

## Helper Views

### `step_materials_detail`
Complete material information with cost calculations

```sql
SELECT * FROM step_materials_detail WHERE step_id = 'step-uuid';
```

Returns:
- Material name, description, category
- Quantity, quantity formula
- Unit cost, estimated total cost
- Optional flag, notes

### `step_tools_detail`
Complete tool information

```sql
SELECT * FROM step_tools_detail WHERE step_id = 'step-uuid';
```

Returns:
- Tool name, description, category
- Rental availability, costs
- Optional flag, notes

### `step_outputs_detail`
Complete output information

```sql
SELECT * FROM step_outputs_detail WHERE step_id = 'step-uuid';
```

Returns:
- Output name, description, type
- Required flag, validation rules
- Notes

---

## Migration Strategy

### Phase 1: ✅ COMPLETED
- Created master catalogs
- Created junction tables
- Migrated data from JSONB
- JSONB columns preserved for backwards compatibility

### Phase 2: IN PROGRESS
- Implement dynamic linking for standard foundation
- Remove copy operations
- Update client code to use relational queries

### Phase 3: PLANNED
- Remove JSONB columns from `template_steps` (materials, tools, outputs)
- Update all client code
- Performance optimization

---

## Performance Considerations

### Indexes Created
- `materials(category)`, `materials(name)`
- `tools(category)`, `tools(name)`, `tools(is_rental_available)`
- `outputs(type)`, `outputs(name)`
- `process_variables(name)`, `process_variables(variable_type)`
- `step_materials(step_id)`, `step_materials(material_id)`
- `step_tools(step_id)`, `step_tools(tool_id)`
- `step_outputs(step_id)`, `step_outputs(output_id)`
- `step_variables(step_id)`, `step_variables(variable_id)`
- `template_steps(step_type_id)`

### Query Optimization
- Use helper views for common queries
- Batch inserts during migration
- Prepared statements in application code
- Connection pooling

---

## Data Integrity

### Constraints
- Unique constraints on master catalogs prevent duplicates
- Foreign keys ensure referential integrity
- Check constraints on enums validate data
- NOT NULL constraints on critical fields

### Cascading Deletes
- Deleting a step → deletes junction table entries
- Deleting a material/tool/output → protected (foreign key error)
- Admin must reassign before deletion

---

## Security (RLS Policies)

### Read Access
- ✅ All authenticated users can view master catalogs
- ✅ All authenticated users can view junction tables

### Write Access
- ❌ Only admins can modify master catalogs
- ❌ Only admins can modify junction tables
- ✅ Users manage only their project runs

---

## Benefits of Relational Architecture

### 1. Data Normalization
- No duplicate material/tool definitions
- Single source of truth for costs
- Consistent naming conventions

### 2. Advanced Querying
- "Which projects need a specific tool?"
- "What's the total cost of all projects?"
- "Which materials are used most frequently?"

### 3. Reporting & Analytics
- Cost analysis across projects
- Tool inventory management
- Material usage trends

### 4. Scalability
- Efficient indexes for fast lookups
- Reduced storage (no duplication)
- Better query planner optimization

### 5. Maintainability
- Update material cost in ONE place
- Changes propagate automatically
- Clear data relationships

---

## Client-Side Integration

### TypeScript Interfaces (Updated)

```typescript
// Master Catalogs
interface Material {
  id: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  avgCostPerUnit?: number;
  isRentalAvailable: boolean;
  supplierLink?: string;
  notes?: string;
}

interface Tool {
  id: string;
  name: string;
  description?: string;
  category: string;
  isRentalAvailable: boolean;
  avgRentalCostPerDay?: number;
  purchaseCostEstimate?: number;
  rentalSupplierLink?: string;
  purchaseSupplierLink?: string;
  safetyNotes?: string;
}

interface Output {
  id: string;
  name: string;
  description?: string;
  type: 'none' | 'measurement' | 'decision' | 'document' | 'photo' | 'inspection' | 'material_list' | 'tool_list' | 'calculation' | 'approval' | 'schedule';
  isRequired: boolean;
  validationRules?: any;
}

interface ProcessVariable {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  variableType: 'number' | 'text' | 'boolean' | 'date' | 'measurement' | 'list';
  unit?: string;
  defaultValue?: string;
  validationRules?: any;
  usedInCalculations: boolean;
}

// Junction Table Data
interface StepMaterial {
  stepId: string;
  material: Material;
  quantity?: number;
  quantityFormula?: string;
  isOptional: boolean;
  notes?: string;
  estimatedCost?: number;
}

interface StepTool {
  stepId: string;
  tool: Tool;
  isOptional: boolean;
  notes?: string;
}

interface StepOutput {
  stepId: string;
  output: Output;
  isRequired: boolean;
  notes?: string;
}

interface StepVariable {
  stepId: string;
  variable: ProcessVariable;
  isInput: boolean;
  isRequired: boolean;
}
```

### Example Queries

```typescript
// Get step with all related data
const getStepComplete = async (stepId: string) => {
  const { data, error } = await supabase
    .from('template_steps')
    .select(`
      *,
      step_type:step_types(*),
      materials:step_materials_detail(*),
      tools:step_tools_detail(*),
      outputs:step_outputs_detail(*),
      variables:step_variables(*, variable:process_variables(*))
    `)
    .eq('id', stepId)
    .single();
    
  return data;
};

// Get all materials for a project
const getProjectMaterials = async (projectId: string) => {
  const { data } = await supabase
    .rpc('get_project_materials_with_costs', { p_project_id: projectId });
    
  return data;
};
```

---

## Future Enhancements

1. **Material Substitutions**: Link alternative materials
2. **Supplier Integration**: Real-time pricing from suppliers
3. **Tool Library**: User's personal tool inventory
4. **Cost Tracking**: Actual vs estimated costs
5. **Material Waste Tracking**: Capture unused materials
6. **Recipe-style Steps**: Reusable step templates

---

## Summary

This relational architecture provides:
- ✅ True normalization of workflow data
- ✅ Powerful querying capabilities
- ✅ Scalability and performance
- ✅ Data integrity and consistency
- ✅ Backwards compatibility during migration
- ✅ Foundation for advanced features

The system balances the benefits of relational storage (for structured, queryable data) with JSON storage (for flexible, complex content), aligning perfectly with the original design intent.

