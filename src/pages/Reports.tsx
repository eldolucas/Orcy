import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, TrendingUp, PieChart, BarChart3, DollarSign, Building2, Eye } from 'lucide-react';
import { BudgetExecutionReport } from '../components/Reports/BudgetExecutionReport';
import { VarianceAnalysisReport } from '../components/Reports/VarianceAnalysisReport';
import { CashFlowReport } from '../components/Reports/CashFlowReport';
import { DepartmentPerformanceReport } from '../components/Reports/DepartmentPerformanceReport';
import { TrendAnalysisReport } from '../components/Reports/TrendAnalysisReport';
import { useCostCenters } from '../hooks/useCostCenters';
import { useFiscalYears } from '../hooks/useFiscalYears';
import { useReports } from '../hooks/useReports';

type ReportType = 'budget-execution' | 'variance-analysis' | 'cash-flow' | 'department-performance' | 'trend-analysis';

export function Reports() {
  const { costCenters } = useCostCenters();
  const { fiscalYears } = useFiscalYears();
  const { generateReport, exportReport, isLoading } = useReports();
  
  const [activeReport, setActiveReport] = useState<ReportType>('budget-execution');
  const [filters, setFilters] = useState({
    fiscalYearId: '',
    costCenterId: 'all',
    startDate: '',
    endDate: '',
    period: 'monthly'
  });

  const reportTypes = [
    {
      id: 'budget-execution' as ReportType,
      name: 'Execução Orçamentária',
      description: 'Análise detalhada da execução do orçamento por centro de custo',
      icon: PieChart,
      color: 'blue'
    },
    {
      id: 'variance-analysis' as ReportType,
      name: 'Análise de Variação',
      description: 'Comparação entre orçado vs realizado com análise de desvios',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      id: 'cash-flow' as ReportType,
      name: 'Fluxo de Caixa',
      description: 'Análise de receitas e despesas ao longo do tempo',
      icon: BarChart3,
      color: 'green'
    },
    {
      id: 'department-performance' as ReportType,
      name: 'Performance por Departamento',
      description: 'Comparativo de performance entre departamentos',
      icon: Building2,
      color: 'orange'
    },
    {
      id: 'trend-analysis' as ReportType,
      name: 'Análise de Tendências',
      description: 'Projeções e tendências baseadas em dados históricos',
      icon: TrendingUp,
      color: 'red'
    }
  ];

  const handleExportReport = async (format: 'pdf' | 'excel') => {
    try {
      await exportReport(activeReport, filters, format);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
    }
  };

  const renderActiveReport = () => {
    switch (activeReport) {
      case 'budget-execution':
        return <BudgetExecutionReport filters={filters} />;
      case 'variance-analysis':
        return <VarianceAnalysisReport filters={filters} />;
      case 'cash-flow':
        return <CashFlowReport filters={filters} />;
      case 'department-performance':
        return <DepartmentPerformanceReport filters={filters} />;
      case 'trend-analysis':
        return <TrendAnalysisReport filters={filters} />;
      default:
        return <BudgetExecutionReport filters={filters} />;
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200',
      green: 'bg-green-100 text-green-600 border-green-200',
      orange: 'bg-orange-100 text-orange-600 border-orange-200',
      red: 'bg-red-100 text-red-600 border-red-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Relatórios e Análises</h1>
          <p className="text-gray-600 mt-1">Análises detalhadas e relatórios executivos</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleExportReport('excel')}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Excel</span>
          </button>
          
          <button
            onClick={() => handleExportReport('pdf')}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          const isActive = activeReport === report.id;
          
          return (
            <button
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                isActive 
                  ? getColorClasses(report.color)
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isActive ? 'bg-white bg-opacity-20' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-4 h-4 ${
                    isActive ? 'text-current' : 'text-gray-600'
                  }`} />
                </div>
                <h3 className={`font-medium text-sm ${
                  isActive ? 'text-current' : 'text-gray-800'
                }`}>
                  {report.name}
                </h3>
              </div>
              <p className={`text-xs ${
                isActive ? 'text-current opacity-80' : 'text-gray-600'
              }`}>
                {report.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exercício Orçamentário
            </label>
            <select
              value={filters.fiscalYearId}
              onChange={(e) => setFilters({ ...filters, fiscalYearId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os exercícios</option>
              {fiscalYears.map((fy) => (
                <option key={fy.id} value={fy.id}>
                  {fy.name} ({fy.year})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Centro de Custo
            </label>
            <select
              value={filters.costCenterId}
              onChange={(e) => setFilters({ ...filters, costCenterId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os centros</option>
              {costCenters.map((center) => (
                <option key={center.id} value={center.id}>
                  {center.code} - {center.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Inicial
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Final
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período
            </label>
            <select
              value={filters.period}
              onChange={(e) => setFilters({ ...filters, period: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
              <option value="quarterly">Trimestral</option>
              <option value="yearly">Anual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          renderActiveReport()
        )}
      </div>
    </div>
  );
}