import React from 'react';
import { X, Shield, Check } from 'lucide-react';
import { Role, Permission } from '../../types/user';

interface RoleDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  permissions: Permission[];
}

export function RoleDetails({ 
  isOpen, 
  onClose, 
  role,
  permissions
}: RoleDetailsProps) {
  if (!isOpen || !role) return null;

  // Agrupar permissões por módulo
  const groupedPermissions: Record<string, Permission[]> = {};
  permissions.forEach(permission => {
    if (!groupedPermissions[permission.module]) {
      groupedPermissions[permission.module] = [];
    }
    groupedPermissions[permission.module].push(permission);
  });

  // Ordenar módulos
  const sortedModules = Object.keys(groupedPermissions).sort();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{role.name}</h2>
              {role.isSystem && (
                <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full mt-1">
                  Função do Sistema
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Descrição */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Descrição</h3>
            <p className="text-gray-600">{role.description}</p>
          </div>

          {/* Permissões */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Permissões</h3>
            
            <div className="space-y-6">
              {sortedModules.map(module => (
                <div key={module} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-800 capitalize">
                      {module.replace(/-/g, ' ')}
                    </h4>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {groupedPermissions[module].map(permission => (
                        <div 
                          key={permission.id} 
                          className="flex items-center p-2 rounded-lg bg-white border border-gray-100"
                        >
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{permission.name}</p>
                            <p className="text-xs text-gray-500">{permission.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="border-t border-gray-200 pt-4 mt-6">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Criado em {new Date(role.createdAt).toLocaleDateString('pt-BR')}</span>
              <span>Última atualização: {new Date(role.updatedAt).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}