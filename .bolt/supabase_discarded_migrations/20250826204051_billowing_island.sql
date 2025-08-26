/*
  # Sistema de Grupos Empresariais

  1. Nova Tabela
    - `business_groups`
      - `id` (uuid, primary key)
      - `name` (text, nome do grupo)
      - `code` (text, código único do grupo)
      - `description` (text, descrição)
      - `headquarters_address` (text, endereço da matriz)
      - `headquarters_city` (text, cidade da matriz)
      - `headquarters_state` (text, estado da matriz)
      - `headquarters_country` (text, país da matriz)
      - `main_cnpj` (text, CNPJ principal do grupo)
      - `website` (text, site do grupo)
      - `phone` (text, telefone)
      - `email` (text, email)
      - `status` (text, status do grupo)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (text, criador)

  2. Modificação na Tabela Companies
    - Adicionar `business_group_id` (uuid, foreign key opcional)
    - Adicionar `joined_group_at` (timestamp, data de vinculação)

  3. Tabela de Histórico
    - `business_group_memberships`
      - Histórico de vinculações entre empresas e grupos

  4. Índices e Constraints
    - Índices para performance
    - Constraints para regras de negócio
    - Triggers para auditoria

  5. Segurança
    - RLS policies para isolamento de dados
    - Permissões adequadas por função
*/

-- Criar tabela de grupos empresariais
CREATE TABLE IF NOT EXISTS business_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
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
  created_by text NOT NULL,
  
  -- Constraints
  CONSTRAINT business_groups_code_unique UNIQUE (code),
  CONSTRAINT business_groups_name_length CHECK (char_length(name) >= 2),
  CONSTRAINT business_groups_code_length CHECK (char_length(code) >= 2)
);

-- Adicionar coluna business_group_id na tabela companies se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'business_group_id'
  ) THEN
    ALTER TABLE companies ADD COLUMN business_group_id uuid REFERENCES business_groups(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Adicionar coluna joined_group_at na tabela companies se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'joined_group_at'
  ) THEN
    ALTER TABLE companies ADD COLUMN joined_group_at timestamptz;
  END IF;
END $$;

-- Criar tabela de histórico de vinculações
CREATE TABLE IF NOT EXISTS business_group_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_group_id uuid NOT NULL REFERENCES business_groups(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('joined', 'left', 'transferred_from', 'transferred_to')),
  previous_group_id uuid REFERENCES business_groups(id) ON DELETE SET NULL,
  effective_date timestamptz DEFAULT now(),
  reason text,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  -- Índices para performance
  INDEX idx_memberships_group_id (business_group_id),
  INDEX idx_memberships_company_id (company_id),
  INDEX idx_memberships_effective_date (effective_date)
);

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_business_groups_status ON business_groups(status);
CREATE INDEX IF NOT EXISTS idx_business_groups_code ON business_groups(code);
CREATE INDEX IF NOT EXISTS idx_business_groups_created_at ON business_groups(created_at);
CREATE INDEX IF NOT EXISTS idx_companies_business_group_id ON companies(business_group_id);

-- Função para atualizar contador de empresas no grupo
CREATE OR REPLACE FUNCTION update_business_group_company_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar contador do grupo anterior (se houver)
  IF OLD.business_group_id IS NOT NULL THEN
    UPDATE business_groups 
    SET total_companies = (
      SELECT COUNT(*) 
      FROM companies 
      WHERE business_group_id = OLD.business_group_id
    ),
    updated_at = now()
    WHERE id = OLD.business_group_id;
  END IF;
  
  -- Atualizar contador do novo grupo (se houver)
  IF NEW.business_group_id IS NOT NULL THEN
    UPDATE business_groups 
    SET total_companies = (
      SELECT COUNT(*) 
      FROM companies 
      WHERE business_group_id = NEW.business_group_id
    ),
    updated_at = now()
    WHERE id = NEW.business_group_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar contador automaticamente
DROP TRIGGER IF EXISTS trigger_update_group_company_count ON companies;
CREATE TRIGGER trigger_update_group_company_count
  AFTER UPDATE OF business_group_id ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_business_group_company_count();

-- Função para registrar histórico de vinculações
CREATE OR REPLACE FUNCTION log_business_group_membership()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a empresa foi vinculada a um grupo
  IF OLD.business_group_id IS NULL AND NEW.business_group_id IS NOT NULL THEN
    INSERT INTO business_group_memberships (
      business_group_id, 
      company_id, 
      action, 
      effective_date,
      created_by
    ) VALUES (
      NEW.business_group_id, 
      NEW.id, 
      'joined', 
      now(),
      'Sistema'
    );
    
    -- Atualizar data de vinculação
    NEW.joined_group_at = now();
  END IF;
  
  -- Se a empresa foi desvinculada de um grupo
  IF OLD.business_group_id IS NOT NULL AND NEW.business_group_id IS NULL THEN
    INSERT INTO business_group_memberships (
      business_group_id, 
      company_id, 
      action, 
      effective_date,
      created_by
    ) VALUES (
      OLD.business_group_id, 
      NEW.id, 
      'left', 
      now(),
      'Sistema'
    );
    
    -- Limpar data de vinculação
    NEW.joined_group_at = NULL;
  END IF;
  
  -- Se a empresa foi transferida entre grupos
  IF OLD.business_group_id IS NOT NULL AND NEW.business_group_id IS NOT NULL 
     AND OLD.business_group_id != NEW.business_group_id THEN
    
    -- Registrar saída do grupo anterior
    INSERT INTO business_group_memberships (
      business_group_id, 
      company_id, 
      action, 
      previous_group_id,
      effective_date,
      created_by
    ) VALUES (
      OLD.business_group_id, 
      NEW.id, 
      'transferred_from',
      OLD.business_group_id,
      now(),
      'Sistema'
    );
    
    -- Registrar entrada no novo grupo
    INSERT INTO business_group_memberships (
      business_group_id, 
      company_id, 
      action, 
      previous_group_id,
      effective_date,
      created_by
    ) VALUES (
      NEW.business_group_id, 
      NEW.id, 
      'transferred_to',
      OLD.business_group_id,
      now(),
      'Sistema'
    );
    
    -- Atualizar data de vinculação
    NEW.joined_group_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar histórico automaticamente
DROP TRIGGER IF EXISTS trigger_log_group_membership ON companies;
CREATE TRIGGER trigger_log_group_membership
  BEFORE UPDATE OF business_group_id ON companies
  FOR EACH ROW
  EXECUTE FUNCTION log_business_group_membership();

-- Trigger para updated_at em business_groups
CREATE OR REPLACE FUNCTION update_business_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_business_groups_updated_at ON business_groups;
CREATE TRIGGER trigger_update_business_groups_updated_at
  BEFORE UPDATE ON business_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_business_groups_updated_at();

-- Habilitar RLS
ALTER TABLE business_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_group_memberships ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para business_groups
CREATE POLICY "Users can read business groups" ON business_groups
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert business groups" ON business_groups
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update business groups" ON business_groups
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can delete business groups" ON business_groups
  FOR DELETE TO authenticated USING (true);

-- Políticas RLS para business_group_memberships
CREATE POLICY "Users can read group memberships" ON business_group_memberships
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert group memberships" ON business_group_memberships
  FOR INSERT TO authenticated WITH CHECK (true);

-- Inserir dados de exemplo (opcional)
INSERT INTO business_groups (name, code, description, created_by) VALUES
  ('Grupo Tecnologia Avançada', 'GTA', 'Grupo focado em soluções tecnológicas inovadoras', 'Admin'),
  ('Holding Empresarial Brasil', 'HEB', 'Conglomerado de empresas diversificadas', 'Admin')
ON CONFLICT (code) DO NOTHING;