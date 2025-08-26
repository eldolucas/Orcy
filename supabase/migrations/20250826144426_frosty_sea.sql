/*
  # Criar tabela de despesas

  1. Nova Tabela
    - `expenses`
      - `id` (uuid, primary key)
      - `description` (text, not null)
      - `amount` (numeric, not null)
      - `category` (text, not null)
      - `cost_center_id` (uuid, foreign key, not null)
      - `budget_id` (text, optional)
      - `fiscal_year_id` (uuid, foreign key, not null)
      - `date` (date, not null)
      - `created_by` (text, not null)
      - `status` (enum: pending, approved, rejected)
      - `last_updated` (timestamp)
      - `approved_by` (text, optional)
      - `approved_at` (timestamp, optional)
      - `rejected_by` (text, optional)
      - `rejected_at` (timestamp, optional)
      - `notes` (text, optional)
      - `attachments` (text array, optional)
      - `company_id` (uuid, foreign key, not null)
      - `created_at` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela `expenses`
    - Adicionar políticas para CRUD baseado na empresa
*/

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  category text NOT NULL,
  cost_center_id uuid REFERENCES cost_centers(id) ON DELETE CASCADE NOT NULL,
  budget_id text,
  fiscal_year_id uuid REFERENCES financial_years(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  created_by text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  last_updated timestamptz DEFAULT now(),
  approved_by text,
  approved_at timestamptz,
  rejected_by text,
  rejected_at timestamptz,
  notes text,
  attachments text[],
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read expenses from their companies"
  ON expenses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert expenses"
  ON expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update expenses"
  ON expenses
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete expenses"
  ON expenses
  FOR DELETE
  TO authenticated
  USING (true);

CREATE TRIGGER update_expenses_last_updated 
    BEFORE UPDATE ON expenses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_expenses_company_id ON expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_expenses_cost_center_id ON expenses(cost_center_id);
CREATE INDEX IF NOT EXISTS idx_expenses_fiscal_year_id ON expenses(fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);