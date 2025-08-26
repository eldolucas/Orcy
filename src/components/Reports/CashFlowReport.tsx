import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useReports, CashFlowData } from '../../hooks/useReports';

interface CashFlowReportProps {
  filters: {
    fiscalYearId: string;
    costCenterId: string;
    startDate: string;
    endDate: string;
    period: string;
  };
}

export function CashFlowReport({ filters }: CashFlowReportProps) {
  const { generateCashFlowReport } = useReports();
  const [data, setData] = useState<CashFlowData[]>([]);

  useEffect(() => {
    const reportData = generateCashFlowReport(filters);
    setData(reportData);
  }, [filters, generateCashFlowReport]);

  const totalRevenues = data.reduce((sum, item) => sum + item.revenues, 0);
  const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0);
  const netCashFlow = totalRevenues - totalExpenses;
  const finalCumulativeFlow = data.length > 0 ? data[data.length - 1].cumulativeFlow : 0;

  const positiveMonths = data.filter(item => item.netFlow > 0).length;
  const negativeMonths = data.filter(item => item.netFlow < 0).length;

  const maxValue = Math.max(
    ...data.map(item => Math.max(item.revenues, item.expenses, Math.abs(item.netFlow)))
  );

  const getFlowColor = (flow: number) => {
    if (flow > 0) return 'text-green-600';
    if (flow < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getFlowIcon = (flow: number) => {
    if (flow > 0) return <TrendingUp className="w-4 h-4" />;
    if (flow < 0) return <TrendingDown className="w-4 h-4" />;
    return <DollarSign className="w-4 h-4" />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Relatório de Fluxo de Caixa</h2>
          <p className="text-sm text-gray-600">Análise de receitas e despesas ao longo do tempo</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Total Receitas</p>
              <p className="text-lg font-bold text-green-800">R$ {totalRevenues.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-600 font-medium">Total Despesas</p>
              <p className="text-lg font-bold text-red-800">R$ {totalExpenses.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Fluxo Líquido</p>
              <p className={`text-lg font-bold ${getFlowColor(netCashFlow)}`}>
                R$ {Math.abs(netCashFlow).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Saldo Acumulado</p>
              <p className={`text-lg font-bold ${getFlowColor(finalCumulativeFlow)}`}>
                R$ {Math.abs(finalCumulativeFlow).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Análise Mensal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-800">{item.period}</h4>
                <div className={`flex items-center space-x-1 ${getFlowColor(item.netFlow)}`}>
                  {getFlowIcon(item.netFlow)}
                  <span className="text-xs font-medium">
                    {item.netFlow > 0 ? 'Positivo' : item.netFlow < 0 ? 'Negativo' : 'Neutro'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Receitas:</span>
                  <span className="font-medium text-green-600">R$ {item.revenues.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Despesas:</span>
                  <span className="font-medium text-red-600">R$ {item.expenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Líquido:</span>
                  <span className={`font-medium ${getFlowColor(item.netFlow)}`}>
                    R$ {Math.abs(item.netFlow).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Acumulado:</span>
                  <span className={`font-medium ${getFlowColor(item.cumulativeFlow)}`}>
                    R$ {Math.abs(item.cumulativeFlow).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Visual Bar */}
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Receitas</span>
                  <span>{((item.revenues / maxValue) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(item.revenues / maxValue) * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Despesas</span>
                  <span>{((item.expenses / maxValue) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${(item.expenses / maxValue) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Fluxo Detalhado</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receitas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Despesas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fluxo Líquido
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acumulado
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
                    <div className="text-sm font-medium text-gray-900">{item.period}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 font-medium">
                    R$ {item.revenues.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600 font-medium">
                    R$ {item.expenses.toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${getFlowColor(item.netFlow)}`}>
                    <div className="flex items-center justify-end space-x-1">
                      {getFlowIcon(item.netFlow)}
                      <span>R$ {Math.abs(item.netFlow).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${getFlowColor(item.cumulativeFlow)}`}>
                    R$ {Math.abs(item.cumulativeFlow).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.netFlow > 0 
                        ? 'bg-green-100 text-green-800'
                        : item.netFlow < 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.netFlow > 0 ? 'Positivo' : item.netFlow < 0 ? 'Negativo' : 'Neutro'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Estatísticas do Período</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Meses com fluxo positivo:</span>
              <span className="font-medium text-green-600">{positiveMonths}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Meses com fluxo negativo:</span>
              <span className="font-medium text-red-600">{negativeMonths}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxa de sucesso:</span>
              <span className="font-medium text-blue-600">
                {data.length > 0 ? ((positiveMonths / data.length) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Indicadores</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Margem líquida:</span>
              <span className={`font-medium ${getFlowColor(netCashFlow)}`}>
                {totalRevenues > 0 ? ((netCashFlow / totalRevenues) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Eficiência operacional:</span>
              <span className="font-medium text-blue-600">
                {totalExpenses > 0 ? ((totalRevenues / totalExpenses) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Crescimento acumulado:</span>
              <span className={`font-medium ${getFlowColor(finalCumulativeFlow)}`}>
                {finalCumulativeFlow > 0 ? 'Positivo' : finalCumulativeFlow < 0 ? 'Negativo' : 'Neutro'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}