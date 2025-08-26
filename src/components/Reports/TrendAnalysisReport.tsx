import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Target, AlertTriangle } from 'lucide-react';
import { useReports, TrendAnalysisData } from '../../hooks/useReports';

interface TrendAnalysisReportProps {
  filters: {
    fiscalYearId: string;
    costCenterId: string;
    startDate: string;
    endDate: string;
    period: string;
  };
}

export function TrendAnalysisReport({ filters }: TrendAnalysisReportProps) {
  const { generateTrendAnalysisReport } = useReports();
  const [data, setData] = useState<TrendAnalysisData[]>([]);

  useEffect(() => {
    const reportData = generateTrendAnalysisReport(filters);
    setData(reportData);
  }, [filters, generateTrendAnalysisReport]);

  const totalActual = data.reduce((sum, item) => sum + item.actual, 0);
  const totalProjection = data.reduce((sum, item) => sum + item.projection, 0);
  const averageConfidence = data.length > 0 ? data.reduce((sum, item) => sum + item.confidence, 0) / data.length : 0;
  
  const growthTrend = data.length > 1 ? 
    ((data[data.length - 1].actual - data[0].actual) / data[0].actual) * 100 : 0;

  const maxValue = Math.max(
    ...data.map(item => Math.max(item.actual, item.trend, item.projection))
  );

  const upwardTrends = data.filter((item, index) => 
    index > 0 && item.trend > data[index - 1].trend
  ).length;

  const downwardTrends = data.filter((item, index) => 
    index > 0 && item.trend < data[index - 1].trend
  ).length;

  const getTrendDirection = (current: number, previous: number) => {
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'stable';
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'Alta';
    if (confidence >= 60) return 'Média';
    return 'Baixa';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Análise de Tendências</h2>
          <p className="text-sm text-gray-600">Projeções e tendências baseadas em dados históricos</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Realizado</p>
              <p className="text-lg font-bold text-blue-800">R$ {totalActual.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Projeção Total</p>
              <p className="text-lg font-bold text-purple-800">R$ {totalProjection.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Tendência Geral</p>
              <p className={`text-lg font-bold ${getTrendColor(growthTrend > 0 ? 'up' : growthTrend < 0 ? 'down' : 'stable')}`}>
                {growthTrend > 0 ? '+' : ''}{growthTrend.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-yellow-600 font-medium">Confiança Média</p>
              <p className={`text-lg font-bold ${getConfidenceColor(averageConfidence)}`}>
                {averageConfidence.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Visualization */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Visualização de Tendências</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.map((item, index) => {
            const previousItem = index > 0 ? data[index - 1] : null;
            const trendDirection = previousItem ? getTrendDirection(item.trend, previousItem.trend) : 'stable';
            
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-800">{item.period}</h4>
                  <div className={`flex items-center space-x-1 ${getTrendColor(trendDirection)}`}>
                    {getTrendIcon(trendDirection)}
                    <span className="text-xs font-medium">
                      {trendDirection === 'up' ? 'Subindo' : trendDirection === 'down' ? 'Descendo' : 'Estável'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* Actual */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Realizado</span>
                      <span className="text-xs font-medium text-blue-600">
                        R$ {item.actual.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(item.actual / maxValue) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Trend */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Tendência</span>
                      <span className="text-xs font-medium text-purple-600">
                        R$ {item.trend.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${(item.trend / maxValue) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Projection */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Projeção</span>
                      <span className="text-xs font-medium text-green-600">
                        R$ {item.projection.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(item.projection / maxValue) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Confiança</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConfidenceBadgeColor(item.confidence)}`}>
                        {getConfidenceLabel(item.confidence)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Dados Detalhados</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Realizado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tendência
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projeção
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variação
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confiança
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Direção
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, index) => {
                const previousItem = index > 0 ? data[index - 1] : null;
                const trendDirection = previousItem ? getTrendDirection(item.trend, previousItem.trend) : 'stable';
                const variation = ((item.projection - item.actual) / item.actual) * 100;
                
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.period}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-blue-600 font-medium">
                      R$ {item.actual.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-purple-600 font-medium">
                      R$ {item.trend.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 font-medium">
                      R$ {item.projection.toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                      variation > 0 ? 'text-green-600' : variation < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {variation > 0 ? '+' : ''}{variation.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConfidenceBadgeColor(item.confidence)}`}>
                        {item.confidence.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className={`flex items-center justify-center space-x-1 ${getTrendColor(trendDirection)}`}>
                        {getTrendIcon(trendDirection)}
                        <span className="text-xs font-medium capitalize">{trendDirection}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Análise de Tendências</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Tendências de alta:</span>
              <span className="font-medium text-green-600">{upwardTrends}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tendências de baixa:</span>
              <span className="font-medium text-red-600">{downwardTrends}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Crescimento geral:</span>
              <span className={`font-medium ${getTrendColor(growthTrend > 0 ? 'up' : growthTrend < 0 ? 'down' : 'stable')}`}>
                {growthTrend > 0 ? '+' : ''}{growthTrend.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Confiança média:</span>
              <span className={`font-medium ${getConfidenceColor(averageConfidence)}`}>
                {averageConfidence.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recomendações</h3>
          <div className="space-y-3">
            {growthTrend > 10 && (
              <div className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">Tendência Positiva</p>
                  <p className="text-xs text-green-600">Considere aumentar investimentos nesta área</p>
                </div>
              </div>
            )}
            
            {growthTrend < -10 && (
              <div className="flex items-start space-x-2 p-3 bg-red-50 rounded-lg">
                <TrendingDown className="w-4 h-4 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Tendência Negativa</p>
                  <p className="text-xs text-red-600">Revise estratégias e considere ajustes</p>
                </div>
              </div>
            )}
            
            {averageConfidence < 70 && (
              <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Baixa Confiança</p>
                  <p className="text-xs text-yellow-600">Colete mais dados para melhorar previsões</p>
                </div>
              </div>
            )}
            
            {Math.abs(totalProjection - totalActual) / totalActual > 0.2 && (
              <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                <Target className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Grande Variação</p>
                  <p className="text-xs text-blue-600">Monitore de perto as próximas realizações</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}