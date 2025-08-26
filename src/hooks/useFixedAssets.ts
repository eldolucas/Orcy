import { useState, useEffect } from 'react';
import { FixedAsset, FixedAssetFormData } from '../types/fixedAsset';
import { useAuth } from '../contexts/AuthContext';

// Mock data para ativos imobilizados
const mockFixedAssets: FixedAsset[] = [
  {
    id: '1',
    name: 'Notebook Dell XPS 15',
    description: 'Notebook para equipe de desenvolvimento',
    category: 'equipment',
    acquisitionDate: '2023-06-15',
    acquisitionValue: 12000,
    depreciationRate: 20,
    depreciationMethod: 'linear',
    usefulLifeYears: 5,
    currentValue: 9600, // 80% do valor original após 1 ano
    status: 'active',
    costCenterId: '11',
    fiscalYearId: '1',
    supplier: 'Dell Computadores',
    invoiceNumber: 'NF-12345',
    serialNumber: 'XPS15-789456',
    location: 'Escritório Central - Andar 2',
    companyId: '1',
    createdAt: '2023-06-15',
    updatedAt: '2023-06-15',
    createdBy: 'João Silva'
  },
  {
    id: '2',
    name: 'Veículo Utilitário',
    description: 'Veículo para transporte de equipamentos',
    category: 'vehicle',
    acquisitionDate: '2022-03-10',
    acquisitionValue: 85000,
    depreciationRate: 10,
    depreciationMethod: 'linear',
    usefulLifeYears: 10,
    currentValue: 68000, // 80% do valor original após 2 anos
    status: 'active',
    costCenterId: '2',
    fiscalYearId: '1',
    supplier: 'Concessionária ABC',
    invoiceNumber: 'NF-78945',
    serialNumber: 'VIN-123456789',
    location: 'Garagem Corporativa',
    companyId: '1',
    createdAt: '2022-03-10',
    updatedAt: '2022-03-10',
    createdBy: 'Maria Santos'
  },
  {
    id: '3',
    name: 'Mobiliário para Escritório',
    description: 'Conjunto de mesas, cadeiras e armários',
    category: 'furniture',
    acquisitionDate: '2023-01-20',
    acquisitionValue: 35000,
    depreciationRate: 10,
    depreciationMethod: 'linear',
    usefulLifeYears: 10,
    currentValue: 31500, // 90% do valor original após 1 ano
    status: 'active',
    costCenterId: '1',
    fiscalYearId: '1',
    supplier: 'Móveis Corporativos Ltda',
    invoiceNumber: 'NF-45678',
    location: 'Escritório Central - Andar 1',
    companyId: '1',
    createdAt: '2023-01-20',
    updatedAt: '2023-01-20',
    createdBy: 'Pedro Costa'
  },
  {
    id: '4',
    name: 'Licenças de Software ERP',
    description: 'Licenças perpétuas do sistema ERP',
    category: 'software',
    acquisitionDate: '2023-09-05',
    acquisitionValue: 120000,
    depreciationRate: 20,
    depreciationMethod: 'linear',
    usefulLifeYears: 5,
    currentValue: 112000, // 93% do valor original após alguns meses
    status: 'active',
    costCenterId: '13',
    fiscalYearId: '1',
    supplier: 'Software Solutions Inc.',
    invoiceNumber: 'NF-98765',
    serialNumber: 'LIC-ERP-123456',
    companyId: '1',
    createdAt: '2023-09-05',
    updatedAt: '2023-09-05',
    createdBy: 'Ana Rodrigues'
  },
  {
    id: '5',
    name: 'Servidor de Rede',
    description: 'Servidor para infraestrutura de TI',
    category: 'equipment',
    acquisitionDate: '2024-01-10',
    acquisitionValue: 45000,
    depreciationRate: 20,
    depreciationMethod: 'linear',
    usefulLifeYears: 5,
    currentValue: 45000, // Recém adquirido
    status: 'active',
    costCenterId: '12',
    fiscalYearId: '1',
    supplier: 'Tech Infrastructure Ltd',
    invoiceNumber: 'NF-54321',
    serialNumber: 'SRV-987654',
    location: 'Sala de Servidores',
    companyId: '1',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
    createdBy: 'Carlos Oliveira'
  },
  {
    id: '6',
    name: 'Impressora Multifuncional',
    description: 'Impressora para departamento de marketing',
    category: 'equipment',
    acquisitionDate: '2022-11-15',
    acquisitionValue: 8500,
    depreciationRate: 20,
    depreciationMethod: 'linear',
    usefulLifeYears: 5,
    currentValue: 5950, // 70% do valor original após 1.5 anos
    status: 'inactive',
    costCenterId: '21',
    fiscalYearId: '1',
    supplier: 'Office Tech Solutions',
    invoiceNumber: 'NF-13579',
    serialNumber: 'IMP-246810',
    location: 'Departamento de Marketing',
    companyId: '2',
    createdAt: '2022-11-15',
    updatedAt: '2023-12-20',
    createdBy: 'Roberto Lima'
  },
  {
    id: '7',
    name: 'Terreno para Nova Filial',
    description: 'Terreno adquirido para construção de nova filial',
    category: 'land',
    acquisitionDate: '2023-05-20',
    acquisitionValue: 500000,
    depreciationRate: 0,
    depreciationMethod: 'none',
    usefulLifeYears: 0,
    currentValue: 550000, // Valorização de 10%
    status: 'active',
    costCenterId: '3',
    fiscalYearId: '1',
    supplier: 'Imobiliária Central',
    invoiceNumber: 'ESC-24680',
    location: 'Zona Industrial - Lote 123',
    companyId: '2',
    createdAt: '2023-05-20',
    updatedAt: '2023-05-20',
    createdBy: 'Juliana Costa'
  }
];

export function useFixedAssets() {
  const { activeCompany } = useAuth();
  const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simula uma chamada de API
    const fetchFixedAssets = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simula um delay de rede
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Filtra ativos pela empresa ativa
        const filteredAssets = activeCompany 
          ? mockFixedAssets.filter(asset => asset.companyId === activeCompany.id)
          : mockFixedAssets;
        
        setFixedAssets(filteredAssets);
      } catch (err) {
        setError('Erro ao carregar ativos imobilizados. Por favor, tente novamente.');
        console.error('Erro ao buscar ativos imobilizados:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFixedAssets();
  }, [activeCompany]);

  const addFixedAsset = async (assetData: FixedAssetFormData): Promise<FixedAsset> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!activeCompany) {
        throw new Error('Nenhuma empresa ativa selecionada');
      }
      
      // Calcula o valor atual (igual ao valor de aquisição para novos ativos)
      const currentValue = assetData.status === 'planned' ? 0 : assetData.acquisitionValue;
      
      const newAsset: FixedAsset = {
        id: Date.now().toString(),
        ...assetData,
        currentValue,
        companyId: activeCompany.id,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'Usuário Atual' // Em uma implementação real, viria do contexto de autenticação
      };
      
      setFixedAssets(prev => [newAsset, ...prev]);
      return newAsset;
    } catch (err) {
      setError('Erro ao adicionar ativo imobilizado. Por favor, tente novamente.');
      console.error('Erro ao adicionar ativo imobilizado:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateFixedAsset = async (id: string, updates: Partial<FixedAssetFormData>): Promise<FixedAsset> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let updatedAsset: FixedAsset | undefined;
      
      setFixedAssets(prev => 
        prev.map(asset => {
          if (asset.id === id) {
            // Se o status mudou para "disposed", verifica se tem data de baixa
            const needsDisposalDate = updates.status === 'disposed' && !updates.disposalDate && !asset.disposalDate;
            
            // Se o valor de aquisição mudou, recalcula o valor atual
            let currentValue = asset.currentValue;
            if (updates.acquisitionValue !== undefined && updates.acquisitionValue !== asset.acquisitionValue) {
              // Simplificação: para ativos planejados, o valor atual é zero
              // Para outros, é o valor de aquisição ajustado pela depreciação
              if (asset.status === 'planned' || updates.status === 'planned') {
                currentValue = 0;
              } else {
                const yearsElapsed = calculateYearsElapsed(asset.acquisitionDate);
                const depreciationRate = updates.depreciationRate !== undefined ? updates.depreciationRate : asset.depreciationRate;
                const totalDepreciation = Math.min(yearsElapsed * depreciationRate, 100);
                currentValue = updates.acquisitionValue * (1 - totalDepreciation / 100);
              }
            }
            
            updatedAsset = {
              ...asset,
              ...updates,
              currentValue,
              disposalDate: needsDisposalDate ? new Date().toISOString().split('T')[0] : updates.disposalDate || asset.disposalDate,
              updatedAt: new Date().toISOString().split('T')[0]
            };
            return updatedAsset;
          }
          return asset;
        })
      );
      
      if (!updatedAsset) {
        throw new Error('Ativo imobilizado não encontrado');
      }
      
      return updatedAsset;
    } catch (err) {
      setError('Erro ao atualizar ativo imobilizado. Por favor, tente novamente.');
      console.error('Erro ao atualizar ativo imobilizado:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFixedAsset = async (id: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFixedAssets(prev => prev.filter(asset => asset.id !== id));
    } catch (err) {
      setError('Erro ao excluir ativo imobilizado. Por favor, tente novamente.');
      console.error('Erro ao excluir ativo imobilizado:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getFixedAssetById = (id: string): FixedAsset | undefined => {
    return fixedAssets.find(asset => asset.id === id);
  };

  const getFilteredFixedAssets = (
    searchTerm: string = '', 
    categoryFilter: string = 'all',
    statusFilter: string = 'all',
    costCenterFilter: string = 'all',
    fiscalYearFilter: string = 'all'
  ): FixedAsset[] => {
    let filtered = fixedAssets;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(term) ||
        (asset.description && asset.description.toLowerCase().includes(term)) ||
        (asset.serialNumber && asset.serialNumber.toLowerCase().includes(term)) ||
        (asset.invoiceNumber && asset.invoiceNumber.toLowerCase().includes(term))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(asset => asset.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(asset => asset.status === statusFilter);
    }

    if (costCenterFilter !== 'all') {
      filtered = filtered.filter(asset => asset.costCenterId === costCenterFilter);
    }

    if (fiscalYearFilter !== 'all') {
      filtered = filtered.filter(asset => asset.fiscalYearId === fiscalYearFilter);
    }

    return filtered;
  };

  const getFixedAssetsByCategory = (category: string): FixedAsset[] => {
    return fixedAssets.filter(asset => asset.category === category);
  };

  const getFixedAssetsByStatus = (status: string): FixedAsset[] => {
    return fixedAssets.filter(asset => asset.status === status);
  };

  const getTotalAcquisitionValue = (): number => {
    return fixedAssets.reduce((sum, asset) => sum + asset.acquisitionValue, 0);
  };

  const getTotalCurrentValue = (): number => {
    return fixedAssets.reduce((sum, asset) => sum + asset.currentValue, 0);
  };

  const getTotalDepreciation = (): number => {
    return fixedAssets.reduce((sum, asset) => sum + (asset.acquisitionValue - asset.currentValue), 0);
  };

  const calculateYearsElapsed = (acquisitionDate: string): number => {
    const today = new Date();
    const acquisition = new Date(acquisitionDate);
    return (today.getTime() - acquisition.getTime()) / (1000 * 60 * 60 * 24 * 365);
  };

  const calculateDepreciation = (asset: FixedAsset): number => {
    if (asset.depreciationMethod === 'none' || asset.status === 'planned') {
      return 0;
    }
    
    const yearsElapsed = calculateYearsElapsed(asset.acquisitionDate);
    const totalDepreciation = Math.min(yearsElapsed * asset.depreciationRate, 100);
    
    return asset.acquisitionValue * (totalDepreciation / 100);
  };

  return {
    fixedAssets,
    isLoading,
    error,
    addFixedAsset,
    updateFixedAsset,
    deleteFixedAsset,
    getFixedAssetById,
    getFilteredFixedAssets,
    getFixedAssetsByCategory,
    getFixedAssetsByStatus,
    getTotalAcquisitionValue,
    getTotalCurrentValue,
    getTotalDepreciation,
    calculateDepreciation
  };
}