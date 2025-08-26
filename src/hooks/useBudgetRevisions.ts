import { useState, useEffect } from 'react';
import { BudgetRevision, BudgetRevisionFormData } from '../types/budgetRevision';
import { useAuth } from '../contexts/AuthContext';

// Mock data for budget revisions
const mockBudgetRevisions: BudgetRevision[] = [
  {
    id: '1',
    companyId: '1',
    financialYearId: '1',
    revisionNumber: 1,
    revisionDate: '2024-03-15',
    description: 'Revisão inicial do orçamento 2024',
    status: 'active',
    createdBy: 'João Silva',
    createdAt: '2024-03-15',
    updatedAt: '2024-03-15',
    totalBudgetBefore: 1200000,
    totalBudgetAfter: 1250000,
    changePercentage: 4.17,
    approvedBy: 'Maria Santos',
    approvedAt: '2024-03-16'
  },
  {
    id: '2',
    companyId: '1',
    financialYearId: '1',
    revisionNumber: 2,
    revisionDate: '2024-06-20',
    description: 'Ajuste orçamentário devido a novos projetos',
    status: 'active',
    createdBy: 'Pedro Costa',
    createdAt: '2024-06-20',
    updatedAt: '2024-06-20',
    totalBudgetBefore: 1250000,
    totalBudgetAfter: 1350000,
    changePercentage: 8.00,
    approvedBy: 'João Silva',
    approvedAt: '2024-06-21'
  },
  {
    id: '3',
    companyId: '1',
    financialYearId: '1',
    revisionNumber: 3,
    revisionDate: '2024-09-10',
    description: 'Revisão trimestral - Q3',
    status: 'draft',
    createdBy: 'Ana Rodrigues',
    createdAt: '2024-09-10',
    updatedAt: '2024-09-10',
    totalBudgetBefore: 1350000,
    totalBudgetAfter: 1320000,
    changePercentage: -2.22
  },
  {
    id: '4',
    companyId: '2',
    financialYearId: '5',
    revisionNumber: 1,
    revisionDate: '2024-02-10',
    description: 'Revisão inicial do orçamento 2024 - Empresa 2',
    status: 'active',
    createdBy: 'Carlos Oliveira',
    createdAt: '2024-02-10',
    updatedAt: '2024-02-10',
    totalBudgetBefore: 700000,
    totalBudgetAfter: 750000,
    changePercentage: 7.14,
    approvedBy: 'Roberto Lima',
    approvedAt: '2024-02-11'
  },
  {
    id: '5',
    companyId: '2',
    financialYearId: '5',
    revisionNumber: 2,
    revisionDate: '2024-05-15',
    description: 'Ajuste orçamentário - Empresa 2',
    status: 'active',
    createdBy: 'Roberto Lima',
    createdAt: '2024-05-15',
    updatedAt: '2024-05-15',
    totalBudgetBefore: 750000,
    totalBudgetAfter: 780000,
    changePercentage: 4.00,
    approvedBy: 'Carlos Oliveira',
    approvedAt: '2024-05-16'
  }
];

export function useBudgetRevisions() {
  const { activeCompany } = useAuth();
  const [budgetRevisions, setBudgetRevisions] = useState<BudgetRevision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Filter budget revisions by active company
        const filteredRevisions = activeCompany 
          ? mockBudgetRevisions.filter(revision => revision.companyId === activeCompany.id)
          : mockBudgetRevisions;
        
        setBudgetRevisions(filteredRevisions);
      } catch (err) {
        setError('Erro ao carregar revisões orçamentárias. Por favor, tente novamente.');
        console.error('Erro ao buscar revisões orçamentárias:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeCompany]);

  const addBudgetRevision = async (revisionData: BudgetRevisionFormData): Promise<BudgetRevision> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!activeCompany) {
        throw new Error('Nenhuma empresa ativa selecionada');
      }
      
      // Check if financial year exists
      // In a real implementation, this would be a database check
      
      // Calculate revision number (should be the next number for this financial year)
      const existingRevisions = budgetRevisions.filter(
        rev => rev.financialYearId === revisionData.financialYearId
      );
      const nextRevisionNumber = existingRevisions.length > 0
        ? Math.max(...existingRevisions.map(rev => rev.revisionNumber)) + 1
        : 1;
      
      // Calculate change percentage
      let changePercentage: number | undefined;
      if (revisionData.totalBudgetBefore && revisionData.totalBudgetAfter) {
        changePercentage = ((revisionData.totalBudgetAfter - revisionData.totalBudgetBefore) / revisionData.totalBudgetBefore) * 100;
      }
      
      const newRevision: BudgetRevision = {
        id: Date.now().toString(),
        companyId: activeCompany.id,
        financialYearId: revisionData.financialYearId,
        revisionNumber: revisionData.revisionNumber || nextRevisionNumber,
        revisionDate: revisionData.revisionDate || new Date().toISOString().split('T')[0],
        description: revisionData.description,
        status: revisionData.status || 'draft',
        totalBudgetBefore: revisionData.totalBudgetBefore,
        totalBudgetAfter: revisionData.totalBudgetAfter,
        changePercentage,
        createdBy: 'Usuário Atual', // In a real app, this would come from auth context
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      
      setBudgetRevisions(prev => [newRevision, ...prev]);
      return newRevision;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar revisão orçamentária';
      setError(errorMessage);
      console.error('Erro ao adicionar revisão orçamentária:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBudgetRevision = async (id: string, updates: Partial<BudgetRevisionFormData>): Promise<BudgetRevision> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Calculate change percentage if budget values are updated
      let changePercentage: number | undefined;
      if (updates.totalBudgetBefore && updates.totalBudgetAfter) {
        changePercentage = ((updates.totalBudgetAfter - updates.totalBudgetBefore) / updates.totalBudgetBefore) * 100;
      }
      
      let updatedRevision: BudgetRevision | undefined;
      
      setBudgetRevisions(prev => 
        prev.map(revision => {
          if (revision.id === id) {
            updatedRevision = {
              ...revision,
              ...updates,
              changePercentage: changePercentage !== undefined ? changePercentage : revision.changePercentage,
              updatedAt: new Date().toISOString().split('T')[0]
            };
            return updatedRevision;
          }
          return revision;
        })
      );
      
      if (!updatedRevision) {
        throw new Error('Revisão orçamentária não encontrada');
      }
      
      return updatedRevision;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar revisão orçamentária';
      setError(errorMessage);
      console.error('Erro ao atualizar revisão orçamentária:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBudgetRevision = async (id: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if revision is active
      const revision = budgetRevisions.find(rev => rev.id === id);
      if (revision?.status === 'active') {
        throw new Error('Não é possível excluir uma revisão ativa. Arquive-a primeiro.');
      }
      
      setBudgetRevisions(prev => prev.filter(revision => revision.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir revisão orçamentária';
      setError(errorMessage);
      console.error('Erro ao excluir revisão orçamentária:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const approveBudgetRevision = async (id: string, approverName: string): Promise<BudgetRevision> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let approvedRevision: BudgetRevision | undefined;
      
      setBudgetRevisions(prev => 
        prev.map(revision => {
          if (revision.id === id) {
            if (revision.status !== 'draft') {
              throw new Error('Apenas revisões em rascunho podem ser aprovadas');
            }
            
            approvedRevision = {
              ...revision,
              status: 'active',
              approvedBy: approverName,
              approvedAt: new Date().toISOString().split('T')[0],
              updatedAt: new Date().toISOString().split('T')[0]
            };
            return approvedRevision;
          }
          return revision;
        })
      );
      
      if (!approvedRevision) {
        throw new Error('Revisão orçamentária não encontrada');
      }
      
      return approvedRevision;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao aprovar revisão orçamentária';
      setError(errorMessage);
      console.error('Erro ao aprovar revisão orçamentária:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const archiveBudgetRevision = async (id: string): Promise<BudgetRevision> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let archivedRevision: BudgetRevision | undefined;
      
      setBudgetRevisions(prev => 
        prev.map(revision => {
          if (revision.id === id) {
            archivedRevision = {
              ...revision,
              status: 'archived',
              updatedAt: new Date().toISOString().split('T')[0]
            };
            return archivedRevision;
          }
          return revision;
        })
      );
      
      if (!archivedRevision) {
        throw new Error('Revisão orçamentária não encontrada');
      }
      
      return archivedRevision;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao arquivar revisão orçamentária';
      setError(errorMessage);
      console.error('Erro ao arquivar revisão orçamentária:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredBudgetRevisions = (
    searchTerm: string = '', 
    financialYearId: string = 'all',
    statusFilter: string = 'all'
  ): BudgetRevision[] => {
    let filtered = budgetRevisions;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(revision => 
        revision.description.toLowerCase().includes(term) ||
        revision.revisionNumber.toString().includes(term) ||
        revision.createdBy.toLowerCase().includes(term)
      );
    }

    if (financialYearId !== 'all') {
      filtered = filtered.filter(revision => revision.financialYearId === financialYearId);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(revision => revision.status === statusFilter);
    }

    return filtered.sort((a, b) => {
      // First sort by financial year ID
      if (a.financialYearId !== b.financialYearId) {
        return a.financialYearId.localeCompare(b.financialYearId);
      }
      // Then sort by revision number (descending)
      return b.revisionNumber - a.revisionNumber;
    });
  };

  const getBudgetRevisionsByFinancialYear = (financialYearId: string): BudgetRevision[] => {
    return budgetRevisions
      .filter(revision => revision.financialYearId === financialYearId)
      .sort((a, b) => b.revisionNumber - a.revisionNumber);
  };

  const getLatestRevisionByFinancialYear = (financialYearId: string): BudgetRevision | undefined => {
    const yearRevisions = getBudgetRevisionsByFinancialYear(financialYearId);
    return yearRevisions.length > 0 ? yearRevisions[0] : undefined;
  };

  return {
    budgetRevisions,
    isLoading,
    error,
    addBudgetRevision,
    updateBudgetRevision,
    deleteBudgetRevision,
    approveBudgetRevision,
    archiveBudgetRevision,
    getFilteredBudgetRevisions,
    getBudgetRevisionsByFinancialYear,
    getLatestRevisionByFinancialYear
  };
}