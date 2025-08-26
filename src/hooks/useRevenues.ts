import { useState, useEffect } from 'react';
import { Revenue } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Função para converter dados do Supabase para o formato da aplicação
const mapSupabaseToRevenue = (data: any): Revenue => ({
  id: data.id,
  description: data.description,
  amount: parseFloat(data.amount) || 0,
  source: data.source,
  costCenterId: data.cost_center_id,
  budgetId: data.budget_id,
  fiscalYearId: data.fiscal_year_id,
  date: data.date,
  createdBy: data.created_by,
  status: data.status,
  lastUpdated: data.last_updated?.split('T')[0] || data.created_at?.split('T')[0] || '',
  confirmedBy: data.confirmed_by,
  confirmedAt: data.confirmed_at?.split('T')[0],
  cancelledBy: data.cancelled_by,
  cancelledAt: data.cancelled_at?.split('T')[0],
  notes: data.notes,
  attachments: data.attachments,
  recurrenceType: data.recurrence_type,
  nextRecurrenceDate: data.next_recurrence_date
});

// Função para converter dados da aplicação para o formato do Supabase
const mapRevenueToSupabase = (revenue: Omit<Revenue, 'id' | 'lastUpdated'>) => ({
  description: revenue.description,
  amount: revenue.amount,
  source: revenue.source,
  cost_center_id: revenue.costCenterId,
  budget_id: revenue.budgetId,
  fiscal_year_id: revenue.fiscalYearId,
  date: revenue.date,
  created_by: revenue.createdBy,
  status: revenue.status,
  notes: revenue.notes,
  attachments: revenue.attachments,
  recurrence_type: revenue.recurrenceType,
  next_recurrence_date: revenue.nextRecurrenceDate
});

export function useRevenues() {
  const { activeCompany, user } = useAuth();
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRevenues = async () => {
      if (!activeCompany) {
        setRevenues([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('revenues')
          .select('*')
          .eq('company_id', activeCompany.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedRevenues = data?.map(mapSupabaseToRevenue) || [];
        setRevenues(mappedRevenues);
      } catch (err) {
        console.error('Erro ao buscar receitas:', err);
        setError('Erro ao carregar receitas. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevenues();
  }, [activeCompany]);

  const addRevenue = async (newRevenue: Omit<Revenue, 'id' | 'lastUpdated'>): Promise<Revenue> => {
    try {
      if (!activeCompany) {
        throw new Error('Nenhuma empresa ativa selecionada');
      }

      const supabaseData = {
        ...mapRevenueToSupabase(newRevenue),
        company_id: activeCompany.id
      };

      const { data, error } = await supabase
        .from('revenues')
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      const revenue = mapSupabaseToRevenue(data);
      setRevenues(prev => [revenue, ...prev]);
      
      return revenue;
    } catch (err) {
      console.error('Erro ao adicionar receita:', err);
      setError('Erro ao adicionar receita. Por favor, tente novamente.');
      throw err;
    }
  };

  const updateRevenue = async (id: string, updates: Partial<Revenue>): Promise<Revenue> => {
    try {
      // Converte os campos de volta para o formato do Supabase
      const supabaseUpdates: any = {};
      
      if (updates.description !== undefined) supabaseUpdates.description = updates.description;
      if (updates.amount !== undefined) supabaseUpdates.amount = updates.amount;
      if (updates.source !== undefined) supabaseUpdates.source = updates.source;
      if (updates.costCenterId !== undefined) supabaseUpdates.cost_center_id = updates.costCenterId;
      if (updates.budgetId !== undefined) supabaseUpdates.budget_id = updates.budgetId;
      if (updates.fiscalYearId !== undefined) supabaseUpdates.fiscal_year_id = updates.fiscalYearId;
      if (updates.date !== undefined) supabaseUpdates.date = updates.date;
      if (updates.status !== undefined) supabaseUpdates.status = updates.status;
      if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;
      if (updates.attachments !== undefined) supabaseUpdates.attachments = updates.attachments;
      if (updates.confirmedBy !== undefined) supabaseUpdates.confirmed_by = updates.confirmedBy;
      if (updates.confirmedAt !== undefined) supabaseUpdates.confirmed_at = updates.confirmedAt;
      if (updates.cancelledBy !== undefined) supabaseUpdates.cancelled_by = updates.cancelledBy;
      if (updates.cancelledAt !== undefined) supabaseUpdates.cancelled_at = updates.cancelledAt;
      if (updates.recurrenceType !== undefined) supabaseUpdates.recurrence_type = updates.recurrenceType;
      if (updates.nextRecurrenceDate !== undefined) supabaseUpdates.next_recurrence_date = updates.nextRecurrenceDate;

      const { data, error } = await supabase
        .from('revenues')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedRevenue = mapSupabaseToRevenue(data);
      setRevenues(prev => 
        prev.map(revenue => revenue.id === id ? updatedRevenue : revenue)
      );
      
      return updatedRevenue;
    } catch (err) {
      console.error('Erro ao atualizar receita:', err);
      setError('Erro ao atualizar receita. Por favor, tente novamente.');
      throw err;
    }
  };

  const deleteRevenue = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('revenues')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRevenues(prev => prev.filter(revenue => revenue.id !== id));
    } catch (err) {
      console.error('Erro ao excluir receita:', err);
      setError('Erro ao excluir receita. Por favor, tente novamente.');
      throw err;
    }
  };

  const confirmRevenue = async (id: string, confirmedBy: string): Promise<void> => {
    try {
      await updateRevenue(id, {
        status: 'confirmed',
        confirmedBy,
        confirmedAt: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Erro ao confirmar receita:', err);
      throw err;
    }
  };

  const cancelRevenue = async (id: string, cancelledBy: string, notes?: string): Promise<void> => {
    try {
      await updateRevenue(id, {
        status: 'cancelled',
        cancelledBy,
        cancelledAt: new Date().toISOString().split('T')[0],
        notes
      });
    } catch (err) {
      console.error('Erro ao cancelar receita:', err);
      throw err;
    }
  };

  const getFilteredRevenues = (
    searchTerm: string = '', 
    statusFilter: string = 'all', 
    costCenterFilter: string = 'all',
    sourceFilter: string = 'all',
    dateRange: { start?: string; end?: string } = {}
  ): Revenue[] => {
    let filtered = revenues;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(revenue =>
        revenue.description.toLowerCase().includes(term) ||
        revenue.createdBy.toLowerCase().includes(term) ||
        revenue.source.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(revenue => revenue.status === statusFilter);
    }

    if (costCenterFilter !== 'all') {
      filtered = filtered.filter(revenue => revenue.costCenterId === costCenterFilter);
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(revenue => revenue.source === sourceFilter);
    }

    if (dateRange.start) {
      filtered = filtered.filter(revenue => revenue.date >= dateRange.start!);
    }

    if (dateRange.end) {
      filtered = filtered.filter(revenue => revenue.date <= dateRange.end!);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getRevenuesByCostCenter = (costCenterId: string): Revenue[] => {
    return revenues.filter(revenue => revenue.costCenterId === costCenterId);
  };

  const getRevenuesByBudget = (budgetId: string): Revenue[] => {
    return revenues.filter(revenue => revenue.budgetId === budgetId);
  };

  const getRevenuesBySource = (source: string): Revenue[] => {
    return revenues.filter(revenue => revenue.source === source);
  };

  const getTotalRevenuesByStatus = (status: string): number => {
    return revenues
      .filter(revenue => revenue.status === status)
      .reduce((total, revenue) => total + revenue.amount, 0);
  };

  const getRevenueSources = (): string[] => {
    const sources = [...new Set(revenues.map(revenue => revenue.source))];
    return sources.sort();
  };

  const getMonthlyRevenues = (year: number, month: number): Revenue[] => {
    return revenues.filter(revenue => {
      const revenueDate = new Date(revenue.date);
      return revenueDate.getFullYear() === year && revenueDate.getMonth() === month - 1;
    });
  };

  const getRecurringRevenues = (): Revenue[] => {
    return revenues.filter(revenue => 
      revenue.recurrenceType && revenue.recurrenceType !== 'none'
    );
  };

  return {
    revenues,
    isLoading,
    error,
    addRevenue,
    updateRevenue,
    deleteRevenue,
    confirmRevenue,
    cancelRevenue,
    getFilteredRevenues,
    getRevenuesByCostCenter,
    getRevenuesByBudget,
    getRevenuesBySource,
    getTotalRevenuesByStatus,
    getRevenueSources,
    getMonthlyRevenues,
    getRecurringRevenues
  };
}