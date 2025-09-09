import React, { useState } from 'react';
import { Plus, Search, Filter, FileText, Calendar, DollarSign, Building2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { ContractCard } from '../components/Contracts/ContractCard';
import { ContractForm } from '../components/Contracts/ContractForm';
import { useContracts } from '../hooks/useContracts';
import { useCostCenters } from '../hooks/useCostCenters';
import { useFinancialYears } from '../hooks/useFinancialYears';
import { useAuth } from '../contexts/AuthContext';
import { Contract, ContractFormData, contractTypeLabels, contractStatusLabels } from '../types/contract';

export function ContractsPage() {
  const { activeCompany } = useAuth();
  const { 
    contracts, 
    isLoading, 
    error,
    addContract, 
    updateContract, 
    deleteContract, 
    getFilteredContracts,
    getContractsByType,
    getTotalValueByType,
    getTotalMonthlyValue,
    getExpiringContracts
  } = useContracts();
  
  const { costCenters } = useCostCenters();
  const { financialYears } = useFinancialYears();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [costCenterFilter, setCostCenterFilter] = useState('all');
  const [fiscalYearFilter, setFiscalYearFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [contractToEdit, setContractToEdit] = useState<Contract | null>(null);

  const handleCreateContract = async (formData: ContractFormData) => {
    try {
      await addContract(formData);
      setShowCreateModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar contrato');
    }
  };

  const handleEditContract = (contract: Contract) => {
    setContractToEdit(contract);
    setShowCreateModal(true);
  };

  const handleUpdateContract = async (formData: ContractFormData) => {
    if (contractToEdit) {
      try {
        await updateContract(contractToEdit.id, formData);
        setContractToEdit(null);
        setShowCreateModal(false);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao atualizar contrato');
      }
    }
  };

  const handleDeleteContract = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.')) {
      try {
        await deleteContract(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao excluir contrato');
      }
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setContractToEdit(null);
  };

  const filteredContracts = getFilteredContracts(
    searchTerm,
    typeFilter,
    statusFilter,
    costCenterFilter,
    fiscalYearFilter
  );

  // Funções auxiliares para obter objetos relacionados
  const getCostCenter = (id: string) => costCenters.find(cc => cc.id === id);
  const getFiscalYear = (id: string) => financialYears.find(fy => fy.id === id);

  // Estatísticas
  const totalContracts = contracts.length;
  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const inactiveContracts = contracts.filter(c => c.status === 'inactive').length;
  const expiredContracts = contracts.filter(c => c.status === 'expired').length;
  const expiringContracts = getExpiringContracts(30).length;
  const totalMonthlyValue = getTotalMonthlyValue();
  
  // Contagem por tipo
  const serviceContracts = getContractsByType('service').length;
  const leaseContracts = getContractsByType('lease').length;
  const rentalContracts = getContractsByType('rental').length;

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
          <h1 className="text-2xl font-bold text-gray-800">Contratos</h1>
          <p className="text-gray-600 mt-1">
            {activeCompany ? `Gerencie os contratos da ${activeCompany.name}` : 
             'Gerencie contratos de serviços, locações e aluguéis'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={!activeCompany}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            activeCompany 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Novo Contrato</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Contratos</p>
              <p className="text-xl font-bold text-gray-800">{totalContracts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Contratos Ativos</p>
              <p className="text-xl font-bold text-gray-800">{activeContracts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Expirando em 30 dias</p>
              <p className="text-xl font-bold text-gray-800">{expiringContracts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor Mensal Total</p>
              <p className="text-xl font-bold text-gray-800">R$ {totalMonthlyValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Types Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Serviços</p>
              <div className="flex items-center space-x-2">
                <p className="text-xl font-bold text-gray-800">{serviceContracts}</p>
                <p className="text-sm text-gray-500">contratos</p>
              </div>
              <p className="text-xs text-gray-500">
                R$ {getTotalValueByType('service').toLocaleString()} mensais
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Locações</p>
              <div className="flex items-center space-x-2">
                <p className="text-xl font-bold text-gray-800">{leaseContracts}</p>
                <p className="text-sm text-gray-500">contratos</p>
              </div>
              <p className="text-xs text-gray-500">
                R$ {getTotalValueByType('lease').toLocaleString()} mensais
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Aluguéis</p>
              <div className="flex items-center space-x-2">
                <p className="text-xl font-bold text-gray-800">{rentalContracts}</p>
                <p className="text-sm text-gray-500">contratos</p>
              </div>
              <p className="text-xs text-gray-500">
                R$ {getTotalValueByType('rental').toLocaleString()} mensais
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar contratos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os tipos</option>
            {Object.entries(contractTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            {Object.entries(contractStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <select
            value={costCenterFilter}
            onChange={(e) => setCostCenterFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os centros de custo</option>
            {costCenters.map((center) => (
              <option key={center.id} value={center.id}>
                {center.code} - {center.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Additional Filters */}
      <div className="flex items-center justify-between space-x-4">
        <select
          value={fiscalYearFilter}
          onChange={(e) => setFiscalYearFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os exercícios financeiros</option>
          {financialYears.map((year) => (
            <option key={year.id} value={year.id}>
              {year.name} ({year.year})
            </option>
          ))}
        </select>
      </div>

      {/* Expiring Contracts Alert */}
      {expiringContracts > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-800">Contratos Expirando em Breve</h3>
          </div>
          <p className="text-yellow-700 text-sm mb-3">
            {expiringContracts} contrato(s) irão expirar nos próximos 30 dias. Verifique e renove se necessário.
          </p>
        </div>
      )}

      {/* Contracts List */}
      <div className="space-y-4">
        {filteredContracts.map((contract) => (
          <ContractCard
            key={contract.id}
            contract={contract}
            costCenter={getCostCenter(contract.costCenterId)}
            fiscalYear={getFiscalYear(contract.fiscalYearId)}
            onEdit={handleEditContract}
            onDelete={handleDeleteContract}
          />
        ))}
      </div>

      {filteredContracts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum contrato encontrado</h3>
          <p className="text-gray-500">
            {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || 
             costCenterFilter !== 'all' || fiscalYearFilter !== 'all'
              ? 'Ajuste os filtros ou crie um novo contrato'
              : 'Crie seu primeiro contrato para começar'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Contrato</span>
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <ContractForm
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSave={contractToEdit ? handleUpdateContract : handleCreateContract}
        initialData={contractToEdit}
      />
    </div>
  );
}