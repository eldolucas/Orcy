import { useState, useEffect } from 'react';
import { Budget } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Mock data for budgets
const mockBudgets: Budget[] = [
  {
    id: '1',
    name: 'Orçamento TI 2024',
    costCenterId: '1',
    fiscalYearId: '1',
    period: '2024',
    totalBudget: 800000,
    spent: 620000,
    remaining: 180000,
    status: 'active',
    createdBy: 'João Silva',
    createdAt: '2024-01-01',
    lastUpdated: '2024-01-15',
    categories: [
      { id: '1', name: 'Infraestrutura', budgeted: 350000, spent: 287500, percentage: 82.1 },
      { id: '2', name: 'Desenvolvimento', budgeted: 300000, spent: 232500, percentage: 77.5 },
      { id: '3', name: 'Licenças', budgeted: 150000, spent: 100000, percentage: 66.7 }
    ]
  },
  {
    id: '2',
    name: 'Marketing Digital 2024',
    costCenterId: '21',
    fiscalYearId: '1',
    period: '2024',
    totalBudget: 200000,
    spent: 165000,
    remaining: 35000,
    status: 'active',
    createdBy: 'Juliana Costa',
    createdAt: '2024-01-01',
    lastUpdated: '2024-01-14',
    categories: [
      { id: '4', name: 'Publicidade Online', budgeted: 120000, spent: 105000, percentage: 87.5 },
      { id: '5', name: 'Criação de Conteúdo', budgeted: 50000, spent: 37500, percentage: 75.0 },
      { id: '6', name: 'Ferramentas', budgeted: 30000, spent: 22500, percentage: 75.0 }
    ]
  },
  {
    id: '3',
    name: 'Recursos Humanos 2024',
    costCenterId: '3',
    fiscalYearId: '1',
    period: '2024',
    totalBudget: 300000,
    spent: 245000,
    remaining: 55000,
    status: 'active',
    createdBy: 'Pedro Costa',
    createdAt: '2024-01-01',
    lastUpdated: '2024-01-13',
    categories: [
      { id: '7', name: 'Salários', budgeted: 200000, spent: 166000, percentage: 83.0 },
      { id: '8', name: 'Benefícios', budgeted: 60000, spent: 49000, percentage: 81.7 },
      { id: '9', name: 'Treinamentos', budgeted: 40000, spent: 30000, percentage: 75.0 }
    ]
  },
  {
    id: '4',
    name: 'Orçamento TI 2025',
    costCenterId: '1',
    fiscalYearId: '2',
    period: '2025',
    totalBudget: 950000,
    spent: 0,
    remaining: 950000,
    status: 'planning',
    createdBy: 'João Silva',
    createdAt: '2024-10-15',
    lastUpdated: '2024-10-15',
    categories: [
      { id: '10', name: 'Infraestrutura', budgeted: 400000, spent: 0, percentage: 0 },
      { id: '11', name: 'Desenvolvimento', budgeted: 350000, spent: 0, percentage: 0 },
      { id: '12', name: 'Licenças', budgeted: 200000, spent: 0, percentage: 0 }
    ]
  }
];

export function useBudgets() {
  const { activeCompany } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filtrar orçamentos pela empresa ativa (simulação)
      // Em uma implementação real, isso seria feito no backend
      const filteredBudgets = activeCompany 
        ? mockBudgets.filter(budget => {
            // Aqui estamos simulando que os primeiros 2 orçamentos pertencem à empresa 1
            // e os outros à empresa 2
            if (activeCompany.id === '1' && ['1', '2'].includes(budget.id)) {
              return true;
            } else if (activeCompany.id === '2' && ['3', '4'].includes(budget.id)) {
              return true;
            }
            return false;
          })
        : mockBudgets;
      
      setBudgets(filteredBudgets);
      setIsLoading(false);
    };

    fetchData();
  }, [activeCompany]);

  const addBudget = (newBudget: Omit<Budget, 'id' | 'createdAt' | 'lastUpdated' | 'spent' | 'remaining'>) => {
    const budget: Budget = {
      ...newBudget,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      spent: 0,
      remaining: newBudget.totalBudget,
      categories: newBudget.categories || []
    };
    
    setBudgets(prev => [budget, ...prev]);
    return budget;
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setBudgets(prev => 
      prev.map(budget => 
        budget.id === id 
          ? { 
              ...budget, 
              ...updates, 
              lastUpdated: new Date().toISOString().split('T')[0],
              remaining: updates.totalBudget !== undefined 
                ? updates.totalBudget - (updates.spent || budget.spent)
                : budget.remaining
            }
          : budget
      )
    );
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(budget => budget.id !== id));
  };

  const getFilteredBudgets = (searchTerm: string, statusFilter: string, costCenterFilter: string = 'all') => {
    let filtered = budgets;

    if (searchTerm) {
      filtered = filtered.filter(budget =>
        budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(budget => budget.status === statusFilter);
    }

    if (costCenterFilter !== 'all') {
      filtered = filtered.filter(budget => budget.costCenterId === costCenterFilter);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getBudgetsByCostCenter = (costCenterId: string) => {
    return budgets.filter(budget => budget.costCenterId === costCenterId);
  };

  const getBudgetsByFiscalYear = (fiscalYearId: string) => {
    return budgets.filter(budget => budget.fiscalYearId === fiscalYearId);
  };

  const getTotalBudgetByStatus = (status: string) => {
    return budgets
      .filter(budget => budget.status === status)
      .reduce((total, budget) => total + budget.totalBudget, 0);
  };

  return {
    budgets,
    isLoading,
    addBudget,
    updateBudget,
    deleteBudget,
    getFilteredBudgets,
    getBudgetsByCostCenter,
    getBudgetsByFiscalYear,
    getTotalBudgetByStatus
  };
}