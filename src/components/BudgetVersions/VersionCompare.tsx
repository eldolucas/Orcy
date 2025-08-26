import React, { useState, useEffect } from 'react';
import { X, BarChart3, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { BudgetVersion } from '../../types/budgetVersion';
import { BudgetItem } from '../../types/budgetItem';
import { FiscalYear } from '../../types';
import { useBudgetVersions } from '../../hooks/useBudgetVersions';

interface VersionCompareProps {
  isOpen: boolean;
  onClose: () => void;
  version: BudgetVersion | null;
  versions: BudgetVersion[];
  budgetItems: BudgetItem[];
  fiscalYears: FiscalYear[];
}

export function VersionCompare({ 
  isOpen, 
  onClose, 
  version,
  versions,
  budgetItems,
  fiscalYears
}: VersionCompareProps) {
  const { compareVersions } = useBudgetVersions();
  const [compareToVersionId, setCompareToVersionId] = useState<string>('');
  const [comparisonResult, setComparisonResult] = useState<any>(null);

  // Reset quando o modal é aberto ou a versão muda
  useEffect(() => {
    if (isOpen && version) {
      // Tenta selecionar a versão base como padrão para comparação
      const baselineVersion = versions.find(v => 
        v.fiscalYearId === version.fiscalYearId && 
        v.isBaseline && 
        v.id !== version.id
      );
      
      if (baselineVersion) {
        setCompareToVersionId(baselineVersion.id);
      } else if (version.parentVersionId) {
        // Ou a versão pai, se existir
        setCompareToVersionId(version.parentVersionId);
      } else {
        // Ou a primeira versão disponível que não seja a atual
        const otherVersion = versions.find(v => 
          v.fiscalYearId === version.fiscalYearId && 
          v.id !== version.id
        );
        
        if (otherVersion) {
          setCompareToVersionId(otherVersion.id);
        } else {
          setCompareToVersionId('');
        }
      }
    } else {
      setCompareToVersionId('');
      setComparisonResult(null);
    }
  }, [isOpen, version, versions]);

  // Realiza a comparação quando a versão de comparação muda
  useEffect(() => {
    if (version && compareToVersionId) {
      const result = compareVersions(compareToVersionId, version.id);
      setComparisonResult(result);
    } else {
      setComparisonResult(null);
    }
  }, [compareToVersionId, version, compareVersions]);

  if (!isOpen || !version) return null;

  // Filtra as versões disponíveis para comparação
  const availableVersions = versions.filter(v => 
    v.fiscalYearId === version.fiscalYearId && 
    v.id !== version.id
  );

  // Obtém o nome da versão de comparação
  const compareToVersion = versions.find(v => v.id === compareToVersionId);

  // Obtém o exercício fiscal
  const fiscalYear = fiscalYears.find(fy => fy.id === version.fiscalYearId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Comparação de Versões</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Seleção de Versão para Comparação */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comparar "{version.name}" com:
          </label>
          <select
            value={compareToVersionId}
            onChange={(e) => setCompareToVersionId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Selecione uma versão para comparação</option>
            {availableVersions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} {v.isBaseline ? '(Base)' : `(#${v.versionNumber})`}
              </option>
            ))}
          </select>
        </div>

        {/* Resumo da Comparação */}
        {comparisonResult && (
          <div className="space-y-6">
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Resumo da Comparação</h3>
                    <p className="text-sm text-gray-600">
                      {fiscalYear ? `Exercício: ${fiscalYear.name} (${fiscalYear.year})` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Variação Total</p>
                  <p className={`text-xl font-bold ${
                    comparisonResult.totalDifference > 0 ? 'text-green-600' : 
                    comparisonResult.totalDifference < 0 ? 'text-red-600' : 'text-gray-800'
                  }`}>
                    {comparisonResult.totalDifference > 0 ? '+' : ''}
                    {comparisonResult.totalDifference.toLocaleString()} ({comparisonResult.totalPercentageDifference.toFixed(1)}%)
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{compareToVersion?.name || 'Versão 1'}</span>
                    <span className="text-sm font-medium text-gray-800">
                      R$ {comparisonResult.totalVersion1.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-purple-500" />
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{version.name}</span>
                    <span className="text-sm font-medium text-gray-800">
                      R$ {comparisonResult.totalVersion2.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Detalhes da Comparação */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalhes por Item</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {compareToVersion?.name || 'Versão 1'}
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {version.name}
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Diferença
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Variação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {comparisonResult.items.map((item: any, index: number) => {
                      const budgetItem = budgetItems.find(bi => bi.id === item.budgetItemId);
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
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
                            R$ {item.version1Amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            R$ {item.version2Amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <span className={`${
                              item.difference > 0 ? 'text-green-600' : 
                              item.difference < 0 ? 'text-red-600' : 'text-gray-800'
                            }`}>
                              {item.difference > 0 ? '+' : ''}
                              {item.difference.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              item.difference > 0 
                                ? 'bg-green-100 text-green-800' 
                                : item.difference < 0 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {item.difference > 0 ? (
                                <TrendingUp className="w-3 h-3 mr-1" />
                              ) : item.difference < 0 ? (
                                <TrendingDown className="w-3 h-3 mr-1" />
                              ) : null}
                              {item.difference > 0 ? '+' : ''}
                              {item.percentageDifference.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem quando não há versão selecionada para comparação */}
        {!comparisonResult && compareToVersionId === '' && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Selecione uma versão para comparação</p>
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
      </div>
    </div>
  );
}