export interface BudgetAllocation {
  id: string;
  budgetItemId: string;  // Referência ao item orçamentário
  fiscalYearId: string;  // Exercício financeiro
  costCenterId: string;  // Centro de custo
  totalAmount: number;   // Valor total anual
  allocations: MonthlyAllocation[]; // Alocações mensais
  distributionType: 'equal' | 'custom' | 'seasonal' | 'weighted'; // Tipo de distribuição
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  companyId: string;
}

export interface MonthlyAllocation {
  month: number;        // 1-12 para Jan-Dez
  year: number;         // Ano da alocação
  plannedAmount: number; // Valor planejado
  actualAmount?: number; // Valor realizado (opcional, preenchido conforme execução)
  percentage: number;    // Percentual do total
  notes?: string;        // Observações específicas do mês
}

export interface BudgetAllocationFormData {
  budgetItemId: string;
  fiscalYearId: string;
  costCenterId: string;
  totalAmount: number;
  distributionType: 'equal' | 'custom' | 'seasonal' | 'weighted';
  allocations?: Omit<MonthlyAllocation, 'percentage'>[];
  notes?: string;
}

// Perfis de distribuição sazonal pré-definidos
export const seasonalProfiles = {
  uniform: [8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.37], // Distribuição uniforme
  firstHalfHeavy: [12, 12, 12, 12, 12, 12, 8, 8, 6, 6, 5, 5], // Concentrado no primeiro semestre
  secondHalfHeavy: [5, 5, 6, 6, 8, 8, 12, 12, 12, 12, 12, 12], // Concentrado no segundo semestre
  quarterEnd: [5, 5, 15, 5, 5, 15, 5, 5, 15, 5, 5, 15], // Picos no final de cada trimestre
  yearEnd: [5, 5, 5, 5, 5, 5, 5, 5, 10, 10, 15, 25], // Concentrado no final do ano
  seasonal: [5, 5, 8, 10, 12, 15, 15, 10, 8, 5, 5, 2], // Padrão sazonal genérico
  custom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // Para distribuição personalizada
};

// Meses do ano para exibição
export const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];