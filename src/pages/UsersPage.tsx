import React, { useState } from 'react';
import { Plus, Search, Filter, Users, CheckCircle, XCircle, Download, Upload, UserPlus, Mail, Phone, Building2 } from 'lucide-react';
import { UserCard } from '../components/Users/UserCard';
import { UserForm } from '../components/Users/UserForm';
import { useUsers } from '../hooks/useUsers';
import { useCompanies } from '../hooks/useCompanies';
import { useCostCenters } from '../hooks/useCostCenters';
import { useRoles } from '../hooks/useRoles';
import { User, UserFormData, userRoleLabels } from '../types/user';
import { useAuth } from '../contexts/AuthContext';

export function UsersPage() {
  const { activeCompany } = useAuth();
  const { 
    users, 
    isLoading: usersLoading, 
    error: usersError,
    addUser, 
    updateUser, 
    deleteUser, 
    getFilteredUsers,
    getDepartments
  } = useUsers();
  
  const {
    companies,
    isLoading: companiesLoading
  } = useCompanies();
  
  const {
    costCenters,
    isLoading: costCentersLoading
  } = useCostCenters();
  
  const {
    roles,
    isLoading: rolesLoading
  } = useRoles();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const handleCreateUser = async (userData: UserFormData) => {
    try {
      await addUser(userData);
      setShowCreateModal(false);
    } catch (err) {
      // Error is handled in the hook and displayed in the UI
    }
  };

  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setShowCreateModal(true);
  };

  const handleUpdateUser = async (userData: UserFormData) => {
    if (userToEdit) {
      try {
        await updateUser(userToEdit.id, userData);
        setUserToEdit(null);
        setShowCreateModal(false);
      } catch (err) {
        // Error is handled in the hook and displayed in the UI
      }
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Tem certeza que deseja desativar este usuário? Esta ação não pode ser desfeita.')) {
      try {
        await deleteUser(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao desativar usuário');
      }
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setUserToEdit(null);
  };

  const filteredUsers = getFilteredUsers(searchTerm, roleFilter, statusFilter, departmentFilter);
  const departments = getDepartments();

  // Estatísticas
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const inactiveUsers = users.filter(u => u.status === 'inactive').length;
  
  // Contagem por função
  const usersByRole: Record<string, number> = {};
  Object.keys(userRoleLabels).forEach(role => {
    usersByRole[role] = users.filter(u => u.role === role).length;
  });

  const isLoading = usersLoading || companiesLoading || costCentersLoading || rolesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p>{usersError}</p>
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
          <h1 className="text-2xl font-bold text-gray-800">Usuários</h1>
          <p className="text-gray-600 mt-1">
            {activeCompany ? `Gerencie os usuários da ${activeCompany.name}` : 
             'Gerencie os usuários do sistema'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Usuários</p>
              <p className="text-xl font-bold text-gray-800">{totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Usuários Ativos</p>
              <p className="text-xl font-bold text-gray-800">{activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Usuários Inativos</p>
              <p className="text-xl font-bold text-gray-800">{inactiveUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Distribuição por Função</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(userRoleLabels).map(([role, label]) => (
            <div key={role} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">{label}</p>
              <p className="text-lg font-bold text-gray-800">{usersByRole[role] || 0}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas as funções</option>
            {Object.entries(userRoleLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os departamentos</option>
            {departments.map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Exportar usuários"
          >
            <Download className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Exportar</span>
          </button>
          <button
            className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Importar usuários"
          >
            <Upload className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Importar</span>
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
          <p className="text-gray-500">
            {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' || departmentFilter !== 'all'
              ? 'Ajuste os filtros ou crie um novo usuário'
              : 'Crie seu primeiro usuário para começar'
            }
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <UserForm
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSave={userToEdit ? handleUpdateUser : handleCreateUser}
        initialData={userToEdit}
        companies={companies}
        costCenters={costCenters}
        roles={roles}
      />
    </div>
  );
}