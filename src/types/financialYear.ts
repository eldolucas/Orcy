export interface FinancialYear {
  id: string;
  year: number;
  name: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'closed' | 'archived';
  description?: string;
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  closedAt?: string;
  budgetVersion: number;
  totalBudget?: number;
  totalSpent?: number;
  companyId?: string;
}

export interface FinancialYearFormData {
  year: number;
  name: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'closed' | 'archived';
  description?: string;
  isDefault: boolean;
}

export const financialYearStatusLabels = {
  planning: 'Planejamento',
  active: 'Ativo',
  closed: 'Encerrado',
  archived: 'Arquivado'
};