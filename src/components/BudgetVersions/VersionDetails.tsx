import React, { useState } from 'react';
import { X, Calendar, DollarSign, Plus, Edit, Trash2, TrendingUp, TrendingDown, BarChart3, CheckCircle, Star } from 'lucide-react';
import { BudgetVersion, BudgetVersionItem, versionStatusLabels, scenarioTypeLabels } from '../../types/budgetVersion';
import { BudgetItem } from '../../types/budgetItem';
import { FiscalYear, CostCenter } from '../../types';
import { VersionItemForm } from './VersionItemForm';

interface VersionDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  version: BudgetVersion | null;
  versionItems: BudgetVersionItem[];
  budgetItems: BudgetItem[];
  fiscalYear?: FiscalYear;
  costCenter?: CostCenter;
  onAddItem: (versionId: string, item: any) => void;
  onUpdateItem: (versionId: string, itemId: string, updates: any) => void;
  onDeleteItem: (versionId: string, itemId: string) => void;
  onApprove: (id: string) => void;
  onActivate: (id: string) => void;
}

export function VersionDetails({ 
  isOpen, 
  onClose, 
  version, 
  versionItems,
  budgetItems,
  fiscalYear,
  costCenter,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onApprove,
  onActivate
}: VersionDetailsProps) {
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<BudgetVersionItem | null>(null);
  const [activeTab, setActiveTab] = useState<'items' | 'summary' | 'assumptions'>('items');

  if (!isOpen || !version) return null;

  const handleAddItem = (itemData: any) => {
    onAddItem(version.id, itemData);
    setShowItemForm(false);
  };

  const handleEditItem = (item: BudgetVersionItem) => {
    setItemToEdit(item);
    setShowItemForm(true);
  };

  const handleUpdateItem = (itemData: any) => {
    if (itemToEdit) {
      onUpdateItem(version.id, itemToEdit.id, itemData);
      setItemToEdit(null);
      setShowItemForm(false);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Tem certeza que deseja remover este item da versão?')) {
      onDeleteItem(version.id, itemId);
    }
  };

  const handleCloseItemForm = () => {
    setShowItemForm(false);
    setItemToEdit(null);
  };

  // Calcula estatísticas
  const totalOriginal = versionItems.reduce((sum, item) => sum + item.originalAmount, 0);
  const totalAdjusted = versionItems.reduce((sum, item) => sum + item.adjustedAmount, 0);
  const totalDifference = totalAdjusted - totalOriginal;
  const totalPercentageDifference = totalOriginal > 0 ? (totalDifference / totalOriginal) * 100 : 0;
  
  // Agrupa por tipo (receita/despesa)
  const revenueItems = versionItems.filter(item => {
    const budgetItem = budgetItems.find(bi => bi.id === item.budgetItemId);
    return budgetItem?.type === 'revenue';
  });
  
  const expenseItems = versionItems.filter(item => {
    const budgetItem = budgetItems.find(bi => bi.id === item.budgetItemId);
    return budgetItem?.type === 'expense';
  });
  
  const totalRevenueOriginal = revenueItems.reduce((sum, item) => sum + item.originalAmount, 0);
  const totalRevenueAdjusted = revenueItems.reduce((sum, item) => sum + item.adjustedAmount, 0);
  const totalExpenseOriginal = expenseItems.reduce((sum, item) => sum + item.originalAmount, 0);
  const totalExpenseAdjusted = expenseItems.reduce((sum, item) => sum + item.adjustedAmount, 0);
  
  // Calcula o resultado (receita - despesa)
  const resultOriginal = totalRevenueOriginal - totalExpenseOriginal;
  const resultAdjusted = totalRevenueAdjusted - totalExpenseAdjusted;
  const resultDifference = resultAdjusted - resultOriginal;
  const resultPercentageDifference = resultOriginal !== 0 ? (resultDifference / Math.abs(resultOriginal)) * 100 : 0;

  // Lista de IDs de itens já incluídos na versão
  const includedItemIds = versionItems.map(item => item.budgetItemId);

  // Verifica se há itens disponíveis para adicionar
  const hasAvailableItems = budgetItems.some(item => !includedItemIds.includes(item.id));

  // Verifica se o usuário pode editar a versão
  const canEdit = version.status === 'draft' || version.status === 'simulation';

  // Verifica se o usuário pode aprovar a versão
  const canApprove = version.status === 'draft' || version.status === 'simulation';

  // Verifica se o usuário pode ativar a versão
  const canActivate = version.status === 'approved';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{version.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800`}>
                  Versão #{version.versionNumber}
                </span>
                {version.isBaseline && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    Versão Base
                  </span>
                )}
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                  version.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  version.status === 'simulation' ? 'bg-blue-100 text-blue-800' :
                  version.status === 'approved' ? 'bg-green-100 text-green-800' :
                  version.status === 'active' ? 'bg-purple-100 text-purple-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {versionStatusLabels[version.status as keyof typeof versionStatusLabels]}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {canApprove && (
              <button
                onClick={() => onApprove(version.id)}
                className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Aprovar</span>
              </button>
            )}
            
            {canActivate && (
              <button
                onClick={() => onActivate(version.id)}
                className="flex items-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Star className="w-4 h-4" />
                <span>Ativar</span>
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

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('items')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'items'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Itens Orçamentários
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'summary'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resumo Financeiro
            </button>
            <button
              onClick={() => setActiveTab('assumptions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assumptions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Premissas e Metadados
            </button>
          </nav>
        </div>

        {/* Itens Orçamentários */}
        {activeTab === 'items' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Itens Orçamentários</h3>
              
              {canEdit && hasAvailableItems && (
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
            
            {versionItems.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Nenhum item orçamentário nesta versão</p>
                {canEdit && hasAvailableItems && (
                  <button
                    onClick={() => {
                      setItemToEdit(null);
                      setShowItemForm(true);
                    }}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Adicionar Item
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Original
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ajuste
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Ajustado
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
                    {versionItems.map((item) => {
                      const budgetItem = budgetItems.find(bi => bi.id === item.budgetItemId);
                      const difference = item.adjustedAmount - item.originalAmount;
                      const percentageDifference = item.originalAmount > 0 
                        ? (difference / item.originalAmount) * 100 
                        : 0;
                      
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {budgetItem?.name || 'Item não encontrado'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {budgetItem?.type === 'revenue' ? 'Receita' : 'Despesa'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            R$ {item.originalAmount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {item.adjustmentType === 'percentage' 
                              ? `${item.adjustmentValue > 0 ? '+' : ''}${item.adjustmentValue}%` 
                              : `${item.adjustmentValue > 0 ? '+' : ''}R$ ${item.adjustmentValue.toLocaleString()}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                            R$ {item.adjustedAmount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              difference > 0 
                                ? 'bg-green-100 text-green-800' 
                                : difference < 0 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {difference > 0 ? (
                                <TrendingUp className="w-3 h-3 mr-1" />
                              ) : difference < 0 ? (
                                <TrendingDown className="w-3 h-3 mr-1" />
                              ) : null}
                              {difference > 0 ? '+' : ''}
                              {percentageDifference.toFixed(1)}%
                            </span>
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
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Resumo Financeiro */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo Financeiro</h3>
            
            {/* Totais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Orçamento Total</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Original:</span>
                    <span className="font-medium text-gray-800">R$ {totalOriginal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ajustado:</span>
                    <span className="font-medium text-gray-800">R$ {totalAdjusted.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-gray-600">Variação:</span>
                    <span className={`font-medium ${
                      totalDifference > 0 ? 'text-green-600' : totalDifference < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {totalDifference > 0 ? '+' : ''}
                      {totalDifference.toLocaleString()} ({totalPercentageDifference.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Receitas</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Original:</span>
                    <span className="font-medium text-green-600">R$ {totalRevenueOriginal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ajustado:</span>
                    <span className="font-medium text-green-600">R$ {totalRevenueAdjusted.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-gray-600">Variação:</span>
                    <span className={`font-medium ${
                      totalRevenueAdjusted - totalRevenueOriginal > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {totalRevenueAdjusted - totalRevenueOriginal > 0 ? '+' : ''}
                      {(totalRevenueAdjusted - totalRevenueOriginal).toLocaleString()} (
                      {totalRevenueOriginal > 0 
                        ? ((totalRevenueAdjusted - totalRevenueOriginal) / totalRevenueOriginal * 100).toFixed(1) 
                        : '0.0'}%)
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Despesas</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Original:</span>
                    <span className="font-medium text-red-600">R$ {totalExpenseOriginal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ajustado:</span>
                    <span className="font-medium text-red-600">R$ {totalExpenseAdjusted.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-gray-600">Variação:</span>
                    <span className={`font-medium ${
                      totalExpenseAdjusted - totalExpenseOriginal > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {totalExpenseAdjusted - totalExpenseOriginal > 0 ? '+' : ''}
                      {(totalExpenseAdjusted - totalExpenseOriginal).toLocaleString()} (
                      {totalExpenseOriginal > 0 
                        ? ((totalExpenseAdjusted - totalExpenseOriginal) / totalExpenseOriginal * 100).toFixed(1) 
                        : '0.0'}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Resultado (Receitas - Despesas) */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h4 className="text-lg font-medium text-gray-800 mb-4">Resultado (Receitas - Despesas)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Resultado Original:</span>
                    <span className={`text-xl font-bold ${resultOriginal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {resultOriginal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Resultado Ajustado:</span>
                    <span className={`text-xl font-bold ${resultAdjusted >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {resultAdjusted.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 font-medium">Variação no Resultado:</span>
                    <span className={`text-lg font-bold ${resultDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {resultDifference > 0 ? '+' : ''}
                      R$ {resultDifference.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Variação Percentual:</span>
                    <span className={`font-medium ${resultDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {resultDifference > 0 ? '+' : ''}
                      {resultPercentageDifference.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-gray-500">
                    {resultDifference > 0 
                      ? 'Esta versão apresenta um resultado melhor que a versão original.' 
                      : resultDifference < 0 
                      ? 'Esta versão apresenta um resultado pior que a versão original.' 
                      : 'Esta versão mantém o mesmo resultado da versão original.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Premissas e Metadados */}
        {activeTab === 'assumptions' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Premissas e Metadados</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações Básicas */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Informações Básicas</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Exercício:</span>
                    <span className="font-medium text-gray-800">
                      {fiscalYear ? `${fiscalYear.name} (${fiscalYear.year})` : 'Não especificado'}
                    </span>
                  </div>
                  {costCenter && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Centro de Custo:</span>
                      <span className="font-medium text-gray-800">
                        {costCenter.code} - {costCenter.name}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Versão Base:</span>
                    <span className="font-medium text-gray-800">
                      {version.isBaseline ? 'Sim' : 'Não'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Criado por:</span>
                    <span className="font-medium text-gray-800">{version.createdBy}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Data de Criação:</span>
                    <span className="font-medium text-gray-800">
                      {new Date(version.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Cenário */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Informações do Cenário</h4>
                <div className="space-y-3">
                  {version.metadata?.scenarioType && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tipo de Cenário:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        version.metadata.scenarioType === 'optimistic' ? 'bg-green-100 text-green-800' :
                        version.metadata.scenarioType === 'realistic' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {scenarioTypeLabels[version.metadata.scenarioType as keyof typeof scenarioTypeLabels]}
                      </span>
                    </div>
                  )}
                  {version.metadata?.adjustmentFactor && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Fator de Ajuste:</span>
                      <span className={`font-medium ${
                        version.metadata.adjustmentFactor > 1 ? 'text-green-600' :
                        version.metadata.adjustmentFactor < 1 ? 'text-red-600' :
                        'text-gray-800'
                      }`}>
                        {version.metadata.adjustmentFactor.toFixed(2)}x
                        {version.metadata.adjustmentFactor !== 1 && (
                          <span className="ml-1">
                            ({version.metadata.adjustmentFactor > 1 ? '+' : ''}
                            {((version.metadata.adjustmentFactor - 1) * 100).toFixed(1)}%)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  {version.parentVersionId && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Baseada em:</span>
                      <span className="font-medium text-gray-800">
                        Versão #{version.versionNumber - 1}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Premissas */}
            {version.metadata?.assumptions && version.metadata.assumptions.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Premissas</h4>
                <ul className="space-y-2">
                  {version.metadata.assumptions.map((assumption, index) => (
                    <li key={index} className="flex items-start p-2 hover:bg-gray-50 rounded-lg">
                      <span className="mr-2 text-blue-500">•</span>
                      <span className="text-gray-700">{assumption}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Tags */}
            {version.metadata?.tags && version.metadata.tags.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {version.metadata.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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
        <VersionItemForm
          isOpen={showItemForm}
          onClose={handleCloseItemForm}
          onSave={itemToEdit ? handleUpdateItem : handleAddItem}
          initialData={itemToEdit}
          budgetItems={budgetItems}
          excludedItemIds={includedItemIds}
        />
      </div>
    </div>
  );
}