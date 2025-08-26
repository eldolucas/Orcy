import React from 'react';
import { Package, Edit, Trash2, FileText, Tag, Clock } from 'lucide-react';
import { Insumo, insumoTypeLabels } from '../../types/insumo';

interface InsumoCardProps {
  insumo: Insumo;
  onEdit: (insumo: Insumo) => void;
  onDelete: (id: string) => void;
}

export function InsumoCard({ 
  insumo, 
  onEdit, 
  onDelete 
}: InsumoCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'product':
        return 'bg-blue-100 text-blue-800';
      case 'service':
        return 'bg-purple-100 text-purple-800';
      case 'fund':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Package className="w-6 h-6 text-blue-600" />;
      case 'service':
        return <Clock className="w-6 h-6 text-purple-600" />;
      case 'fund':
        return <Tag className="w-6 h-6 text-green-600" />;
      default:
        return <Package className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            {getTypeIcon(insumo.type)}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-800">{insumo.name}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                insumo.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {insumo.isActive ? 'Ativo' : 'Inativo'}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(insumo.type)}`}>
                {insumoTypeLabels[insumo.type as keyof typeof insumoTypeLabels]}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mt-1">{insumo.description}</p>
            
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="font-medium">Unidade:</span>
                <span className="ml-1 font-mono bg-gray-100 px-2 py-1 rounded">{insumo.unit}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Custo:</span>
                <span className="ml-1 font-medium text-gray-800">R$ {insumo.cost.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onEdit(insumo)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Editar insumo"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(insumo.id)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            title="Excluir insumo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Criado por {insumo.createdBy} em {new Date(insumo.createdAt).toLocaleDateString('pt-BR')}</span>
          <span>Última atualização: {new Date(insumo.updatedAt).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
}