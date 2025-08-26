import { useState, useEffect } from 'react';
import { FinancialYear, FinancialYearFormData } from '../types/financialYear';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Função para converter dados do Supabase para o formato da aplicação
const mapSupabaseToFinancialYear = (data: any): FinancialYear => ({
  id: data.id,
  year: data.year,
  name: data.name,
  startDate: data.start_date,
  endDate: data.end_date,
  status: data.status,
  description: data.description,
  isDefault: data.is_default,
  createdBy: data.created_by,
  createdAt: data.created_at?.split('T')[0] || '',
  closedAt: data.closed_at?.split('T')[0],
  budgetVersion: data.budget_version,
  totalBudget: data.total_budget ? parseFloat(data.total_budget) : undefined,
  totalSpent: data.total_spent ? parseFloat(data.total_spent) : undefined,
  companyId: data.company_id
});

// Função para converter dados da aplicação para o formato do Supabase
const mapFinancialYearToSupabase = (financialYear: FinancialYearFormData) => ({
  year: financialYear.year,
  name: financialYear.name,
  start_date: financialYear.startDate,
  end_date: financialYear.endDate,
  status: financialYear.status,
  description: financialYear.description,
  is_default: financialYear.isDefault
});

export function useFinancialYears() {
  const { activeCompany, user } = useAuth();
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFinancialYears = async () => {
      if (!activeCompany) {
        setFinancialYears([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('financial_years')
          .select('*')
          .eq('company_id', activeCompany.id)
          .order('year', { ascending: false });

        if (error) throw error;

        const mappedFinancialYears = data?.map(mapSupabaseToFinancialYear) || [];
        setFinancialYears(mappedFinancialYears);
      } catch (err) {
        console.error('Erro ao buscar exercícios financeiros:', err);
        setError('Erro ao carregar exercícios financeiros. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancialYears();
  }, [activeCompany]);

  const addFinancialYear = async (newFinancialYear: FinancialYearFormData): Promise<FinancialYear> => {
    try {
      if (!activeCompany) {
        throw new Error('Nenhuma empresa ativa selecionada');
      }
      
      // Check if a financial year with the same year already exists for this company
      const existingYear = financialYears.find(
        year => year.year === newFinancialYear.year
      );
      
      if (existingYear) {
        throw new Error(`Já existe um exercício financeiro para o ano ${newFinancialYear.year}`);
      }
      
      // If setting as default, update other years first
      if (newFinancialYear.isDefault) {
        const { error: updateError } = await supabase
          .from('financial_years')
          .update({ is_default: false })
          .eq('company_id', activeCompany.id);
        
        if (updateError) throw updateError;
      }

      const supabaseData = {
        ...mapFinancialYearToSupabase(newFinancialYear),
        company_id: activeCompany.id,
        created_by: user?.name || 'Usuário Atual',
        budget_version: 1,
        total_budget: 0,
        total_spent: 0
      };

      const { data, error } = await supabase
        .from('financial_years')
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      const newYear = mapSupabaseToFinancialYear(data);
      
      // Update local state
      if (newFinancialYear.isDefault) {
        setFinancialYears(prev => 
          prev.map(year => ({ ...year, isDefault: false }))
        );
      }
      
      setFinancialYears(prev => [newYear, ...prev]);
      return newYear;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar exercício financeiro';
      setError(errorMessage);
      console.error('Erro ao adicionar exercício financeiro:', err);
      throw err;
    }
  };

  const updateFinancialYear = async (id: string, updates: Partial<FinancialYearFormData>): Promise<FinancialYear> => {
    try {
      if (!activeCompany) {
        throw new Error('Nenhuma empresa ativa selecionada');
      }
      
      // If setting as default, update other years first
      if (updates.isDefault) {
        const { error: updateError } = await supabase
          .from('financial_years')
          .update({ is_default: false })
          .eq('company_id', activeCompany.id)
          .neq('id', id);
        
        if (updateError) throw updateError;
      }

      const supabaseUpdates = mapFinancialYearToSupabase(updates as FinancialYearFormData);

      const { data, error } = await supabase
        .from('financial_years')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedYear = mapSupabaseToFinancialYear(data);
      
      // Update local state
      if (updates.isDefault) {
        setFinancialYears(prev => 
          prev.map(year => 
            year.id === id 
              ? updatedYear
              : { ...year, isDefault: false }
          )
        );
      } else {
        setFinancialYears(prev => 
          prev.map(year => year.id === id ? updatedYear : year)
        );
      }
      
      return updatedYear;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar exercício financeiro';
      setError(errorMessage);
      console.error('Erro ao atualizar exercício financeiro:', err);
      throw err;
    }
  };

  const deleteFinancialYear = async (id: string): Promise<void> => {
    try {
      // Check if it's the default year
      const yearToDelete = financialYears.find(year => year.id === id);
      
      if (yearToDelete?.isDefault) {
        throw new Error('Não é possível excluir o exercício financeiro padrão');
      }
      
      // Check if it has budgets or transactions
      if (yearToDelete?.totalBudget && yearToDelete.totalBudget > 0) {
        throw new Error('Não é possível excluir um exercício financeiro com orçamentos associados');
      }

      const { error } = await supabase
        .from('financial_years')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFinancialYears(prev => prev.filter(year => year.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir exercício financeiro';
      setError(errorMessage);
      console.error('Erro ao excluir exercício financeiro:', err);
      throw err;
    }
  };

  const setDefaultFinancialYear = async (id: string): Promise<void> => {
    try {
      if (!activeCompany) {
        throw new Error('Nenhuma empresa ativa selecionada');
      }
      
      // Update all years to not be default
      const { error: updateError } = await supabase
        .from('financial_years')
        .update({ is_default: false })
        .eq('company_id', activeCompany.id);
      
      if (updateError) throw updateError;
      
      // Set the selected year as default
      const { error: setDefaultError } = await supabase
        .from('financial_years')
        .update({ is_default: true })
        .eq('id', id);
      
      if (setDefaultError) throw setDefaultError;
      
      // Update local state
      setFinancialYears(prev => 
        prev.map(year => ({
          ...year,
          isDefault: year.id === id
        }))
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao definir exercício financeiro padrão';
      setError(errorMessage);
      console.error('Erro ao definir exercício financeiro padrão:', err);
      throw err;
    }
  };

  const getFilteredFinancialYears = (searchTerm: string = '', statusFilter: string = 'all'): FinancialYear[] => {
    let filtered = financialYears;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(year => 
        year.name.toLowerCase().includes(term) ||
        year.year.toString().includes(term) ||
        year.description?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(year => year.status === statusFilter);
    }

    return filtered.sort((a, b) => b.year - a.year);
  };

  const getActiveFiscalYear = (): FinancialYear | undefined => {
    if (!activeCompany) return undefined;
    
    return financialYears.find(
      year => year.isDefault
    ) || financialYears.find(
      year => year.status === 'active'
    );
  };

  const closeFinancialYear = async (id: string): Promise<FinancialYear> => {
    try {
      const { data, error } = await supabase
        .from('financial_years')
        .update({ 
          status: 'closed',
          closed_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const closedYear = mapSupabaseToFinancialYear(data);
      
      setFinancialYears(prev => 
        prev.map(year => year.id === id ? closedYear : year)
      );
      
      return closedYear;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao encerrar exercício financeiro';
      setError(errorMessage);
      console.error('Erro ao encerrar exercício financeiro:', err);
      throw err;
    }
  };

  const archiveFinancialYear = async (id: string): Promise<FinancialYear> => {
    try {
      const yearToArchive = financialYears.find(year => year.id === id);
      
      if (yearToArchive?.status !== 'closed') {
        throw new Error('Apenas exercícios encerrados podem ser arquivados');
      }

      const { data, error } = await supabase
        .from('financial_years')
        .update({ status: 'archived' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const archivedYear = mapSupabaseToFinancialYear(data);
      
      setFinancialYears(prev => 
        prev.map(year => year.id === id ? archivedYear : year)
      );
      
      return archivedYear;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao arquivar exercício financeiro';
      setError(errorMessage);
      console.error('Erro ao arquivar exercício financeiro:', err);
      throw err;
    }
  };

  return {
    financialYears,
    isLoading,
    error,
    addFinancialYear,
    updateFinancialYear,
    deleteFinancialYear,
    setDefaultFinancialYear,
    getFilteredFinancialYears,
    getActiveFiscalYear,
    closeFinancialYear,
    archiveFinancialYear
  };
}