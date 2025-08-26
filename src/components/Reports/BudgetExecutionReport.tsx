import React, { useEffect, useState } from 'react';
import { PieChart, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';
import { useReports, BudgetExecutionData } from '../../hooks/useReports';

interface BudgetExecutionReportProps {
  filters: {
    fiscalYearId: string;
    costCenterId: string;
    startDate: string;
    endDate: string;
    period: string;
  };
}

export function BudgetExecutionReport({ filters }: BudgetExecutionReportProps) {
  const { generateBudgetExecutionReport } = useReports();
  const [data, setData] = useState<BudgetExecutionData[]>([]);

  useEffect(() => {
    const reportData = generateBudgetExecutionReport(filters);
    setData(reportData);
  }, [filters, generateBudgetExecutionReport]);

  const totalBudgeted = data.reduce((sum, item) => sum + item.budgeted, 0);
  const totalSpent = data.reduce((sum, item) => sum + item.spent, 0);
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const overallUtilization = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 100) return 'text-red-600';
    if (utilization > 90) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getVarianceColor = (variance: number) => {
    if (variance < 0) return 'text-red-600';
    if (variance > 0) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <PieChart className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Relatório de Execução Orçamentária</h2>
          <p className="text-sm text-gray-600">Análise detalhada da execução do orçamento por centro de custo</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Orçado</p>
              <p className="text-lg font-bold text-blue-800">R$ {totalBudgeted.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Total Gasto</p>
              <p className="text-lg font-bold text-purple-800">R$ {totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Total Receitas</p>
              <p className="text-lg font-bold text-green-800">R$ {totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Utilização Geral</p>
              <p className={`text-lg font-bold ${getUtilizationColor(overallUtilization)}`}>
                {overallUtilization.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Execução por Centro de Custo</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Centro de Custo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orçado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gasto
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receitas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilização
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variação
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
                    <div className="text-sm font-medium text-gray-900">{item.costCenterName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    R$ {item.budgeted.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    R$ {item.spent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    R$ {item.revenue.toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${getUtilizationColor(item.utilization)}`}>
                    {item.utilization.toFixed(1)}%
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
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.utilization > 100 
                        ? 'bg-red-100 text-red-800'
                        : item.utilization > 90
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.utilization > 100 ? 'Excedido' : item.utilization > 90 ? 'Atenção' : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Progress Visualization */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Progresso Visual por Centro</h3>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{item.costCenterName}</span>
                <span className={`text-sm font-medium ${getUtilizationColor(item.utilization)}`}>
                  {item.utilization.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    item.utilization > 100 ? 'bg-red-500' :
                    item.utilization > 90 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(item.utilization, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}