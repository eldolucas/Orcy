import React from 'react';
import { Settings, Edit, Trash2, Globe, Building2, ToggleLeft, ToggleRight } from 'lucide-react';
import { FinancialParameter, parameterCategoryLabels, parameterValueTypeLabels, economicSectors } from '../../types/financialParameter';

interface ParameterCardProps {
  parameter: FinancialParameter;
  onEdit: (parameter: FinancialParameter) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
}

export function ParameterCard({ 
  parameter, 
  onEdit, 
  onDelete,
  canEdit
}: ParameterCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tax':
        return 'bg-blue-100 text-blue-800';
      case 'budget':
        return 'bg-green-100 text-green-800';
      case 'accounting':
        return 'bg-purple-100 text-purple-800';
      case 'approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      case 'sector':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getValueTypeColor = (valueType: string) => {
    switch (valueType) {
      case 'string':
        return 'bg-indigo-100 text-indigo-800';
      case 'number':
        return 'bg-blue-100 text-blue-800';
      case 'percentage':
        return 'bg-green-100 text-green-800';
      case 'boolean':
        return 'bg-orange-100 text-orange-800';
      case 'date':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatValue = (value: string | number | boolean, valueType: string) => {
    switch (valueType) {
      case 'percentage':
        return `${value}%`;
      case 'boolean':
        return value ? 'Sim' : 'Não';
      case 'date':
        return new Date(value as string).toLocaleDateString('pt-BR');
      default:
        return value.toString();
    }
  };

  const renderValueIcon = (value: string | number | boolean, valueType: string) => {
    if (valueType === 'boolean') {
      return value ? 
        <ToggleRight className="w-6 h-6 text-green-600" /> : 
        <ToggleLeft className="w-6 h-6 text-red-600" />;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-800">{parameter.name}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                parameter.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {parameter.isActive ? 'Ativo' : 'Inativo'}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(parameter.category)}`}>
                {parameterCategoryLabels[parameter.category as keyof typeof parameterCategoryLabels]}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getValueTypeColor(parameter.valueType)}`}>
                {parameterValueTypeLabels[parameter.valueType as keyof typeof parameterValueTypeLabels]}
              </span>
              {parameter.sector && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                  {economicSectors.find(s => s.id === parameter.sector)?.name || parameter.sector}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="font-medium">Código:</span>
                <span className="ml-1 font-mono bg-gray-100 px-2 py-1 rounded">{parameter.code}</span>
              </div>
              <div className="flex items-center">
                {parameter.companyId ? (
                  <Building2 className="w-4 h-4 mr-1 text-gray-500" />
                ) : (
                  <Globe className="w-4 h-4 mr-1 text-gray-500" />
                )}
                <span>{parameter.companyId ? 'Específico da empresa' : 'Global'}</span>
              </div>
              {parameter.isSystem && (
                <div className="flex items-center">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                    Sistema
                  </span>
                </div>
              )}
            </div>
            
            {parameter.description && (
              <p className="text-sm text-gray-600 mt-2">{parameter.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right flex items-center space-x-2">
            {renderValueIcon(parameter.value, parameter.valueType)}
            <div>
              <p className="text-xl font-bold text-gray-800">
                {formatValue(parameter.value, parameter.valueType)}
              </p>
              <p className="text-xs text-gray-500">
                Valor atual
              </p>
            </div>
          </div>
          
          {canEdit && (
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => onEdit(parameter)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Editar parâmetro"
              >
                <Edit className="w-4 h-4" />
              </button>
              {!parameter.isSystem && (
                <button 
                  onClick={() => onDelete(parameter.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Excluir parâmetro"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Criado por {parameter.createdBy} em {new Date(parameter.createdAt).toLocaleDateString('pt-BR')}</span>
          <span>Última atualização: {new Date(parameter.updatedAt).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
}