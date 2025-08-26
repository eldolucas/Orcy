import React from 'react';
import { Shield, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import { Role } from '../../types/user';

interface RoleCardProps {
  role: Role;
  permissionCount: number;
  totalPermissions: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function RoleCard({ 
  role, 
  permissionCount,
  totalPermissions,
  onView, 
  onEdit, 
  onDelete 
}: RoleCardProps) {
  const permissionPercentage = totalPermissions > 0 
    ? Math.round((permissionCount / totalPermissions) * 100) 
    : 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-800">{role.name}</h3>
              {role.isSystem && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                  Sistema
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mt-1">{role.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={onView}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            title="Ver detalhes"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={onEdit}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Editar função"
            disabled={role.isSystem}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            title="Excluir função"
            disabled={role.isSystem}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Permissions Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Permissões</span>
          <span className="text-sm text-gray-600">{permissionCount} de {totalPermissions}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${permissionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Criado em {new Date(role.createdAt).toLocaleDateString('pt-BR')}</span>
          <span>Última atualização: {new Date(role.updatedAt).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
}