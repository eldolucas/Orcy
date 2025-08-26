import React from 'react';
import { Calendar, Edit, Trash2, Archive, CheckCircle, Clock, Calculator, FileText } from 'lucide-react';
import { BudgetRevision, budgetRevisionStatusLabels } from '../../types/budgetRevision';
import { FinancialYear } from '../../types/financialYear';

interface BudgetRevisionCardProps {
  revision: BudgetRevision;
  financialYear?: FinancialYear;
  onEdit: (revision: BudgetRevision) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  onArchive: (id: string) => void;
}

export function BudgetRevisionCard({ 
  revision, 
  financialYear,
  onEdit, 
  onDelete, 
  onApprove,
  onArchive
}: BudgetRevisionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'draft':
        return <Clock className="w-4 h-4" />;
      case 'archived':
        return <Archive className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getChangeColor = (percentage?: number) => {
    if (!percentage) return 'text-gray-600';
    if (percentage > 0) return 'text-green-600';
    if (percentage < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          
          <div>
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-800">Revisão #{revision.revisionNumber}</h3>
              <span className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(revision.status)}`}>
                {getStatusIcon(revision.status)}
                <span>{budgetRevisionStatusLabels[revision.status as keyof typeof budgetRevisionStatusLabels]}</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
              <span>Data: {new Date(revision.revisionDate).toLocaleDateString('pt-BR')}</span>
              {financialYear && (
                <>
                  <span>•</span>
                  <span>Exercício: {financialYear.name}</span>
                </>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mt-2">{revision.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {revision.status === 'draft' && (
            <>
              <button
                onClick={() => onApprove(revision.id)}
                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                title="Aprovar revisão"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onEdit(revision)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Editar revisão"
              >
                <Edit className="w-4 h-4" />
              </button>
            </>
          )}
          
          {revision.status === 'active' && (
            <button
              onClick={() => onArchive(revision.id)}
              className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
              title="Arquivar revisão"
            >
              <Archive className="w-4 h-4" />
            </button>
          )}
          
          {revision.status === 'draft' && (
            <button
              onClick={() => onDelete(revision.id)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="Excluir revisão"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Budget Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600 font-medium mb-1">Orçamento Anterior</p>
          <p className="text-lg font-bold text-blue-800">
            R$ {(revision.totalBudgetBefore || 0).toLocaleString()}
          </p>
        </div>
        
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-xs text-purple-600 font-medium mb-1">Orçamento Revisado</p>
          <p className="text-lg font-bold text-purple-800">
            R$ {(revision.totalBudgetAfter || 0).toLocaleString()}
          </p>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 font-medium mb-1">Variação</p>
          <div className="flex items-center justify-center space-x-1">
            <Calculator className={`w-4 h-4 ${getChangeColor(revision.changePercentage)}`} />
            <p className={`text-lg font-bold ${getChangeColor(revision.changePercentage)}`}>
              {revision.changePercentage && revision.changePercentage > 0 ? '+' : ''}
              {revision.changePercentage?.toFixed(2) || 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Criado por {revision.createdBy} em {new Date(revision.createdAt).toLocaleDateString('pt-BR')}</span>
          {revision.approvedBy && revision.approvedAt && (
            <span>Aprovado por {revision.approvedBy} em {new Date(revision.approvedAt).toLocaleDateString('pt-BR')}</span>
          )}
        </div>
      </div>
    </div>
  );
}