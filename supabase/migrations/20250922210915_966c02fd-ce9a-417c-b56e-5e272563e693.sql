-- Clean up existing project names by removing revision text
UPDATE projects 
SET name = REGEXP_REPLACE(name, ' \(Rev \d+\)$', '', 'g')
WHERE name ~ ' \(Rev \d+\)$';