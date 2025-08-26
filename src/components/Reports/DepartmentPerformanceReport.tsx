import React, { useEffect, useState } from 'react';
import { Building2, TrendingUp, Award, Target } from 'lucide-react';
import { useReports, DepartmentPerformanceData } from '../../hooks/useReports';

interface DepartmentPerformanceReportProps {
  filters: {
    fiscalYearId: string;
    costCenterId: string;
    startDate: string;
    endDate: string;
    period: string;
  };
}

export function DepartmentPerformanceReport({ filters }: DepartmentPerformanceReportProps) {
  const { generateDepartmentPerformanceReport } = useReports();
  const [data, setData] = useState<DepartmentPerformanceData[]>([]);

  useEffect(() => {
    const reportData = generateDepartmentPerformanceReport(filters);
    setData(reportData.sort((a, b) => b.score - a.score));
  }, [filters, generateDepartmentPerformanceReport]);

  const averageUtilization = data.length > 0 ? data.reduce((sum, item) => sum + item.budgetUtilization, 0) / data.length : 0;
  const averageRevenue = data.length > 0 ? data.reduce((sum, item) => sum + item.revenueGenerated, 0) / data.length : 0;
  const averageEfficiency = data.length > 0 ? data.reduce((sum, item) => sum + item.efficiency, 0) / data.length : 0;
  const averageScore = data.length > 0 ? data.reduce((sum, item) => sum + item.score, 0) / data.length : 0;

  const topPerformer = data.length > 0 ? data[0] : null;
  const excellentDepts = data.filter(item => item.score >= 80).length;
  const goodDepts = data.filter(item => item.score >= 60 && item.score < 80).length;
  const needsImprovementDepts = data.filter(item => item.score < 60).length;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    return 'Precisa Melhorar';
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization <= 90) return 'text-green-600';
    if (utilization <= 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Performance por Departamento</h2>
          <p className="text-sm text-gray-600">Comparativo de performance entre departamentos</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Score Médio</p>
              <p className={`text-lg font-bold ${getScoreColor(averageScore)}`}>
                {averageScore.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Excelentes</p>
              <p className="text-lg font-bold text-green-800">{excellentDepts}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-yellow-600 font-medium">Bons</p>
              <p className="text-lg font-bold text-yellow-800">{goodDepts}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-600 font-medium">Precisam Melhorar</p>
              <p className="text-lg font-bold text-red-800">{needsImprovementDepts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performer Highlight */}
      {topPerformer && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">🏆 Melhor Performance</h3>
              <p className="text-xl font-bold text-yellow-800">{topPerformer.department}</p>
              <p className="text-sm text-gray-600">Score: {topPerformer.score.toFixed(1)} pontos</p>
            </div>
            <div className="text-right">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-600">Utilização</p>
                  <p className={`text-sm font-bold ${getUtilizationColor(topPerformer.budgetUtilization)}`}>
                    {topPerformer.budgetUtilization.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Receita</p>
                  <p className="text-sm font-bold text-green-600">
                    R$ {topPerformer.revenueGenerated.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Eficiência</p>
                  <p className="text-sm font-bold text-blue-600">
                    {topPerformer.efficiency.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{item.department}</h3>
                  <p className="text-xs text-gray-500">#{index + 1} no ranking</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(item.score)}`}>
                  {item.score.toFixed(0)}
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreBadgeColor(item.score)}`}>
                  {getScoreLabel(item.score)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Budget Utilization */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Utilização do Orçamento</span>
                  <span className={`text-sm font-medium ${getUtilizationColor(item.budgetUtilization)}`}>
                    {item.budgetUtilization.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.budgetUtilization <= 90 ? 'bg-green-500' :
                      item.budgetUtilization <= 100 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(item.budgetUtilization, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Revenue Generated */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Receita Gerada</span>
                  <span className="text-sm font-medium text-green-600">
                    R$ {item.revenueGenerated.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ 
                      width: `${Math.min((item.revenueGenerated / Math.max(...data.map(d => d.revenueGenerated))) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Efficiency */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Eficiência</span>
                  <span className="text-sm font-medium text-blue-600">
                    {item.efficiency.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ 
                      width: `${Math.min((item.efficiency / Math.max(...data.map(d => d.efficiency))) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Ranking Detalhado</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departamento
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilização Orçamento
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receita Gerada
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Eficiência
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classificação
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                      {index === 0 && <Award className="w-4 h-4 text-yellow-500" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.department}</div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${getUtilizationColor(item.budgetUtilization)}`}>
                    {item.budgetUtilization.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 font-medium">
                    R$ {item.revenueGenerated.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-blue-600 font-medium">
                    {item.efficiency.toFixed(1)}%
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${getScoreColor(item.score)}`}>
                    {item.score.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreBadgeColor(item.score)}`}>
                      {getScoreLabel(item.score)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Médias Gerais</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Utilização média do orçamento:</span>
              <span className={`font-medium ${getUtilizationColor(averageUtilization)}`}>
                {averageUtilization.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Receita média gerada:</span>
              <span className="font-medium text-green-600">
                R$ {averageRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Eficiência média:</span>
              <span className="font-medium text-blue-600">
                {averageEfficiency.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição de Performance</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Excelente (80+)</span>
              </div>
              <span className="text-lg font-bold text-green-800">{excellentDepts}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Bom (60-79)</span>
              </div>
              <span className="text-lg font-bold text-yellow-800">{goodDepts}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">Precisa Melhorar (&lt;60)</span>
              </div>
              <span className="text-lg font-bold text-red-800">{needsImprovementDepts}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}