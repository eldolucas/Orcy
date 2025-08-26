import { useState, useEffect } from 'react';
import { Expense } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Mock data for expenses
const mockExpenses: Expense[] = [
  {
    id: '1',
    description: 'Licenças de Software Microsoft Office',
    amount: 15000,
    category: 'Licenças',
    costCenterId: '1',
    budgetId: '1',
    fiscalYearId: '1',
    date: '2024-01-15',
    createdBy: 'João Silva',
    status: 'approved',
    lastUpdated: '2024-01-16',
    approvedBy: 'Maria Santos',
    approvedAt: '2024-01-16',
    notes: 'Renovação anual das licenças corporativas'
  },
  {
    id: '2',
    description: 'Campanha Google Ads - Janeiro',
    amount: 8500,
    category: 'Publicidade Online',
    costCenterId: '21',
    budgetId: '2',
    fiscalYearId: '1',
    date: '2024-01-14',
    createdBy: 'Juliana Costa',
    status: 'approved',
    lastUpdated: '2024-01-15',
    approvedBy: 'Ricardo Pereira',
    approvedAt: '2024-01-15',
    notes: 'Campanha de lançamento do novo produto'
  },
  {
    id: '3',
    description: 'Equipamentos de TI - Notebooks',
    amount: 25000,
    category: 'Infraestrutura',
    costCenterId: '12',
    budgetId: '1',
    fiscalYearId: '1',
    date: '2024-01-13',
    createdBy: 'Ana Rodrigues',
    status: 'pending',
    lastUpdated: '2024-01-13',
    notes: '5 notebooks para equipe de desenvolvimento'
  },
  {
    id: '4',
    description: 'Treinamento Online - Certificação AWS',
    amount: 3200,
    category: 'Treinamentos',
    costCenterId: '3',
    budgetId: '3',
    fiscalYearId: '1',
    date: '2024-01-12',
    createdBy: 'Pedro Costa',
    status: 'approved',
    lastUpdated: '2024-01-13',
    approvedBy: 'João Silva',
    approvedAt: '2024-01-13',
    notes: 'Certificação para equipe de infraestrutura'
  },
  {
    id: '5',
    description: 'Material de Marketing - Impressão',
    amount: 1800,
    category: 'Marketing Tradicional',
    costCenterId: '22',
    budgetId: '2',
    fiscalYearId: '1',
    date: '2024-01-11',
    createdBy: 'Ricardo Pereira',
    status: 'rejected',
    lastUpdated: '2024-01-12',
    rejectedBy: 'Maria Santos',
    rejectedAt: '2024-01-12',
    notes: 'Orçamento excedido para material impresso'
  },
  {
    id: '6',
    description: 'Hospedagem Cloud AWS',
    amount: 4500,
    category: 'Infraestrutura',
    costCenterId: '12',
    budgetId: '1',
    fiscalYearId: '1',
    date: '2024-01-10',
    createdBy: 'Carlos Oliveira',
    status: 'approved',
    lastUpdated: '2024-01-11',
    approvedBy: 'João Silva',
    approvedAt: '2024-01-11',
    notes: 'Custos mensais de infraestrutura cloud'
  },
  {
    id: '7',
    description: 'Consultoria em Segurança',
    amount: 12000,
    category: 'Consultoria',
    costCenterId: '13',
    budgetId: '1',
    fiscalYearId: '1',
    date: '2024-01-09',
    createdBy: 'Roberto Lima',
    status: 'pending',
    lastUpdated: '2024-01-09',
    notes: 'Auditoria de segurança trimestral'
  },
  {
    id: '8',
    description: 'Ferramentas de Design - Adobe Creative',
    amount: 2400,
    category: 'Ferramentas',
    costCenterId: '23',
    budgetId: '2',
    fiscalYearId: '1',
    date: '2024-01-08',
    createdBy: 'Camila Souza',
    status: 'approved',
    lastUpdated: '2024-01-09',
    approvedBy: 'Maria Santos',
    approvedAt: '2024-01-09',
    notes: 'Licenças anuais para equipe de design'
  }
];

export function useExpenses() {
  const { activeCompany } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filtrar despesas pela empresa ativa (simulação)
      // Em uma implementação real, isso seria feito no backend
      const filteredExpenses = activeCompany 
        ? mockExpenses.filter(expense => {
            // Aqui estamos simulando que as primeiras 4 despesas pertencem à empresa 1
            // e as outras à empresa 2
            if (activeCompany.id === '1' && ['1', '2', '3', '4'].includes(expense.id)) {
              return true;
            } else if (activeCompany.id === '2' && ['5', '6', '7', '8'].includes(expense.id)) {
              return true;
            }
            return false;
          })
        : mockExpenses;
      
      setExpenses(filteredExpenses);
      setIsLoading(false);
    };

    fetchData();
  }, [activeCompany]);

  const addExpense = (newExpense: Omit<Expense, 'id' | 'createdAt' | 'lastUpdated'>) => {
    const expense: Expense = {
      ...newExpense,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    setExpenses(prev => [expense, ...prev]);
    return expense;
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === id 
          ? { 
              ...expense, 
              ...updates, 
              lastUpdated: new Date().toISOString().split('T')[0]
            }
          : expense
      )
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const approveExpense = (id: string, approvedBy: string) => {
    updateExpense(id, {
      status: 'approved',
      approvedBy,
      approvedAt: new Date().toISOString().split('T')[0]
    });
  };

  const rejectExpense = (id: string, rejectedBy: string, notes?: string) => {
    updateExpense(id, {
      status: 'rejected',
      rejectedBy,
      rejectedAt: new Date().toISOString().split('T')[0],
      notes
    });
  };

  const getFilteredExpenses = (
    searchTerm: string, 
    statusFilter: string, 
    costCenterFilter: string = 'all',
    categoryFilter: string = 'all',
    dateRange: { start?: string; end?: string } = {}
  ) => {
    let filtered = expenses;

    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(expense => expense.status === statusFilter);
    }

    if (costCenterFilter !== 'all') {
      filtered = filtered.filter(expense => expense.costCenterId === costCenterFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }

    if (dateRange.start) {
      filtered = filtered.filter(expense => expense.date >= dateRange.start!);
    }

    if (dateRange.end) {
      filtered = filtered.filter(expense => expense.date <= dateRange.end!);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getExpensesByCostCenter = (costCenterId: string) => {
    return expenses.filter(expense => expense.costCenterId === costCenterId);
  };

  const getExpensesByBudget = (budgetId: string) => {
    return expenses.filter(expense => expense.budgetId === budgetId);
  };

  const getExpensesByCategory = (category: string) => {
    return expenses.filter(expense => expense.category === category);
  };

  const getTotalExpensesByStatus = (status: string) => {
    return expenses
      .filter(expense => expense.status === status)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getExpenseCategories = () => {
    const categories = [...new Set(expenses.map(expense => expense.category))];
    return categories.sort();
  };

  const getMonthlyExpenses = (year: number, month: number) => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === year && expenseDate.getMonth() === month - 1;
    });
  };

  return {
    expenses,
    isLoading,
    addExpense,
    updateExpense,
    deleteExpense,
    approveExpense,
    rejectExpense,
    getFilteredExpenses,
    getExpensesByCostCenter,
    getExpensesByBudget,
    getExpensesByCategory,
    getTotalExpensesByStatus,
    getExpenseCategories,
    getMonthlyExpenses
  };
}