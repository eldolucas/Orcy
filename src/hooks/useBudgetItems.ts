import { useState, useEffect } from 'react';
import { BudgetItem, BudgetItemFormData } from '../types/budgetItem';
import { useAuth } from '../contexts/AuthContext';

// Mock data for budget items
const mockBudgetItems: BudgetItem[] = [
  {
    id: '1',
    companyId: '1',
    financialYearId: '1',
    budgetRevisionId: '1',
    accountingClassificationId: '1',
    costCenterId: '1',
    name: 'Receita de Vendas',
    description: 'Receita proveniente de vendas de produtos e serviços',
    budgetedAmount: 500000,
    type: 'revenue',
    createdBy: 'João Silva',
    createdAt: '2024-03-15',
    updatedAt: '2024-03-15'
  },
  {
    id: '2',
    companyId: '1',
    financialYearId: '1',
    budgetRevisionId: '1',
    accountingClassificationId: '2',
    costCenterId: '1',
    name: 'Despesas Administrativas',
    description: 'Despesas gerais de administração',
    budgetedAmount: 120000,
    type: 'expense',
    createdBy: 'Maria Santos',
    createdAt: '2024-03-15',
    updatedAt: '2024-03-15'
  },
  {
    id: '3',
    companyId: '1',
    financialYearId: '1',
    budgetRevisionId: '2',
    accountingClassificationId: '1',
    costCenterId: '2',
    name: 'Receita de Serviços',
    description: 'Receita proveniente de prestação de serviços',
    budgetedAmount: 300000,
    type: 'revenue',
    createdBy: 'Pedro Costa',
    createdAt: '2024-06-20',
    updatedAt: '2024-06-20'
  },
  {
    id: '4',
    companyId: '1',
    financialYearId: '1',
    budgetRevisionId: '2',
    accountingClassificationId: '2',
    costCenterId: '2',
    name: 'Despesas de Marketing',
    description: 'Despesas com campanhas de marketing',
    budgetedAmount: 80000,
    type: 'expense',
    createdBy: 'Ana Rodrigues',
    createdAt: '2024-06-20',
    updatedAt: '2024-06-20'
  },
  {
    id: '5',
    companyId: '2',
    financialYearId: '5',
    budgetRevisionId: '4',
    accountingClassificationId: '4',
    costCenterId: '21',
    name: 'Despesas com Pessoal',
    description: 'Salários e benefícios',
    budgetedAmount: 250000,
    type: 'expense',
    createdBy: 'Carlos Oliveira',
    createdAt: '2024-02-10',
    updatedAt: '2024-02-10'
  },
  {
    id: '6',
    companyId: '2',
    financialYearId: '5',
    budgetRevisionId: '4',
    accountingClassificationId: '5',
    costCenterId: '21',
    name: 'Receita de Consultoria',
    description: 'Receita de serviços de consultoria',
    budgetedAmount: 350000,
    type: 'revenue',
    createdBy: 'Roberto Lima',
    createdAt: '2024-02-10',
    updatedAt: '2024-02-10'
  }
];

export function useBudgetItems() {
  const { activeCompany } = useAuth();
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Filter budget items by active company
        const filteredItems = activeCompany 
          ? mockBudgetItems.filter(item => item.companyId === activeCompany.id)
          : mockBudgetItems;
        
        setBudgetItems(filteredItems);
      } catch (err) {
        setError('Erro ao carregar itens orçamentários. Por favor, tente novamente.');
        console.error('Erro ao buscar itens orçamentários:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeCompany]);

  const addBudgetItem = async (itemData: BudgetItemFormData): Promise<BudgetItem> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!activeCompany) {
        throw new Error('Nenhuma empresa ativa selecionada');
      }
      
      const newItem: BudgetItem = {
        id: Date.now().toString(),
        companyId: activeCompany.id,
        ...itemData,
        createdBy: 'Usuário Atual', // In a real app, this would come from auth context
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      
      setBudgetItems(prev => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar item orçamentário';
      setError(errorMessage);
      console.error('Erro ao adicionar item orçamentário:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBudgetItem = async (id: string, updates: Partial<BudgetItemFormData>): Promise<BudgetItem> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let updatedItem: BudgetItem | undefined;
      
      setBudgetItems(prev => 
        prev.map(item => {
          if (item.id === id) {
            updatedItem = {
              ...item,
              ...updates,
              updatedAt: new Date().toISOString().split('T')[0]
            };
            return updatedItem;
          }
          return item;
        })
      );
      
      if (!updatedItem) {
        throw new Error('Item orçamentário não encontrado');
      }
      
      return updatedItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar item orçamentário';
      setError(errorMessage);
      console.error('Erro ao atualizar item orçamentário:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBudgetItem = async (id: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setBudgetItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir item orçamentário';
      setError(errorMessage);
      console.error('Erro ao excluir item orçamentário:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredBudgetItems = (
    financialYearId: string = 'all',
    budgetRevisionId: string = 'all',
    accountingClassificationId: string = 'all',
    costCenterId: string = 'all',
    type: string = 'all',
    searchTerm: string = ''
  ): BudgetItem[] => {
    let filtered = budgetItems;

    if (financialYearId !== 'all') {
      filtered = filtered.filter(item => item.financialYearId === financialYearId);
    }

    if (budgetRevisionId !== 'all') {
      filtered = filtered.filter(item => item.budgetRevisionId === budgetRevisionId);
    }

    if (accountingClassificationId !== 'all') {
      filtered = filtered.filter(item => item.accountingClassificationId === accountingClassificationId);
    }

    if (costCenterId !== 'all') {
      filtered = filtered.filter(item => item.costCenterId === costCenterId);
    }

    if (type !== 'all') {
      filtered = filtered.filter(item => item.type === type);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term))
      );
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getBudgetItemsByFinancialYear = (financialYearId: string): BudgetItem[] => {
    return budgetItems.filter(item => item.financialYearId === financialYearId);
  };

  const getBudgetItemsByRevision = (revisionId: string): BudgetItem[] => {
    return budgetItems.filter(item => item.budgetRevisionId === revisionId);
  };

  const getTotalBudgetedByType = (type: 'revenue' | 'expense'): number => {
    return budgetItems
      .filter(item => item.type === type)
      .reduce((sum, item) => sum + item.budgetedAmount, 0);
  };

  const getTotalBudgetedByFinancialYear = (financialYearId: string, type?: 'revenue' | 'expense'): number => {
    let items = budgetItems.filter(item => item.financialYearId === financialYearId);
    
    if (type) {
      items = items.filter(item => item.type === type);
    }
    
    return items.reduce((sum, item) => sum + item.budgetedAmount, 0);
  };

  const getTotalBudgetedByRevision = (revisionId: string, type?: 'revenue' | 'expense'): number => {
    let items = budgetItems.filter(item => item.budgetRevisionId === revisionId);
    
    if (type) {
      items = items.filter(item => item.type === type);
    }
    
    return items.reduce((sum, item) => sum + item.budgetedAmount, 0);
  };

  return {
    budgetItems,
    isLoading,
    error,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    getFilteredBudgetItems,
    getBudgetItemsByFinancialYear,
    getBudgetItemsByRevision,
    getTotalBudgetedByType,
    getTotalBudgetedByFinancialYear,
    getTotalBudgetedByRevision
  };
}