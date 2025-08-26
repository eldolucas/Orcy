import { useState, useEffect } from 'react';
import { FinancialParameter, FinancialParameterFormData, defaultParameters, sectorParameters } from '../types/financialParameter';
import { useAuth } from '../contexts/AuthContext';

// Mock data para parâmetros financeiros
const mockFinancialParameters: FinancialParameter[] = [
  ...defaultParameters.map((param, index) => ({
    ...param,
    id: (index + 1).toString(),
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'Admin'
  })),
  ...sectorParameters.map((param, index) => ({
    ...param,
    id: (defaultParameters.length + index + 1).toString(),
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'Admin'
  })),
  {
    id: '9',
    code: 'COMPANY_TAX_RATE',
    name: 'Alíquota de Impostos da Empresa',
    description: 'Alíquota específica de impostos para esta empresa',
    value: 15,
    valueType: 'percentage',
    category: 'tax',
    isActive: true,
    isSystem: false,
    companyId: '1',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    createdBy: 'João Silva'
  },
  {
    id: '10',
    code: 'COMPANY_BUDGET_ALERT',
    name: 'Alerta de Orçamento da Empresa',
    description: 'Percentual personalizado para alertas de orçamento',
    value: 75,
    valueType: 'percentage',
    category: 'budget',
    isActive: true,
    isSystem: false,
    companyId: '1',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    createdBy: 'Maria Santos'
  },
  {
    id: '11',
    code: 'COMPANY_APPROVAL_LEVELS',
    name: 'Níveis de Aprovação',
    description: 'Número de níveis de aprovação necessários',
    value: 3,
    valueType: 'number',
    category: 'approval',
    isActive: true,
    isSystem: false,
    companyId: '2',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
    createdBy: 'Pedro Costa'
  }
];

export function useFinancialParameters() {
  const { activeCompany, user } = useAuth();
  const [parameters, setParameters] = useState<FinancialParameter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verifica se o usuário tem permissão para editar parâmetros do sistema
  const canEditSystemParameters = user?.role === 'admin' || user?.role === 'staff';

  useEffect(() => {
    // Simula uma chamada de API
    const fetchParameters = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simula um delay de rede
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Filtra parâmetros: globais (sem companyId) + específicos da empresa ativa
        const filteredParameters = mockFinancialParameters.filter(param => 
          !param.companyId || (activeCompany && param.companyId === activeCompany.id)
        );
        
        setParameters(filteredParameters);
      } catch (err) {
        setError('Erro ao carregar parâmetros financeiros. Por favor, tente novamente.');
        console.error('Erro ao buscar parâmetros financeiros:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParameters();
  }, [activeCompany]);

  const addParameter = async (paramData: FinancialParameterFormData): Promise<FinancialParameter> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verifica se o código já existe
      const existingParameter = parameters.find(p => p.code === paramData.code);
      if (existingParameter) {
        throw new Error(`Já existe um parâmetro com o código ${paramData.code}`);
      }
      
      // Verifica permissão para parâmetros do sistema
      if (paramData.isSystem && !canEditSystemParameters) {
        throw new Error('Você não tem permissão para criar parâmetros do sistema');
      }
      
      const newParameter: FinancialParameter = {
        id: Date.now().toString(),
        ...paramData,
        companyId: paramData.companyId || (activeCompany ? activeCompany.id : undefined),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: user?.name || 'Usuário Atual'
      };
      
      setParameters(prev => [...prev, newParameter]);
      return newParameter;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar parâmetro financeiro';
      setError(errorMessage);
      console.error('Erro ao adicionar parâmetro financeiro:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateParameter = async (id: string, updates: Partial<FinancialParameterFormData>): Promise<FinancialParameter> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const paramToUpdate = parameters.find(p => p.id === id);
      if (!paramToUpdate) {
        throw new Error('Parâmetro não encontrado');
      }
      
      // Verifica permissão para parâmetros do sistema
      if (paramToUpdate.isSystem && !canEditSystemParameters) {
        throw new Error('Você não tem permissão para editar parâmetros do sistema');
      }
      
      // Se estiver alterando o código, verifica se já existe
      if (updates.code && updates.code !== paramToUpdate.code) {
        const existingParameter = parameters.find(p => p.code === updates.code);
        if (existingParameter) {
          throw new Error(`Já existe um parâmetro com o código ${updates.code}`);
        }
      }
      
      let updatedParameter: FinancialParameter | undefined;
      
      setParameters(prev => 
        prev.map(param => {
          if (param.id === id) {
            updatedParameter = {
              ...param,
              ...updates,
              updatedAt: new Date().toISOString().split('T')[0]
            };
            return updatedParameter;
          }
          return param;
        })
      );
      
      if (!updatedParameter) {
        throw new Error('Erro ao atualizar parâmetro');
      }
      
      return updatedParameter;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar parâmetro financeiro';
      setError(errorMessage);
      console.error('Erro ao atualizar parâmetro financeiro:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteParameter = async (id: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const paramToDelete = parameters.find(p => p.id === id);
      if (!paramToDelete) {
        throw new Error('Parâmetro não encontrado');
      }
      
      // Verifica se é um parâmetro do sistema
      if (paramToDelete.isSystem) {
        throw new Error('Parâmetros do sistema não podem ser excluídos');
      }
      
      setParameters(prev => prev.filter(param => param.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir parâmetro financeiro';
      setError(errorMessage);
      console.error('Erro ao excluir parâmetro financeiro:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getParameterByCode = (code: string): FinancialParameter | undefined => {
    // Primeiro procura um parâmetro específico da empresa
    if (activeCompany) {
      const companyParam = parameters.find(p => 
        p.code === code && p.companyId === activeCompany.id
      );
      if (companyParam) return companyParam;
    }
    
    // Se não encontrar, retorna o parâmetro global
    return parameters.find(p => p.code === code && !p.companyId);
  };

  const getParameterValue = (code: string): any => {
    const param = getParameterByCode(code);
    return param?.value;
  };

  const getFilteredParameters = (
    searchTerm: string = '', 
    categoryFilter: string = 'all',
    typeFilter: string = 'all',
    sectorFilter: string = 'all',
    showSystemParams: boolean = true,
    showCompanyParams: boolean = true
  ): FinancialParameter[] => {
    let filtered = parameters;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(param => 
        param.code.toLowerCase().includes(term) ||
        param.name.toLowerCase().includes(term) ||
        (param.description && param.description.toLowerCase().includes(term))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(param => param.category === categoryFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(param => param.valueType === typeFilter);
    }
    
    if (sectorFilter !== 'all') {
      filtered = filtered.filter(param => param.sector === sectorFilter);
    }

    if (!showSystemParams) {
      filtered = filtered.filter(param => !param.isSystem);
    }

    if (!showCompanyParams) {
      filtered = filtered.filter(param => !param.companyId);
    }

    return filtered;
  };

  return {
    parameters,
    isLoading,
    error,
    canEditSystemParameters,
    addParameter,
    updateParameter,
    deleteParameter,
    getParameterByCode,
    getParameterValue,
    getFilteredParameters
  };
}