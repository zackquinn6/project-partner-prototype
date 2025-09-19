-- Force complete reset with proper order
-- First disable any triggers/constraints temporarily
SET session_replication_role = replica;

-- Delete everything in proper order
DELETE FROM pricing_data;
DELETE FROM tool_models; 
DELETE FROM variation_warning_flags;
DELETE FROM variation_instances WHERE item_type = 'tools';
DELETE FROM tools;

-- Re-enable triggers
SET session_replication_role = DEFAULT;