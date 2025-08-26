import React from 'react';
import { Calendar, Edit, Trash2, CheckCircle, Clock, FileText, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { BalanceSheet, BalanceSheetSummary, periodTypeLabels, balanceSheetStatusLabels } from '../../types/balanceSheet';
import { FiscalYear } from '../../types';

interface BalanceSheetCardProps {
  balanceSheet: BalanceSheet;
  summary: BalanceSheetSummary;
  fiscalYear?: FiscalYear;
  onEdit: (balanceSheet: BalanceSheet) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
  onAudit: (id: string) => void;
  onViewDetails: (balanceSheet: BalanceSheet) => void;
}

export function BalanceSheetCard({ 
  balanceSheet, 
  summary,
  fiscalYear,
  onEdit, 
  onDelete, 
  onPublish,
  onAudit,
  onViewDetails
}: BalanceSheetCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'audited':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit className="w-4 h-4" />;
      case 'published':
        return <CheckCircle className="w-4 h-4" />;
      case 'audited':
        return <FileText className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPeriodTypeLabel = (type: string) => {
    return periodTypeLabels[type as keyof typeof periodTypeLabels] || type;
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

  // Verifica se o balanço está balanceado (Ativos = Passivos + PL)
  const isBalanced = Math.abs(summary.totalAssets - (summary.totalLiabilities + summary.totalEquity)) < 0.01;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-800">
                {formatPeriod(balanceSheet.period, balanceSheet.periodType)}
              </h3>
              <span className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(balanceSheet.status)}`}>
                {getStatusIcon(balanceSheet.status)}
                <span>{balanceSheetStatusLabels[balanceSheet.status as keyof typeof balanceSheetStatusLabels]}</span>
              </span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                {getPeriodTypeLabel(balanceSheet.periodType)}
              </span>
              {!isBalanced && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                  Não Balanceado
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="font-medium">Exercício:</span>
                <span className="ml-1">{fiscalYear ? fiscalYear.name : 'Não especificado'}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Criado por:</span>
                <span className="ml-1">{balanceSheet.createdBy}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Data:</span>
                <span className="ml-1">{new Date(balanceSheet.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            
            {balanceSheet.notes && (
              <p className="text-sm text-gray-600 mt-2 italic">"{balanceSheet.notes}"</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800">
              R$ {summary.totalAssets.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              Total de Ativos
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => onViewDetails(balanceSheet)}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              title="Ver detalhes"
            >
              <FileText className="w-4 h-4" />
            </button>
            
            {balanceSheet.status === 'draft' && (
              <>
                <button 
                  onClick={() => onEdit(balanceSheet)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Editar balanço"
                >
                  <Edit className="w-4 h-4" />
                </button>
                
                <button 
                  onClick={() => onPublish(balanceSheet.id)}
                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                  title="Publicar balanço"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                
                <button 
                  onClick={() => onDelete(balanceSheet.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Excluir balanço"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            
            {balanceSheet.status === 'published' && (
              <button 
                onClick={() => onAudit(balanceSheet.id)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                title="Auditar balanço"
              >
                <FileText className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
      </div>

      {/* Resultado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 font-medium mb-1">Resultado Líquido</p>
          <div className="flex items-center justify-center space-x-1">
            {summary.netIncome > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : summary.netIncome < 0 ? (
              <TrendingDown className="w-4 h-4 text-red-600" />
            ) : (
              <DollarSign className="w-4 h-4 text-gray-600" />
            )}
            <p className={`text-lg font-bold ${
              summary.netIncome > 0 ? 'text-green-600' :
              summary.netIncome < 0 ? 'text-red-600' : 'text-gray-800'
            }`}>
              R$ {Math.abs(summary.netIncome).toLocaleString()}
              {summary.netIncome < 0 ? ' (Prejuízo)' : summary.netIncome > 0 ? ' (Lucro)' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Índices Financeiros */}
      {(summary.currentRatio !== undefined || summary.quickRatio !== undefined || summary.debtToEquityRatio !== undefined) && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Índices Financeiros</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summary.currentRatio !== undefined && (
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Liquidez Corrente</p>
                <p className={`text-sm font-bold ${
                  summary.currentRatio >= 1 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {summary.currentRatio.toFixed(2)}
                </p>
              </div>
            )}
            
            {summary.quickRatio !== undefined && (
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Liquidez Seca</p>
                <p className={`text-sm font-bold ${
                  summary.quickRatio >= 1 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {summary.quickRatio.toFixed(2)}
                </p>
              </div>
            )}
            
            {summary.debtToEquityRatio !== undefined && (
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Dívida/Patrimônio</p>
                <p className={`text-sm font-bold ${
                  summary.debtToEquityRatio <= 1 ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {summary.debtToEquityRatio.toFixed(2)}
                </p>
              </div>
            )}
            
            {summary.returnOnEquity !== undefined && (
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">ROE</p>
                <p className={`text-sm font-bold ${
                  summary.returnOnEquity > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(summary.returnOnEquity * 100).toFixed(2)}%
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}