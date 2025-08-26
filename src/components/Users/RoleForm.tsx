import React, { useState, useEffect } from 'react';
import { X, Save, Shield } from 'lucide-react';
import { Role, RoleFormData, Permission } from '../../types/user';

interface RoleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: RoleFormData) => void;
  initialData?: Role | null;
  permissions: Permission[];
}

export function RoleForm({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
  permissions
}: RoleFormProps) {
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    permissions: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');

  // Inicializa o formulário com os dados iniciais quando estiver editando
  useEffect(() => {
    if (initialData) {
      console.log("Inicializando formulário com dados:", initialData);
      setFormData({
        name: initialData.name,
        description: initialData.description,
        permissions: initialData.permissions,
        isSystem: initialData.isSystem
      });
    } else {
      // Reset do formulário quando for uma nova função
      setFormData({
        name: '',
        description: '',
        permissions: []
      });
    }
    setErrors({});
    setSearchTerm('');
    setSelectedModule('all');
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    
    if (formData.permissions.length === 0) {
      newErrors.permissions = 'Selecione pelo menos uma permissão';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSave(formData);
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        permissions: [...prev.permissions, permissionId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(id => id !== permissionId)
      }));
    }
  };

  const handleSelectAllInModule = (module: string, checked: boolean) => {
    const modulePermissions = permissions
      .filter(p => p.module === module)
      .map(p => p.id);
    
    if (checked) {
      // Adiciona todas as permissões do módulo que ainda não estão selecionadas
      const newPermissions = [...new Set([...formData.permissions, ...modulePermissions])];
      setFormData(prev => ({
        ...prev,
        permissions: newPermissions
      }));
    } else {
      // Remove todas as permissões do módulo
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(id => !modulePermissions.includes(id))
      }));
    }
  };

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar Função' : 'Nova Função';
  const submitButtonText = isEditing ? 'Salvar Alterações' : 'Criar Função';
  const isSystemRole = isEditing && initialData.isSystem;

  // Agrupar permissões por módulo
  const modules = [...new Set(permissions.map(p => p.module))].sort();
  
  // Filtrar permissões
  const filteredPermissions = permissions.filter(permission => {
    // Filtro por termo de busca
    if (searchTerm && !permission.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !permission.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filtro por módulo
    if (selectedModule !== 'all' && permission.module !== selectedModule) {
      return false;
    }
    
    return true;
  });

  // Agrupar permissões filtradas por módulo
  const groupedPermissions: Record<string, Permission[]> = {};
  filteredPermissions.forEach(permission => {
    if (!groupedPermissions[permission.module]) {
      groupedPermissions[permission.module] = [];
    }
    groupedPermissions[permission.module].push(permission);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">{modalTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Função *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Gerente Financeiro, Analista de Orçamento"
                disabled={isSystemRole} // Não permite alterar o nome de funções do sistema
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              {isSystemRole && (
                <p className="text-yellow-600 text-xs mt-1">
                  O nome de funções do sistema não pode ser alterado
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Descrição detalhada da função e suas responsabilidades"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* Permissões */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Permissões *
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar permissões..."
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos os módulos</option>
                  {modules.map(module => (
                    <option key={module} value={module}>
                      {module.charAt(0).toUpperCase() + module.slice(1).replace(/-/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {errors.permissions && <p className="text-red-500 text-xs mb-2">{errors.permissions}</p>}
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {Object.keys(groupedPermissions).length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                    <div key={module} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-800 capitalize">
                          {module.replace(/-/g, ' ')}
                        </h3>
                        <label className="flex items-center space-x-2 text-xs text-gray-600">
                          <input
                            type="checkbox"
                            checked={modulePermissions.every(p => formData.permissions.includes(p.id))}
                            onChange={(e) => handleSelectAllInModule(module, e.target.checked)}
                            className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span>Selecionar todas</span>
                        </label>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {modulePermissions.map(permission => (
                          <label 
                            key={permission.id} 
                            className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                              formData.permissions.includes(permission.id) 
                                ? 'bg-blue-50' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(permission.id)}
                              onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-800">{permission.name}</p>
                              <p className="text-xs text-gray-500">{permission.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Nenhuma permissão encontrada com os filtros atuais</p>
                </div>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              disabled={isSystemRole} // Não permite salvar alterações em funções do sistema
            >
              <Save className="w-4 h-4" />
              <span>{submitButtonText}</span>
            </button>
          </div>
          
          {isSystemRole && (
            <p className="text-yellow-600 text-sm text-center">
              Funções do sistema não podem ser modificadas
            </p>
          )}
        </form>
      </div>
    </div>
  );
}