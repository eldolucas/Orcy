import React, { useState } from 'react';
import { Plus, Search, Filter, Briefcase, Users, DollarSign, Building2 } from 'lucide-react';
import { LaborBudgetCard } from '../components/LaborBudget/LaborBudgetCard';
import { LaborBudgetForm } from '../components/LaborBudget/LaborBudgetForm';
import { useLaborBudget } from '../hooks/useLaborBudget';
import { useCostCenters } from '../hooks/useCostCenters';
import { useFinancialYears } from '../hooks/useFinancialYears';
import { useAuth } from '../contexts/AuthContext';
import { LaborBudget, LaborBudgetFormData, departmentOptions } from '../types/laborBudget';

export function LaborBudgetPage() {
  const { activeCompany } = useAuth();
  const { 
    laborBudgets, 
    isLoading, 
    error,
    addLaborBudget, 
    updateLaborBudget, 
    deleteLaborBudget, 
    getFilteredLaborBudgets,
    getDepartments,
    getTotalCostByDepartment,
    getTotalCostByCostCenter,
    getTotalCostByFiscalYear
  } = useLaborBudget();
  
  const { costCenters } = useCostCenters();
  const { financialYears } = useFinancialYears();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [costCenterFilter, setCostCenterFilter] = useState('all');
  const [fiscalYearFilter, setFiscalYearFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [laborToEdit, setLaborToEdit] = useState<LaborBudget | null>(null);

  const handleCreateLaborBudget = async (formData: LaborBudgetFormData) => {
    try {
      await addLaborBudget(formData);
      setShowCreateModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar registro de mão de obra');
    }
  };

  const handleEditLaborBudget = (labor: LaborBudget) => {
    setLaborToEdit(labor);
    setShowCreateModal(true);
  };

  const handleUpdateLaborBudget = async (formData: LaborBudgetFormData) => {
    if (laborToEdit) {
      try {
        await updateLaborBudget(laborToEdit.id, formData);
        setLaborToEdit(null);
        setShowCreateModal(false);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao atualizar registro de mão de obra');
      }
    }
  };

  const handleDeleteLaborBudget = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro de mão de obra? Esta ação não pode ser desfeita.')) {
      try {
        await deleteLaborBudget(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao excluir registro de mão de obra');
      }
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setLaborToEdit(null);
  };

  const filteredLaborBudgets = getFilteredLaborBudgets(
    searchTerm,
    departmentFilter,
    statusFilter,
    costCenterFilter,
    fiscalYearFilter
  );

  // Funções auxiliares para obter objetos relacionados
  const getCostCenter = (id: string) => costCenters.find(cc => cc.id === id);
  const getFiscalYear = (id: string) => financialYears.find(fy => fy.id === id);

  // Estatísticas
  const totalLaborBudgets = laborBudgets.length;
  const activeLaborBudgets = laborBudgets.filter(l => l.isActive).length;
  const inactiveLaborBudgets = laborBudgets.filter(l => !l.isActive).length;
  const totalEmployees = laborBudgets.reduce((sum, l) => sum + l.quantity, 0);
  const totalAnnualCost = laborBudgets.reduce((sum, l) => sum + l.totalCost, 0);
  
  // Departamentos disponíveis para filtro
  const availableDepartments = getDepartments();

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
          <h1 className="text-2xl font-bold text-gray-800">Mão de Obra Orçada</h1>
          <p className="text-gray-600 mt-1">
            {activeCompany ? `Gerencie o orçamento de mão de obra da ${activeCompany.name}` : 
             'Gerencie o orçamento de mão de obra por cargo, salário, benefícios e encargos'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Registro</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Registros</p>
              <p className="text-xl font-bold text-gray-800">{totalLaborBudgets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Registros Ativos</p>
              <p className="text-xl font-bold text-gray-800">{activeLaborBudgets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Funcionários</p>
              <p className="text-xl font-bold text-gray-800">{totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Custo Anual Total</p>
              <p className="text-xl font-bold text-gray-800">R$ {totalAnnualCost.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Custo Médio Mensal</p>
              <p className="text-xl font-bold text-gray-800">
                R$ {(totalAnnualCost / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
                placeholder="Buscar por cargo ou departamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os departamentos</option>
            {availableDepartments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
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

      {/* Department Cost Distribution */}
      {availableDepartments.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição de Custos por Departamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableDepartments.map((dept) => {
              const deptCost = getTotalCostByDepartment(dept);
              const deptPercentage = totalAnnualCost > 0 ? (deptCost / totalAnnualCost) * 100 : 0;
              
              return (
                <div key={dept} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{dept}</h4>
                    <span className="text-sm font-medium text-blue-600">{deptPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Custo Anual:</span>
                    <span className="font-medium">R$ {deptCost.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${deptPercentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Labor Budgets List */}
      <div className="space-y-4">
        {filteredLaborBudgets.map((labor) => (
          <LaborBudgetCard
            key={labor.id}
            laborBudget={labor}
            costCenter={getCostCenter(labor.costCenterId)}
            fiscalYear={getFiscalYear(labor.fiscalYearId)}
            onEdit={handleEditLaborBudget}
            onDelete={handleDeleteLaborBudget}
          />
        ))}
      </div>

      {filteredLaborBudgets.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum registro de mão de obra encontrado</h3>
          <p className="text-gray-500">
            {searchTerm || departmentFilter !== 'all' || statusFilter !== 'all' || 
             costCenterFilter !== 'all' || fiscalYearFilter !== 'all'
              ? 'Ajuste os filtros ou crie um novo registro de mão de obra'
              : 'Crie seu primeiro registro de mão de obra para começar'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Registro de Mão de Obra</span>
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <LaborBudgetForm
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSave={laborToEdit ? handleUpdateLaborBudget : handleCreateLaborBudget}
        initialData={laborToEdit}
      />
    </div>
  );
}