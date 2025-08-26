import { useState, useEffect } from 'react';
import { AccountingClassification, AccountingClassificationFormData } from '../types/accountingClassification';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Função para converter dados do Supabase para o formato da aplicação
const mapSupabaseToAccountingClassification = (data: any): AccountingClassification => ({
  id: data.id,
  name: data.name,
  code: data.code,
  type: data.type,
  description: data.description,
  isActive: data.is_active,
  companyId: data.company_id,
  createdAt: data.created_at?.split('T')[0] || '',
  updatedAt: data.updated_at?.split('T')[0] || '',
  createdBy: data.created_by
});

// Função para converter dados da aplicação para o formato do Supabase
const mapAccountingClassificationToSupabase = (classification: AccountingClassificationFormData) => ({
  name: classification.name,
  code: classification.code,
  type: classification.type,
  description: classification.description,
  is_active: classification.isActive
});

export function useAccountingClassifications() {
  const { activeCompany, user } = useAuth();
  const [accountingClassifications, setAccountingClassifications] = useState<AccountingClassification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountingClassifications = async () => {
      if (!activeCompany) {
        setAccountingClassifications([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('accounting_classifications')
          .select('*')
          .eq('company_id', activeCompany.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedClassifications = data?.map(mapSupabaseToAccountingClassification) || [];
        setAccountingClassifications(mappedClassifications);
      } catch (err) {
        console.error('Erro ao buscar classificações contábeis:', err);
        setError('Erro ao carregar classificações contábeis. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountingClassifications();
  }, [activeCompany]);

  const addAccountingClassification = async (classificationData: AccountingClassificationFormData): Promise<AccountingClassification> => {
    try {
      if (!activeCompany) {
        throw new Error('Nenhuma empresa ativa selecionada');
      }

      const supabaseData = {
        ...mapAccountingClassificationToSupabase(classificationData),
        company_id: activeCompany.id,
        created_by: user?.name || 'Usuário Atual'
      };

      const { data, error } = await supabase
        .from('accounting_classifications')
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      const newClassification = mapSupabaseToAccountingClassification(data);
      setAccountingClassifications(prev => [newClassification, ...prev]);
      
      return newClassification;
    } catch (err) {
      console.error('Erro ao adicionar classificação contábil:', err);
      setError('Erro ao adicionar classificação contábil. Por favor, tente novamente.');
      throw err;
    }
  };

  const updateAccountingClassification = async (id: string, updates: Partial<AccountingClassificationFormData>): Promise<AccountingClassification> => {
    try {
      const supabaseUpdates = mapAccountingClassificationToSupabase(updates as AccountingClassificationFormData);

      const { data, error } = await supabase
        .from('accounting_classifications')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedClassification = mapSupabaseToAccountingClassification(data);
      setAccountingClassifications(prev => 
        prev.map(classification => classification.id === id ? updatedClassification : classification)
      );
      
      return updatedClassification;
    } catch (err) {
      console.error('Erro ao atualizar classificação contábil:', err);
      setError('Erro ao atualizar classificação contábil. Por favor, tente novamente.');
      throw err;
    }
  };

  const deleteAccountingClassification = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('accounting_classifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAccountingClassifications(prev => prev.filter(classification => classification.id !== id));
    } catch (err) {
      console.error('Erro ao excluir classificação contábil:', err);
      setError('Erro ao excluir classificação contábil. Por favor, tente novamente.');
      throw err;
    }
  };

  const getAccountingClassificationById = (id: string): AccountingClassification | undefined => {
    return accountingClassifications.find(classification => classification.id === id);
  };

  const getFilteredAccountingClassifications = (
    searchTerm: string = '', 
    typeFilter: string = 'all',
    statusFilter: string = 'all'
  ): AccountingClassification[] => {
    let filtered = accountingClassifications;

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

  const getAccountingClassificationsByType = (type: 'revenue' | 'expense' | 'asset' | 'liability' | 'equity'): AccountingClassification[] => {
    return accountingClassifications.filter(classification => classification.type === type);
  };

  return {
    accountingClassifications,
    isLoading,
    error,
    addAccountingClassification,
    updateAccountingClassification,
    deleteAccountingClassification,
    getAccountingClassificationById,
    getFilteredAccountingClassifications,
    getAccountingClassificationsByType
  };
}