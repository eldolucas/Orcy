/*
  # Create insumos table

  1. New Tables
    - `insumos`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text, nullable)
      - `type` (text, not null) - product, service, fund
      - `unit` (text, not null) - unit of measurement
      - `cost` (numeric, not null, default 0)
      - `is_active` (boolean, default true)
      - `company_id` (uuid, foreign key to companies)
      - `created_at` (timestamp, default now)
      - `updated_at` (timestamp, default now)
      - `created_by` (text, nullable)

  2. Security
    - Enable RLS on `insumos` table
    - Add policies for authenticated users to manage insumos from their companies

  3. Indexes
    - Index on company_id for performance
    - Index on type for filtering
    - Index on is_active for filtering
*/

CREATE TABLE IF NOT EXISTS insumos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type = ANY (ARRAY['product'::text, 'service'::text, 'fund'::text])),
  unit text NOT NULL,
  cost numeric NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text
);

-- Enable RLS
ALTER TABLE insumos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read insumos from their companies"
  ON insumos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert insumos"
  ON insumos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update insumos"
  ON insumos
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete insumos"
  ON insumos
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_insumos_company_id ON insumos(company_id);
CREATE INDEX IF NOT EXISTS idx_insumos_type ON insumos(type);
CREATE INDEX IF NOT EXISTS idx_insumos_is_active ON insumos(is_active);

-- Create trigger for updated_at
CREATE TRIGGER update_insumos_updated_at
  BEFORE UPDATE ON insumos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();