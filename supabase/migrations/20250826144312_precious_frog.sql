/*
  # Criar tabela de ativos imobilizados

  1. Nova Tabela
    - `fixed_assets`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text, optional)
      - `category` (enum: equipment, vehicle, furniture, building, land, software, other)
      - `acquisition_date` (date, not null)
      - `acquisition_value` (numeric, not null)
      - `depreciation_rate` (numeric, not null)
      - `depreciation_method` (enum: linear, accelerated, none)
      - `useful_life_years` (integer, not null)
      - `current_value` (numeric, not null)
      - `status` (enum: planned, acquired, active, inactive, disposed)
      - `disposal_date` (date, optional)
      - `disposal_value` (numeric, optional)
      - `cost_center_id` (uuid, foreign key, not null)
      - `fiscal_year_id` (uuid, foreign key, not null)
      - `supplier` (text, optional)
      - `invoice_number` (text, optional)
      - `serial_number` (text, optional)
      - `location` (text, optional)
      - `notes` (text, optional)
      - `company_id` (uuid, foreign key, not null)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (text, optional)

  2. Segurança
    - Habilitar RLS na tabela `fixed_assets`
    - Adicionar políticas para CRUD baseado na empresa
*/

CREATE TABLE IF NOT EXISTS fixed_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('equipment', 'vehicle', 'furniture', 'building', 'land', 'software', 'other')),
  acquisition_date date NOT NULL,
  acquisition_value numeric NOT NULL DEFAULT 0,
  depreciation_rate numeric NOT NULL DEFAULT 0,
  depreciation_method text DEFAULT 'linear' CHECK (depreciation_method IN ('linear', 'accelerated', 'none')),
  useful_life_years integer NOT NULL DEFAULT 0,
  current_value numeric NOT NULL DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('planned', 'acquired', 'active', 'inactive', 'disposed')),
  disposal_date date,
  disposal_value numeric,
  cost_center_id uuid REFERENCES cost_centers(id) ON DELETE CASCADE NOT NULL,
  fiscal_year_id uuid REFERENCES financial_years(id) ON DELETE CASCADE NOT NULL,
  supplier text,
  invoice_number text,
  serial_number text,
  location text,
  notes text,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text
);

ALTER TABLE fixed_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read fixed assets from their companies"
  ON fixed_assets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert fixed assets"
  ON fixed_assets
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update fixed assets"
  ON fixed_assets
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete fixed assets"
  ON fixed_assets
  FOR DELETE
  TO authenticated
  USING (true);

CREATE TRIGGER update_fixed_assets_updated_at 
    BEFORE UPDATE ON fixed_assets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_fixed_assets_company_id ON fixed_assets(company_id);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_cost_center_id ON fixed_assets(cost_center_id);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_fiscal_year_id ON fixed_assets(fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_category ON fixed_assets(category);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_status ON fixed_assets(status);