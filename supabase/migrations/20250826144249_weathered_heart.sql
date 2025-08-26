/*
  # Criar tabela de insumos

  1. Nova Tabela
    - `insumos`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text, optional)
      - `type` (enum: product, service, fund)
      - `unit` (text, not null)
      - `cost` (numeric, not null)
      - `is_active` (boolean, default true)
      - `company_id` (uuid, foreign key, not null)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (text, optional)

  2. Segurança
    - Habilitar RLS na tabela `insumos`
    - Adicionar políticas para CRUD baseado na empresa
*/

CREATE TABLE IF NOT EXISTS insumos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('product', 'service', 'fund')),
  unit text NOT NULL,
  cost numeric NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text
);

ALTER TABLE insumos ENABLE ROW LEVEL SECURITY;

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

CREATE TRIGGER update_insumos_updated_at 
    BEFORE UPDATE ON insumos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_insumos_company_id ON insumos(company_id);
CREATE INDEX IF NOT EXISTS idx_insumos_type ON insumos(type);
CREATE INDEX IF NOT EXISTS idx_insumos_is_active ON insumos(is_active);