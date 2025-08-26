import { useState, useEffect } from 'react';
import { ExpenseClassification, ExpenseClassificationFormData } from '../types/expenseClassification';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Função para converter dados do Supabase para o formato da aplicação
const mapSupabaseToExpenseClassification = (data: any): ExpenseClassification => ({
  id: data.id,
  name: data.name,
  type: data.type,
  code: data.code,
  description: data.description,
  isActive: data.is_active,
  companyId: data.company_id,
  createdAt: data.created_at?.split('T')[0] || '',
  updatedAt: data.updated_at?.split('T')[0] || '',
  createdBy: data.created_by
});

// Função para converter dados da aplicação para o formato do Supabase
const mapExpenseClassificationToSupabase = (classification: ExpenseClassificationFormData) => ({
  name: classification.name,
  type: classification.type,
  code: classification.code,
  description: classification.description,
  is_active: classification.isActive
});

export function useExpenseClassifications() {
  const { activeCompany, user } = useAuth();
  const [expenseClassifications, setExpenseClassifications] = useState<ExpenseClassification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpenseClassifications = async () => {
      if (!activeCompany) {
        setExpenseClassifications([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('expense_classifications')
          .select('*')
          .eq('company_id', activeCompany.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedClassifications = data?.map(mapSupabaseToExpenseClassification) || [];
        setExpenseClassifications(mappedClassifications);
      } catch (err) {
        console.error('Erro ao buscar classificações de gastos:', err);
        setError('Erro ao carregar classificações de gastos. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenseClassifications();
  }, [activeCompany]);

  const addExpenseClassification = async (classificationData: ExpenseClassificationFormData): Promise<ExpenseClassification> => {
    try {
      if (!activeCompany) {
        throw new Error('Nenhuma empresa ativa selecionada');
      }

      const supabaseData = {
        ...mapExpenseClassificationToSupabase(classificationData),
        company_id: activeCompany.id,
        created_by: user?.name || 'Usuário Atual'
      };

      const { data, error } = await supabase
        .from('expense_classifications')
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      const newClassification = mapSupabaseToExpenseClassification(data);
      setExpenseClassifications(prev => [newClassification, ...prev]);
      
      return newClassification;
    } catch (err) {
      console.error('Erro ao adicionar classificação de gasto:', err);
      setError('Erro ao adicionar classificação de gasto. Por favor, tente novamente.');
      throw err;
    }
  };

  const updateExpenseClassification = async (id: string, updates: Partial<ExpenseClassificationFormData>): Promise<ExpenseClassification> => {
    try {
      const supabaseUpdates = mapExpenseClassificationToSupabase(updates as ExpenseClassificationFormData);

      const { data, error } = await supabase
        .from('expense_classifications')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedClassification = mapSupabaseToExpenseClassification(data);
      setExpenseClassifications(prev => 
        prev.map(classification => classification.id === id ? updatedClassification : classification)
      );
      
      return updatedClassification;
    } catch (err) {
      console.error('Erro ao atualizar classificação de gasto:', err);
      setError('Erro ao atualizar classificação de gasto. Por favor, tente novamente.');
      throw err;
    }
  };

  const deleteExpenseClassification = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('expense_classifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setExpenseClassifications(prev => prev.filter(classification => classification.id !== id));
    } catch (err) {
      console.error('Erro ao excluir classificação de gasto:', err);
      setError('Erro ao excluir classificação de gasto. Por favor, tente novamente.');
      throw err;
    }
  };

  const getExpenseClassificationById = (id: string): ExpenseClassification | undefined => {
    return expenseClassifications.find(classification => classification.id === id);
  };

  const getFilteredExpenseClassifications = (
    searchTerm: string = '', 
    typeFilter: string = 'all',
    statusFilter: string = 'all'
  ): ExpenseClassification[] => {
    let filtered = expenseClassifications;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(classification => 
        classification.name.toLowerCase().includes(term) ||
        classification.code.toLowerCase().includes(term) ||
        classification.description.toLowerCase().includes(term)
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(classification => classification.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(classification => classification.isActive === isActive);
    }

    return filtered;
  };

  const getExpenseClassificationsByType = (type: 'variable_cost' | 'fixed_cost' | 'expense'): ExpenseClassification[] => {
    return expenseClassifications.filter(classification => classification.type === type);
  };

  return {
    expenseClassifications,
    isLoading,
    error,
    addExpenseClassification,
    updateExpenseClassification,
    deleteExpenseClassification,
    getExpenseClassificationById,
    getFilteredExpenseClassifications,
    getExpenseClassificationsByType
  };
}