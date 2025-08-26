import { useState, useEffect } from 'react';
import { Contract, ContractFormData } from '../types/contract';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Função para converter dados do Supabase para o formato da aplicação
const mapSupabaseToContract = (data: any): Contract => ({
  id: data.id,
  name: data.name,
  description: data.description,
  contractNumber: data.contract_number,
  contractType: data.contract_type,
  startDate: data.start_date,
  endDate: data.end_date,
  value: parseFloat(data.value) || 0,
  currency: data.currency,
  recurrenceType: data.recurrence_type,
  nextPaymentDate: data.next_payment_date,
  partnerName: data.partner_name,
  costCenterId: data.cost_center_id,
  fiscalYearId: data.fiscal_year_id,
  status: data.status,
  attachments: data.attachments,
  notes: data.notes,
  companyId: data.company_id,
  createdAt: data.created_at?.split('T')[0] || '',
  updatedAt: data.updated_at?.split('T')[0] || '',
  createdBy: data.created_by
});

// Função para converter dados da aplicação para o formato do Supabase
const mapContractToSupabase = (contract: ContractFormData) => ({
  name: contract.name,
  description: contract.description,
  contract_number: contract.contractNumber,
  contract_type: contract.contractType,
  start_date: contract.startDate,
  end_date: contract.endDate,
  value: contract.value,
  currency: contract.currency,
  recurrence_type: contract.recurrenceType,
  next_payment_date: contract.nextPaymentDate,
  partner_name: contract.partnerName,
  cost_center_id: contract.costCenterId,
  fiscal_year_id: contract.fiscalYearId,
  status: contract.status,
  notes: contract.notes
});

export function useContracts() {
  const { activeCompany, user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContracts = async () => {
      if (!activeCompany) {
        setContracts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('contracts')
          .select('*')
          .eq('company_id', activeCompany.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedContracts = data?.map(mapSupabaseToContract) || [];
        setContracts(mappedContracts);
      } catch (err) {
        console.error('Erro ao buscar contratos:', err);
        setError('Erro ao carregar contratos. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContracts();
  }, [activeCompany]);

  const addContract = async (contractData: ContractFormData): Promise<Contract> => {
    try {
      if (!activeCompany) {
        throw new Error('Nenhuma empresa ativa selecionada');
      }

      const supabaseData = {
        ...mapContractToSupabase(contractData),
        company_id: activeCompany.id,
        created_by: user?.name || 'Usuário Atual'
      };

      const { data, error } = await supabase
        .from('contracts')
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      const newContract = mapSupabaseToContract(data);
      setContracts(prev => [newContract, ...prev]);
      
      return newContract;
    } catch (err) {
      console.error('Erro ao adicionar contrato:', err);
      setError('Erro ao adicionar contrato. Por favor, tente novamente.');
      throw err;
    }
  };

  const updateContract = async (id: string, updates: Partial<ContractFormData>): Promise<Contract> => {
    try {
      const supabaseUpdates = mapContractToSupabase(updates as ContractFormData);

      const { data, error } = await supabase
        .from('contracts')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedContract = mapSupabaseToContract(data);
      setContracts(prev => 
        prev.map(contract => contract.id === id ? updatedContract : contract)
      );
      
      return updatedContract;
    } catch (err) {
      console.error('Erro ao atualizar contrato:', err);
      setError('Erro ao atualizar contrato. Por favor, tente novamente.');
      throw err;
    }
  };

  const deleteContract = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContracts(prev => prev.filter(contract => contract.id !== id));
    } catch (err) {
      console.error('Erro ao excluir contrato:', err);
      setError('Erro ao excluir contrato. Por favor, tente novamente.');
      throw err;
    }
  };

  const getContractById = (id: string): Contract | undefined => {
    return contracts.find(contract => contract.id === id);
  };

  const getFilteredContracts = (
    searchTerm: string = '', 
    typeFilter: string = 'all',
    statusFilter: string = 'all',
    costCenterFilter: string = 'all',
    fiscalYearFilter: string = 'all'
  ): Contract[] => {
    let filtered = contracts;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(contract => 
        contract.name.toLowerCase().includes(term) ||
        contract.contractNumber.toLowerCase().includes(term) ||
        contract.partnerName.toLowerCase().includes(term) ||
        (contract.description && contract.description.toLowerCase().includes(term))
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(contract => contract.contractType === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(contract => contract.status === statusFilter);
    }

    if (costCenterFilter !== 'all') {
      filtered = filtered.filter(contract => contract.costCenterId === costCenterFilter);
    }

    if (fiscalYearFilter !== 'all') {
      filtered = filtered.filter(contract => contract.fiscalYearId === fiscalYearFilter);
    }

    return filtered;
  };

  const getContractsByType = (type: 'service' | 'lease' | 'rental' | 'other'): Contract[] => {
    return contracts.filter(contract => contract.contractType === type);
  };

  const getContractsByStatus = (status: 'active' | 'inactive' | 'expired' | 'cancelled'): Contract[] => {
    return contracts.filter(contract => contract.status === status);
  };

  const getTotalValueByType = (type: 'service' | 'lease' | 'rental' | 'other'): number => {
    return contracts
      .filter(contract => contract.contractType === type && contract.status === 'active')
      .reduce((sum, contract) => sum + contract.value, 0);
  };

  const getTotalMonthlyValue = (): number => {
    return contracts
      .filter(contract => contract.status === 'active' && contract.recurrenceType === 'monthly')
      .reduce((sum, contract) => sum + contract.value, 0);
  };

  const getExpiringContracts = (daysThreshold: number = 30): Contract[] => {
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);
    
    return contracts.filter(contract => {
      if (!contract.endDate || contract.status !== 'active') return false;
      
      const endDate = new Date(contract.endDate);
      return endDate <= thresholdDate && endDate >= today;
    });
  };

  return {
    contracts,
    isLoading,
    error,
    addContract,
    updateContract,
    deleteContract,
    getContractById,
    getFilteredContracts,
    getContractsByType,
    getContractsByStatus,
    getTotalValueByType,
    getTotalMonthlyValue,
    getExpiringContracts
  };
}