import { useState, useEffect } from 'react';
import { BalanceSheet, BalanceSheetItem, BalanceSheetFormData, BalanceSheetItemFormData, BalanceSheetSummary, AccountingAccount } from '../types/balanceSheet';
import { useAuth } from '../contexts/AuthContext';

// Mock data para contas contábeis
const mockAccounts: AccountingAccount[] = [
  // Ativos
  {
    id: '1',
    code: '1.1.1',
    name: 'Caixa e Equivalentes',
    type: 'asset',
    group: 'current-assets',
    isActive: true,
    companyId: '1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    level: 0,
    path: '1.1.1'
  },
  {
    id: '2',
    code: '1.1.2',
    name: 'Contas a Receber',
    type: 'asset',
    group: 'current-assets',
    isActive: true,
    companyId: '1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    level: 0,
    path: '1.1.2'
  },
  {
    id: '3',
    code: '1.2.1',
    name: 'Imobilizado',
    type: 'asset',
    group: 'fixed-assets',
    isActive: true,
    companyId: '1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    level: 0,
    path: '1.2.1'
  },
  
  // Passivos
  {
    id: '4',
    code: '2.1.1',
    name: 'Fornecedores',
    type: 'liability',
    group: 'current-liabilities',
    isActive: true,
    companyId: '1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    level: 0,
    path: '2.1.1'
  },
  {
    id: '5',
    code: '2.1.2',
    name: 'Empréstimos',
    type: 'liability',
    group: 'current-liabilities',
    isActive: true,
    companyId: '1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    level: 0,
    path: '2.1.2'
  },
  
  // Patrimônio Líquido
  {
    id: '6',
    code: '3.1.1',
    name: 'Capital Social',
    type: 'equity',
    group: 'capital',
    isActive: true,
    companyId: '1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    level: 0,
    path: '3.1.1'
  },
  {
    id: '7',
    code: '3.3.1',
    name: 'Lucros Acumulados',
    type: 'equity',
    group: 'retained-earnings',
    isActive: true,
    companyId: '1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    level: 0,
    path: '3.3.1'
  },
  
  // Receitas
  {
    id: '8',
    code: '4.1.1',
    name: 'Receita de Vendas',
    type: 'revenue',
    group: 'operational-revenue',
    isActive: true,
    companyId: '1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    level: 0,
    path: '4.1.1'
  },
  
  // Despesas
  {
    id: '9',
    code: '5.1.1',
    name: 'Custo das Mercadorias Vendidas',
    type: 'expense',
    group: 'operational-expense',
    isActive: true,
    companyId: '1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    level: 0,
    path: '5.1.1'
  },
  {
    id: '10',
    code: '5.2.1',
    name: 'Despesas Administrativas',
    type: 'expense',
    group: 'operational-expense',
    isActive: true,
    companyId: '1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    level: 0,
    path: '5.2.1'
  }
];

// Mock data para balanços
const mockBalanceSheets: BalanceSheet[] = [
  {
    id: '1',
    fiscalYearId: '1',
    companyId: '1',
    period: '2024-Q1',
    periodType: 'quarterly',
    status: 'published',
    createdBy: 'João Silva',
    createdAt: '2024-04-15',
    updatedAt: '2024-04-15',
    publishedAt: '2024-04-15',
    notes: 'Balanço do primeiro trimestre de 2024'
  },
  {
    id: '2',
    fiscalYearId: '1',
    companyId: '1',
    period: '2024-03',
    periodType: 'monthly',
    status: 'published',
    createdBy: 'Maria Santos',
    createdAt: '2024-04-10',
    updatedAt: '2024-04-10',
    publishedAt: '2024-04-10',
    notes: 'Balanço de março de 2024'
  },
  {
    id: '3',
    fiscalYearId: '1',
    companyId: '1',
    period: '2024-Q2',
    periodType: 'quarterly',
    status: 'draft',
    createdBy: 'Pedro Costa',
    createdAt: '2024-07-05',
    updatedAt: '2024-07-05',
    notes: 'Balanço preliminar do segundo trimestre de 2024'
  }
];

// Mock data para itens de balanço
const mockBalanceSheetItems: BalanceSheetItem[] = [
  // Itens para o balanço 1 (2024-Q1)
  {
    id: '1',
    balanceSheetId: '1',
    accountId: '1',
    accountCode: '1.1.1',
    accountName: 'Caixa e Equivalentes',
    accountType: 'asset',
    accountGroup: 'current-assets',
    amount: 250000,
    budgetedAmount: 200000,
    variance: 50000
  },
  {
    id: '2',
    balanceSheetId: '1',
    accountId: '2',
    accountCode: '1.1.2',
    accountName: 'Contas a Receber',
    accountType: 'asset',
    accountGroup: 'current-assets',
    amount: 180000,
    budgetedAmount: 150000,
    variance: 30000
  },
  {
    id: '3',
    balanceSheetId: '1',
    accountId: '3',
    accountCode: '1.2.1',
    accountName: 'Imobilizado',
    accountType: 'asset',
    accountGroup: 'fixed-assets',
    amount: 500000,
    budgetedAmount: 500000,
    variance: 0
  },
  {
    id: '4',
    balanceSheetId: '1',
    accountId: '4',
    accountCode: '2.1.1',
    accountName: 'Fornecedores',
    accountType: 'liability',
    accountGroup: 'current-liabilities',
    amount: 120000,
    budgetedAmount: 100000,
    variance: 20000
  },
  {
    id: '5',
    balanceSheetId: '1',
    accountId: '5',
    accountCode: '2.1.2',
    accountName: 'Empréstimos',
    accountType: 'liability',
    accountGroup: 'current-liabilities',
    amount: 300000,
    budgetedAmount: 300000,
    variance: 0
  },
  {
    id: '6',
    balanceSheetId: '1',
    accountId: '6',
    accountCode: '3.1.1',
    accountName: 'Capital Social',
    accountType: 'equity',
    accountGroup: 'capital',
    amount: 400000,
    budgetedAmount: 400000,
    variance: 0
  },
  {
    id: '7',
    balanceSheetId: '1',
    accountId: '7',
    accountCode: '3.3.1',
    accountName: 'Lucros Acumulados',
    accountType: 'equity',
    accountGroup: 'retained-earnings',
    amount: 110000,
    budgetedAmount: 50000,
    variance: 60000
  },
  {
    id: '8',
    balanceSheetId: '1',
    accountId: '8',
    accountCode: '4.1.1',
    accountName: 'Receita de Vendas',
    accountType: 'revenue',
    accountGroup: 'operational-revenue',
    amount: 350000,
    budgetedAmount: 300000,
    variance: 50000
  },
  {
    id: '9',
    balanceSheetId: '1',
    accountId: '9',
    accountCode: '5.1.1',
    accountName: 'Custo das Mercadorias Vendidas',
    accountType: 'expense',
    accountGroup: 'operational-expense',
    amount: 180000,
    budgetedAmount: 170000,
    variance: 10000
  },
  {
    id: '10',
    balanceSheetId: '1',
    accountId: '10',
    accountCode: '5.2.1',
    accountName: 'Despesas Administrativas',
    accountType: 'expense',
    accountGroup: 'operational-expense',
    amount: 60000,
    budgetedAmount: 80000,
    variance: -20000
  }
];

export function useBalanceSheet() {
  const { activeCompany } = useAuth();
  const [balanceSheets, setBalanceSheets] = useState<BalanceSheet[]>([]);
  const [balanceSheetItems, setBalanceSheetItems] = useState<BalanceSheetItem[]>([]);
  const [accounts, setAccounts] = useState<AccountingAccount[]>([]);
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
        
        // Filtra balanços pela empresa ativa
        const filteredBalanceSheets = activeCompany 
          ? mockBalanceSheets.filter(bs => bs.companyId === activeCompany.id)
          : mockBalanceSheets;
        
        // Filtra contas pela empresa ativa
        const filteredAccounts = activeCompany 
          ? mockAccounts.filter(account => account.companyId === activeCompany.id)
          : mockAccounts;
        
        setBalanceSheets(filteredBalanceSheets);
        setBalanceSheetItems(mockBalanceSheetItems);
        setAccounts(filteredAccounts);
      } catch (err) {
        setError('Erro ao carregar dados do balanço. Por favor, tente novamente.');
        console.error('Erro ao buscar dados do balanço:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeCompany]);

  const createBalanceSheet = async (data: BalanceSheetFormData): Promise<BalanceSheet> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!activeCompany) {
        throw new Error('Nenhuma empresa ativa selecionada');
      }
      
      const newBalanceSheet: BalanceSheet = {
        id: Date.now().toString(),
        ...data,
        companyId: activeCompany.id,
        createdBy: 'Usuário Atual', // Em uma implementação real, viria do contexto de autenticação
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      
      setBalanceSheets(prev => [...prev, newBalanceSheet]);
      return newBalanceSheet;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar balanço';
      setError(errorMessage);
      console.error('Erro ao criar balanço:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBalanceSheet = async (id: string, updates: Partial<BalanceSheetFormData>): Promise<BalanceSheet> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let updatedBalanceSheet: BalanceSheet | undefined;
      
      setBalanceSheets(prev => 
        prev.map(bs => {
          if (bs.id === id) {
            updatedBalanceSheet = {
              ...bs,
              ...updates,
              updatedAt: new Date().toISOString().split('T')[0]
            };
            return updatedBalanceSheet;
          }
          return bs;
        })
      );
      
      if (!updatedBalanceSheet) {
        throw new Error('Balanço não encontrado');
      }
      
      return updatedBalanceSheet;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar balanço';
      setError(errorMessage);
      console.error('Erro ao atualizar balanço:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBalanceSheet = async (id: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verifica se o balanço está publicado ou auditado
      const balanceSheet = balanceSheets.find(bs => bs.id === id);
      if (balanceSheet?.status !== 'draft') {
        throw new Error('Apenas balanços em rascunho podem ser excluídos');
      }
      
      setBalanceSheets(prev => prev.filter(bs => bs.id !== id));
      
      // Remove também os itens do balanço
      setBalanceSheetItems(prev => prev.filter(item => item.balanceSheetId !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir balanço';
      setError(errorMessage);
      console.error('Erro ao excluir balanço:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const publishBalanceSheet = async (id: string): Promise<BalanceSheet> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let publishedBalanceSheet: BalanceSheet | undefined;
      
      setBalanceSheets(prev => 
        prev.map(bs => {
          if (bs.id === id) {
            if (bs.status !== 'draft') {
              throw new Error('Apenas balanços em rascunho podem ser publicados');
            }
            
            publishedBalanceSheet = {
              ...bs,
              status: 'published',
              publishedAt: new Date().toISOString().split('T')[0],
              updatedAt: new Date().toISOString().split('T')[0]
            };
            return publishedBalanceSheet;
          }
          return bs;
        })
      );
      
      if (!publishedBalanceSheet) {
        throw new Error('Balanço não encontrado');
      }
      
      return publishedBalanceSheet;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao publicar balanço';
      setError(errorMessage);
      console.error('Erro ao publicar balanço:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const auditBalanceSheet = async (id: string, auditorName: string): Promise<BalanceSheet> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let auditedBalanceSheet: BalanceSheet | undefined;
      
      setBalanceSheets(prev => 
        prev.map(bs => {
          if (bs.id === id) {
            if (bs.status !== 'published') {
              throw new Error('Apenas balanços publicados podem ser auditados');
            }
            
            auditedBalanceSheet = {
              ...bs,
              status: 'audited',
              auditedAt: new Date().toISOString().split('T')[0],
              auditedBy: auditorName,
              updatedAt: new Date().toISOString().split('T')[0]
            };
            return auditedBalanceSheet;
          }
          return bs;
        })
      );
      
      if (!auditedBalanceSheet) {
        throw new Error('Balanço não encontrado');
      }
      
      return auditedBalanceSheet;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao auditar balanço';
      setError(errorMessage);
      console.error('Erro ao auditar balanço:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addBalanceSheetItem = async (balanceSheetId: string, data: BalanceSheetItemFormData): Promise<BalanceSheetItem> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verifica se o balanço existe e está em rascunho
      const balanceSheet = balanceSheets.find(bs => bs.id === balanceSheetId);
      if (!balanceSheet) {
        throw new Error('Balanço não encontrado');
      }
      
      if (balanceSheet.status !== 'draft') {
        throw new Error('Apenas balanços em rascunho podem ser editados');
      }
      
      // Verifica se a conta existe
      const account = accounts.find(acc => acc.id === data.accountId);
      if (!account) {
        throw new Error('Conta contábil não encontrada');
      }
      
      // Verifica se já existe um item para esta conta neste balanço
      const existingItem = balanceSheetItems.find(item => 
        item.balanceSheetId === balanceSheetId && 
        item.accountId === data.accountId
      );
      
      if (existingItem) {
        throw new Error('Esta conta já existe neste balanço');
      }
      
      // Calcula a variância, se aplicável
      const variance = data.budgetedAmount !== undefined 
        ? data.amount - data.budgetedAmount 
        : undefined;
      
      const newItem: BalanceSheetItem = {
        id: Date.now().toString(),
        balanceSheetId,
        accountId: data.accountId,
        accountCode: account.code,
        accountName: account.name,
        accountType: account.type,
        accountGroup: account.group,
        amount: data.amount,
        budgetedAmount: data.budgetedAmount,
        variance,
        notes: data.notes
      };
      
      setBalanceSheetItems(prev => [...prev, newItem]);
      
      // Atualiza a data de atualização do balanço
      setBalanceSheets(prev => 
        prev.map(bs => 
          bs.id === balanceSheetId 
            ? { ...bs, updatedAt: new Date().toISOString().split('T')[0] }
            : bs
        )
      );
      
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar item ao balanço';
      setError(errorMessage);
      console.error('Erro ao adicionar item ao balanço:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBalanceSheetItem = async (
    balanceSheetId: string, 
    itemId: string, 
    updates: Partial<BalanceSheetItemFormData>
  ): Promise<BalanceSheetItem> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verifica se o balanço existe e está em rascunho
      const balanceSheet = balanceSheets.find(bs => bs.id === balanceSheetId);
      if (!balanceSheet) {
        throw new Error('Balanço não encontrado');
      }
      
      if (balanceSheet.status !== 'draft') {
        throw new Error('Apenas balanços em rascunho podem ser editados');
      }
      
      let updatedItem: BalanceSheetItem | undefined;
      
      setBalanceSheetItems(prev => 
        prev.map(item => {
          if (item.id === itemId && item.balanceSheetId === balanceSheetId) {
            // Recalcula a variância, se aplicável
            let variance = item.variance;
            
            if (updates.amount !== undefined || updates.budgetedAmount !== undefined) {
              const newAmount = updates.amount !== undefined ? updates.amount : item.amount;
              const newBudgetedAmount = updates.budgetedAmount !== undefined ? updates.budgetedAmount : item.budgetedAmount;
              
              if (newBudgetedAmount !== undefined) {
                variance = newAmount - newBudgetedAmount;
              }
            }
            
            updatedItem = {
              ...item,
              amount: updates.amount !== undefined ? updates.amount : item.amount,
              budgetedAmount: updates.budgetedAmount !== undefined ? updates.budgetedAmount : item.budgetedAmount,
              variance,
              notes: updates.notes !== undefined ? updates.notes : item.notes
            };
            return updatedItem;
          }
          return item;
        })
      );
      
      if (!updatedItem) {
        throw new Error('Item não encontrado');
      }
      
      // Atualiza a data de atualização do balanço
      setBalanceSheets(prev => 
        prev.map(bs => 
          bs.id === balanceSheetId 
            ? { ...bs, updatedAt: new Date().toISOString().split('T')[0] }
            : bs
        )
      );
      
      return updatedItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar item do balanço';
      setError(errorMessage);
      console.error('Erro ao atualizar item do balanço:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBalanceSheetItem = async (balanceSheetId: string, itemId: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verifica se o balanço existe e está em rascunho
      const balanceSheet = balanceSheets.find(bs => bs.id === balanceSheetId);
      if (!balanceSheet) {
        throw new Error('Balanço não encontrado');
      }
      
      if (balanceSheet.status !== 'draft') {
        throw new Error('Apenas balanços em rascunho podem ser editados');
      }
      
      setBalanceSheetItems(prev => prev.filter(item => !(item.id === itemId && item.balanceSheetId === balanceSheetId)));
      
      // Atualiza a data de atualização do balanço
      setBalanceSheets(prev => 
        prev.map(bs => 
          bs.id === balanceSheetId 
            ? { ...bs, updatedAt: new Date().toISOString().split('T')[0] }
            : bs
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir item do balanço';
      setError(errorMessage);
      console.error('Erro ao excluir item do balanço:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getBalanceSheetById = (id: string): BalanceSheet | undefined => {
    return balanceSheets.find(bs => bs.id === id);
  };

  const getBalanceSheetItems = (balanceSheetId: string): BalanceSheetItem[] => {
    return balanceSheetItems.filter(item => item.balanceSheetId === balanceSheetId);
  };

  const getBalanceSheetSummary = (balanceSheetId: string): BalanceSheetSummary => {
    const items = getBalanceSheetItems(balanceSheetId);
    
    const totalAssets = items
      .filter(item => item.accountType === 'asset')
      .reduce((sum, item) => sum + item.amount, 0);
    
    const totalLiabilities = items
      .filter(item => item.accountType === 'liability')
      .reduce((sum, item) => sum + item.amount, 0);
    
    const totalEquity = items
      .filter(item => item.accountType === 'equity')
      .reduce((sum, item) => sum + item.amount, 0);
    
    const totalRevenue = items
      .filter(item => item.accountType === 'revenue')
      .reduce((sum, item) => sum + item.amount, 0);
    
    const totalExpense = items
      .filter(item => item.accountType === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);
    
    const netIncome = totalRevenue - totalExpense;
    
    // Cálculo de índices financeiros
    const currentAssets = items
      .filter(item => item.accountType === 'asset' && item.accountGroup === 'current-assets')
      .reduce((sum, item) => sum + item.amount, 0);
    
    const currentLiabilities = items
      .filter(item => item.accountType === 'liability' && item.accountGroup === 'current-liabilities')
      .reduce((sum, item) => sum + item.amount, 0);
    
    // Ativos de alta liquidez (caixa, equivalentes, contas a receber)
    const quickAssets = items
      .filter(item => 
        item.accountType === 'asset' && 
        item.accountGroup === 'current-assets' && 
        ['1.1.1', '1.1.2'].includes(item.accountCode)
      )
      .reduce((sum, item) => sum + item.amount, 0);
    
    // Cálculo dos índices
    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : undefined;
    const quickRatio = currentLiabilities > 0 ? quickAssets / currentLiabilities : undefined;
    const debtToEquityRatio = totalEquity > 0 ? totalLiabilities / totalEquity : undefined;
    const returnOnAssets = totalAssets > 0 ? netIncome / totalAssets : undefined;
    const returnOnEquity = totalEquity > 0 ? netIncome / totalEquity : undefined;
    
    return {
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalRevenue,
      totalExpense,
      netIncome,
      currentRatio,
      quickRatio,
      debtToEquityRatio,
      returnOnAssets,
      returnOnEquity
    };
  };

  const getBalanceSheetsByFiscalYear = (fiscalYearId: string): BalanceSheet[] => {
    return balanceSheets
      .filter(bs => bs.fiscalYearId === fiscalYearId)
      .sort((a, b) => a.period.localeCompare(b.period));
  };

  const getBalanceSheetsByPeriodType = (periodType: 'monthly' | 'quarterly' | 'annual'): BalanceSheet[] => {
    return balanceSheets
      .filter(bs => bs.periodType === periodType)
      .sort((a, b) => a.period.localeCompare(b.period));
  };

  const getFilteredBalanceSheets = (
    fiscalYearId: string = 'all',
    periodType: string = 'all',
    status: string = 'all',
    searchTerm: string = ''
  ): BalanceSheet[] => {
    let filtered = balanceSheets;

    if (fiscalYearId !== 'all') {
      filtered = filtered.filter(bs => bs.fiscalYearId === fiscalYearId);
    }

    if (periodType !== 'all') {
      filtered = filtered.filter(bs => bs.periodType === periodType);
    }

    if (status !== 'all') {
      filtered = filtered.filter(bs => bs.status === status);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(bs => 
        bs.period.toLowerCase().includes(term) ||
        (bs.notes && bs.notes.toLowerCase().includes(term))
      );
    }

    return filtered.sort((a, b) => b.period.localeCompare(a.period));
  };

  const getAccountsByType = (type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'): AccountingAccount[] => {
    return accounts.filter(account => account.type === type);
  };

  const getAccountsByGroup = (group: string): AccountingAccount[] => {
    return accounts.filter(account => account.group === group);
  };

  return {
    balanceSheets,
    balanceSheetItems,
    accounts,
    isLoading,
    error,
    createBalanceSheet,
    updateBalanceSheet,
    deleteBalanceSheet,
    publishBalanceSheet,
    auditBalanceSheet,
    addBalanceSheetItem,
    updateBalanceSheetItem,
    deleteBalanceSheetItem,
    getBalanceSheetById,
    getBalanceSheetItems,
    getBalanceSheetSummary,
    getBalanceSheetsByFiscalYear,
    getBalanceSheetsByPeriodType,
    getFilteredBalanceSheets,
    getAccountsByType,
    getAccountsByGroup
  };
}