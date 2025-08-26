export interface ExpenseClassification {
  id: string;
  name: string;
  type: 'variable_cost' | 'fixed_cost' | 'expense';
  code: string;
  description: string;
  isActive: boolean;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface ExpenseClassificationFormData {
  name: string;
  type: 'variable_cost' | 'fixed_cost' | 'expense';
  code: string;
  description: string;
  isActive: boolean;
}

export const expenseTypeLabels = {
  variable_cost: 'Custo Variável',
  fixed_cost: 'Custo Fixo',
  expense: 'Despesa'
};