export interface BalanceSheet {
  id: string;
  fiscalYearId: string;
  companyId: string;
  period: string;        // Ex: '2024-Q1', '2024-06', '2024'
  periodType: 'monthly' | 'quarterly' | 'annual';
  status: 'draft' | 'published' | 'audited';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  auditedAt?: string;
  auditedBy?: string;
  notes?: string;
}

export interface BalanceSheetItem {
  id: string;
  balanceSheetId: string;
  accountId: string;      // Referência à conta contábil
  accountCode: string;    // Código da conta (para facilitar a exibição)
  accountName: string;    // Nome da conta (para facilitar a exibição)
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  accountGroup: string;   // Grupo da conta (Ativo Circulante, Passivo Não Circulante, etc.)
  amount: number;
  budgetedAmount?: number; // Valor orçado, se aplicável
  variance?: number;       // Variação entre real e orçado
  notes?: string;
}

export interface BalanceSheetFormData {
  fiscalYearId: string;
  period: string;
  periodType: 'monthly' | 'quarterly' | 'annual';
  status: 'draft' | 'published' | 'audited';
  notes?: string;
}

export interface BalanceSheetItemFormData {
  accountId: string;
  amount: number;
  budgetedAmount?: number;
  notes?: string;
}

export interface BalanceSheetSummary {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpense: number;
  netIncome: number;
  currentRatio?: number;
  quickRatio?: number;
  debtToEquityRatio?: number;
  returnOnAssets?: number;
  returnOnEquity?: number;
}

export interface AccountingAccount {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  group: string;
  subgroup?: string;
  isActive: boolean;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  parentAccountId?: string;
  children?: AccountingAccount[];
  level: number;
  path: string;
}

export const accountTypeLabels = {
  asset: 'Ativo',
  liability: 'Passivo',
  equity: 'Patrimônio Líquido',
  revenue: 'Receita',
  expense: 'Despesa'
};

export const accountGroupLabels = {
  // Ativos
  'current-assets': 'Ativo Circulante',
  'non-current-assets': 'Ativo Não Circulante',
  'fixed-assets': 'Imobilizado',
  'intangible-assets': 'Intangível',
  
  // Passivos
  'current-liabilities': 'Passivo Circulante',
  'non-current-liabilities': 'Passivo Não Circulante',
  
  // Patrimônio Líquido
  'capital': 'Capital Social',
  'reserves': 'Reservas',
  'retained-earnings': 'Lucros Acumulados',
  
  // Receitas
  'operational-revenue': 'Receita Operacional',
  'non-operational-revenue': 'Receita Não Operacional',
  
  // Despesas
  'operational-expense': 'Despesa Operacional',
  'non-operational-expense': 'Despesa Não Operacional',
  'tax-expense': 'Despesas com Impostos'
};

export const periodTypeLabels = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  annual: 'Anual'
};

export const balanceSheetStatusLabels = {
  draft: 'Rascunho',
  published: 'Publicado',
  audited: 'Auditado'
};