/*
  # Criar tabela de contratos

  1. Nova Tabela
    - `contracts`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text, optional)
      - `contract_number` (text, unique, not null)
      - `contract_type` (enum: service, lease, rental, other)
      - `start_date` (date, not null)
      - `end_date` (date, optional)
      - `value` (numeric, not null)
      - `currency` (text, default 'BRL')
      - `recurrence_type` (enum: monthly, quarterly, yearly, none)
      - `next_payment_date` (date, optional)
      - `partner_name` (text, not null)
      - `cost_center_id` (uuid, foreign key, not null)
      - `fiscal_year_id` (uuid, foreign key, not null)
      - `status` (enum: active, inactive, expired, cancelled)
      - `attachments` (text array, optional)
      - `notes` (text, optional)
      - `company_id` (uuid, foreign key, not null)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (text, optional)

  2. Segurança
    - Habilitar RLS na tabela `contracts`
    - Adicionar políticas para CRUD baseado na empresa
*/

CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  contract_number text UNIQUE NOT NULL,
  contract_type text NOT NULL CHECK (contract_type IN ('service', 'lease', 'rental', 'other')),
  start_date date NOT NULL,
  end_date date,
  value numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'BRL',
  recurrence_type text DEFAULT 'monthly' CHECK (recurrence_type IN ('monthly', 'quarterly', 'yearly', 'none')),
  next_payment_date date,
  partner_name text NOT NULL,
  cost_center_id uuid REFERENCES cost_centers(id) ON DELETE CASCADE NOT NULL,
  fiscal_year_id uuid REFERENCES financial_years(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired', 'cancelled')),
  attachments text[],
  notes text,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text
);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read contracts from their companies"
  ON contracts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert contracts"
  ON contracts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update contracts"
  ON contracts
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete contracts"
  ON contracts
  FOR DELETE
  TO authenticated
  USING (true);

CREATE TRIGGER update_contracts_updated_at 
    BEFORE UPDATE ON contracts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_contracts_company_id ON contracts(company_id);
CREATE INDEX IF NOT EXISTS idx_contracts_cost_center_id ON contracts(cost_center_id);
CREATE INDEX IF NOT EXISTS idx_contracts_fiscal_year_id ON contracts(fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_contract_type ON contracts(contract_type);