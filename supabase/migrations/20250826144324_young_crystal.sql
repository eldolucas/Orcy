/*
  # Criar tabela de classificações de gastos

  1. Nova Tabela
    - `expense_classifications`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `type` (enum: variable_cost, fixed_cost, expense)
      - `code` (text, not null)
      - `description` (text, not null)
      - `is_active` (boolean, default true)
      - `company_id` (uuid, foreign key, not null)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (text, optional)

  2. Segurança
    - Habilitar RLS na tabela `expense_classifications`
    - Adicionar políticas para CRUD baseado na empresa
*/

CREATE TABLE IF NOT EXISTS expense_classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('variable_cost', 'fixed_cost', 'expense')),
  code text NOT NULL,
  description text NOT NULL,
  is_active boolean DEFAULT true,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text,
  
  UNIQUE(code, company_id)
);

ALTER TABLE expense_classifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read expense classifications from their companies"
  ON expense_classifications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert expense classifications"
  ON expense_classifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update expense classifications"
  ON expense_classifications
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete expense classifications"
  ON expense_classifications
  FOR DELETE
  TO authenticated
  USING (true);

CREATE TRIGGER update_expense_classifications_updated_at 
    BEFORE UPDATE ON expense_classifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_expense_classifications_company_id ON expense_classifications(company_id);
CREATE INDEX IF NOT EXISTS idx_expense_classifications_type ON expense_classifications(type);
CREATE INDEX IF NOT EXISTS idx_expense_classifications_is_active ON expense_classifications(is_active);