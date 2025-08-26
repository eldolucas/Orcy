import { useState, useEffect } from 'react';
import { Contract, ContractFormData } from '../types/contract';
import { useAuth } from '../contexts/AuthContext';

// Mock data para contratos
const mockContracts: Contract[] = [
  {
    id: '1',
    name: 'Serviço de Limpeza',
    description: 'Serviço de limpeza para o escritório central',
    contractNumber: 'SERV-2024-001',
    contractType: 'service',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    value: 3500,
    currency: 'BRL',
    recurrenceType: 'monthly',
    nextPaymentDate: '2024-02-01',
    partnerName: 'Limpeza Express Ltda',
    costCenterId: '1',
    fiscalYearId: '1',
    status: 'active',
    companyId: '1',
    createdAt: '2023-12-15',
    updatedAt: '2023-12-15',
    createdBy: 'João Silva',
    notes: 'Contrato inclui material de limpeza'
  },
  {
    id: '2',
    name: 'Aluguel de Escritório',
    description: 'Aluguel do escritório sede',
    contractNumber: 'ALG-2024-001',
    contractType: 'rental',
    startDate: '2024-01-01',
    endDate: '2026-12-31',
    value: 12000,
    currency: 'BRL',
    recurrenceType: 'monthly',
    nextPaymentDate: '2024-02-05',
    partnerName: 'Imobiliária Central',
    costCenterId: '1',
    fiscalYearId: '1',
    status: 'active',
    companyId: '1',
    createdAt: '2023-11-20',
    updatedAt: '2023-11-20',
    createdBy: 'Maria Santos',
    notes: 'Reajuste anual pelo IGPM'
  },
  {
    id: '3',
    name: 'Licenças Microsoft 365',
    description: 'Licenças para pacote Office e serviços cloud',
    contractNumber: 'LIC-2024-001',
    contractType: 'service',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    value: 5000,
    currency: 'USD',
    recurrenceType: 'monthly',
    nextPaymentDate: '2024-02-01',
    partnerName: 'Microsoft Corporation',
    costCenterId: '11',
    fiscalYearId: '1',
    status: 'active',
    companyId: '1',
    createdAt: '2023-12-10',
    updatedAt: '2023-12-10',
    createdBy: 'Pedro Costa'
  },
  {
    id: '4',
    name: 'Locação de Impressoras',
    description: 'Locação de 5 impressoras multifuncionais',
    contractNumber: 'LOC-2024-001',
    contractType: 'lease',
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    value: 2500,
    currency: 'BRL',
    recurrenceType: 'monthly',
    nextPaymentDate: '2024-02-10',
    partnerName: 'PrintTech Solutions',
    costCenterId: '12',
    fiscalYearId: '1',
    status: 'active',
    companyId: '1',
    createdAt: '2023-12-05',
    updatedAt: '2023-12-05',
    createdBy: 'Ana Rodrigues',
    notes: 'Inclui manutenção e suprimentos'
  },
  {
    id: '5',
    name: 'Consultoria Jurídica',
    description: 'Serviços de assessoria jurídica',
    contractNumber: 'CONS-2023-005',
    contractType: 'service',
    startDate: '2023-06-01',
    endDate: '2024-05-31',
    value: 8000,
    currency: 'BRL',
    recurrenceType: 'monthly',
    nextPaymentDate: '2024-02-05',
    partnerName: 'Oliveira & Associados',
    costCenterId: '3',
    fiscalYearId: '1',
    status: 'active',
    companyId: '2',
    createdAt: '2023-05-20',
    updatedAt: '2023-05-20',
    createdBy: 'Carlos Oliveira'
  },
  {
    id: '6',
    name: 'Serviço de Internet Dedicada',
    description: 'Link de internet dedicado 200Mbps',
    contractNumber: 'NET-2023-002',
    contractType: 'service',
    startDate: '2023-03-01',
    endDate: '2025-02-28',
    value: 3000,
    currency: 'BRL',
    recurrenceType: 'monthly',
    nextPaymentDate: '2024-02-01',
    partnerName: 'TelecomNet',
    costCenterId: '13',
    fiscalYearId: '1',
    status: 'active',
    companyId: '1',
    createdAt: '2023-02-15',
    updatedAt: '2023-02-15',
    createdBy: 'Roberto Lima'
  },
  {
    id: '7',
    name: 'Aluguel de Veículos',
    description: 'Locação de 3 veículos executivos',
    contractNumber: 'VEI-2023-003',
    contractType: 'lease',
    startDate: '2023-07-01',
    endDate: '2024-06-30',
    value: 9000,
    currency: 'BRL',
    recurrenceType: 'monthly',
    nextPaymentDate: '2024-02-01',
    partnerName: 'AutoFlex Locadora',
    costCenterId: '2',
    fiscalYearId: '1',
    status: 'inactive',
    companyId: '2',
    createdAt: '2023-06-20',
    updatedAt: '2023-12-15',
    createdBy: 'Juliana Costa',
    notes: 'Contrato suspenso temporariamente'
  }
];

export function useContracts() {
  const { activeCompany } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simula uma chamada de API
    const fetchContracts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simula um delay de rede
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Filtra contratos pela empresa ativa
        const filteredContracts = activeCompany 
          ? mockContracts.filter(contract => contract.companyId === activeCompany.id)
          : mockContracts;
        
        setContracts(filteredContracts);
      } catch (err) {
        setError('Erro ao carregar contratos. Por favor, tente novamente.');
        console.error('Erro ao buscar contratos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContracts();
  }, [activeCompany]);

  const addContract = async (contractData: ContractFormData): Promise<Contract> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!activeCompany) {
        throw new Error('Nenhuma empresa ativa selecionada');
      }
      
      const newContract: Contract = {
        id: Date.now().toString(),
        ...contractData,
        companyId: activeCompany.id,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'Usuário Atual' // Em uma implementação real, viria do contexto de autenticação
      };
      
      setContracts(prev => [newContract, ...prev]);
      return newContract;
    } catch (err) {
      setError('Erro ao adicionar contrato. Por favor, tente novamente.');
      console.error('Erro ao adicionar contrato:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateContract = async (id: string, updates: Partial<ContractFormData>): Promise<Contract> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let updatedContract: Contract | undefined;
      
      setContracts(prev => 
        prev.map(contract => {
          if (contract.id === id) {
            updatedContract = {
              ...contract,
              ...updates,
              updatedAt: new Date().toISOString().split('T')[0]
            };
            return updatedContract;
          }
          return contract;
        })
      );
      
      if (!updatedContract) {
        throw new Error('Contrato não encontrado');
      }
      
      return updatedContract;
    } catch (err) {
      setError('Erro ao atualizar contrato. Por favor, tente novamente.');
      console.error('Erro ao atualizar contrato:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteContract = async (id: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setContracts(prev => prev.filter(contract => contract.id !== id));
    } catch (err) {
      setError('Erro ao excluir contrato. Por favor, tente novamente.');
      console.error('Erro ao excluir contrato:', err);
      throw err;
    } finally {
      setIsLoading(false);
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