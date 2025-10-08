
-- Rename steps in Standard Project Foundation
UPDATE template_steps 
SET step_title = 'Initial Project Plan', updated_at = now()
WHERE id = '79c0aaeb-b88d-4cf3-8045-fc738d1dd4b3';

UPDATE template_steps 
SET step_title = 'Take Measurements and Assess Conditions', updated_at = now()
WHERE id = '660c2353-445c-4460-8ddc-4d78a22aa42e';

UPDATE template_steps 
SET step_title = 'Finalize Project Plan', updated_at = now()
WHERE id = '4ba6c0f0-087c-47e6-8ce9-470d97baf888';

UPDATE template_steps 
SET step_title = 'Order Tools and Materials', updated_at = now()
WHERE id = 'cafa559d-f765-40e0-a341-469afcc358ca';

-- Remove Project Customizer operation
-- First delete all steps associated with this operation
DELETE FROM template_steps 
WHERE operation_id = 'f53c1f35-30fa-4ff9-b15b-85f4d368194b';

-- Then delete the operation itself
DELETE FROM template_operations 
WHERE id = 'f53c1f35-30fa-4ff9-b15b-85f4d368194b';
