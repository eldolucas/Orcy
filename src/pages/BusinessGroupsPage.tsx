import React, { useState } from 'react';
import { Plus, Search, Filter, GitBranch, Building, Users, DollarSign, Globe, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { BusinessGroupCard } from '../components/BusinessGroups/BusinessGroupCard';
import { BusinessGroupForm } from '../components/BusinessGroups/BusinessGroupForm';
import { GroupCompanyManagementModal } from '../components/BusinessGroups/GroupCompanyManagementModal';
import { useBusinessGroups } from '../hooks/useBusinessGroups';
import { useCompanies } from '../hooks/useCompanies';
import { BusinessGroup, BusinessGroupFormData, businessGroupStatusLabels } from '../types/businessGroup';

export function BusinessGroupsPage() {
  const { 
    businessGroups, 
    isLoading, 
    error,
    addBusinessGroup, 
    updateBusinessGroup, 
    deleteBusinessGroup,
    associateCompanyToGroup,
    dissociateCompanyFromGroup,
    transferCompanyBetweenGroups,
    getCompaniesByGroup,
    getUnassignedCompanies,
    getMembershipHistory,
    getFilteredBusinessGroups
  } = useBusinessGroups();
  
  const { companies } = useCompanies();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompanyManagementModal, setShowCompanyManagementModal] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<BusinessGroup | null>(null);
  const [groupToManage, setGroupToManage] = useState<BusinessGroup | null>(null);

  const handleCreateGroup = async (groupData: BusinessGroupFormData) => {
    try {
      await addBusinessGroup(groupData);
      setShowCreateModal(false);
    } catch (err) {
      // Error is handled in the hook and displayed in the UI
    }
  };

  const handleEditGroup = (group: BusinessGroup) => {
    setGroupToEdit(group);
    setShowCreateModal(true);
  };

  const handleUpdateGroup = async (groupData: BusinessGroupFormData) => {
    if (groupToEdit) {
      try {
        await updateBusinessGroup(groupToEdit.id, groupData);
        setGroupToEdit(null);
        setShowCreateModal(false);
      } catch (err) {
        // Error is handled in the hook and displayed in the UI
      }
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este grupo empresarial? Esta ação não pode ser desfeita.')) {
      try {
        await deleteBusinessGroup(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao excluir grupo empresarial');
      }
    }
  };

  const handleManageCompanies = (group: BusinessGroup) => {
    setGroupToManage(group);
    setShowCompanyManagementModal(true);
  };

  const handleAssociateCompany = async (companyId: string, reason?: string) => {
    if (groupToManage) {
      try {
        await associateCompanyToGroup({
          companyId,
          businessGroupId: groupToManage.id,
          reason
        });
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao associar empresa ao grupo');
      }
    }
  };

  const handleDissociateCompany = async (companyId: string, reason?: string) => {
    try {
      await dissociateCompanyFromGroup(companyId, reason);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao desvincular empresa do grupo');
    }
  };

  const handleTransferCompany = async (companyId: string, fromGroupId: string, toGroupId: string, reason?: string) => {
    try {
      await transferCompanyBetweenGroups({
        companyId,
        fromGroupId,
        toGroupId,
        reason
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao transferir empresa entre grupos');
    }
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowCompanyManagementModal(false);
    setGroupToEdit(null);
    setGroupToManage(null);
  };

  const filteredGroups = getFilteredBusinessGroups(searchTerm, statusFilter);

  // Estatísticas
  const totalGroups = businessGroups.length;
  const activeGroups = businessGroups.filter(g => g.status === 'active').length;
  const inactiveGroups = businessGroups.filter(g => g.status === 'inactive').length;
  const dissolvedGroups = businessGroups.filter(g => g.status === 'dissolved').length;
  const totalCompaniesInGroups = businessGroups.reduce((sum, g) => sum + g.totalCompanies, 0);
  const totalRevenue = businessGroups.reduce((sum, g) => sum + g.totalRevenue, 0);
  const unassignedCompanies = getUnassignedCompanies();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Grupos Empresariais</h1>
          <p className="text-gray-600 mt-1">Gerencie grupos empresariais e suas empresas associadas</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Grupo</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertTriangle className="w-5 h-5 mr-2 mt-0.5" />
          <div>
            <p className="font-medium">Ocorreu um erro</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Grupos</p>
              <p className="text-xl font-bold text-gray-800">{totalGroups}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Grupos Ativos</p>
              <p className="text-xl font-bold text-gray-800">{activeGroups}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Grupos Inativos</p>
              <p className="text-xl font-bold text-gray-800">{inactiveGroups}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-building-100 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-building-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Empresas em Grupos</p>
              <p className="text-xl font-bold text-gray-800">{totalCompaniesInGroups}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Empresas Sem Grupo</p>
              <p className="text-xl font-bold text-gray-800">{unassignedCompanies.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Receita Total</p>
              <p className="text-xl font-bold text-gray-800">R$ {totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert for Unassigned Companies */}
      {unassignedCompanies.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-800">Empresas Sem Grupo</h3>
          </div>
          <p className="text-yellow-700 text-sm mb-3">
            {unassignedCompanies.length} empresa(s) não estão associadas a nenhum grupo empresarial.
          </p>
          <div className="space-y-2">
            {unassignedCompanies.slice(0, 3).map((company) => (
              <div key={company.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                <div>
                  <p className="font-medium text-gray-800">{company.apelido}</p>
                  <p className="text-sm text-gray-600">{company.razaoSocial}</p>
                </div>
                <button
                  onClick={() => {
                    // Aqui você pode implementar uma funcionalidade para associar rapidamente
                    console.log('Associar empresa:', company.id);
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Associar a Grupo
                </button>
              </div>
            ))}
            {unassignedCompanies.length > 3 && (
              <p className="text-center text-sm text-yellow-600">
                ... e mais {unassignedCompanies.length - 3} empresa(s)
              </p>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar grupos empresariais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os status</option>
          {Object.entries(businessGroupStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Business Groups List */}
      <div className="space-y-4">
        {filteredGroups.map((group) => (
          <BusinessGroupCard
            key={group.id}
            businessGroup={group}
            companies={getCompaniesByGroup(group.id)}
            onEdit={handleEditGroup}
            onDelete={handleDeleteGroup}
            onManageCompanies={handleManageCompanies}
          />
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <GitBranch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum grupo empresarial encontrado</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Ajuste os filtros ou crie um novo grupo empresarial'
              : 'Crie seu primeiro grupo empresarial para começar'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Grupo Empresarial</span>
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <BusinessGroupForm
        isOpen={showCreateModal}
        onClose={handleCloseModals}
        onSave={groupToEdit ? handleUpdateGroup : handleCreateGroup}
        initialData={groupToEdit}
      />

      {/* Company Management Modal */}
      <GroupCompanyManagementModal
        isOpen={showCompanyManagementModal}
        onClose={handleCloseModals}
        businessGroup={groupToManage}
        groupCompanies={groupToManage ? getCompaniesByGroup(groupToManage.id) : []}
        unassignedCompanies={getUnassignedCompanies()}
        allBusinessGroups={businessGroups}
        membershipHistory={groupToManage ? getMembershipHistory(groupToManage.id) : []}
        onAssociateCompany={handleAssociateCompany}
        onDissociateCompany={handleDissociateCompany}
        onTransferCompany={handleTransferCompany}
      />
    </div>
  );
}