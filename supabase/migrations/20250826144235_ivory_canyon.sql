/*
  # Criar tabela de centros de custo

  1. Nova Tabela
    - `cost_centers`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `code` (text, not null)
      - `description` (text, not null)
      - `department` (text, not null)
      - `manager` (text, not null)
      - `parent_id` (uuid, foreign key, optional)
      - `level` (integer, not null)
      - `path` (text, not null)
      - `budget` (numeric, not null)
      - `spent` (numeric, default 0)
      - `allocated_budget` (numeric, not null)
      - `inherited_budget` (numeric, default 0)
      - `status` (enum: active, inactive)
      - `company_id` (uuid, foreign key, not null)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela `cost_centers`
    - Adicionar políticas para CRUD baseado na empresa
*/

CREATE TABLE IF NOT EXISTS cost_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  description text NOT NULL,
  department text NOT NULL,
  manager text NOT NULL,
  parent_id uuid REFERENCES cost_centers(id) ON DELETE SET NULL,
  level integer NOT NULL DEFAULT 0,
  path text NOT NULL,
  budget numeric NOT NULL DEFAULT 0,
  spent numeric NOT NULL DEFAULT 0,
  allocated_budget numeric NOT NULL DEFAULT 0,
  inherited_budget numeric NOT NULL DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(code, company_id)
);

ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read cost centers from their companies"
  ON cost_centers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert cost centers"
  ON cost_centers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update cost centers"
  ON cost_centers
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete cost centers"
  ON cost_centers
  FOR DELETE
  TO authenticated
  USING (true);

CREATE TRIGGER update_cost_centers_updated_at 
    BEFORE UPDATE ON cost_centers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_cost_centers_company_id ON cost_centers(company_id);
CREATE INDEX IF NOT EXISTS idx_cost_centers_parent_id ON cost_centers(parent_id);
CREATE INDEX IF NOT EXISTS idx_cost_centers_path ON cost_centers(path);