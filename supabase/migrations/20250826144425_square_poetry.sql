/*
  # Criar tabela de classificações contábeis

  1. Nova Tabela
    - `accounting_classifications`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `code` (text, not null)
      - `type` (enum: revenue, expense, asset, liability, equity)
      - `description` (text, not null)
      - `is_active` (boolean, default true)
      - `company_id` (uuid, foreign key, not null)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (text, optional)

  2. Segurança
    - Habilitar RLS na tabela `accounting_classifications`
    - Adicionar políticas para CRUD baseado na empresa
*/

CREATE TABLE IF NOT EXISTS accounting_classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  type text NOT NULL CHECK (type IN ('revenue', 'expense', 'asset', 'liability', 'equity')),
  description text NOT NULL,
  is_active boolean DEFAULT true,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text,
  
  UNIQUE(code, company_id)
);

ALTER TABLE accounting_classifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read accounting classifications from their companies"
  ON accounting_classifications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert accounting classifications"
  ON accounting_classifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update accounting classifications"
  ON accounting_classifications
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete accounting classifications"
  ON accounting_classifications
  FOR DELETE
  TO authenticated
  USING (true);

CREATE TRIGGER update_accounting_classifications_updated_at 
    BEFORE UPDATE ON accounting_classifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_accounting_classifications_company_id ON accounting_classifications(company_id);
CREATE INDEX IF NOT EXISTS idx_accounting_classifications_type ON accounting_classifications(type);
CREATE INDEX IF NOT EXISTS idx_accounting_classifications_is_active ON accounting_classifications(is_active);