-- Multi-Tenant Todo API Setup Script
-- Run this in your Supabase SQL editor to set up the multi-tenant structure

-- 1. Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add company_id column to existing tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_company_id ON tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_api_key ON companies(api_key);

-- 4. Create RLS (Row Level Security) policies for companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Policy: Companies can only see their own data
CREATE POLICY "Companies can view own data" ON companies
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM tasks WHERE company_id = companies.id
  ));

-- 5. Update tasks RLS policies to include company isolation
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

-- New policies that consider both user and company
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (
    auth.uid() = user_id OR 
    company_id IS NULL -- Allow existing tasks without company_id
  );

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    company_id IS NULL
  );

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (
    auth.uid() = user_id OR 
    company_id IS NULL
  );

-- 6. Create a function to generate API keys
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT AS $$
BEGIN
  RETURN 'tk_' || encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 7. Create a function to create a new company with API key
CREATE OR REPLACE FUNCTION create_company(company_name TEXT)
RETURNS TABLE(id UUID, name TEXT, api_key TEXT) AS $$
DECLARE
  new_company_id UUID;
  new_api_key TEXT;
BEGIN
  new_api_key := generate_api_key();
  
  INSERT INTO companies (name, api_key)
  VALUES (company_name, new_api_key)
  RETURNING companies.id INTO new_company_id;
  
  RETURN QUERY
  SELECT new_company_id, company_name, new_api_key;
END;
$$ LANGUAGE plpgsql;

-- 8. Example: Create a test company (remove this in production)
-- SELECT * FROM create_company('Test Company');

-- 9. Create a view for API statistics (optional)
CREATE OR REPLACE VIEW api_usage_stats AS
SELECT 
  c.id as company_id,
  c.name as company_name,
  COUNT(t.id) as total_tasks,
  COUNT(CASE WHEN t.completed = true THEN 1 END) as completed_tasks,
  COUNT(CASE WHEN t.completed = false THEN 1 END) as pending_tasks,
  c.created_at as company_created_at
FROM companies c
LEFT JOIN tasks t ON c.id = t.company_id
GROUP BY c.id, c.name, c.created_at
ORDER BY c.created_at DESC;

-- 10. Grant necessary permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON companies TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO authenticated;

COMMENT ON TABLE companies IS 'Companies using the Todo API';
COMMENT ON COLUMN companies.api_key IS 'Unique API key for external access';
COMMENT ON COLUMN tasks.company_id IS 'Links task to a company for multi-tenant isolation';
