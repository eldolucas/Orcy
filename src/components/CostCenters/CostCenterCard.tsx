import React from 'react';
import { 
  Building2, 
  Edit, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  Users, 
  DollarSign,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { CostCenter } from '../../types';

interface CostCenterCardProps {
  costCenter: CostCenter;
  onToggleExpansion: (id: string) => void;
  onEdit: (costCenter: CostCenter) => void;
  onDelete: (id: string) => void;
  level?: number;
}

export function CostCenterCard({ 
  costCenter, 
  onToggleExpansion, 
  onEdit, 
  onDelete, 
  level = 0 
}: CostCenterCardProps) {
  const utilization = (costCenter.spent / costCenter.budget) * 100;
  const hasChildren = costCenter.children && costCenter.children.length > 0;
  
  const getUtilizationColor = (utilization: number) => {
    if (utilization > 90) return 'text-red-600 bg-red-100';
    if (utilization > 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getLevelIndentation = (level: number) => {
    return level * 24; // 24px per level
  };

  const getLevelBorderColor = (level: number) => {
    const colors = [
      'border-l-blue-500',
      'border-l-purple-500',
      'border-l-green-500',
      'border-l-orange-500'
    ];
    return colors[level % colors.length];
  };

  return (
    <div className="space-y-2">
      <div 
        className={`bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200 hover:shadow-md transition-all duration-200 ${
          level > 0 ? `ml-${getLevelIndentation(level)} border-l-4 ${getLevelBorderColor(level)}` : ''
        }`}
        style={{ marginLeft: level > 0 ? `${getLevelIndentation(level)}px` : '0' }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1">
            {hasChildren && (
              <button
                onClick={() => onToggleExpansion(costCenter.id)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                {costCenter.isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </button>
            )}
            
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              level === 0 ? 'bg-blue-100' : 
              level === 1 ? 'bg-purple-100' : 'bg-green-100'
            }`}>
              <Building2 className={`w-6 h-6 ${
                level === 0 ? 'text-blue-600' : 
                level === 1 ? 'text-purple-600' : 'text-green-600'
              }`} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-800">{costCenter.name}</h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {costCenter.code}
                </span>
                {level > 0 && (
                  <span className="text-xs text-gray-500">
                    Nível {level + 1}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{costCenter.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <div className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {costCenter.manager}
                </div>
                <div className="flex items-center">
                  <Building2 className="w-3 h-3 mr-1" />
                  {costCenter.department}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => onEdit(costCenter)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Editar centro de custo"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete(costCenter.id)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="Excluir centro de custo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Budget Information */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="w-4 h-4 text-blue-600 mr-1" />
              <span className="text-xs text-blue-600 font-medium">Orçamento</span>
            </div>
            <p className="text-lg font-bold text-blue-800">
              R$ {costCenter.budget.toLocaleString()}
            </p>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 text-purple-600 mr-1" />
              <span className="text-xs text-purple-600 font-medium">Gasto</span>
            </div>
            <p className="text-lg font-bold text-purple-800">
              R$ {costCenter.spent.toLocaleString()}
            </p>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-xs text-green-600 font-medium">Disponível</span>
            </div>
            <p className="text-lg font-bold text-green-800">
              R$ {(costCenter.budget - costCenter.spent).toLocaleString()}
            </p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <AlertTriangle className="w-4 h-4 text-gray-600 mr-1" />
              <span className="text-xs text-gray-600 font-medium">Utilização</span>
            </div>
            <p className={`text-lg font-bold ${
              utilization > 90 ? 'text-red-600' :
              utilization > 75 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {utilization.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progresso do Orçamento</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUtilizationColor(utilization)}`}>
              {utilization.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                utilization > 90 ? 'bg-red-500' :
                utilization > 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Hierarchy Path */}
        {level > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center text-xs text-gray-500">
              <span className="font-medium">Caminho:</span>
              <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">
                {costCenter.path}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Render Children */}
      {hasChildren && costCenter.isExpanded && (
        <div className="space-y-2">
          {costCenter.children!.map((child) => (
            <CostCenterCard
              key={child.id}
              costCenter={child}
              onToggleExpansion={onToggleExpansion}
              onEdit={onEdit}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}