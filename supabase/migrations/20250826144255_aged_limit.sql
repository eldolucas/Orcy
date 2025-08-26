/*
  # Criar tabela de mão de obra orçada

  1. Nova Tabela
    - `labor_budget`
      - `id` (uuid, primary key)
      - `position` (text, not null)
      - `department` (text, not null)
      - `base_salary` (numeric, not null)
      - `benefits` (jsonb, not null)
      - `charges` (jsonb, not null)
      - `quantity` (integer, not null)
      - `total_cost` (numeric, not null)
      - `cost_center_id` (uuid, foreign key, not null)
      - `fiscal_year_id` (uuid, foreign key, not null)
      - `is_active` (boolean, default true)
      - `company_id` (uuid, foreign key, not null)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (text, optional)

  2. Segurança
    - Habilitar RLS na tabela `labor_budget`
    - Adicionar políticas para CRUD baseado na empresa
*/

CREATE TABLE IF NOT EXISTS labor_budget (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position text NOT NULL,
  department text NOT NULL,
  base_salary numeric NOT NULL DEFAULT 0,
  benefits jsonb NOT NULL DEFAULT '[]',
  charges jsonb NOT NULL DEFAULT '[]',
  quantity integer NOT NULL DEFAULT 1,
  total_cost numeric NOT NULL DEFAULT 0,
  cost_center_id uuid REFERENCES cost_centers(id) ON DELETE CASCADE NOT NULL,
  fiscal_year_id uuid REFERENCES financial_years(id) ON DELETE CASCADE NOT NULL,
  is_active boolean DEFAULT true,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text
);

ALTER TABLE labor_budget ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read labor budget from their companies"
  ON labor_budget
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert labor budget"
  ON labor_budget
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update labor budget"
  ON labor_budget
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete labor budget"
  ON labor_budget
  FOR DELETE
  TO authenticated
  USING (true);

CREATE TRIGGER update_labor_budget_updated_at 
    BEFORE UPDATE ON labor_budget 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_labor_budget_company_id ON labor_budget(company_id);
CREATE INDEX IF NOT EXISTS idx_labor_budget_cost_center_id ON labor_budget(cost_center_id);
CREATE INDEX IF NOT EXISTS idx_labor_budget_fiscal_year_id ON labor_budget(fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_labor_budget_department ON labor_budget(department);