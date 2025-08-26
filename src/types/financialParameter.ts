export interface FinancialParameter {
  id: string;
  code: string;
  name: string;
  description?: string;
  value: string | number | boolean;
  valueType: 'string' | 'number' | 'percentage' | 'boolean' | 'date';
  category: 'tax' | 'budget' | 'accounting' | 'approval' | 'system' | 'sector';
  sector?: string; // Setor econômico (quando aplicável)
  isActive: boolean;
  isSystem: boolean;
  companyId?: string; // Null for global parameters
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface FinancialParameterFormData {
  code: string;
  name: string;
  description?: string;
  value: string | number | boolean;
  valueType: 'string' | 'number' | 'percentage' | 'boolean' | 'date';
  category: 'tax' | 'budget' | 'accounting' | 'approval' | 'system' | 'sector';
  sector?: string;
  isActive: boolean;
  isSystem?: boolean;
  companyId?: string;
}

export const parameterCategoryLabels = {
  tax: 'Impostos e Taxas',
  budget: 'Orçamento',
  accounting: 'Contabilidade',
  approval: 'Aprovações',
  system: 'Sistema',
  sector: 'Setores Econômicos'
};

export const parameterValueTypeLabels = {
  string: 'Texto',
  number: 'Número',
  percentage: 'Percentual',
  boolean: 'Sim/Não',
  date: 'Data'
};

// Parâmetros padrão do sistema
export const defaultParameters: Omit<FinancialParameter, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>[] = [
  {
    code: 'DEFAULT_TAX_RATE',
    name: 'Alíquota Padrão de Impostos',
    description: 'Alíquota padrão de impostos para cálculos quando não especificado',
    value: 18,
    valueType: 'percentage',
    category: 'tax',
    isActive: true,
    isSystem: true
  },
  {
    code: 'BUDGET_ALERT_THRESHOLD',
    name: 'Limite de Alerta de Orçamento',
    description: 'Percentual do orçamento que, quando atingido, gera um alerta',
    value: 80,
    valueType: 'percentage',
    category: 'budget',
    isActive: true,
    isSystem: true
  },
  {
    code: 'BUDGET_CRITICAL_THRESHOLD',
    name: 'Limite Crítico de Orçamento',
    description: 'Percentual do orçamento que, quando atingido, gera um alerta crítico',
    value: 95,
    valueType: 'percentage',
    category: 'budget',
    isActive: true,
    isSystem: true
  },
  {
    code: 'APPROVAL_AUTO_REJECT_DAYS',
    name: 'Dias para Rejeição Automática',
    description: 'Número de dias após os quais uma solicitação pendente é automaticamente rejeitada',
    value: 15,
    valueType: 'number',
    category: 'approval',
    isActive: true,
    isSystem: true
  },
  {
    code: 'FISCAL_YEAR_AUTO_CLOSE',
    name: 'Fechamento Automático de Exercício',
    description: 'Se o exercício financeiro deve ser fechado automaticamente após o término',
    value: false,
    valueType: 'boolean',
    category: 'accounting',
    isActive: true,
    isSystem: true
  },
  {
    code: 'DEFAULT_DEPRECIATION_RATE',
    name: 'Taxa de Depreciação Padrão',
    description: 'Taxa de depreciação anual padrão para ativos',
    value: 10,
    valueType: 'percentage',
    category: 'accounting',
    isActive: true,
    isSystem: true
  },
  {
    code: 'ENABLE_BUDGET_REVISIONS',
    name: 'Habilitar Revisões Orçamentárias',
    description: 'Se as revisões orçamentárias estão habilitadas no sistema',
    value: true,
    valueType: 'boolean',
    category: 'system',
    isActive: true,
    isSystem: true
  },
  {
    code: 'MAX_BUDGET_VARIANCE',
    name: 'Variação Máxima de Orçamento',
    description: 'Percentual máximo permitido para variação em revisões orçamentárias',
    value: 20,
    valueType: 'percentage',
    category: 'budget',
    isActive: true,
    isSystem: true
  }
];

// Lista de setores econômicos
export const economicSectors = [
  { id: 'industry', name: 'Indústria' },
  { id: 'commerce', name: 'Comércio' },
  { id: 'services', name: 'Serviços' },
  { id: 'agribusiness', name: 'Agronegócio' },
  { id: 'construction', name: 'Construção Civil' },
  { id: 'technology', name: 'Tecnologia' },
  { id: 'education', name: 'Educação' },
  { id: 'health', name: 'Saúde' },
  { id: 'finance', name: 'Financeiro' },
  { id: 'logistics', name: 'Logística e Transporte' }
];

// Parâmetros específicos por setor
export const sectorParameters: Omit<FinancialParameter, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>[] = [
  {
    code: 'INDUSTRY_TAX_RATE',
    name: 'Alíquota para Indústria',
    description: 'Alíquota padrão de impostos para o setor industrial',
    value: 17,
    valueType: 'percentage',
    category: 'sector',
    sector: 'industry',
    isActive: true,
    isSystem: true
  },
  {
    code: 'COMMERCE_TAX_RATE',
    name: 'Alíquota para Comércio',
    description: 'Alíquota padrão de impostos para o setor de comércio',
    value: 18,
    valueType: 'percentage',
    category: 'sector',
    sector: 'commerce',
    isActive: true,
    isSystem: true
  },
  {
    code: 'SERVICES_TAX_RATE',
    name: 'Alíquota para Serviços',
    description: 'Alíquota padrão de impostos para o setor de serviços',
    value: 5,
    valueType: 'percentage',
    category: 'sector',
    sector: 'services',
    isActive: true,
    isSystem: true
  },
  {
    code: 'AGRIBUSINESS_TAX_EXEMPTION',
    name: 'Isenção para Agronegócio',
    description: 'Se o setor de agronegócio possui isenção fiscal',
    value: true,
    valueType: 'boolean',
    category: 'sector',
    sector: 'agribusiness',
    isActive: true,
    isSystem: true
  }
];