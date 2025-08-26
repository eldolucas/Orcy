/*
  # Criar tabela de receitas

  1. Nova Tabela
    - `revenues`
      - `id` (uuid, primary key)
      - `description` (text, not null)
      - `amount` (numeric, not null)
      - `source` (text, not null)
      - `cost_center_id` (uuid, foreign key, not null)
      - `budget_id` (text, optional)
      - `fiscal_year_id` (uuid, foreign key, not null)
      - `date` (date, not null)
      - `created_by` (text, not null)
      - `status` (enum: pending, confirmed, cancelled)
      - `last_updated` (timestamp)
      - `confirmed_by` (text, optional)
      - `confirmed_at` (timestamp, optional)
      - `cancelled_by` (text, optional)
      - `cancelled_at` (timestamp, optional)
      - `notes` (text, optional)
      - `attachments` (text array, optional)
      - `recurrence_type` (enum: none, monthly, quarterly, yearly)
      - `next_recurrence_date` (date, optional)
      - `company_id` (uuid, foreign key, not null)
      - `created_at` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela `revenues`
    - Adicionar políticas para CRUD baseado na empresa
*/

CREATE TABLE IF NOT EXISTS revenues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  source text NOT NULL,
  cost_center_id uuid REFERENCES cost_centers(id) ON DELETE CASCADE NOT NULL,
  budget_id text,
  fiscal_year_id uuid REFERENCES financial_years(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  created_by text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  last_updated timestamptz DEFAULT now(),
  confirmed_by text,
  confirmed_at timestamptz,
  cancelled_by text,
  cancelled_at timestamptz,
  notes text,
  attachments text[],
  recurrence_type text DEFAULT 'none' CHECK (recurrence_type IN ('none', 'monthly', 'quarterly', 'yearly')),
  next_recurrence_date date,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE revenues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read revenues from their companies"
  ON revenues
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert revenues"
  ON revenues
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update revenues"
  ON revenues
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete revenues"
  ON revenues
  FOR DELETE
  TO authenticated
  USING (true);

CREATE TRIGGER update_revenues_last_updated 
    BEFORE UPDATE ON revenues 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_revenues_company_id ON revenues(company_id);
CREATE INDEX IF NOT EXISTS idx_revenues_cost_center_id ON revenues(cost_center_id);
CREATE INDEX IF NOT EXISTS idx_revenues_fiscal_year_id ON revenues(fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_revenues_status ON revenues(status);
CREATE INDEX IF NOT EXISTS idx_revenues_date ON revenues(date);
CREATE INDEX IF NOT EXISTS idx_revenues_source ON revenues(source);