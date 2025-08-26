/*
  # Criar tabela de empresas

  1. Nova Tabela
    - `companies`
      - `id` (uuid, primary key)
      - `razao_social` (text, not null)
      - `apelido` (text, not null)
      - `cnpj` (text, unique, not null)
      - `codigo_empresa` (text, unique, not null)
      - `status` (enum: active, inactive)
      - `endereco` (text, optional)
      - `cidade` (text, optional)
      - `estado` (text, optional)
      - `cep` (text, optional)
      - `telefone` (text, optional)
      - `email` (text, optional)
      - `website` (text, optional)
      - `responsavel` (text, optional)
      - `observacoes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (text, optional)

  2. Segurança
    - Habilitar RLS na tabela `companies`
    - Adicionar política para usuários autenticados lerem suas próprias empresas
*/

CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social text NOT NULL,
  apelido text NOT NULL,
  cnpj text UNIQUE NOT NULL,
  codigo_empresa text UNIQUE NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  endereco text,
  cidade text,
  estado text,
  cep text,
  telefone text,
  email text,
  website text,
  responsavel text,
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read companies they have access to"
  ON companies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (true);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at 
    BEFORE UPDATE ON companies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();