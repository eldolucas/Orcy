/*
  # Create demo users and profiles

  1. Demo Users
    - Create demo users with email/password authentication
    - Create corresponding profiles with roles and company associations

  2. Security
    - Users are created in auth.users table
    - Profiles are automatically created via trigger
    - Update profiles with demo data
*/

-- Note: In a real production environment, users would sign up through the application
-- This migration creates demo users for testing purposes

-- Insert demo profiles (assuming users will be created manually or through signup)
-- The profiles will be linked when users sign up with these emails

-- Demo data for profiles (will be linked when users sign up)
-- You'll need to create these users manually in Supabase Auth or through the signup process

-- Example of how to update a profile after user signup:
-- UPDATE profiles SET 
--   name = 'João Silva',
--   role = 'admin',
--   department = 'TI',
--   company_id = '550e8400-e29b-41d4-a716-446655440001',
--   companies = ARRAY['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002']
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@empresa.com');

-- For now, we'll create a function to help with demo setup
CREATE OR REPLACE FUNCTION setup_demo_profile(
  user_email text,
  user_name text,
  user_role text,
  user_department text,
  user_company_id uuid DEFAULT NULL,
  user_companies text[] DEFAULT '{}'
)
RETURNS void AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Get user ID from email
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NOT NULL THEN
    -- Update or insert profile
    INSERT INTO profiles (id, name, role, department, company_id, companies)
    VALUES (user_id, user_name, user_role, user_department, user_company_id, user_companies)
    ON CONFLICT (id) 
    DO UPDATE SET
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      department = EXCLUDED.department,
      company_id = EXCLUDED.company_id,
      companies = EXCLUDED.companies,
      updated_at = now();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;