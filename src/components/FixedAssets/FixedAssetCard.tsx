import React from 'react';
import { Monitor, Edit, Trash2, Calendar, DollarSign, Building2, Truck, Home, BookOpen, Map, Package } from 'lucide-react';
import { FixedAsset, assetCategoryLabels, assetStatusLabels, depreciationMethodLabels } from '../../types/fixedAsset';
import { CostCenter, FiscalYear } from '../../types';

interface FixedAssetCardProps {
  asset: FixedAsset;
  costCenter?: CostCenter;
  fiscalYear?: FiscalYear;
  onEdit: (asset: FixedAsset) => void;
  onDelete: (id: string) => void;
}

export function FixedAssetCard({ 
  asset, 
  costCenter,
  fiscalYear,
  onEdit, 
  onDelete 
}: FixedAssetCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'equipment':
        return <Monitor className="w-6 h-6 text-blue-600" />;
      case 'vehicle':
        return <Truck className="w-6 h-6 text-purple-600" />;
      case 'furniture':
        return <Home className="w-6 h-6 text-green-600" />;
      case 'building':
        return <Building2 className="w-6 h-6 text-yellow-600" />;
      case 'land':
        return <Map className="w-6 h-6 text-orange-600" />;
      case 'software':
        return <BookOpen className="w-6 h-6 text-indigo-600" />;
      default:
        return <Package className="w-6 h-6 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'equipment':
        return 'bg-blue-100 text-blue-800';
      case 'vehicle':
        return 'bg-purple-100 text-purple-800';
      case 'furniture':
        return 'bg-green-100 text-green-800';
      case 'building':
        return 'bg-yellow-100 text-yellow-800';
      case 'land':
        return 'bg-orange-100 text-orange-800';
      case 'software':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'acquired':
        return 'bg-purple-100 text-purple-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'disposed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calcula a depreciação acumulada
  const accumulatedDepreciation = asset.acquisitionValue - asset.currentValue;
  
  // Calcula a porcentagem de depreciação
  const depreciationPercentage = asset.acquisitionValue > 0 
    ? (accumulatedDepreciation / asset.acquisitionValue) * 100 
    : 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            {getCategoryIcon(asset.category)}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-800">{asset.name}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(asset.category)}`}>
                {assetCategoryLabels[asset.category as keyof typeof assetCategoryLabels]}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(asset.status)}`}>
                {assetStatusLabels[asset.status as keyof typeof assetStatusLabels]}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mt-1">{asset.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Aquisição:</span>
                <span className="font-medium text-gray-800">{new Date(asset.acquisitionDate).toLocaleDateString('pt-BR')}</span>
              </div>
              
              {asset.serialNumber && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Nº de Série:</span>
                  <span className="font-medium text-gray-800">{asset.serialNumber}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Centro de Custo:</span>
                <span className="font-medium text-gray-800">
                  {costCenter ? `${costCenter.code} - ${costCenter.name}` : 'Não especificado'}
                </span>
              </div>
              
              {asset.location && (
                <div className="flex items-center space-x-2">
                  <Map className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Localização:</span>
                  <span className="font-medium text-gray-800">{asset.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800">
              R$ {asset.currentValue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              Valor atual
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => onEdit(asset)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Editar ativo"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete(asset.id)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="Excluir ativo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detalhes Financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600 font-medium mb-1">Valor de Aquisição</p>
          <p className="text-lg font-bold text-blue-800">
            R$ {asset.acquisitionValue.toLocaleString()}
          </p>
        </div>
        
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-xs text-purple-600 font-medium mb-1">Depreciação Acumulada</p>
          <p className="text-lg font-bold text-purple-800">
            R$ {accumulatedDepreciation.toLocaleString()}
          </p>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-xs text-green-600 font-medium mb-1">Vida Útil</p>
          <p className="text-lg font-bold text-green-800">
            {asset.usefulLifeYears > 0 ? `${asset.usefulLifeYears} anos` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Barra de Depreciação */}
      {asset.depreciationMethod !== 'none' && asset.status !== 'planned' && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Depreciação</span>
            <span className="text-gray-500">{depreciationPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full"
              style={{ width: `${Math.min(depreciationPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Método: {depreciationMethodLabels[asset.depreciationMethod as keyof typeof depreciationMethodLabels]}</span>
            <span>Taxa: {asset.depreciationRate}% ao ano</span>
          </div>
        </div>
      )}

      {/* Informações adicionais */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Criado em {new Date(asset.createdAt).toLocaleDateString('pt-BR')}</span>
          <span>Última atualização: {new Date(asset.updatedAt).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
}