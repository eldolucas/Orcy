import { useState, useEffect } from 'react';
import { BudgetAllocation, BudgetAllocationFormData, MonthlyAllocation, seasonalProfiles } from '../types/budgetAllocation';
import { useAuth } from '../contexts/AuthContext';

// Mock data para alocações orçamentárias
const mockBudgetAllocations: BudgetAllocation[] = [
  {
    id: '1',
    budgetItemId: '1',
    fiscalYearId: '1',
    costCenterId: '1',
    totalAmount: 500000,
    distributionType: 'seasonal',
    allocations: [
      { month: 1, year: 2024, plannedAmount: 25000, percentage: 5, actualAmount: 24500 },
      { month: 2, year: 2024, plannedAmount: 25000, percentage: 5, actualAmount: 25200 },
      { month: 3, year: 2024, plannedAmount: 40000, percentage: 8, actualAmount: 39800 },
      { month: 4, year: 2024, plannedAmount: 50000, percentage: 10, actualAmount: 51200 },
      { month: 5, year: 2024, plannedAmount: 60000, percentage: 12, actualAmount: 59500 },
      { month: 6, year: 2024, plannedAmount: 75000, percentage: 15, actualAmount: 74800 },
      { month: 7, year: 2024, plannedAmount: 75000, percentage: 15, actualAmount: 76200 },
      { month: 8, year: 2024, plannedAmount: 50000, percentage: 10 },
      { month: 9, year: 2024, plannedAmount: 40000, percentage: 8 },
      { month: 10, year: 2024, plannedAmount: 25000, percentage: 5 },
      { month: 11, year: 2024, plannedAmount: 25000, percentage: 5 },
      { month: 12, year: 2024, plannedAmount: 10000, percentage: 2 }
    ],
    notes: 'Distribuição sazonal para receitas de vendas',
    createdBy: 'João Silva',
    createdAt: '2024-01-05',
    updatedAt: '2024-07-15',
    companyId: '1'
  },
  {
    id: '2',
    budgetItemId: '2',
    fiscalYearId: '1',
    costCenterId: '11',
    totalAmount: 120000,
    distributionType: 'equal',
    allocations: Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      year: 2024,
      plannedAmount: 10000,
      percentage: 8.33,
      actualAmount: i < 7 ? 10000 + (Math.random() * 1000 - 500) : undefined
    })),
    notes: 'Distribuição uniforme para despesas administrativas',
    createdBy: 'Maria Santos',
    createdAt: '2024-01-10',
    updatedAt: '2024-07-10',
    companyId: '1'
  },
  {
    id: '3',
    budgetItemId: '3',
    fiscalYearId: '1',
    costCenterId: '21',
    totalAmount: 240000,
    distributionType: 'custom',
    allocations: [
      { month: 1, year: 2024, plannedAmount: 10000, percentage: 4.17, actualAmount: 9800 },
      { month: 2, year: 2024, plannedAmount: 10000, percentage: 4.17, actualAmount: 10200 },
      { month: 3, year: 2024, plannedAmount: 30000, percentage: 12.5, actualAmount: 29500 },
      { month: 4, year: 2024, plannedAmount: 15000, percentage: 6.25, actualAmount: 15300 },
      { month: 5, year: 2024, plannedAmount: 15000, percentage: 6.25, actualAmount: 14800 },
      { month: 6, year: 2024, plannedAmount: 30000, percentage: 12.5, actualAmount: 30500 },
      { month: 7, year: 2024, plannedAmount: 15000, percentage: 6.25, actualAmount: 15100 },
      { month: 8, year: 2024, plannedAmount: 15000, percentage: 6.25 },
      { month: 9, year: 2024, plannedAmount: 30000, percentage: 12.5 },
      { month: 10, year: 2024, plannedAmount: 15000, percentage: 6.25 },
      { month: 11, year: 2024, plannedAmount: 15000, percentage: 6.25 },
      { month: 12, year: 2024, plannedAmount: 40000, percentage: 16.67 }
    ],
    notes: 'Distribuição customizada para campanhas de marketing',
    createdBy: 'Pedro Costa',
    createdAt: '2024-01-15',
    updatedAt: '2024-07-05',
    companyId: '1'
  }
];

export function useBudgetAllocations() {
  const { activeCompany } = useAuth();
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simula uma chamada de API
    const fetchAllocations = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simula um delay de rede
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Filtra alocações pela empresa ativa
        const filteredAllocations = activeCompany 
          ? mockBudgetAllocations.filter(alloc => alloc.companyId === activeCompany.id)
          : mockBudgetAllocations;
        
        setAllocations(filteredAllocations);
      } catch (err) {
        setError('Erro ao carregar alocações orçamentárias. Por favor, tente novamente.');
        console.error('Erro ao buscar alocações orçamentárias:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllocations();
  }, [activeCompany]);

  // Gera alocações mensais com base no tipo de distribuição
  const generateMonthlyAllocations = (
    totalAmount: number,
    distributionType: BudgetAllocation['distributionType'],
    fiscalYear: number = new Date().getFullYear(),
    customAllocations?: Omit<MonthlyAllocation, 'percentage'>[]
  ): MonthlyAllocation[] => {
    // Se for distribuição customizada e tiver valores, use-os
    if (distributionType === 'custom' && customAllocations && customAllocations.length > 0) {
      const total = customAllocations.reduce((sum, alloc) => sum + (alloc.plannedAmount || 0), 0);
      
      return customAllocations.map(alloc => ({
        ...alloc,
        year: alloc.year || fiscalYear,
        percentage: total > 0 ? ((alloc.plannedAmount || 0) / total) * 100 : 0
      }));
    }
    
    // Caso contrário, use um dos perfis pré-definidos
    let profile: number[];
    
    switch (distributionType) {
      case 'equal':
        profile = seasonalProfiles.uniform;
        break;
      case 'seasonal':
        profile = seasonalProfiles.seasonal;
        break;
      case 'weighted':
        profile = seasonalProfiles.yearEnd;
        break;
      default:
        profile = seasonalProfiles.uniform;
    }
    
    return Array.from({ length: 12 }, (_, i) => {
      const percentage = profile[i];
      const plannedAmount = (totalAmount * percentage) / 100;
      
      return {
        month: i + 1,
        year: fiscalYear,
        plannedAmount,
        percentage
      };
    });
  };

  const addBudgetAllocation = async (allocationData: BudgetAllocationFormData): Promise<BudgetAllocation> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!activeCompany) {
        throw new Error('Nenhuma empresa ativa selecionada');
      }
      
      // Gera as alocações mensais
      const monthlyAllocations = generateMonthlyAllocations(
        allocationData.totalAmount,
        allocationData.distributionType,
        parseInt(allocationData.fiscalYearId.split('-')[1] || new Date().getFullYear().toString()),
        allocationData.allocations
      );
      
      const newAllocation: BudgetAllocation = {
        id: Date.now().toString(),
        ...allocationData,
        allocations: monthlyAllocations,
        companyId: activeCompany.id,
        createdBy: 'Usuário Atual', // Em uma implementação real, viria do contexto de autenticação
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      
      setAllocations(prev => [newAllocation, ...prev]);
      return newAllocation;
    } catch (err) {
      setError('Erro ao adicionar alocação orçamentária. Por favor, tente novamente.');
      console.error('Erro ao adicionar alocação orçamentária:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBudgetAllocation = async (id: string, updates: Partial<BudgetAllocationFormData>): Promise<BudgetAllocation> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let updatedAllocation: BudgetAllocation | undefined;
      
      setAllocations(prev => 
        prev.map(allocation => {
          if (allocation.id === id) {
            // Se estamos atualizando o valor total ou o tipo de distribuição, recalcule as alocações mensais
            let monthlyAllocations = allocation.allocations;
            
            if (updates.totalAmount !== undefined || updates.distributionType !== undefined) {
              const totalAmount = updates.totalAmount ?? allocation.totalAmount;
              const distributionType = updates.distributionType ?? allocation.distributionType;
              const fiscalYear = parseInt(
                (updates.fiscalYearId ?? allocation.fiscalYearId).split('-')[1] || 
                new Date().getFullYear().toString()
              );
              
              monthlyAllocations = generateMonthlyAllocations(
                totalAmount,
                distributionType,
                fiscalYear,
                updates.allocations
              );
            } else if (updates.allocations) {
              // Se apenas as alocações foram atualizadas, recalcule os percentuais
              const total = updates.allocations.reduce((sum, alloc) => sum + (alloc.plannedAmount || 0), 0);
              
              monthlyAllocations = updates.allocations.map((alloc, i) => ({
                ...alloc,
                year: alloc.year || allocation.allocations[i]?.year || new Date().getFullYear(),
                percentage: total > 0 ? ((alloc.plannedAmount || 0) / total) * 100 : 0
              }));
            }
            
            updatedAllocation = {
              ...allocation,
              ...updates,
              allocations: monthlyAllocations,
              updatedAt: new Date().toISOString().split('T')[0]
            };
            return updatedAllocation;
          }
          return allocation;
        })
      );
      
      if (!updatedAllocation) {
        throw new Error('Alocação orçamentária não encontrada');
      }
      
      return updatedAllocation;
    } catch (err) {
      setError('Erro ao atualizar alocação orçamentária. Por favor, tente novamente.');
      console.error('Erro ao atualizar alocação orçamentária:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBudgetAllocation = async (id: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAllocations(prev => prev.filter(allocation => allocation.id !== id));
    } catch (err) {
      setError('Erro ao excluir alocação orçamentária. Por favor, tente novamente.');
      console.error('Erro ao excluir alocação orçamentária:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateActualAmount = async (
    allocationId: string, 
    month: number, 
    actualAmount: number
  ): Promise<BudgetAllocation> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let updatedAllocation: BudgetAllocation | undefined;
      
      setAllocations(prev => 
        prev.map(allocation => {
          if (allocation.id === allocationId) {
            const updatedMonthlyAllocations = allocation.allocations.map(monthAlloc => {
              if (monthAlloc.month === month) {
                return {
                  ...monthAlloc,
                  actualAmount
                };
              }
              return monthAlloc;
            });
            
            updatedAllocation = {
              ...allocation,
              allocations: updatedMonthlyAllocations,
              updatedAt: new Date().toISOString().split('T')[0]
            };
            return updatedAllocation;
          }
          return allocation;
        })
      );
      
      if (!updatedAllocation) {
        throw new Error('Alocação orçamentária não encontrada');
      }
      
      return updatedAllocation;
    } catch (err) {
      setError('Erro ao atualizar valor realizado. Por favor, tente novamente.');
      console.error('Erro ao atualizar valor realizado:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllocationById = (id: string): BudgetAllocation | undefined => {
    return allocations.find(allocation => allocation.id === id);
  };

  const getAllocationsByBudgetItem = (budgetItemId: string): BudgetAllocation[] => {
    return allocations.filter(allocation => allocation.budgetItemId === budgetItemId);
  };

  const getAllocationsByCostCenter = (costCenterId: string): BudgetAllocation[] => {
    return allocations.filter(allocation => allocation.costCenterId === costCenterId);
  };

  const getAllocationsByFiscalYear = (fiscalYearId: string): BudgetAllocation[] => {
    return allocations.filter(allocation => allocation.fiscalYearId === fiscalYearId);
  };

  const getMonthlyTotals = (fiscalYearId: string, costCenterId?: string): { month: number; planned: number; actual: number }[] => {
    // Filtra as alocações pelo ano fiscal e, opcionalmente, pelo centro de custo
    const filteredAllocations = allocations.filter(alloc => 
      alloc.fiscalYearId === fiscalYearId && 
      (costCenterId ? alloc.costCenterId === costCenterId : true)
    );
    
    // Inicializa o array de totais mensais
    const monthlyTotals = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      planned: 0,
      actual: 0
    }));
    
    // Soma os valores planejados e realizados para cada mês
    filteredAllocations.forEach(allocation => {
      allocation.allocations.forEach(monthAlloc => {
        const monthIndex = monthAlloc.month - 1;
        monthlyTotals[monthIndex].planned += monthAlloc.plannedAmount;
        monthlyTotals[monthIndex].actual += monthAlloc.actualAmount || 0;
      });
    });
    
    return monthlyTotals;
  };

  const getYearlyTotals = (fiscalYearId: string): { planned: number; actual: number; variance: number; variancePercentage: number } => {
    const monthlyTotals = getMonthlyTotals(fiscalYearId);
    
    const planned = monthlyTotals.reduce((sum, month) => sum + month.planned, 0);
    const actual = monthlyTotals.reduce((sum, month) => sum + month.actual, 0);
    const variance = planned - actual;
    const variancePercentage = planned > 0 ? (variance / planned) * 100 : 0;
    
    return { planned, actual, variance, variancePercentage };
  };

  return {
    allocations,
    isLoading,
    error,
    addBudgetAllocation,
    updateBudgetAllocation,
    deleteBudgetAllocation,
    updateActualAmount,
    getAllocationById,
    getAllocationsByBudgetItem,
    getAllocationsByCostCenter,
    getAllocationsByFiscalYear,
    getMonthlyTotals,
    getYearlyTotals,
    generateMonthlyAllocations
  };
}