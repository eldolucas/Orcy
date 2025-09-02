/*
  # Instruções para Configurar Usuários de Demonstração

  Para resolver o erro de "Invalid login credentials", você precisa criar os usuários
  no painel do Supabase Authentication primeiro.

  ## Passo 1: Criar Usuários no Painel do Supabase
  
  1. Acesse o painel do Supabase: https://app.supabase.com
  2. Selecione seu projeto
  3. Vá para Authentication > Users
  4. Clique em "Add user" e crie os seguintes usuários:

  ### Usuário Administrador
  - Email: admin@empresa.com
  - Password: admin123
  - Email Confirm: true (marque esta opção)

  ### Usuário Gestor
  - Email: gestor@empresa.com
  - Password: gestor123
  - Email Confirm: true (marque esta opção)

  ### Usuário Comum
  - Email: usuario@empresa.com
  - Password: usuario123
  - Email Confirm: true (marque esta opção)

  ## Passo 2: Configurar Perfis dos Usuários
  
  Após criar os usuários acima, execute as seguintes queries no SQL Editor do Supabase
  para configurar os perfis de cada usuário:
*/

-- Configurar perfil do administrador
INSERT INTO profiles (id, name, role, department, company_id, companies, is_active)
SELECT 
  au.id,
  'João Silva (Admin)',
  'admin',
  'TI',
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  ARRAY['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003']::uuid[],
  true
FROM auth.users au
WHERE au.email = 'admin@empresa.com'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  company_id = EXCLUDED.company_id,
  companies = EXCLUDED.companies,
  is_active = EXCLUDED.is_active;

-- Configurar perfil do gestor
INSERT INTO profiles (id, name, role, department, company_id, companies, is_active)
SELECT 
  au.id,
  'Maria Santos (Gestor)',
  'manager',
  'Financeiro',
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  ARRAY['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002']::uuid[],
  true
FROM auth.users au
WHERE au.email = 'gestor@empresa.com'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  company_id = EXCLUDED.company_id,
  companies = EXCLUDED.companies,
  is_active = EXCLUDED.is_active;

-- Configurar perfil do usuário comum
INSERT INTO profiles (id, name, role, department, company_id, companies, is_active)
SELECT 
  au.id,
  'Carlos Oliveira (Usuário)',
  'user',
  'Operações',
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  ARRAY['550e8400-e29b-41d4-a716-446655440001']::uuid[],
  true
FROM auth.users au
WHERE au.email = 'usuario@empresa.com'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  company_id = EXCLUDED.company_id,
  companies = EXCLUDED.companies,
  is_active = EXCLUDED.is_active;

/*
  ## Passo 3: Verificar se os Perfis foram Criados
  
  Execute esta query para verificar se os perfis foram criados corretamente:
*/

SELECT 
  p.name,
  p.role,
  p.department,
  au.email,
  p.is_active
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE au.email IN ('admin@empresa.com', 'gestor@empresa.com', 'usuario@empresa.com');

/*
  ## Resultado Esperado:
  
  Você deve ver 3 linhas com os dados dos usuários criados.
  Se não aparecer nenhuma linha, significa que os usuários não foram criados
  no painel Authentication > Users do Supabase.
*/