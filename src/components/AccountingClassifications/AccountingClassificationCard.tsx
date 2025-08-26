import React from 'react';
import { Tag, Edit, Trash2, FileText } from 'lucide-react';
import { AccountingClassification, accountingTypeLabels } from '../../types/accountingClassification';

interface AccountingClassificationCardProps {
  classification: AccountingClassification;
  onEdit: (classification: AccountingClassification) => void;
  onDelete: (id: string) => void;
}

export function AccountingClassificationCard({ 
  classification, 
  onEdit, 
  onDelete 
}: AccountingClassificationCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'revenue':
        return 'bg-green-100 text-green-800';
      case 'expense':
        return 'bg-red-100 text-red-800';
      case 'asset':
        return 'bg-blue-100 text-blue-800';
      case 'liability':
        return 'bg-yellow-100 text-yellow-800';
      case 'equity':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Tag className="w-6 h-6 text-blue-600" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-800">{classification.name}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                classification.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {classification.isActive ? 'Ativa' : 'Inativa'}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(classification.type)}`}>
                {accountingTypeLabels[classification.type as keyof typeof accountingTypeLabels]}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mt-1">{classification.description}</p>
            
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="font-medium">Código:</span>
                <span className="ml-1 font-mono bg-gray-100 px-2 py-1 rounded">{classification.code}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onEdit(classification)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Editar classificação"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(classification.id)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            title="Excluir classificação"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Criado por {classification.createdBy} em {new Date(classification.createdAt).toLocaleDateString('pt-BR')}</span>
          <span>Última atualização: {new Date(classification.updatedAt).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
}