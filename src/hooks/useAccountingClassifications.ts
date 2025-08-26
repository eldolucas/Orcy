import { useState, useEffect } from 'react';
import { AccountingClassification, AccountingClassificationFormData } from '../types/accountingClassification';
import { useAuth } from '../contexts/AuthContext';

// Mock data para classificações contábeis
const mockAccountingClassifications: AccountingClassification[] = [
  {
    id: '1',
    name: 'Receita de Vendas',
    code: 'REC-VND',
    type: 'revenue',
    description: 'Receitas provenientes de vendas de produtos e serviços',
    isActive: true,
    companyId: '1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'João Silva'
  },
  {
    id: '2',
    name: 'Despesas Administrativas',
    code: 'DESP-ADM',
    type: 'expense',
    description: 'Despesas relacionadas à administração da empresa',
    isActive: true,
    companyId: '1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'Maria Santos'
  },
  {
    id: '3',
    name: 'Equipamentos',
    code: 'AT-EQUIP',
    type: 'asset',
    description: 'Equipamentos e máquinas da empresa',
    isActive: true,
    companyId: '1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'Pedro Costa'
  },
  {
    id: '4',
    name: 'Empréstimos',
    code: 'PAS-EMP',
    type: 'liability',
    description: 'Empréstimos e financiamentos',
    isActive: true,
    companyId: '2',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'Ana Rodrigues'
  },
  {
    id: '5',
    name: 'Capital Social',
    code: 'PL-CAP',
    type: 'equity',
    description: 'Capital social da empresa',
    isActive: true,
    companyId: '2',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'Carlos Oliveira'
  },
  {
    id: '6',
    name: 'Despesas de Marketing',
    code: 'DESP-MKT',
    type: 'expense',
    description: 'Despesas relacionadas a marketing e publicidade',
    isActive: false,
    companyId: '2',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    createdBy: 'Roberto Lima'
  }
];

export function useAccountingClassifications() {
  const { activeCompany } = useAuth();
  const [accountingClassifications, setAccountingClassifications] = useState<AccountingClassification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simula uma chamada de API
    const fetchAccountingClassifications = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simula um delay de rede
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Filtra classificações pela empresa ativa
        const filteredClassifications = activeCompany 
          ? mockAccountingClassifications.filter(classification => classification.companyId === activeCompany.id)
          : mockAccountingClassifications;
        
        setAccountingClassifications(filteredClassifications);
      } catch (err) {
        setError('Erro ao carregar classificações contábeis. Por favor, tente novamente.');
        console.error('Erro ao buscar classificações contábeis:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountingClassifications();
  }, [activeCompany]);

  const addAccountingClassification = async (classificationData: AccountingClassificationFormData): Promise<AccountingClassification> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!activeCompany) {
        throw new Error('Nenhuma empresa ativa selecionada');
      }
      
      const newClassification: AccountingClassification = {
        id: Date.now().toString(),
        ...classificationData,
        companyId: activeCompany.id,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'Usuário Atual' // Em uma implementação real, viria do contexto de autenticação
      };
      
      setAccountingClassifications(prev => [newClassification, ...prev]);
      return newClassification;
    } catch (err) {
      setError('Erro ao adicionar classificação contábil. Por favor, tente novamente.');
      console.error('Erro ao adicionar classificação contábil:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAccountingClassification = async (id: string, updates: Partial<AccountingClassificationFormData>): Promise<AccountingClassification> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let updatedClassification: AccountingClassification | undefined;
      
      setAccountingClassifications(prev => 
        prev.map(classification => {
          if (classification.id === id) {
            updatedClassification = {
              ...classification,
              ...updates,
              updatedAt: new Date().toISOString().split('T')[0]
            };
            return updatedClassification;
          }
          return classification;
        })
      );
      
      if (!updatedClassification) {
        throw new Error('Classificação contábil não encontrada');
      }
      
      return updatedClassification;
    } catch (err) {
      setError('Erro ao atualizar classificação contábil. Por favor, tente novamente.');
      console.error('Erro ao atualizar classificação contábil:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccountingClassification = async (id: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAccountingClassifications(prev => prev.filter(classification => classification.id !== id));
    } catch (err) {
      setError('Erro ao excluir classificação contábil. Por favor, tente novamente.');
      console.error('Erro ao excluir classificação contábil:', err);
      throw err;
    } finally {
      setIsLoading(false);
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