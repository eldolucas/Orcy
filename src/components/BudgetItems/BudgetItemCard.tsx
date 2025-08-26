import React from 'react';
import { DollarSign, Edit, Trash2, FileText, Building2, Tag, Calendar } from 'lucide-react';
import { BudgetItem, budgetItemTypeLabels } from '../../types/budgetItem';
import { FinancialYear } from '../../types/financialYear';
import { BudgetRevision } from '../../types/budgetRevision';
import { AccountingClassification } from '../../types/accountingClassification';
import { CostCenter } from '../../types';

interface BudgetItemCardProps {
  item: BudgetItem;
  financialYear?: FinancialYear;
  budgetRevision?: BudgetRevision;
  accountingClassification?: AccountingClassification;
  costCenter?: CostCenter;
  onEdit: (item: BudgetItem) => void;
  onDelete: (id: string) => void;
}

export function BudgetItemCard({ 
  item, 
  financialYear,
  budgetRevision,
  accountingClassification,
  costCenter,
  onEdit, 
  onDelete 
}: BudgetItemCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'revenue':
        return 'bg-green-100 text-green-800';
      case 'expense':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            item.type === 'revenue' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <DollarSign className={`w-6 h-6 ${
              item.type === 'revenue' ? 'text-green-600' : 'text-red-600'
            }`} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>
                {budgetItemTypeLabels[item.type as keyof typeof budgetItemTypeLabels]}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Exercício:</span>
                <span className="font-medium text-gray-800">
                  {financialYear ? financialYear.name : 'Não especificado'}
                </span>
              </div>
              
              {budgetRevision && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Revisão:</span>
                  <span className="font-medium text-gray-800">
                    #{budgetRevision.revisionNumber}
                  </span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Classificação:</span>
                <span className="font-medium text-gray-800">
                  {accountingClassification ? accountingClassification.name : 'Não especificada'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Centro de Custo:</span>
                <span className="font-medium text-gray-800">
                  {costCenter ? costCenter.name : 'Não especificado'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className={`text-2xl font-bold ${
              item.type === 'revenue' ? 'text-green-600' : 'text-red-600'
            }`}>
              R$ {item.budgetedAmount.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              Orçado
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => onEdit(item)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Editar item"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete(item.id)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="Excluir item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Criado por {item.createdBy} em {new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
          <span>Última atualização: {new Date(item.updatedAt).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
}