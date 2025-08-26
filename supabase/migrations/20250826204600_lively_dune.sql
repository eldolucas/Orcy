/*
  # Sistema de Grupos Empresariais

  1. Novas Tabelas
    - `business_groups`
      - `id` (uuid, primary key)
      - `name` (text, nome do grupo)
      - `code` (text, código único)
      - `description` (text, descrição)
      - `headquarters_address` (text, endereço da matriz)
      - `headquarters_city` (text, cidade da matriz)
      - `headquarters_state` (text, estado da matriz)
      - `headquarters_country` (text, país da matriz)
      - `main_cnpj` (text, CNPJ principal)
      - `website` (text, site)
      - `phone` (text, telefone)
      - `email` (text, email)
      - `status` (text, status do grupo)
      - `total_companies` (integer, total de empresas)
      - `total_revenue` (numeric, receita total)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (text)

    - `business_group_memberships`
      - `id` (uuid, primary key)
      - `business_group_id` (uuid, foreign key)
      - `company_id` (uuid, foreign key)
      - `action` (text, tipo de ação)
      - `previous_group_id` (uuid, grupo anterior)
      - `effective_date` (date, data efetiva)
      - `reason` (text, motivo)
      - `created_by` (text)
      - `created_at` (timestamp)

  2. Modificações na Tabela Existente
    - `companies`
      - Adicionar `business_group_id` (uuid, foreign key)
      - Adicionar `joined_group_at` (timestamp)

  3. Segurança
    - Habilitar RLS em todas as tabelas
    - Políticas para usuários autenticados

  4. Índices
    - Índices para otimização de consultas
    - Índices únicos para códigos

  5. Triggers
    - Trigger para atualizar contadores automaticamente
    - Trigger para updated_at
*/

-- Criar tabela de grupos empresariais
CREATE TABLE IF NOT EXISTS business_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  headquarters_address text,
  headquarters_city text,
  headquarters_state text,
  headquarters_country text DEFAULT 'Brasil',
  main_cnpj text,
  website text,
  phone text,
  email text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'dissolved')),
  total_companies integer DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text NOT NULL
);

-- Criar tabela de histórico de vinculações
CREATE TABLE IF NOT EXISTS business_group_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_group_id uuid NOT NULL REFERENCES business_groups(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('joined', 'left', 'transferred_from', 'transferred_to')),
  previous_group_id uuid REFERENCES business_groups(id),
  effective_date date DEFAULT CURRENT_DATE,
  reason text,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Adicionar colunas à tabela companies se não existirem
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'business_group_id'
  ) THEN
    ALTER TABLE companies ADD COLUMN business_group_id uuid REFERENCES business_groups(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'joined_group_at'
  ) THEN
    ALTER TABLE companies ADD COLUMN joined_group_at timestamptz;
  END IF;
END $$;

-- Habilitar RLS
ALTER TABLE business_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_group_memberships ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para business_groups
CREATE POLICY "Users can read business groups"
  ON business_groups
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert business groups"
  ON business_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update business groups"
  ON business_groups
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete business groups"
  ON business_groups
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para business_group_memberships
CREATE POLICY "Users can read memberships"
  ON business_group_memberships
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert memberships"
  ON business_group_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_business_groups_code ON business_groups(code);
CREATE INDEX IF NOT EXISTS idx_business_groups_status ON business_groups(status);
CREATE INDEX IF NOT EXISTS idx_business_groups_name ON business_groups(name);

CREATE INDEX IF NOT EXISTS idx_business_group_memberships_group_id ON business_group_memberships(business_group_id);
CREATE INDEX IF NOT EXISTS idx_business_group_memberships_company_id ON business_group_memberships(company_id);
CREATE INDEX IF NOT EXISTS idx_business_group_memberships_effective_date ON business_group_memberships(effective_date);

CREATE INDEX IF NOT EXISTS idx_companies_business_group_id ON companies(business_group_id);

-- Trigger para atualizar updated_at em business_groups
CREATE OR REPLACE FUNCTION update_business_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_groups_updated_at
  BEFORE UPDATE ON business_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_business_groups_updated_at();

-- Função para atualizar contadores do grupo
CREATE OR REPLACE FUNCTION update_business_group_counters()
RETURNS TRIGGER AS $$
DECLARE
  group_id uuid;
  company_count integer;
BEGIN
  -- Determinar qual grupo precisa ser atualizado
  IF TG_OP = 'DELETE' THEN
    group_id := OLD.business_group_id;
  ELSE
    group_id := NEW.business_group_id;
  END IF;
  
  -- Se não há grupo, não fazer nada
  IF group_id IS NULL THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;
  
  -- Contar empresas no grupo
  SELECT COUNT(*) INTO company_count
  FROM companies
  WHERE business_group_id = group_id AND status = 'active';
  
  -- Atualizar contador
  UPDATE business_groups
  SET 
    total_companies = company_count,
    updated_at = now()
  WHERE id = group_id;
  
  -- Se foi uma operação de UPDATE e mudou o grupo, atualizar o grupo anterior também
  IF TG_OP = 'UPDATE' AND OLD.business_group_id IS DISTINCT FROM NEW.business_group_id AND OLD.business_group_id IS NOT NULL THEN
    SELECT COUNT(*) INTO company_count
    FROM companies
    WHERE business_group_id = OLD.business_group_id AND status = 'active';
    
    UPDATE business_groups
    SET 
      total_companies = company_count,
      updated_at = now()
    WHERE id = OLD.business_group_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar contadores quando empresas são vinculadas/desvinculadas
CREATE TRIGGER update_group_counters_on_company_change
  AFTER INSERT OR UPDATE OR DELETE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_business_group_counters();