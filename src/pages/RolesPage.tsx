import React, { useState } from 'react';
import { Plus, Search, Filter, Shield, CheckCircle, XCircle, Edit, Trash2, Eye } from 'lucide-react';
import { RoleCard } from '../components/Users/RoleCard';
import { RoleForm } from '../components/Users/RoleForm';
import { RoleDetails } from '../components/Users/RoleDetails';
import { useRoles } from '../hooks/useRoles';
import { Role, RoleFormData } from '../types/user';

export function RolesPage() {
  const { 
    roles, 
    permissions,
    isLoading, 
    error,
    addRole, 
    updateRole, 
    deleteRole,
    getPermissionsByIds
  } = useRoles();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showSystemRoles, setShowSystemRoles] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
  const [roleToView, setRoleToView] = useState<Role | null>(null);

  const handleCreateRole = async (roleData: RoleFormData) => {
    try {
      await addRole(roleData);
      setShowCreateModal(false);
    } catch (err) {
      // Error is handled in the hook and displayed in the UI
    }
  };

  const handleEditRole = (role: Role) => {
    setRoleToEdit(role);
    setShowCreateModal(true);
  };

  const handleViewRole = (role: Role) => {
    setRoleToView(role);
    setShowDetailsModal(true);
  };

  const handleUpdateRole = async (roleData: RoleFormData) => {
    if (roleToEdit) {
      try {
        await updateRole(roleToEdit.id, roleData);
        setRoleToEdit(null);
        setShowCreateModal(false);
      } catch (err) {
        // Error is handled in the hook and displayed in the UI
      }
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta função? Esta ação não pode ser desfeita.')) {
      try {
        await deleteRole(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao excluir função');
      }
    }
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowDetailsModal(false);
    setRoleToEdit(null);
    setRoleToView(null);
  };

  // Filtragem de funções
  const filteredRoles = roles.filter(role => {
    // Filtro por termo de busca
    if (searchTerm && !role.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !role.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filtro por funções do sistema
    if (!showSystemRoles && role.isSystem) {
      return false;
    }
    
    return true;
  });

  // Estatísticas
  const totalRoles = roles.length;
  const systemRoles = roles.filter(r => r.isSystem).length;
  const customRoles = roles.filter(r => !r.isSystem).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p>{error}</p>
        <button 
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Funções e Permissões</h1>
          <p className="text-gray-600 mt-1">Gerencie as funções e permissões de acesso ao sistema</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Função</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Funções</p>
              <p className="text-xl font-bold text-gray-800">{totalRoles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Funções do Sistema</p>
              <p className="text-xl font-bold text-gray-800">{systemRoles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Funções Personalizadas</p>
              <p className="text-xl font-bold text-gray-800">{customRoles}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar funções..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showSystemRoles}
              onChange={(e) => setShowSystemRoles(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Mostrar funções do sistema</span>
          </label>
        </div>
      </div>

      {/* Roles List */}
      <div className="space-y-4">
        {filteredRoles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            permissionCount={role.permissions.length}
            totalPermissions={permissions.length}
            onView={() => handleViewRole(role)}
            onEdit={() => handleEditRole(role)}
            onDelete={() => handleDeleteRole(role.id)}
          />
        ))}
      </div>

      {filteredRoles.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma função encontrada</h3>
          <p className="text-gray-500">
            {searchTerm || !showSystemRoles
              ? 'Ajuste os filtros ou crie uma nova função'
              : 'Crie sua primeira função para começar'
            }
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <RoleForm
        isOpen={showCreateModal}
        onClose={handleCloseModals}
        onSave={roleToEdit !== null ? handleUpdateRole : handleCreateRole}
        initialData={roleToEdit}
        permissions={permissions}
      />

      {/* Details Modal */}
      <RoleDetails
        isOpen={showDetailsModal}
        onClose={handleCloseModals}
        role={roleToView}
        permissions={roleToView ? getPermissionsByIds(roleToView.permissions) : []}
      />
    </div>
  );
}