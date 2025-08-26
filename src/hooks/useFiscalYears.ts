import { useState, useEffect } from 'react';
import { FiscalYear } from '../types';

// Mock data for fiscal years
const mockFiscalYears: FiscalYear[] = [
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
    totalSpent: 987500
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
    totalSpent: 0
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
    totalSpent: 945000
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
    totalSpent: 823000
  }
];

export function useFiscalYears() {
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setFiscalYears(mockFiscalYears);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const addFiscalYear = (newFiscalYear: Omit<FiscalYear, 'id' | 'createdAt' | 'budgetVersion'>) => {
    const fiscalYear: FiscalYear = {
      ...newFiscalYear,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      budgetVersion: 1,
      totalBudget: 0,
      totalSpent: 0
    };
    
    setFiscalYears(prev => [fiscalYear, ...prev]);
    return fiscalYear;
  };

  const updateFiscalYear = (id: string, updates: Partial<FiscalYear>) => {
    setFiscalYears(prev => 
      prev.map(fy => 
        fy.id === id 
          ? { ...fy, ...updates }
          : fy
      )
    );
  };

  const deleteFiscalYear = (id: string) => {
    setFiscalYears(prev => prev.filter(fy => fy.id !== id));
  };

  const setDefaultFiscalYear = (id: string) => {
    setFiscalYears(prev => 
      prev.map(fy => ({
        ...fy,
        isDefault: fy.id === id
      }))
    );
  };

  const getFilteredFiscalYears = (searchTerm: string, statusFilter: string) => {
    let filtered = fiscalYears;

    if (searchTerm) {
      filtered = filtered.filter(fy =>
        fy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fy.year.toString().includes(searchTerm) ||
        fy.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(fy => fy.status === statusFilter);
    }

    return filtered.sort((a, b) => b.year - a.year);
  };

  const getActiveFiscalYear = () => {
    return fiscalYears.find(fy => fy.isDefault) || fiscalYears.find(fy => fy.status === 'active');
  };

  return {
    fiscalYears,
    isLoading,
    addFiscalYear,
    updateFiscalYear,
    deleteFiscalYear,
    setDefaultFiscalYear,
    getFilteredFiscalYears,
    getActiveFiscalYear
  };
}