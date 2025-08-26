import { useState, useEffect } from 'react';
import { FinancialYear, FinancialYearFormData } from '../types/financialYear';
import { useAuth } from '../contexts/AuthContext';

// Mock data for financial years
const mockFinancialYears: FinancialYear[] = [
  {
    id: '1',
    year: 2024,
    name: 'Exercício 2024',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    description: 'Exercício orçamentário principal de 2024',
    isDefault: true,
    createdBy: 'João Silva',
    createdAt: '2023-12-01',
    budgetVersion: 3,
    totalBudget: 1250000,
    totalSpent: 987500,
    companyId: '1'
  },
  {
    id: '2',
    year: 2025,
    name: 'Exercício 2025',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: 'planning',
    description: 'Planejamento orçamentário para 2025',
    isDefault: false,
    createdBy: 'Maria Santos',
    createdAt: '2024-10-15',
    budgetVersion: 1,
    totalBudget: 1450000,
    totalSpent: 0,
    companyId: '1'
  },
  {
    id: '3',
    year: 2023,
    name: 'Exercício 2023',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    status: 'closed',
    description: 'Exercício orçamentário encerrado de 2023',
    isDefault: false,
    createdBy: 'Pedro Costa',
    createdAt: '2022-12-01',
    closedAt: '2024-01-31',
    budgetVersion: 5,
    totalBudget: 980000,
    totalSpent: 945000,
    companyId: '1'
  },
  {
    id: '4',
    year: 2022,
    name: 'Exercício 2022',
    startDate: '2022-01-01',
    endDate: '2022-12-31',
    status: 'archived',
    description: 'Exercício orçamentário arquivado de 2022',
    isDefault: false,
    createdBy: 'Ana Silva',
    createdAt: '2021-12-01',
    closedAt: '2023-02-15',
    budgetVersion: 4,
    totalBudget: 850000,
    totalSpent: 823000,
    companyId: '1'
  },
  {
    id: '5',
    year: 2024,
    name: 'Exercício 2024 - Empresa 2',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    description: 'Exercício orçamentário principal de 2024',
    isDefault: true,
    createdBy: 'Carlos Oliveira',
    createdAt: '2023-12-01',
    budgetVersion: 2,
    totalBudget: 750000,
    totalSpent: 487500,
    companyId: '2'
  },
  {
    id: '6',
    year: 2023,
    name: 'Exercício 2023 - Empresa 2',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    status: 'closed',
    description: 'Exercício orçamentário encerrado de 2023',
    isDefault: false,
    createdBy: 'Roberto Lima',
    createdAt: '2022-12-01',
    closedAt: '2024-01-31',
    budgetVersion: 3,
    totalBudget: 680000,
    totalSpent: 645000,
    companyId: '2'
  }
];

export function useFinancialYears() {
  const { activeCompany } = useAuth();
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Filter financial years by active company
        const filteredYears = activeCompany 
          ? mockFinancialYears.filter(year => year.companyId === activeCompany.id)
          : mockFinancialYears;
        
        setFinancialYears(filteredYears);
      } catch (err) {
        setError('Erro ao carregar exercícios financeiros. Por favor, tente novamente.');
        console.error('Erro ao buscar exercícios financeiros:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeCompany]);

  const addFinancialYear = async (newFinancialYear: FinancialYearFormData): Promise<FinancialYear> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!activeCompany) {
        throw new Error('Nenhuma empresa ativa selecionada');
      }
      
      // Check if a financial year with the same year already exists for this company
      const existingYear = financialYears.find(
        year => year.year === newFinancialYear.year && year.companyId === activeCompany.id
      );
      
      if (existingYear) {
        throw new Error(`Já existe um exercício financeiro para o ano ${newFinancialYear.year}`);
      }
      
      // If setting as default, update other years
      if (newFinancialYear.isDefault) {
        setFinancialYears(prev => 
          prev.map(year => 
            year.companyId === activeCompany.id 
              ? { ...year, isDefault: false }
              : year
          )
        );
      }
      
      const financialYear: FinancialYear = {
        id: Date.now().toString(),
        ...newFinancialYear,
        companyId: activeCompany.id,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'Usuário Atual', // In a real app, this would come from auth context
        budgetVersion: 1,
        totalBudget: 0,
        totalSpent: 0
      };
      
      setFinancialYears(prev => [financialYear, ...prev]);
      return financialYear;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar exercício financeiro';
      setError(errorMessage);
      console.error('Erro ao adicionar exercício financeiro:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateFinancialYear = async (id: string, updates: Partial<FinancialYearFormData>): Promise<FinancialYear> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!activeCompany) {
        throw new Error('Nenhuma empresa ativa selecionada');
      }
      
      // If setting as default, update other years
      if (updates.isDefault) {
        setFinancialYears(prev => 
          prev.map(year => 
            year.companyId === activeCompany.id && year.id !== id
              ? { ...year, isDefault: false }
              : year
          )
        );
      }
      
      let updatedYear: FinancialYear | undefined;
      
      setFinancialYears(prev => 
        prev.map(year => {
          if (year.id === id) {
            updatedYear = {
              ...year,
              ...updates
            };
            return updatedYear;
          }
          return year;
        })
      );
      
      if (!updatedYear) {
        throw new Error('Exercício financeiro não encontrado');
      }
      
      return updatedYear;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar exercício financeiro';
      setError(errorMessage);
      console.error('Erro ao atualizar exercício financeiro:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFinancialYear = async (id: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if it's the default year
      const yearToDelete = financialYears.find(year => year.id === id);
      
      if (yearToDelete?.isDefault) {
        throw new Error('Não é possível excluir o exercício financeiro padrão');
      }
      
      // Check if it has budgets or transactions
      if (yearToDelete?.totalBudget && yearToDelete.totalBudget > 0) {
        throw new Error('Não é possível excluir um exercício financeiro com orçamentos associados');
      }
      
      setFinancialYears(prev => prev.filter(year => year.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir exercício financeiro';
      setError(errorMessage);
      console.error('Erro ao excluir exercício financeiro:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultFinancialYear = async (id: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!activeCompany) {
        throw new Error('Nenhuma empresa ativa selecionada');
      }
      
      setFinancialYears(prev => 
        prev.map(year => ({
          ...year,
          isDefault: year.id === id && year.companyId === activeCompany.id
        }))
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao definir exercício financeiro padrão';
      setError(errorMessage);
      console.error('Erro ao definir exercício financeiro padrão:', err);
      throw err;
    } finally {
      setIsLoading(false);
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
      year => year.companyId === activeCompany.id && year.isDefault
    ) || financialYears.find(
      year => year.companyId === activeCompany.id && year.status === 'active'
    );
  };

  const closeFinancialYear = async (id: string): Promise<FinancialYear> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let closedYear: FinancialYear | undefined;
      
      setFinancialYears(prev => 
        prev.map(year => {
          if (year.id === id) {
            closedYear = {
              ...year,
              status: 'closed',
              closedAt: new Date().toISOString().split('T')[0]
            };
            return closedYear;
          }
          return year;
        })
      );
      
      if (!closedYear) {
        throw new Error('Exercício financeiro não encontrado');
      }
      
      return closedYear;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao encerrar exercício financeiro';
      setError(errorMessage);
      console.error('Erro ao encerrar exercício financeiro:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const archiveFinancialYear = async (id: string): Promise<FinancialYear> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let archivedYear: FinancialYear | undefined;
      
      setFinancialYears(prev => 
        prev.map(year => {
          if (year.id === id) {
            if (year.status !== 'closed') {
              throw new Error('Apenas exercícios encerrados podem ser arquivados');
            }
            
            archivedYear = {
              ...year,
              status: 'archived'
            };
            return archivedYear;
          }
          return year;
        })
      );
      
      if (!archivedYear) {
        throw new Error('Exercício financeiro não encontrado');
      }
      
      return archivedYear;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao arquivar exercício financeiro';
      setError(errorMessage);
      console.error('Erro ao arquivar exercício financeiro:', err);
      throw err;
    } finally {
      setIsLoading(false);
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