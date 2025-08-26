export interface AccountingClassification {
  id: string;
  name: string;
  code: string;
  type: 'revenue' | 'expense' | 'asset' | 'liability' | 'equity';
  description: string;
  isActive: boolean;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface AccountingClassificationFormData {
  name: string;
  code: string;
  type: 'revenue' | 'expense' | 'asset' | 'liability' | 'equity';
  description: string;
  isActive: boolean;
}

export const accountingTypeLabels = {
  revenue: 'Receita',
  expense: 'Despesa',
  asset: 'Ativo',
  liability: 'Passivo',
  equity: 'Patrimônio Líquido'
};