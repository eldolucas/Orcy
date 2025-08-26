import React from 'react';
import { Calendar, Star, Edit, Trash2, Archive, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { FinancialYear, financialYearStatusLabels } from '../../types/financialYear';

interface FinancialYearCardProps {
  financialYear: FinancialYear;
  onEdit: (financialYear: FinancialYear) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  onClose: (id: string) => void;
  onArchive: (id: string) => void;
}

export function FinancialYearCard({ 
  financialYear, 
  onEdit, 
  onDelete, 
  onSetDefault,
  onClose,
  onArchive
}: FinancialYearCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'planning':
        return <Clock className="w-4 h-4" />;
      case 'closed':
      case 'archived':
        return <Archive className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const utilization = financialYear.totalBudget && financialYear.totalBudget > 0 
    ? (financialYear.totalSpent || 0) / financialYear.totalBudget * 100 
    : 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          
          <div>
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-800">{financialYear.name}</h3>
              {financialYear.isDefault && (
                <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                  <Star className="w-3 h-3" />
                  <span>Padrão</span>
                </div>
              )}
              <span className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(financialYear.status)}`}>
                {getStatusIcon(financialYear.status)}
                <span>{financialYearStatusLabels[financialYear.status as keyof typeof financialYearStatusLabels]}</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
              <span>Ano: {financialYear.year}</span>
              <span>•</span>
              <span>
                {new Date(financialYear.startDate).toLocaleDateString('pt-BR')} - {new Date(financialYear.endDate).toLocaleDateString('pt-BR')}
              </span>
              <span>•</span>
              <span>Versão: {financialYear.budgetVersion}</span>
            </div>
            
            {financialYear.description && (
              <p className="text-sm text-gray-600 mt-2">{financialYear.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!financialYear.isDefault && financialYear.status !== 'archived' && (
            <button
              onClick={() => onSetDefault(financialYear.id)}
              className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
              title="Definir como padrão"
            >
              <Star className="w-4 h-4" />
            </button>
          )}
          
          {financialYear.status !== 'closed' && financialYear.status !== 'archived' && (
            <button
              onClick={() => onEdit(financialYear)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          
          {financialYear.status === 'active' && (
            <button
              onClick={() => onClose(financialYear.id)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Encerrar exercício"
            >
              <Archive className="w-4 h-4" />
            </button>
          )}
          
          {financialYear.status === 'closed' && (
            <button
              onClick={() => onArchive(financialYear.id)}
              className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
              title="Arquivar exercício"
            >
              <Archive className="w-4 h-4" />
            </button>
          )}
          
          {financialYear.status !== 'active' && !financialYear.isDefault && (
            <button
              onClick={() => onDelete(financialYear.id)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Budget Information */}
      {financialYear.totalBudget && financialYear.totalBudget > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 font-medium mb-1">Orçamento Total</p>
            <p className="text-lg font-bold text-blue-800">
              R$ {financialYear.totalBudget.toLocaleString()}
            </p>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-purple-600 font-medium mb-1">Total Gasto</p>
            <p className="text-lg font-bold text-purple-800">
              R$ {(financialYear.totalSpent || 0).toLocaleString()}
            </p>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-green-600 font-medium mb-1">Utilização</p>
            <p className={`text-lg font-bold ${
              utilization > 90 ? 'text-red-600' :
              utilization > 75 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {utilization.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar for active/closed years */}
      {financialYear.totalBudget && financialYear.totalBudget > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Execução Orçamentária</span>
            <span className="text-gray-500">{utilization.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                utilization > 90 ? 'bg-red-500' :
                utilization > 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Additional Information */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Criado por {financialYear.createdBy} em {new Date(financialYear.createdAt).toLocaleDateString('pt-BR')}</span>
          {financialYear.closedAt && (
            <span>Encerrado em {new Date(financialYear.closedAt).toLocaleDateString('pt-BR')}</span>
          )}
        </div>
      </div>
    </div>
  );
}