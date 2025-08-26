import { useState, useEffect } from 'react';
import { Expense } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Função para converter dados do Supabase para o formato da aplicação
const mapSupabaseToExpense = (data: any): Expense => ({
  id: data.id,
  description: data.description,
  amount: parseFloat(data.amount) || 0,
  category: data.category,
  costCenterId: data.cost_center_id,
  budgetId: data.budget_id,
  fiscalYearId: data.fiscal_year_id,
  date: data.date,
  createdBy: data.created_by,
  status: data.status,
  lastUpdated: data.last_updated?.split('T')[0] || data.created_at?.split('T')[0] || '',
  approvedBy: data.approved_by,
  approvedAt: data.approved_at?.split('T')[0],
  rejectedBy: data.rejected_by,
  rejectedAt: data.rejected_at?.split('T')[0],
  notes: data.notes,
  attachments: data.attachments
});

// Função para converter dados da aplicação para o formato do Supabase
const mapExpenseToSupabase = (expense: Omit<Expense, 'id' | 'lastUpdated'>) => ({
  description: expense.description,
  amount: expense.amount,
  category: expense.category,
  cost_center_id: expense.costCenterId,
  budget_id: expense.budgetId,
  fiscal_year_id: expense.fiscalYearId,
  date: expense.date,
  created_by: expense.createdBy,
  status: expense.status,
  notes: expense.notes,
  attachments: expense.attachments
});

export function useExpenses() {
  const { activeCompany, user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!activeCompany) {
        setExpenses([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('company_id', activeCompany.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedExpenses = data?.map(mapSupabaseToExpense) || [];
        setExpenses(mappedExpenses);
      } catch (err) {
        console.error('Erro ao buscar despesas:', err);
        setError('Erro ao carregar despesas. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [activeCompany]);

  const addExpense = async (newExpense: Omit<Expense, 'id' | 'lastUpdated'>): Promise<Expense> => {
    try {
      if (!activeCompany) {
        throw new Error('Nenhuma empresa ativa selecionada');
      }

      const supabaseData = {
        ...mapExpenseToSupabase(newExpense),
        company_id: activeCompany.id
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      const expense = mapSupabaseToExpense(data);
      setExpenses(prev => [expense, ...prev]);
      
      return expense;
    } catch (err) {
      console.error('Erro ao adicionar despesa:', err);
      setError('Erro ao adicionar despesa. Por favor, tente novamente.');
      throw err;
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>): Promise<Expense> => {
    try {
      // Converte os campos de volta para o formato do Supabase
      const supabaseUpdates: any = {};
      
      if (updates.description !== undefined) supabaseUpdates.description = updates.description;
      if (updates.amount !== undefined) supabaseUpdates.amount = updates.amount;
      if (updates.category !== undefined) supabaseUpdates.category = updates.category;
      if (updates.costCenterId !== undefined) supabaseUpdates.cost_center_id = updates.costCenterId;
      if (updates.budgetId !== undefined) supabaseUpdates.budget_id = updates.budgetId;
      if (updates.fiscalYearId !== undefined) supabaseUpdates.fiscal_year_id = updates.fiscalYearId;
      if (updates.date !== undefined) supabaseUpdates.date = updates.date;
      if (updates.status !== undefined) supabaseUpdates.status = updates.status;
      if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;
      if (updates.attachments !== undefined) supabaseUpdates.attachments = updates.attachments;
      if (updates.approvedBy !== undefined) supabaseUpdates.approved_by = updates.approvedBy;
      if (updates.approvedAt !== undefined) supabaseUpdates.approved_at = updates.approvedAt;
      if (updates.rejectedBy !== undefined) supabaseUpdates.rejected_by = updates.rejectedBy;
      if (updates.rejectedAt !== undefined) supabaseUpdates.rejected_at = updates.rejectedAt;

      const { data, error } = await supabase
        .from('expenses')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedExpense = mapSupabaseToExpense(data);
      setExpenses(prev => 
        prev.map(expense => expense.id === id ? updatedExpense : expense)
      );
      
      return updatedExpense;
    } catch (err) {
      console.error('Erro ao atualizar despesa:', err);
      setError('Erro ao atualizar despesa. Por favor, tente novamente.');
      throw err;
    }
  };

  const deleteExpense = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setExpenses(prev => prev.filter(expense => expense.id !== id));
    } catch (err) {
      console.error('Erro ao excluir despesa:', err);
      setError('Erro ao excluir despesa. Por favor, tente novamente.');
      throw err;
    }
  };

  const approveExpense = async (id: string, approvedBy: string): Promise<void> => {
    try {
      await updateExpense(id, {
        status: 'approved',
        approvedBy,
        approvedAt: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Erro ao aprovar despesa:', err);
      throw err;
    }
  };

  const rejectExpense = async (id: string, rejectedBy: string, notes?: string): Promise<void> => {
    try {
      await updateExpense(id, {
        status: 'rejected',
        rejectedBy,
        rejectedAt: new Date().toISOString().split('T')[0],
        notes
      });
    } catch (err) {
      console.error('Erro ao rejeitar despesa:', err);
      throw err;
    }
  };

  const getFilteredExpenses = (
    searchTerm: string = '', 
    statusFilter: string = 'all', 
    costCenterFilter: string = 'all',
    categoryFilter: string = 'all',
    dateRange: { start?: string; end?: string } = {}
  ): Expense[] => {
    let filtered = expenses;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(term) ||
        expense.createdBy.toLowerCase().includes(term) ||
        expense.category.toLowerCase().includes(term)
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

  const getExpensesByCostCenter = (costCenterId: string): Expense[] => {
    return expenses.filter(expense => expense.costCenterId === costCenterId);
  };

  const getExpensesByBudget = (budgetId: string): Expense[] => {
    return expenses.filter(expense => expense.budgetId === budgetId);
  };

  const getExpensesByCategory = (category: string): Expense[] => {
    return expenses.filter(expense => expense.category === category);
  };

  const getTotalExpensesByStatus = (status: string): number => {
    return expenses
      .filter(expense => expense.status === status)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getExpenseCategories = (): string[] => {
    const categories = [...new Set(expenses.map(expense => expense.category))];
    return categories.sort();
  };

  const getMonthlyExpenses = (year: number, month: number): Expense[] => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === year && expenseDate.getMonth() === month - 1;
    });
  };

  return {
    expenses,
    isLoading,
    error,
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