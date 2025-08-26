import React, { useState } from 'react';
import { X, DollarSign, Plus, Edit, Trash2, TrendingUp, TrendingDown, FileText, CheckCircle } from 'lucide-react';
import { BalanceSheet, BalanceSheetItem, BalanceSheetSummary, accountTypeLabels, accountGroupLabels, balanceSheetStatusLabels } from '../../types/balanceSheet';
import { BalanceSheetItemForm } from './BalanceSheetItemForm';
import { AccountingAccount } from '../../types/balanceSheet';
import { FiscalYear } from '../../types';

interface BalanceSheetDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  balanceSheet: BalanceSheet | null;
  items: BalanceSheetItem[];
  accounts: AccountingAccount[];
  summary: BalanceSheetSummary;
  fiscalYear?: FiscalYear;
  onAddItem: (balanceSheetId: string, item: any) => void;
  onUpdateItem: (balanceSheetId: string, itemId: string, updates: any) => void;
  onDeleteItem: (balanceSheetId: string, itemId: string) => void;
  onPublish: (id: string) => void;
  onAudit: (id: string) => void;
}

export function BalanceSheetDetails({ 
  isOpen, 
  onClose, 
  balanceSheet, 
  items,
  accounts,
  summary,
  fiscalYear,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onPublish,
  onAudit
}: BalanceSheetDetailsProps) {
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<BalanceSheetItem | null>(null);
  const [activeTab, setActiveTab] = useState<'assets' | 'liabilities' | 'equity' | 'income' | 'ratios'>('assets');

  if (!isOpen || !balanceSheet) return null;

  const handleAddItem = (itemData: any) => {
    onAddItem(balanceSheet.id, itemData);
    setShowItemForm(false);
  };

  const handleEditItem = (item: BalanceSheetItem) => {
    setItemToEdit(item);
    setShowItemForm(true);
  };

  const handleUpdateItem = (itemData: any) => {
    if (itemToEdit) {
      onUpdateItem(balanceSheet.id, itemToEdit.id, itemData);
      setItemToEdit(null);
      setShowItemForm(false);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Tem certeza que deseja remover este item do balanço?')) {
      onDeleteItem(balanceSheet.id, itemId);
    }
  };

  const handleCloseItemForm = () => {
    setShowItemForm(false);
    setItemToEdit(null);
  };

  const formatPeriod = (period: string, periodType: string) => {
    if (periodType === 'monthly') {
      const [year, month] = period.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
    } else if (periodType === 'quarterly') {
      const [year, quarter] = period.split('-');
      return `${quarter} Trimestre de ${year}`;
    } else {
      return `Ano ${period}`;
    }
  };

  // Filtra os itens por tipo de conta
  const assetItems = items.filter(item => item.accountType === 'asset');
  const liabilityItems = items.filter(item => item.accountType === 'liability');
  const equityItems = items.filter(item => item.accountType === 'equity');
  const revenueItems = items.filter(item => item.accountType === 'revenue');
  const expenseItems = items.filter(item => item.accountType === 'expense');

  // Agrupa os itens por grupo de conta
  const groupItemsByGroup = (items: BalanceSheetItem[]) => {
    const groups: Record<string, BalanceSheetItem[]> = {};
    
    items.forEach(item => {
      if (!groups[item.accountGroup]) {
        groups[item.accountGroup] = [];
      }
      groups[item.accountGroup].push(item);
    });
    
    return groups;
  };

  const assetGroups = groupItemsByGroup(assetItems);
  const liabilityGroups = groupItemsByGroup(liabilityItems);
  const equityGroups = groupItemsByGroup(equityItems);

  // Lista de IDs de contas já incluídas no balanço
  const includedAccountIds = items.map(item => item.accountId);

  // Verifica se há contas disponíveis para adicionar
  const hasAvailableAccounts = accounts.some(account => !includedAccountIds.includes(account.id));

  // Verifica se o usuário pode editar o balanço
  const canEdit = balanceSheet.status === 'draft';

  // Verifica se o usuário pode publicar o balanço
  const canPublish = balanceSheet.status === 'draft';

  // Verifica se o usuário pode auditar o balanço
  const canAudit = balanceSheet.status === 'published';

  // Verifica se o balanço está balanceado (Ativos = Passivos + PL)
  const isBalanced = Math.abs(summary.totalAssets - (summary.totalLiabilities + summary.totalEquity)) < 0.01;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {formatPeriod(balanceSheet.period, balanceSheet.periodType)}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                  balanceSheet.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  balanceSheet.status === 'published' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {balanceSheetStatusLabels[balanceSheet.status as keyof typeof balanceSheetStatusLabels]}
                </span>
                {fiscalYear && (
                  <span className="text-sm text-gray-600">
                    {fiscalYear.name}
                  </span>
                )}
                {!isBalanced && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    Não Balanceado
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {canPublish && (
              <button
                onClick={() => onPublish(balanceSheet.id)}
                className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Publicar</span>
              </button>
            )}
            
            {canAudit && (
              <button
                onClick={() => onAudit(balanceSheet.id)}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Auditar</span>
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 font-medium mb-1">Ativos</p>
            <p className="text-lg font-bold text-blue-800">
              R$ {summary.totalAssets.toLocaleString()}
            </p>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-xs text-red-600 font-medium mb-1">Passivos</p>
            <p className="text-lg font-bold text-red-800">
              R$ {summary.totalLiabilities.toLocaleString()}
            </p>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-purple-600 font-medium mb-1">Patrimônio Líquido</p>
            <p className="text-lg font-bold text-purple-800">
              R$ {summary.totalEquity.toLocaleString()}
            </p>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-green-600 font-medium mb-1">Receitas</p>
            <p className="text-lg font-bold text-green-800">
              R$ {summary.totalRevenue.toLocaleString()}
            </p>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-xs text-orange-600 font-medium mb-1">Despesas</p>
            <p className="text-lg font-bold text-orange-800">
              R$ {summary.totalExpense.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('assets')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Ativos
            </button>
            <button
              onClick={() => setActiveTab('liabilities')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'liabilities'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Passivos
            </button>
            <button
              onClick={() => setActiveTab('equity')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'equity'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Patrimônio Líquido
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'income'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resultado
            </button>
            <button
              onClick={() => setActiveTab('ratios')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ratios'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Índices
            </button>
          </nav>
        </div>

        {/* Conteúdo da Aba */}
        <div className="space-y-6">
          {/* Aba de Ativos */}
          {activeTab === 'assets' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Ativos</h3>
                
                {canEdit && hasAvailableAccounts && (
                  <button
                    onClick={() => {
                      setItemToEdit(null);
                      setShowItemForm(true);
                    }}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Item</span>
                  </button>
                )}
              </div>
              
              {Object.entries(assetGroups).length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Nenhum ativo registrado neste balanço</p>
                  {canEdit && hasAvailableAccounts && (
                    <button
                      onClick={() => {
                        setItemToEdit(null);
                        setShowItemForm(true);
                      }}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Adicionar Ativo
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(assetGroups).map(([group, groupItems]) => (
                    <div key={group} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                        <h4 className="font-medium text-gray-800">
                          {accountGroupLabels[group as keyof typeof accountGroupLabels] || group}
                        </h4>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Código
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Conta
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Valor Real
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Valor Orçado
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Variação
                              </th>
                              {canEdit && (
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Ações
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {groupItems.map((item) => {
                              const variance = item.budgetedAmount !== undefined 
                                ? item.amount - item.budgetedAmount 
                                : undefined;
                              
                              const variancePercentage = item.budgetedAmount && item.budgetedAmount > 0 
                                ? (variance! / item.budgetedAmount) * 100 
                                : undefined;
                              
                              return (
                                <tr key={item.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.accountCode}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.accountName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                    R$ {item.amount.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                    {item.budgetedAmount !== undefined 
                                      ? `R$ ${item.budgetedAmount.toLocaleString()}`
                                      : '-'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right">
                                    {variance !== undefined && (
                                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                        variance > 0 
                                          ? 'bg-green-100 text-green-800' 
                                          : variance < 0 
                                          ? 'bg-red-100 text-red-800' 
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {variance > 0 ? (
                                          <TrendingUp className="w-3 h-3 mr-1" />
                                        ) : variance < 0 ? (
                                          <TrendingDown className="w-3 h-3 mr-1" />
                                        ) : null}
                                        {variance > 0 ? '+' : ''}
                                        {variance.toLocaleString()} ({variancePercentage?.toFixed(1)}%)
                                      </span>
                                    )}
                                  </td>
                                  {canEdit && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <button
                                        onClick={() => handleEditItem(item)}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="text-red-600 hover:text-red-900"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                            <tr className="bg-gray-50 font-medium">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" colSpan={2}>
                                Total {accountGroupLabels[group as keyof typeof accountGroupLabels] || group}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                R$ {groupItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                {groupItems.some(item => item.budgetedAmount !== undefined) 
                                  ? `R$ ${groupItems.reduce((sum, item) => sum + (item.budgetedAmount || 0), 0).toLocaleString()}`
                                  : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500" colSpan={canEdit ? 2 : 1}>
                                {groupItems.some(item => item.variance !== undefined) 
                                  ? `R$ ${groupItems.reduce((sum, item) => sum + (item.variance || 0), 0).toLocaleString()}`
                                  : '-'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                  
                  {/* Total de Ativos */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-blue-800">Total de Ativos</h4>
                      <span className="text-xl font-bold text-blue-800">
                        R$ {summary.totalAssets.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Aba de Passivos */}
          {activeTab === 'liabilities' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Passivos</h3>
                
                {canEdit && hasAvailableAccounts && (
                  <button
                    onClick={() => {
                      setItemToEdit(null);
                      setShowItemForm(true);
                    }}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Item</span>
                  </button>
                )}
              </div>
              
              {Object.entries(liabilityGroups).length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Nenhum passivo registrado neste balanço</p>
                  {canEdit && hasAvailableAccounts && (
                    <button
                      onClick={() => {
                        setItemToEdit(null);
                        setShowItemForm(true);
                      }}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Adicionar Passivo
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(liabilityGroups).map(([group, groupItems]) => (
                    <div key={group} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                        <h4 className="font-medium text-gray-800">
                          {accountGroupLabels[group as keyof typeof accountGroupLabels] || group}
                        </h4>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Código
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Conta
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Valor Real
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Valor Orçado
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Variação
                              </th>
                              {canEdit && (
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Ações
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {groupItems.map((item) => {
                              const variance = item.budgetedAmount !== undefined 
                                ? item.amount - item.budgetedAmount 
                                : undefined;
                              
                              const variancePercentage = item.budgetedAmount && item.budgetedAmount > 0 
                                ? (variance! / item.budgetedAmount) * 100 
                                : undefined;
                              
                              return (
                                <tr key={item.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.accountCode}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.accountName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                    R$ {item.amount.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                    {item.budgetedAmount !== undefined 
                                      ? `R$ ${item.budgetedAmount.toLocaleString()}`
                                      : '-'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right">
                                    {variance !== undefined && (
                                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                        variance > 0 
                                          ? 'bg-red-100 text-red-800' 
                                          : variance < 0 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {variance > 0 ? (
                                          <TrendingUp className="w-3 h-3 mr-1" />
                                        ) : variance < 0 ? (
                                          <TrendingDown className="w-3 h-3 mr-1" />
                                        ) : null}
                                        {variance > 0 ? '+' : ''}
                                        {variance.toLocaleString()} ({variancePercentage?.toFixed(1)}%)
                                      </span>
                                    )}
                                  </td>
                                  {canEdit && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <button
                                        onClick={() => handleEditItem(item)}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="text-red-600 hover:text-red-900"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                            <tr className="bg-gray-50 font-medium">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" colSpan={2}>
                                Total {accountGroupLabels[group as keyof typeof accountGroupLabels] || group}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                R$ {groupItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                {groupItems.some(item => item.budgetedAmount !== undefined) 
                                  ? `R$ ${groupItems.reduce((sum, item) => sum + (item.budgetedAmount || 0), 0).toLocaleString()}`
                                  : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500" colSpan={canEdit ? 2 : 1}>
                                {groupItems.some(item => item.variance !== undefined) 
                                  ? `R$ ${groupItems.reduce((sum, item) => sum + (item.variance || 0), 0).toLocaleString()}`
                                  : '-'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                  
                  {/* Total de Passivos */}
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-red-800">Total de Passivos</h4>
                      <span className="text-xl font-bold text-red-800">
                        R$ {summary.totalLiabilities.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Aba de Patrimônio Líquido */}
          {activeTab === 'equity' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Patrimônio Líquido</h3>
                
                {canEdit && hasAvailableAccounts && (
                  <button
                    onClick={() => {
                      setItemToEdit(null);
                      setShowItemForm(true);
                    }}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Item</span>
                  </button>
                )}
              </div>
              
              {Object.entries(equityGroups).length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Nenhum item de patrimônio líquido registrado neste balanço</p>
                  {canEdit && hasAvailableAccounts && (
                    <button
                      onClick={() => {
                        setItemToEdit(null);
                        setShowItemForm(true);
                      }}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Adicionar Item de Patrimônio Líquido
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(equityGroups).map(([group, groupItems]) => (
                    <div key={group} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                        <h4 className="font-medium text-gray-800">
                          {accountGroupLabels[group as keyof typeof accountGroupLabels] || group}
                        </h4>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Código
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Conta
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Valor Real
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Valor Orçado
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Variação
                              </th>
                              {canEdit && (
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Ações
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {groupItems.map((item) => {
                              const variance = item.budgetedAmount !== undefined 
                                ? item.amount - item.budgetedAmount 
                                : undefined;
                              
                              const variancePercentage = item.budgetedAmount && item.budgetedAmount > 0 
                                ? (variance! / item.budgetedAmount) * 100 
                                : undefined;
                              
                              return (
                                <tr key={item.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.accountCode}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.accountName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                    R$ {item.amount.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                    {item.budgetedAmount !== undefined 
                                      ? `R$ ${item.budgetedAmount.toLocaleString()}`
                                      : '-'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right">
                                    {variance !== undefined && (
                                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                        variance > 0 
                                          ? 'bg-green-100 text-green-800' 
                                          : variance < 0 
                                          ? 'bg-red-100 text-red-800' 
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {variance > 0 ? (
                                          <TrendingUp className="w-3 h-3 mr-1" />
                                        ) : variance < 0 ? (
                                          <TrendingDown className="w-3 h-3 mr-1" />
                                        ) : null}
                                        {variance > 0 ? '+' : ''}
                                        {variance.toLocaleString()} ({variancePercentage?.toFixed(1)}%)
                                      </span>
                                    )}
                                  </td>
                                  {canEdit && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <button
                                        onClick={() => handleEditItem(item)}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="text-red-600 hover:text-red-900"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                            <tr className="bg-gray-50 font-medium">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" colSpan={2}>
                                Total {accountGroupLabels[group as keyof typeof accountGroupLabels] || group}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                R$ {groupItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                {groupItems.some(item => item.budgetedAmount !== undefined) 
                                  ? `R$ ${groupItems.reduce((sum, item) => sum + (item.budgetedAmount || 0), 0).toLocaleString()}`
                                  : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500" colSpan={canEdit ? 2 : 1}>
                                {groupItems.some(item => item.variance !== undefined) 
                                  ? `R$ ${groupItems.reduce((sum, item) => sum + (item.variance || 0), 0).toLocaleString()}`
                                  : '-'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                  
                  {/* Total de Patrimônio Líquido */}
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-purple-800">Total de Patrimônio Líquido</h4>
                      <span className="text-xl font-bold text-purple-800">
                        R$ {summary.totalEquity.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Aba de Resultado */}
          {activeTab === 'income' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Demonstração de Resultado</h3>
                
                {canEdit && hasAvailableAccounts && (
                  <button
                    onClick={() => {
                      setItemToEdit(null);
                      setShowItemForm(true);
                    }}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Item</span>
                  </button>
                )}
              </div>
              
              {revenueItems.length === 0 && expenseItems.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Nenhum item de resultado registrado neste balanço</p>
                  {canEdit && hasAvailableAccounts && (
                    <button
                      onClick={() => {
                        setItemToEdit(null);
                        setShowItemForm(true);
                      }}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Adicionar Item de Resultado
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Receitas */}
                  {revenueItems.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-green-50 px-6 py-3 border-b border-gray-200">
                        <h4 className="font-medium text-green-800">Receitas</h4>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Código
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Conta
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Valor Real
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Valor Orçado
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Variação
                              </th>
                              {canEdit && (
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Ações
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {revenueItems.map((item) => {
                              const variance = item.budgetedAmount !== undefined 
                                ? item.amount - item.budgetedAmount 
                                : undefined;
                              
                              const variancePercentage = item.budgetedAmount && item.budgetedAmount > 0 
                                ? (variance! / item.budgetedAmount) * 100 
                                : undefined;
                              
                              return (
                                <tr key={item.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.accountCode}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.accountName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                    R$ {item.amount.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                    {item.budgetedAmount !== undefined 
                                      ? `R$ ${item.budgetedAmount.toLocaleString()}`
                                      : '-'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right">
                                    {variance !== undefined && (
                                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                        variance > 0 
                                          ? 'bg-green-100 text-green-800' 
                                          : variance < 0 
                                          ? 'bg-red-100 text-red-800' 
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {variance > 0 ? (
                                          <TrendingUp className="w-3 h-3 mr-1" />
                                        ) : variance < 0 ? (
                                          <TrendingDown className="w-3 h-3 mr-1" />
                                        ) : null}
                                        {variance > 0 ? '+' : ''}
                                        {variance.toLocaleString()} ({variancePercentage?.toFixed(1)}%)
                                      </span>
                                    )}
                                  </td>
                                  {canEdit && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <button
                                        onClick={() => handleEditItem(item)}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="text-red-600 hover:text-red-900"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                            <tr className="bg-gray-50 font-medium">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" colSpan={2}>
                                Total de Receitas
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">
                                R$ {summary.totalRevenue.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                {revenueItems.some(item => item.budgetedAmount !== undefined) 
                                  ? `R$ ${revenueItems.reduce((sum, item) => sum + (item.budgetedAmount || 0), 0).toLocaleString()}`
                                  : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500" colSpan={canEdit ? 2 : 1}>
                                {revenueItems.some(item => item.variance !== undefined) 
                                  ? `R$ ${revenueItems.reduce((sum, item) => sum + (item.variance || 0), 0).toLocaleString()}`
                                  : '-'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {/* Despesas */}
                  {expenseItems.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-orange-50 px-6 py-3 border-b border-gray-200">
                        <h4 className="font-medium text-orange-800">Despesas</h4>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Código
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Conta
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Valor Real
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Valor Orçado
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Variação
                              </th>
                              {canEdit && (
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Ações
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {expenseItems.map((item) => {
                              const variance = item.budgetedAmount !== undefined 
                                ? item.amount - item.budgetedAmount 
                                : undefined;
                              
                              const variancePercentage = item.budgetedAmount && item.budgetedAmount > 0 
                                ? (variance! / item.budgetedAmount) * 100 
                                : undefined;
                              
                              return (
                                <tr key={item.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.accountCode}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.accountName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                    R$ {item.amount.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                    {item.budgetedAmount !== undefined 
                                      ? `R$ ${item.budgetedAmount.toLocaleString()}`
                                      : '-'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right">
                                    {variance !== undefined && (
                                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                        variance > 0 
                                          ? 'bg-red-100 text-red-800' 
                                          : variance < 0 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {variance > 0 ? (
                                          <TrendingUp className="w-3 h-3 mr-1" />
                                        ) : variance < 0 ? (
                                          <TrendingDown className="w-3 h-3 mr-1" />
                                        ) : null}
                                        {variance > 0 ? '+' : ''}
                                        {variance.toLocaleString()} ({variancePercentage?.toFixed(1)}%)
                                      </span>
                                    )}
                                  </td>
                                  {canEdit && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <button
                                        onClick={() => handleEditItem(item)}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="text-red-600 hover:text-red-900"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                            <tr className="bg-gray-50 font-medium">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" colSpan={2}>
                                Total de Despesas
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-orange-600">
                                R$ {summary.totalExpense.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                {expenseItems.some(item => item.budgetedAmount !== undefined) 
                                  ? `R$ ${expenseItems.reduce((sum, item) => sum + (item.budgetedAmount || 0), 0).toLocaleString()}`
                                  : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500" colSpan={canEdit ? 2 : 1}>
                                {expenseItems.some(item => item.variance !== undefined) 
                                  ? `R$ ${expenseItems.reduce((sum, item) => sum + (item.variance || 0), 0).toLocaleString()}`
                                  : '-'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {/* Resultado Líquido */}
                  <div className={`rounded-lg p-4 border ${
                    summary.netIncome > 0 
                      ? 'bg-green-50 border-green-200' 
                      : summary.netIncome < 0 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${
                        summary.netIncome > 0 
                          ? 'text-green-800' 
                          : summary.netIncome < 0 
                          ? 'text-red-800' 
                          : 'text-gray-800'
                      }`}>
                        Resultado Líquido {summary.netIncome > 0 ? '(Lucro)' : summary.netIncome < 0 ? '(Prejuízo)' : ''}
                      </h4>
                      <span className={`text-xl font-bold ${
                        summary.netIncome > 0 
                          ? 'text-green-800' 
                          : summary.netIncome < 0 
                          ? 'text-red-800' 
                          : 'text-gray-800'
                      }`}>
                        R$ {Math.abs(summary.netIncome).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Aba de Índices */}
          {activeTab === 'ratios' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Índices Financeiros</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Índices de Liquidez */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-blue-50 px-6 py-3 border-b border-gray-200">
                    <h4 className="font-medium text-blue-800">Índices de Liquidez</h4>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {summary.currentRatio !== undefined && (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">Liquidez Corrente</p>
                          <p className="text-xs text-gray-500">Ativos Circulantes / Passivos Circulantes</p>
                        </div>
                        <div className={`text-lg font-bold ${
                          summary.currentRatio >= 1 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {summary.currentRatio.toFixed(2)}
                        </div>
                      </div>
                    )}
                    
                    {summary.quickRatio !== undefined && (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">Liquidez Seca</p>
                          <p className="text-xs text-gray-500">Ativos de Alta Liquidez / Passivos Circulantes</p>
                        </div>
                        <div className={`text-lg font-bold ${
                          summary.quickRatio >= 1 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {summary.quickRatio.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Índices de Estrutura de Capital */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-purple-50 px-6 py-3 border-b border-gray-200">
                    <h4 className="font-medium text-purple-800">Estrutura de Capital</h4>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {summary.debtToEquityRatio !== undefined && (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">Dívida / Patrimônio</p>
                          <p className="text-xs text-gray-500">Passivos Totais / Patrimônio Líquido</p>
                        </div>
                        <div className={`text-lg font-bold ${
                          summary.debtToEquityRatio <= 1 ? 'text-green-600' : 
                          summary.debtToEquityRatio <= 2 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {summary.debtToEquityRatio.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Índices de Rentabilidade */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-green-50 px-6 py-3 border-b border-gray-200">
                    <h4 className="font-medium text-green-800">Índices de Rentabilidade</h4>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {summary.returnOnAssets !== undefined && (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">Retorno sobre Ativos (ROA)</p>
                          <p className="text-xs text-gray-500">Lucro Líquido / Ativos Totais</p>
                        </div>
                        <div className={`text-lg font-bold ${
                          summary.returnOnAssets > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(summary.returnOnAssets * 100).toFixed(2)}%
                        </div>
                      </div>
                    )}
                    
                    {summary.returnOnEquity !== undefined && (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">Retorno sobre PL (ROE)</p>
                          <p className="text-xs text-gray-500">Lucro Líquido / Patrimônio Líquido</p>
                        </div>
                        <div className={`text-lg font-bold ${
                          summary.returnOnEquity > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(summary.returnOnEquity * 100).toFixed(2)}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Análise de Equilíbrio */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <h4 className="font-medium text-gray-800">Análise de Equilíbrio</h4>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">Equação Patrimonial</p>
                        <p className="text-xs text-gray-500">Ativos = Passivos + Patrimônio Líquido</p>
                      </div>
                      <div className={`text-lg font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                        {isBalanced ? 'Balanceado' : 'Não Balanceado'}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">Diferença</p>
                      </div>
                      <div className="text-lg font-bold text-gray-800">
                        R$ {Math.abs(summary.totalAssets - (summary.totalLiabilities + summary.totalEquity)).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Fechar
          </button>
        </div>

        {/* Item Form */}
        <BalanceSheetItemForm
          isOpen={showItemForm}
          onClose={handleCloseItemForm}
          onSave={itemToEdit ? handleUpdateItem : handleAddItem}
          initialData={itemToEdit}
          accounts={accounts}
          excludedAccountIds={includedAccountIds}
        />
      </div>
    </div>
  );
}