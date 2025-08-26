export interface BudgetRevision {
  id: string;
  companyId: string;
  financialYearId: string;
  revisionNumber: number;
  revisionDate: string;
  description: string;
  status: 'draft' | 'active' | 'archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  totalBudgetBefore?: number;
  totalBudgetAfter?: number;
  changePercentage?: number;
  approvedBy?: string;
  approvedAt?: string;
}

export interface BudgetRevisionFormData {
  financialYearId: string;
  revisionNumber: number;
  revisionDate: string;
  description: string;
  status: 'draft' | 'active' | 'archived';
  totalBudgetBefore?: number;
  totalBudgetAfter?: number;
}

export const budgetRevisionStatusLabels = {
  draft: 'Rascunho',
  active: 'Ativo',
  archived: 'Arquivado'
};