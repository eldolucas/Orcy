import { useState, useEffect } from 'react';
import { ExpenseClassification, ExpenseClassificationFormData } from '../types/expenseClassification';
import { useAuth } from '../contexts/AuthContext';

// Mock data para classificações de gastos
const mockExpenseClassifications: ExpenseClassification[] = [
  {
    id: '1',
    name: 'Salários',
    type: 'fixed_cost',
    code: 'SAL',
    description: 'Salários e benefícios de funcionários',
    isActive: true,
    companyId: '1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'João Silva'
  },
  {
    id: '2',
    name: 'Marketing Digital',
    type: 'variable_cost',
    code: 'MKT-DIG',
    description: 'Gastos com campanhas de marketing digital',
    isActive: true,
    companyId: '1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'Maria Santos'
  },
  {
    id: '3',
    name: 'Aluguel',
    type: 'fixed_cost',
    code: 'ALG',
    description: 'Aluguel de escritórios e instalações',
    isActive: true,
    companyId: '1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'Pedro Costa'
  },
  {
    id: '4',
    name: 'Matéria Prima',
    type: 'variable_cost',
    code: 'MP',
    description: 'Matérias primas para produção',
    isActive: true,
    companyId: '2',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'Ana Rodrigues'
  },
  {
    id: '5',
    name: 'Viagens',
    type: 'expense',
    code: 'VIA',
    description: 'Despesas com viagens corporativas',
    isActive: true,
    companyId: '2',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'Carlos Oliveira'
  },
  {
    id: '6',
    name: 'Manutenção',
    type: 'fixed_cost',
    code: 'MAN',
    description: 'Manutenção de equipamentos e instalações',
    isActive: false,
    companyId: '2',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    createdBy: 'Roberto Lima'
  }
];

export function useExpenseClassifications() {
  const { activeCompany } = useAuth();
  const [expenseClassifications, setExpenseClassifications] = useState<ExpenseClassification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simula uma chamada de API
    const fetchExpenseClassifications = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simula um delay de rede
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Filtra classificações pela empresa ativa
        const filteredClassifications = activeCompany 
          ? mockExpenseClassifications.filter(classification => classification.companyId === activeCompany.id)
          : mockExpenseClassifications;
        
        setExpenseClassifications(filteredClassifications);
      } catch (err) {
        setError('Erro ao carregar classificações de gastos. Por favor, tente novamente.');
        console.error('Erro ao buscar classificações de gastos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenseClassifications();
  }, [activeCompany]);

  const addExpenseClassification = async (classificationData: ExpenseClassificationFormData): Promise<ExpenseClassification> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!activeCompany) {
        throw new Error('Nenhuma empresa ativa selecionada');
      }
      
      const newClassification: ExpenseClassification = {
        id: Date.now().toString(),
        ...classificationData,
        companyId: activeCompany.id,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'Usuário Atual' // Em uma implementação real, viria do contexto de autenticação
      };
      
      setExpenseClassifications(prev => [newClassification, ...prev]);
      return newClassification;
    } catch (err) {
      setError('Erro ao adicionar classificação de gasto. Por favor, tente novamente.');
      console.error('Erro ao adicionar classificação de gasto:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateExpenseClassification = async (id: string, updates: Partial<ExpenseClassificationFormData>): Promise<ExpenseClassification> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let updatedClassification: ExpenseClassification | undefined;
      
      setExpenseClassifications(prev => 
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
        throw new Error('Classificação de gasto não encontrada');
      }
      
      return updatedClassification;
    } catch (err) {
      setError('Erro ao atualizar classificação de gasto. Por favor, tente novamente.');
      console.error('Erro ao atualizar classificação de gasto:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExpenseClassification = async (id: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setExpenseClassifications(prev => prev.filter(classification => classification.id !== id));
    } catch (err) {
      setError('Erro ao excluir classificação de gasto. Por favor, tente novamente.');
      console.error('Erro ao excluir classificação de gasto:', err);
      throw err;
    } finally {
      setIsLoading(false);
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