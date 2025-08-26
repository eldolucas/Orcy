import { useState, useEffect } from 'react';
import { Insumo, InsumoFormData } from '../types/insumo';
import { useAuth } from '../contexts/AuthContext';

// Mock data para insumos
const mockInsumos: Insumo[] = [
  {
    id: '1',
    name: 'Notebook Dell Latitude',
    description: 'Notebook para uso corporativo',
    type: 'product',
    unit: 'UN',
    cost: 5000,
    isActive: true,
    companyId: '1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'João Silva'
  },
  {
    id: '2',
    name: 'Licença Microsoft Office',
    description: 'Licença anual do pacote Office 365',
    type: 'product',
    unit: 'UN',
    cost: 600,
    isActive: true,
    companyId: '1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'Maria Santos'
  },
  {
    id: '3',
    name: 'Consultoria em TI',
    description: 'Serviço de consultoria em tecnologia',
    type: 'service',
    unit: 'HR',
    cost: 200,
    isActive: true,
    companyId: '1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'Pedro Costa'
  },
  {
    id: '4',
    name: 'Verba para Marketing Digital',
    description: 'Verba mensal para campanhas de marketing digital',
    type: 'fund',
    unit: 'MES',
    cost: 10000,
    isActive: true,
    companyId: '2',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'Ana Rodrigues'
  },
  {
    id: '5',
    name: 'Manutenção de Equipamentos',
    description: 'Serviço mensal de manutenção preventiva',
    type: 'service',
    unit: 'MES',
    cost: 1500,
    isActive: true,
    companyId: '2',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'Carlos Oliveira'
  },
  {
    id: '6',
    name: 'Material de Escritório',
    description: 'Verba para compra de materiais diversos',
    type: 'fund',
    unit: 'MES',
    cost: 800,
    isActive: false,
    companyId: '2',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    createdBy: 'Roberto Lima'
  }
];

export function useInsumos() {
  const { activeCompany } = useAuth();
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simula uma chamada de API
    const fetchInsumos = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simula um delay de rede
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Filtra insumos pela empresa ativa
        const filteredInsumos = activeCompany 
          ? mockInsumos.filter(insumo => insumo.companyId === activeCompany.id)
          : mockInsumos;
        
        setInsumos(filteredInsumos);
      } catch (err) {
        setError('Erro ao carregar insumos. Por favor, tente novamente.');
        console.error('Erro ao buscar insumos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsumos();
  }, [activeCompany]);

  const addInsumo = async (insumoData: InsumoFormData): Promise<Insumo> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!activeCompany) {
        throw new Error('Nenhuma empresa ativa selecionada');
      }
      
      const newInsumo: Insumo = {
        id: Date.now().toString(),
        ...insumoData,
        companyId: activeCompany.id,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'Usuário Atual' // Em uma implementação real, viria do contexto de autenticação
      };
      
      setInsumos(prev => [newInsumo, ...prev]);
      return newInsumo;
    } catch (err) {
      setError('Erro ao adicionar insumo. Por favor, tente novamente.');
      console.error('Erro ao adicionar insumo:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateInsumo = async (id: string, updates: Partial<InsumoFormData>): Promise<Insumo> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let updatedInsumo: Insumo | undefined;
      
      setInsumos(prev => 
        prev.map(insumo => {
          if (insumo.id === id) {
            updatedInsumo = {
              ...insumo,
              ...updates,
              updatedAt: new Date().toISOString().split('T')[0]
            };
            return updatedInsumo;
          }
          return insumo;
        })
      );
      
      if (!updatedInsumo) {
        throw new Error('Insumo não encontrado');
      }
      
      return updatedInsumo;
    } catch (err) {
      setError('Erro ao atualizar insumo. Por favor, tente novamente.');
      console.error('Erro ao atualizar insumo:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteInsumo = async (id: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setInsumos(prev => prev.filter(insumo => insumo.id !== id));
    } catch (err) {
      setError('Erro ao excluir insumo. Por favor, tente novamente.');
      console.error('Erro ao excluir insumo:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getInsumoById = (id: string): Insumo | undefined => {
    return insumos.find(insumo => insumo.id === id);
  };

  const getFilteredInsumos = (
    searchTerm: string = '', 
    typeFilter: string = 'all',
    statusFilter: string = 'all'
  ): Insumo[] => {
    let filtered = insumos;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(insumo => 
        insumo.name.toLowerCase().includes(term) ||
        (insumo.description && insumo.description.toLowerCase().includes(term))
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(insumo => insumo.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(insumo => insumo.isActive === isActive);
    }

    return filtered;
  };

  const getInsumosByType = (type: 'product' | 'service' | 'fund'): Insumo[] => {
    return insumos.filter(insumo => insumo.type === type);
  };

  return {
    insumos,
    isLoading,
    error,
    addInsumo,
    updateInsumo,
    deleteInsumo,
    getInsumoById,
    getFilteredInsumos,
    getInsumosByType
  };
}