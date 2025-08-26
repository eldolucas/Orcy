import { useState, useEffect } from 'react';
import { BudgetVersion, BudgetVersionItem, BudgetVersionFormData, BudgetVersionItemFormData } from '../types/budgetVersion';
import { useAuth } from '../contexts/AuthContext';
import { useBudgetItems } from './useBudgetItems';

// Mock data para versões de orçamento
const mockBudgetVersions: BudgetVersion[] = [
  {
    id: '1',
    name: 'Orçamento Base 2024',
    description: 'Versão oficial do orçamento 2024',
    fiscalYearId: '1',
    versionNumber: 1,
    status: 'active',
    isBaseline: true,
    createdBy: 'João Silva',
    createdAt: '2023-11-15',
    updatedAt: '2023-11-15',
    companyId: '1',
    totalBudget: 1250000
  },
  {
    id: '2',
    name: 'Simulação - Corte de 10%',
    description: 'Simulação com redução de 10% em despesas não essenciais',
    fiscalYearId: '1',
    versionNumber: 2,
    status: 'simulation',
    isBaseline: false,
    parentVersionId: '1',
    createdBy: 'Maria Santos',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
    companyId: '1',
    totalBudget: 1175000,
    metadata: {
      assumptions: [
        'Redução de 10% em despesas não essenciais',
        'Manutenção dos investimentos estratégicos'
      ],
      scenarioType: 'pessimistic',
      adjustmentFactor: 0.9,
      tags: ['contingência', 'redução']
    }
  },
  {
    id: '3',
    name: 'Simulação - Expansão',
    description: 'Simulação com aumento de investimentos para expansão',
    fiscalYearId: '1',
    versionNumber: 3,
    status: 'simulation',
    isBaseline: false,
    parentVersionId: '1',
    createdBy: 'Pedro Costa',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    companyId: '1',
    totalBudget: 1450000,
    metadata: {
      assumptions: [
        'Aumento de 20% em investimentos de expansão',
        'Contratação de 5 novos desenvolvedores'
      ],
      scenarioType: 'optimistic',
      adjustmentFactor: 1.16,
      tags: ['expansão', 'crescimento']
    }
  },
  {
    id: '4',
    name: 'Simulação - Cenário Conservador',
    description: 'Ajustes conservadores para cenário econômico incerto',
    fiscalYearId: '1',
    versionNumber: 4,
    status: 'simulation',
    isBaseline: false,
    parentVersionId: '1',
    createdBy: 'Ana Rodrigues',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
    companyId: '1',
    totalBudget: 1200000,
    metadata: {
      assumptions: [
        'Redução de 5% em despesas gerais',
        'Adiamento de projetos não essenciais'
      ],
      scenarioType: 'realistic',
      adjustmentFactor: 0.96,
      tags: ['conservador', 'cautela']
    }
  }
];

// Mock data para itens de versão de orçamento
const mockBudgetVersionItems: BudgetVersionItem[] = [
  // Itens para a versão 2 (Corte de 10%)
  {
    id: '1',
    versionId: '2',
    budgetItemId: '2', // Despesas Administrativas
    originalAmount: 120000,
    adjustedAmount: 108000,
    adjustmentType: 'percentage',
    adjustmentValue: -10,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10'
  },
  {
    id: '2',
    versionId: '2',
    budgetItemId: '4', // Despesas de Marketing
    originalAmount: 80000,
    adjustedAmount: 72000,
    adjustmentType: 'percentage',
    adjustmentValue: -10,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10'
  },
  
  // Itens para a versão 3 (Expansão)
  {
    id: '3',
    versionId: '3',
    budgetItemId: '1', // Receita de Vendas
    originalAmount: 500000,
    adjustedAmount: 600000,
    adjustmentType: 'percentage',
    adjustmentValue: 20,
    notes: 'Aumento projetado com expansão',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '4',
    versionId: '3',
    budgetItemId: '2', // Despesas Administrativas
    originalAmount: 120000,
    adjustedAmount: 150000,
    adjustmentType: 'percentage',
    adjustmentValue: 25,
    notes: 'Aumento para suportar crescimento',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  
  // Itens para a versão 4 (Conservador)
  {
    id: '5',
    versionId: '4',
    budgetItemId: '2', // Despesas Administrativas
    originalAmount: 120000,
    adjustedAmount: 114000,
    adjustmentType: 'percentage',
    adjustmentValue: -5,
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20'
  },
  {
    id: '6',
    versionId: '4',
    budgetItemId: '4', // Despesas de Marketing
    originalAmount: 80000,
    adjustedAmount: 76000,
    adjustmentType: 'percentage',
    adjustmentValue: -5,
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20'
  }
];

export function useBudgetVersions() {
  const { activeCompany } = useAuth();
  const { budgetItems } = useBudgetItems();
  const [versions, setVersions] = useState<BudgetVersion[]>([]);
  const [versionItems, setVersionItems] = useState<BudgetVersionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simula uma chamada de API
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simula um delay de rede
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Filtra versões pela empresa ativa
        const filteredVersions = activeCompany 
          ? mockBudgetVersions.filter(version => version.companyId === activeCompany.id)
          : mockBudgetVersions;
        
        setVersions(filteredVersions);
        setVersionItems(mockBudgetVersionItems);
      } catch (err) {
        setError('Erro ao carregar versões de orçamento. Por favor, tente novamente.');
        console.error('Erro ao buscar versões de orçamento:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeCompany]);

  const createVersion = async (versionData: BudgetVersionFormData): Promise<BudgetVersion> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!activeCompany) {
        throw new Error('Nenhuma empresa ativa selecionada');
      }
      
      // Verifica se já existe uma versão base para este ano fiscal
      if (versionData.isBaseline) {
        const existingBaseline = versions.find(v => 
          v.fiscalYearId === versionData.fiscalYearId && 
          v.isBaseline && 
          v.companyId === activeCompany.id
        );
        
        if (existingBaseline) {
          throw new Error('Já existe uma versão base para este exercício financeiro');
        }
      }
      
      // Determina o número da versão
      const existingVersions = versions.filter(v => 
        v.fiscalYearId === versionData.fiscalYearId && 
        v.companyId === activeCompany.id
      );
      
      const versionNumber = existingVersions.length > 0
        ? Math.max(...existingVersions.map(v => v.versionNumber)) + 1
        : 1;
      
      // Calcula o orçamento total
      // Em uma implementação real, isso seria calculado com base nos itens
      let totalBudget = 0;
      
      if (versionData.parentVersionId) {
        // Se for derivada de outra versão, herda o valor total
        const parentVersion = versions.find(v => v.id === versionData.parentVersionId);
        if (parentVersion) {
          totalBudget = parentVersion.totalBudget;
          
          // Aplica o fator de ajuste, se existir
          if (versionData.metadata?.adjustmentFactor) {
            totalBudget = totalBudget * versionData.metadata.adjustmentFactor;
          }
        }
      } else {
        // Se for uma versão nova, calcula com base nos itens orçamentários
        const fiscalYearItems = budgetItems.filter(item => 
          item.fiscalYearId === versionData.fiscalYearId
        );
        
        totalBudget = fiscalYearItems.reduce((sum, item) => sum + item.budgetedAmount, 0);
      }
      
      const newVersion: BudgetVersion = {
        id: Date.now().toString(),
        ...versionData,
        versionNumber,
        totalBudget,
        companyId: activeCompany.id,
        createdBy: 'Usuário Atual', // Em uma implementação real, viria do contexto de autenticação
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      
      setVersions(prev => [...prev, newVersion]);
      
      // Se for derivada de outra versão, cria os itens automaticamente
      if (versionData.parentVersionId) {
        await createVersionItemsFromParent(newVersion.id, versionData.parentVersionId, versionData.metadata?.adjustmentFactor);
      }
      
      return newVersion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar versão de orçamento';
      setError(errorMessage);
      console.error('Erro ao criar versão de orçamento:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createVersionItemsFromParent = async (
    versionId: string, 
    parentVersionId: string,
    adjustmentFactor?: number
  ): Promise<BudgetVersionItem[]> => {
    try {
      // Obtém os itens da versão pai
      const parentItems = versionItems.filter(item => item.versionId === parentVersionId);
      
      // Se não houver itens na versão pai, busca os itens originais do orçamento
      if (parentItems.length === 0) {
        const parentVersion = versions.find(v => v.id === parentVersionId);
        if (!parentVersion) throw new Error('Versão pai não encontrada');
        
        const fiscalYearItems = budgetItems.filter(item => 
          item.fiscalYearId === parentVersion.fiscalYearId
        );
        
        const newItems: BudgetVersionItem[] = fiscalYearItems.map(item => {
          const originalAmount = item.budgetedAmount;
          const factor = adjustmentFactor || 1;
          const adjustedAmount = originalAmount * factor;
          const adjustmentValue = factor !== 1 ? (factor - 1) * 100 : 0;
          
          return {
            id: `${Date.now()}-${item.id}`,
            versionId,
            budgetItemId: item.id,
            originalAmount,
            adjustedAmount,
            adjustmentType: 'percentage',
            adjustmentValue,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
          };
        });
        
        setVersionItems(prev => [...prev, ...newItems]);
        return newItems;
      }
      
      // Cria novos itens baseados nos itens da versão pai
      const newItems: BudgetVersionItem[] = parentItems.map(parentItem => {
        const originalAmount = parentItem.adjustedAmount; // O valor ajustado do pai é o original para o filho
        const factor = adjustmentFactor || 1;
        const adjustedAmount = originalAmount * factor;
        const adjustmentValue = factor !== 1 ? (factor - 1) * 100 : 0;
        
        return {
          id: `${Date.now()}-${parentItem.budgetItemId}`,
          versionId,
          budgetItemId: parentItem.budgetItemId,
          originalAmount,
          adjustedAmount,
          adjustmentType: 'percentage',
          adjustmentValue,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        };
      });
      
      setVersionItems(prev => [...prev, ...newItems]);
      return newItems;
    } catch (err) {
      console.error('Erro ao criar itens da versão:', err);
      throw err;
    }
  };

  const updateVersion = async (id: string, updates: Partial<BudgetVersionFormData>): Promise<BudgetVersion> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verifica se a versão existe
      const versionToUpdate = versions.find(v => v.id === id);
      if (!versionToUpdate) {
        throw new Error('Versão não encontrada');
      }
      
      // Verifica se está tentando mudar para versão base quando já existe uma
      if (updates.isBaseline && !versionToUpdate.isBaseline) {
        const existingBaseline = versions.find(v => 
          v.fiscalYearId === (updates.fiscalYearId || versionToUpdate.fiscalYearId) && 
          v.isBaseline && 
          v.id !== id
        );
        
        if (existingBaseline) {
          throw new Error('Já existe uma versão base para este exercício financeiro');
        }
      }
      
      let updatedVersion: BudgetVersion | undefined;
      
      setVersions(prev => 
        prev.map(version => {
          if (version.id === id) {
            updatedVersion = {
              ...version,
              ...updates,
              updatedAt: new Date().toISOString().split('T')[0]
            };
            return updatedVersion;
          }
          return version;
        })
      );
      
      if (!updatedVersion) {
        throw new Error('Erro ao atualizar versão');
      }
      
      return updatedVersion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar versão de orçamento';
      setError(errorMessage);
      console.error('Erro ao atualizar versão de orçamento:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteVersion = async (id: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verifica se a versão existe
      const versionToDelete = versions.find(v => v.id === id);
      if (!versionToDelete) {
        throw new Error('Versão não encontrada');
      }
      
      // Não permite excluir a versão base
      if (versionToDelete.isBaseline) {
        throw new Error('Não é possível excluir a versão base do orçamento');
      }
      
      // Não permite excluir versões ativas
      if (versionToDelete.status === 'active') {
        throw new Error('Não é possível excluir uma versão ativa');
      }
      
      // Remove a versão
      setVersions(prev => prev.filter(version => version.id !== id));
      
      // Remove os itens da versão
      setVersionItems(prev => prev.filter(item => item.versionId !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir versão de orçamento';
      setError(errorMessage);
      console.error('Erro ao excluir versão de orçamento:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addVersionItem = async (versionId: string, itemData: BudgetVersionItemFormData): Promise<BudgetVersionItem> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verifica se a versão existe
      const version = versions.find(v => v.id === versionId);
      if (!version) {
        throw new Error('Versão não encontrada');
      }
      
      // Verifica se o item orçamentário existe
      const budgetItem = budgetItems.find(item => item.id === itemData.budgetItemId);
      if (!budgetItem) {
        throw new Error('Item orçamentário não encontrado');
      }
      
      // Verifica se já existe um item para este item orçamentário nesta versão
      const existingItem = versionItems.find(item => 
        item.versionId === versionId && 
        item.budgetItemId === itemData.budgetItemId
      );
      
      if (existingItem) {
        throw new Error('Este item orçamentário já existe nesta versão');
      }
      
      // Calcula o valor ajustado
      let adjustedAmount = 0;
      const originalAmount = budgetItem.budgetedAmount;
      
      if (itemData.adjustmentType === 'percentage') {
        adjustedAmount = originalAmount * (1 + itemData.adjustmentValue / 100);
      } else { // absolute
        adjustedAmount = originalAmount + itemData.adjustmentValue;
      }
      
      // Garante que o valor não seja negativo
      adjustedAmount = Math.max(0, adjustedAmount);
      
      const newItem: BudgetVersionItem = {
        id: Date.now().toString(),
        versionId,
        budgetItemId: itemData.budgetItemId,
        originalAmount,
        adjustedAmount,
        adjustmentType: itemData.adjustmentType,
        adjustmentValue: itemData.adjustmentValue,
        notes: itemData.notes,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      
      setVersionItems(prev => [...prev, newItem]);
      
      // Atualiza o valor total da versão
      updateVersionTotal(versionId);
      
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar item à versão';
      setError(errorMessage);
      console.error('Erro ao adicionar item à versão:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateVersionItem = async (
    versionId: string, 
    itemId: string, 
    updates: Partial<BudgetVersionItemFormData>
  ): Promise<BudgetVersionItem> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verifica se o item existe
      const itemToUpdate = versionItems.find(item => item.id === itemId && item.versionId === versionId);
      if (!itemToUpdate) {
        throw new Error('Item não encontrado');
      }
      
      let updatedItem: BudgetVersionItem | undefined;
      
      setVersionItems(prev => 
        prev.map(item => {
          if (item.id === itemId && item.versionId === versionId) {
            // Recalcula o valor ajustado se necessário
            let adjustedAmount = item.adjustedAmount;
            
            if (updates.adjustmentType !== undefined || updates.adjustmentValue !== undefined) {
              const adjustmentType = updates.adjustmentType || item.adjustmentType;
              const adjustmentValue = updates.adjustmentValue !== undefined ? updates.adjustmentValue : item.adjustmentValue;
              
              if (adjustmentType === 'percentage') {
                adjustedAmount = item.originalAmount * (1 + adjustmentValue / 100);
              } else { // absolute
                adjustedAmount = item.originalAmount + adjustmentValue;
              }
              
              // Garante que o valor não seja negativo
              adjustedAmount = Math.max(0, adjustedAmount);
            }
            
            updatedItem = {
              ...item,
              adjustmentType: updates.adjustmentType || item.adjustmentType,
              adjustmentValue: updates.adjustmentValue !== undefined ? updates.adjustmentValue : item.adjustmentValue,
              adjustedAmount,
              notes: updates.notes !== undefined ? updates.notes : item.notes,
              updatedAt: new Date().toISOString().split('T')[0]
            };
            return updatedItem;
          }
          return item;
        })
      );
      
      if (!updatedItem) {
        throw new Error('Erro ao atualizar item');
      }
      
      // Atualiza o valor total da versão
      updateVersionTotal(versionId);
      
      return updatedItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar item da versão';
      setError(errorMessage);
      console.error('Erro ao atualizar item da versão:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteVersionItem = async (versionId: string, itemId: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove o item
      setVersionItems(prev => prev.filter(item => !(item.id === itemId && item.versionId === versionId)));
      
      // Atualiza o valor total da versão
      updateVersionTotal(versionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir item da versão';
      setError(errorMessage);
      console.error('Erro ao excluir item da versão:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateVersionTotal = (versionId: string): void => {
    // Calcula o novo total com base nos itens
    const items = versionItems.filter(item => item.versionId === versionId);
    const totalBudget = items.reduce((sum, item) => sum + item.adjustedAmount, 0);
    
    // Atualiza o total da versão
    setVersions(prev => 
      prev.map(version => 
        version.id === versionId 
          ? { ...version, totalBudget, updatedAt: new Date().toISOString().split('T')[0] }
          : version
      )
    );
  };

  const getVersionById = (id: string): BudgetVersion | undefined => {
    return versions.find(version => version.id === id);
  };

  const getVersionsByFiscalYear = (fiscalYearId: string): BudgetVersion[] => {
    return versions
      .filter(version => version.fiscalYearId === fiscalYearId)
      .sort((a, b) => a.versionNumber - b.versionNumber);
  };

  const getVersionItems = (versionId: string): BudgetVersionItem[] => {
    return versionItems.filter(item => item.versionId === versionId);
  };

  const getBaselineVersion = (fiscalYearId: string): BudgetVersion | undefined => {
    return versions.find(version => 
      version.fiscalYearId === fiscalYearId && 
      version.isBaseline
    );
  };

  const compareVersions = (versionId1: string, versionId2: string): { 
    items: Array<{
      budgetItemId: string;
      version1Amount: number;
      version2Amount: number;
      difference: number;
      percentageDifference: number;
    }>;
    totalVersion1: number;
    totalVersion2: number;
    totalDifference: number;
    totalPercentageDifference: number;
  } => {
    const version1Items = versionItems.filter(item => item.versionId === versionId1);
    const version2Items = versionItems.filter(item => item.versionId === versionId2);
    
    // Obtém todos os IDs de itens orçamentários únicos
    const allBudgetItemIds = [...new Set([
      ...version1Items.map(item => item.budgetItemId),
      ...version2Items.map(item => item.budgetItemId)
    ])];
    
    // Compara cada item
    const comparisonItems = allBudgetItemIds.map(budgetItemId => {
      const item1 = version1Items.find(item => item.budgetItemId === budgetItemId);
      const item2 = version2Items.find(item => item.budgetItemId === budgetItemId);
      
      const version1Amount = item1 ? item1.adjustedAmount : 0;
      const version2Amount = item2 ? item2.adjustedAmount : 0;
      const difference = version2Amount - version1Amount;
      const percentageDifference = version1Amount > 0 
        ? (difference / version1Amount) * 100 
        : version2Amount > 0 ? 100 : 0;
      
      return {
        budgetItemId,
        version1Amount,
        version2Amount,
        difference,
        percentageDifference
      };
    });
    
    // Calcula os totais
    const totalVersion1 = version1Items.reduce((sum, item) => sum + item.adjustedAmount, 0);
    const totalVersion2 = version2Items.reduce((sum, item) => sum + item.adjustedAmount, 0);
    const totalDifference = totalVersion2 - totalVersion1;
    const totalPercentageDifference = totalVersion1 > 0 
      ? (totalDifference / totalVersion1) * 100 
      : totalVersion2 > 0 ? 100 : 0;
    
    return {
      items: comparisonItems,
      totalVersion1,
      totalVersion2,
      totalDifference,
      totalPercentageDifference
    };
  };

  const activateVersion = async (id: string): Promise<BudgetVersion> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verifica se a versão existe
      const versionToActivate = versions.find(v => v.id === id);
      if (!versionToActivate) {
        throw new Error('Versão não encontrada');
      }
      
      // Verifica se a versão está aprovada
      if (versionToActivate.status !== 'approved') {
        throw new Error('Apenas versões aprovadas podem ser ativadas');
      }
      
      // Desativa a versão ativa atual, se houver
      const currentActiveVersion = versions.find(v => 
        v.fiscalYearId === versionToActivate.fiscalYearId && 
        v.status === 'active'
      );
      
      if (currentActiveVersion) {
        setVersions(prev => 
          prev.map(version => 
            version.id === currentActiveVersion.id 
              ? { ...version, status: 'archived', updatedAt: new Date().toISOString().split('T')[0] }
              : version
          )
        );
      }
      
      // Ativa a nova versão
      let activatedVersion: BudgetVersion | undefined;
      
      setVersions(prev => 
        prev.map(version => {
          if (version.id === id) {
            activatedVersion = {
              ...version,
              status: 'active',
              updatedAt: new Date().toISOString().split('T')[0]
            };
            return activatedVersion;
          }
          return version;
        })
      );
      
      if (!activatedVersion) {
        throw new Error('Erro ao ativar versão');
      }
      
      return activatedVersion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao ativar versão de orçamento';
      setError(errorMessage);
      console.error('Erro ao ativar versão de orçamento:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const approveVersion = async (id: string): Promise<BudgetVersion> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verifica se a versão existe
      const versionToApprove = versions.find(v => v.id === id);
      if (!versionToApprove) {
        throw new Error('Versão não encontrada');
      }
      
      // Verifica se a versão está em estado que pode ser aprovado
      if (versionToApprove.status !== 'draft' && versionToApprove.status !== 'simulation') {
        throw new Error('Apenas versões em rascunho ou simulação podem ser aprovadas');
      }
      
      // Aprova a versão
      let approvedVersion: BudgetVersion | undefined;
      
      setVersions(prev => 
        prev.map(version => {
          if (version.id === id) {
            approvedVersion = {
              ...version,
              status: 'approved',
              updatedAt: new Date().toISOString().split('T')[0]
            };
            return approvedVersion;
          }
          return version;
        })
      );
      
      if (!approvedVersion) {
        throw new Error('Erro ao aprovar versão');
      }
      
      return approvedVersion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao aprovar versão de orçamento';
      setError(errorMessage);
      console.error('Erro ao aprovar versão de orçamento:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredVersions = (
    fiscalYearId: string = 'all',
    statusFilter: string = 'all',
    searchTerm: string = ''
  ): BudgetVersion[] => {
    let filtered = versions;

    if (fiscalYearId !== 'all') {
      filtered = filtered.filter(version => version.fiscalYearId === fiscalYearId);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(version => version.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(version => 
        version.name.toLowerCase().includes(term) ||
        (version.description && version.description.toLowerCase().includes(term))
      );
    }

    return filtered.sort((a, b) => {
      // Primeiro ordena por ano fiscal
      if (a.fiscalYearId !== b.fiscalYearId) {
        return a.fiscalYearId.localeCompare(b.fiscalYearId);
      }
      
      // Depois coloca a versão base primeiro
      if (a.isBaseline !== b.isBaseline) {
        return a.isBaseline ? -1 : 1;
      }
      
      // Por fim, ordena por número da versão
      return a.versionNumber - b.versionNumber;
    });
  };

  return {
    versions,
    versionItems,
    isLoading,
    error,
    createVersion,
    updateVersion,
    deleteVersion,
    addVersionItem,
    updateVersionItem,
    deleteVersionItem,
    getVersionById,
    getVersionsByFiscalYear,
    getVersionItems,
    getBaselineVersion,
    compareVersions,
    activateVersion,
    approveVersion,
    getFilteredVersions
  };
}