/*
  # Criar tabela de exercícios financeiros

  1. Nova Tabela
    - `financial_years`
      - `id` (uuid, primary key)
      - `year` (integer, not null)
      - `name` (text, not null)
      - `start_date` (date, not null)
      - `end_date` (date, not null)
      - `status` (enum: planning, active, closed, archived)
      - `description` (text, optional)
      - `is_default` (boolean, default false)
      - `created_by` (text, not null)
      - `created_at` (timestamp)
      - `closed_at` (timestamp, optional)
      - `budget_version` (integer, default 1)
      - `total_budget` (numeric, optional)
      - `total_spent` (numeric, optional)
      - `company_id` (uuid, foreign key, not null)

  2. Segurança
    - Habilitar RLS na tabela `financial_years`
    - Adicionar políticas para CRUD baseado na empresa
*/

CREATE TABLE IF NOT EXISTS financial_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'closed', 'archived')),
  description text,
  is_default boolean DEFAULT false,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  budget_version integer DEFAULT 1,
  total_budget numeric,
  total_spent numeric,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  
  UNIQUE(year, company_id)
);

ALTER TABLE financial_years ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read financial years from their companies"
  ON financial_years
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert financial years"
  ON financial_years
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update financial years"
  ON financial_years
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete financial years"
  ON financial_years
  FOR DELETE
  TO authenticated
  USING (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_financial_years_company_id ON financial_years(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_years_year ON financial_years(year);
CREATE INDEX IF NOT EXISTS idx_financial_years_status ON financial_years(status);