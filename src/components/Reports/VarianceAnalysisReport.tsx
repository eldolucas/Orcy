import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useReports, VarianceAnalysisData } from '../../hooks/useReports';

interface VarianceAnalysisReportProps {
  filters: {
    fiscalYearId: string;
    costCenterId: string;
    startDate: string;
    endDate: string;
    period: string;
  };
}

export function VarianceAnalysisReport({ filters }: VarianceAnalysisReportProps) {
  const { generateVarianceAnalysisReport } = useReports();
  const [data, setData] = useState<VarianceAnalysisData[]>([]);

  useEffect(() => {
    const reportData = generateVarianceAnalysisReport(filters);
    setData(reportData);
  }, [filters, generateVarianceAnalysisReport]);

  const totalBudgeted = data.reduce((sum, item) => sum + item.budgeted, 0);
  const totalActual = data.reduce((sum, item) => sum + item.actual, 0);
  const totalVariance = totalBudgeted - totalActual;
  const totalVariancePercentage = totalBudgeted > 0 ? (totalVariance / totalBudgeted) * 100 : 0;

  const favorableCount = data.filter(item => item.status === 'favorable').length;
  const unfavorableCount = data.filter(item => item.status === 'unfavorable').length;
  const neutralCount = data.filter(item => item.status === 'neutral').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'favorable':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'unfavorable':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'favorable':
        return 'bg-green-100 text-green-800';
      case 'unfavorable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'favorable':
        return 'Favorável';
      case 'unfavorable':
        return 'Desfavorável';
      default:
        return 'Neutro';
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-green-600';
    if (variance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Análise de Variação</h2>
          <p className="text-sm text-gray-600">Comparação entre orçado vs realizado com análise de desvios</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Variação Total</p>
              <p className={`text-lg font-bold ${getVarianceColor(totalVariance)}`}>
                R$ {Math.abs(totalVariance).toLocaleString()}
              </p>
              <p className={`text-xs ${getVarianceColor(totalVariance)}`}>
                {totalVariancePercentage > 0 ? '+' : ''}{totalVariancePercentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Favoráveis</p>
              <p className="text-lg font-bold text-green-800">{favorableCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-600 font-medium">Desfavoráveis</p>
              <p className="text-lg font-bold text-red-800">{unfavorableCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-yellow-600 font-medium">Neutros</p>
              <p className="text-lg font-bold text-yellow-800">{neutralCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Análise por Categoria</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orçado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Realizado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variação (R$)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variação (%)
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    R$ {item.budgeted.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    R$ {item.actual.toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${getVarianceColor(item.variance)}`}>
                    <div className="flex items-center justify-end space-x-1">
                      {item.variance > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : item.variance < 0 ? (
                        <TrendingDown className="w-4 h-4" />
                      ) : null}
                      <span>R$ {Math.abs(item.variance).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${getVarianceColor(item.variance)}`}>
                    {item.variancePercentage > 0 ? '+' : ''}{item.variancePercentage.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {getStatusIcon(item.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Variance Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Variação por Categoria</h3>
          <div className="space-y-4">
            {data.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{item.category}</span>
                  <span className={`text-sm font-medium ${getVarianceColor(item.variance)}`}>
                    {item.variancePercentage > 0 ? '+' : ''}{item.variancePercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        item.variance > 0 ? 'bg-green-500' : 
                        item.variance < 0 ? 'bg-red-500' : 'bg-gray-400'
                      }`}
                      style={{ 
                        width: `${Math.min(Math.abs(item.variancePercentage), 100)}%`,
                        marginLeft: item.variance < 0 ? `${100 - Math.min(Math.abs(item.variancePercentage), 100)}%` : '0'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição de Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Favoráveis</span>
              </div>
              <span className="text-lg font-bold text-green-800">{favorableCount}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">Desfavoráveis</span>
              </div>
              <span className="text-lg font-bold text-red-800">{unfavorableCount}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Neutros</span>
              </div>
              <span className="text-lg font-bold text-yellow-800">{neutralCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}