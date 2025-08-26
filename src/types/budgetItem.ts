export interface BudgetItem {
  id: string;
  companyId: string;
  financialYearId: string;
  budgetRevisionId?: string;
  accountingClassificationId: string;
  costCenterId: string;
  name: string;
  description?: string;
  budgetedAmount: number;
  type: 'revenue' | 'expense';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetItemFormData {
  financialYearId: string;
  budgetRevisionId?: string;
  accountingClassificationId: string;
  costCenterId: string;
  name: string;
  description?: string;
  budgetedAmount: number;
  type: 'revenue' | 'expense';
}

export const budgetItemTypeLabels = {
  revenue: 'Receita',
  expense: 'Despesa'
};