export interface BudgetVersion {
  id: string;
  name: string;
  description?: string;
  fiscalYearId: string;
  costCenterId?: string;  // Opcional, pode ser para toda a empresa
  versionNumber: number;
  status: 'draft' | 'simulation' | 'approved' | 'active' | 'archived';
  isBaseline: boolean;    // Indica se é a versão base/oficial
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  companyId: string;
  parentVersionId?: string; // Versão da qual esta foi derivada
  totalBudget: number;
  metadata?: {
    assumptions?: string[];
    scenarioType?: 'optimistic' | 'realistic' | 'pessimistic';
    adjustmentFactor?: number;
    tags?: string[];
    [key: string]: any;
  };
}

export interface BudgetVersionItem {
  id: string;
  versionId: string;
  budgetItemId: string;
  originalAmount: number;  // Valor na versão original/base
  adjustedAmount: number;  // Valor ajustado nesta versão
  adjustmentType: 'percentage' | 'absolute'; // Tipo de ajuste aplicado
  adjustmentValue: number; // Valor do ajuste (percentual ou absoluto)
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetVersionFormData {
  name: string;
  description?: string;
  fiscalYearId: string;
  costCenterId?: string;
  status: 'draft' | 'simulation' | 'approved' | 'active' | 'archived';
  isBaseline: boolean;
  parentVersionId?: string;
  metadata?: {
    assumptions?: string[];
    scenarioType?: 'optimistic' | 'realistic' | 'pessimistic';
    adjustmentFactor?: number;
    tags?: string[];
    [key: string]: any;
  };
}

export interface BudgetVersionItemFormData {
  budgetItemId: string;
  adjustmentType: 'percentage' | 'absolute';
  adjustmentValue: number;
  notes?: string;
}

export const versionStatusLabels = {
  draft: 'Rascunho',
  simulation: 'Simulação',
  approved: 'Aprovado',
  active: 'Ativo',
  archived: 'Arquivado'
};

export const scenarioTypeLabels = {
  optimistic: 'Otimista',
  realistic: 'Realista',
  pessimistic: 'Pessimista'
};