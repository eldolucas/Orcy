import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, DollarSign, BarChart3, PieChart, Plus, Minus } from 'lucide-react';
import { BudgetAllocation, BudgetAllocationFormData, MonthlyAllocation, seasonalProfiles, monthNames } from '../../types/budgetAllocation';
import { useBudgetAllocations } from '../../hooks/useBudgetAllocations';
import { useBudgetItems } from '../../hooks/useBudgetItems';
import { useCostCenters } from '../../hooks/useCostCenters';
import { useFinancialYears } from '../../hooks/useFinancialYears';

interface AllocationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (allocation: BudgetAllocationFormData) => void;
  initialData?: BudgetAllocation | null;
}

export function AllocationForm({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: AllocationFormProps) {
  const { generateMonthlyAllocations } = useBudgetAllocations();
  const { budgetItems } = useBudgetItems();
  const { costCenters } = useCostCenters();
  const { financialYears } = useFinancialYears();
  
  const [formData, setFormData] = useState<BudgetAllocationFormData>({
    budgetItemId: '',
    fiscalYearId: '',
    costCenterId: '',
    totalAmount: 0,
    distributionType: 'equal',
    notes: ''
  });

  const [monthlyAllocations, setMonthlyAllocations] = useState<Omit<MonthlyAllocation, 'percentage'>[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedProfile, setSelectedProfile] = useState<string>('uniform');
  const [fiscalYear, setFiscalYear] = useState<number>(new Date().getFullYear());

  // Inicializa o formulário com os dados iniciais quando estiver editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        budgetItemId: initialData.budgetItemId,
        fiscalYearId: initialData.fiscalYearId,
        costCenterId: initialData.costCenterId,
        totalAmount: initialData.totalAmount,
        distributionType: initialData.distributionType,
        notes: initialData.notes || ''
      });
      
      // Converte as alocações mensais para o formato do formulário
      const formAllocations = initialData.allocations.map(alloc => ({
        month: alloc.month,
        year: alloc.year,
        plannedAmount: alloc.plannedAmount,
        actualAmount: alloc.actualAmount
      }));
      
      setMonthlyAllocations(formAllocations);
      
      // Tenta identificar o perfil sazonal
      if (initialData.distributionType === 'seasonal') {
        const profile = identifySeasonalProfile(initialData.allocations);
        setSelectedProfile(profile);
      }
      
      // Define o ano fiscal
      if (initialData.allocations.length > 0) {
        setFiscalYear(initialData.allocations[0].year);
      }
    } else {
      // Reset do formulário quando for uma nova alocação
      setFormData({
        budgetItemId: '',
        fiscalYearId: '',
        costCenterId: '',
        totalAmount: 0,
        distributionType: 'equal',
        notes: ''
      });
      
      // Inicializa as alocações mensais vazias
      const currentYear = new Date().getFullYear();
      setFiscalYear(currentYear);
      
      const emptyAllocations = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        year: currentYear,
        plannedAmount: 0
      }));
      
      setMonthlyAllocations(emptyAllocations);
      setSelectedProfile('uniform');
    }
    
    setErrors({});
  }, [initialData, isOpen]);

  // Atualiza as alocações mensais quando o tipo de distribuição, valor total ou perfil sazonal mudam
  useEffect(() => {
    if (formData.distributionType !== 'custom') {
      let profile: number[];
      
      switch (formData.distributionType) {
        case 'equal':
          profile = seasonalProfiles.uniform;
          break;
        case 'seasonal':
          profile = selectedProfile === 'uniform' ? seasonalProfiles.seasonal : seasonalProfiles[selectedProfile as keyof typeof seasonalProfiles];
          break;
        case 'weighted':
          profile = seasonalProfiles.yearEnd;
          break;
        default:
          profile = seasonalProfiles.uniform;
      }
      
      const newAllocations = Array.from({ length: 12 }, (_, i) => {
        const percentage = profile[i];
        const plannedAmount = (formData.totalAmount * percentage) / 100;
        
        return {
          month: i + 1,
          year: fiscalYear,
          plannedAmount,
          actualAmount: monthlyAllocations[i]?.actualAmount
        };
      });
      
      setMonthlyAllocations(newAllocations);
    }
  }, [formData.distributionType, formData.totalAmount, selectedProfile, fiscalYear]);

  // Identifica o perfil sazonal com base nas alocações
  const identifySeasonalProfile = (allocations: MonthlyAllocation[]): string => {
    // Extrai os percentuais das alocações
    const percentages = allocations.map(alloc => alloc.percentage);
    
    // Compara com os perfis pré-definidos
    for (const [profileName, profileValues] of Object.entries(seasonalProfiles)) {
      if (profileName === 'custom') continue;
      
      // Verifica se os percentuais são similares ao perfil
      const isSimilar = percentages.every((percentage, i) => {
        return Math.abs(percentage - profileValues[i]) < 1; // Tolerância de 1%
      });
      
      if (isSimilar) return profileName;
    }
    
    return 'custom';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    const newErrors: Record<string, string> = {};
    
    if (!formData.budgetItemId) newErrors.budgetItemId = 'Item orçamentário é obrigatório';
    if (!formData.fiscalYearId) newErrors.fiscalYearId = 'Exercício financeiro é obrigatório';
    if (!formData.costCenterId) newErrors.costCenterId = 'Centro de custo é obrigatório';
    if (!formData.totalAmount || formData.totalAmount <= 0) {
      newErrors.totalAmount = 'Valor total deve ser maior que zero';
    }
    
    // Validação das alocações mensais
    if (formData.distributionType === 'custom') {
      const totalAllocated = monthlyAllocations.reduce((sum, alloc) => sum + (alloc.plannedAmount || 0), 0);
      
      if (Math.abs(totalAllocated - formData.totalAmount) > 0.01) {
        newErrors.allocations = `A soma das alocações mensais (${totalAllocated.toLocaleString()}) deve ser igual ao valor total (${formData.totalAmount.toLocaleString()})`;
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSave({
        ...formData,
        allocations: monthlyAllocations
      });
      onClose();
    }
  };

  const handleMonthlyAllocationChange = (month: number, value: number) => {
    setFormData(prev => ({ ...prev, distributionType: 'custom' }));
    
    setMonthlyAllocations(prev => 
      prev.map(alloc => 
        alloc.month === month 
          ? { ...alloc, plannedAmount: value }
          : alloc
      )
    );
  };

  const handleDistributeEvenly = () => {
    const monthlyAmount = formData.totalAmount / 12;
    
    setMonthlyAllocations(prev => 
      prev.map(alloc => ({
        ...alloc,
        plannedAmount: monthlyAmount
      }))
    );
    
    setFormData(prev => ({ ...prev, distributionType: 'equal' }));
    setSelectedProfile('uniform');
  };

  const handleApplySeasonalProfile = (profile: string) => {
    setSelectedProfile(profile);
    setFormData(prev => ({ ...prev, distributionType: 'seasonal' }));
  };

  const getTotalAllocated = (): number => {
    return monthlyAllocations.reduce((sum, alloc) => sum + (alloc.plannedAmount || 0), 0);
  };

  const getAllocationDifference = (): number => {
    return formData.totalAmount - getTotalAllocated();
  };

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar Alocação Orçamentária' : 'Nova Alocação Orçamentária';
  const submitButtonText = isEditing ? 'Salvar Alterações' : 'Criar Alocação';

  // Obtém o item orçamentário selecionado
  const selectedBudgetItem = budgetItems.find(item => item.id === formData.budgetItemId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
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
                Item Orçamentário *
              </label>
              <select
                value={formData.budgetItemId}
                onChange={(e) => setFormData({ ...formData, budgetItemId: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.budgetItemId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione um item orçamentário</option>
                {budgetItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.type === 'revenue' ? 'Receita' : 'Despesa'})
                  </option>
                ))}
              </select>
              {errors.budgetItemId && <p className="text-red-500 text-xs mt-1">{errors.budgetItemId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Total Anual (R$) *
              </label>
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.totalAmount || ''}
                  onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.totalAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.totalAmount && <p className="text-red-500 text-xs mt-1">{errors.totalAmount}</p>}
              {selectedBudgetItem && (
                <p className="text-xs text-gray-500 mt-1">
                  Valor orçado: R$ {selectedBudgetItem.budgetedAmount.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Centro de Custo *
              </label>
              <select
                value={formData.costCenterId}
                onChange={(e) => setFormData({ ...formData, costCenterId: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.costCenterId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione um centro de custo</option>
                {costCenters.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.code} - {center.name}
                  </option>
                ))}
              </select>
              {errors.costCenterId && <p className="text-red-500 text-xs mt-1">{errors.costCenterId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exercício Financeiro *
              </label>
              <select
                value={formData.fiscalYearId}
                onChange={(e) => {
                  const selectedYear = financialYears.find(y => y.id === e.target.value);
                  if (selectedYear) {
                    setFiscalYear(selectedYear.year);
                  }
                  setFormData({ ...formData, fiscalYearId: e.target.value });
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.fiscalYearId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione um exercício</option>
                {financialYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name} ({year.year})
                  </option>
                ))}
              </select>
              {errors.fiscalYearId && <p className="text-red-500 text-xs mt-1">{errors.fiscalYearId}</p>}
            </div>
          </div>

          {/* Tipo de Distribuição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Distribuição
            </label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <label 
                className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.distributionType === 'equal' 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="distributionType"
                  value="equal"
                  checked={formData.distributionType === 'equal'}
                  onChange={() => {
                    setFormData({ ...formData, distributionType: 'equal' });
                    setSelectedProfile('uniform');
                  }}
                  className="sr-only"
                />
                <BarChart3 className="w-5 h-5 mr-2" />
                <span>Uniforme</span>
              </label>
              
              <label 
                className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.distributionType === 'seasonal' 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="distributionType"
                  value="seasonal"
                  checked={formData.distributionType === 'seasonal'}
                  onChange={() => {
                    setFormData({ ...formData, distributionType: 'seasonal' });
                    setSelectedProfile('seasonal');
                  }}
                  className="sr-only"
                />
                <PieChart className="w-5 h-5 mr-2" />
                <span>Sazonal</span>
              </label>
              
              <label 
                className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.distributionType === 'weighted' 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="distributionType"
                  value="weighted"
                  checked={formData.distributionType === 'weighted'}
                  onChange={() => {
                    setFormData({ ...formData, distributionType: 'weighted' });
                    setSelectedProfile('yearEnd');
                  }}
                  className="sr-only"
                />
                <BarChart3 className="w-5 h-5 mr-2" />
                <span>Ponderada</span>
              </label>
              
              <label 
                className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.distributionType === 'custom' 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="distributionType"
                  value="custom"
                  checked={formData.distributionType === 'custom'}
                  onChange={() => {
                    setFormData({ ...formData, distributionType: 'custom' });
                    setSelectedProfile('custom');
                  }}
                  className="sr-only"
                />
                <PieChart className="w-5 h-5 mr-2" />
                <span>Personalizada</span>
              </label>
            </div>
          </div>

          {/* Perfis Sazonais */}
          {formData.distributionType === 'seasonal' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Perfil Sazonal
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label 
                  className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedProfile === 'seasonal' 
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="seasonalProfile"
                    value="seasonal"
                    checked={selectedProfile === 'seasonal'}
                    onChange={() => handleApplySeasonalProfile('seasonal')}
                    className="sr-only"
                  />
                  <span>Padrão Sazonal</span>
                </label>
                
                <label 
                  className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedProfile === 'firstHalfHeavy' 
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="seasonalProfile"
                    value="firstHalfHeavy"
                    checked={selectedProfile === 'firstHalfHeavy'}
                    onChange={() => handleApplySeasonalProfile('firstHalfHeavy')}
                    className="sr-only"
                  />
                  <span>Primeiro Semestre</span>
                </label>
                
                <label 
                  className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedProfile === 'secondHalfHeavy' 
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="seasonalProfile"
                    value="secondHalfHeavy"
                    checked={selectedProfile === 'secondHalfHeavy'}
                    onChange={() => handleApplySeasonalProfile('secondHalfHeavy')}
                    className="sr-only"
                  />
                  <span>Segundo Semestre</span>
                </label>
                
                <label 
                  className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedProfile === 'quarterEnd' 
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="seasonalProfile"
                    value="quarterEnd"
                    checked={selectedProfile === 'quarterEnd'}
                    onChange={() => handleApplySeasonalProfile('quarterEnd')}
                    className="sr-only"
                  />
                  <span>Final de Trimestre</span>
                </label>
                
                <label 
                  className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedProfile === 'yearEnd' 
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="seasonalProfile"
                    value="yearEnd"
                    checked={selectedProfile === 'yearEnd'}
                    onChange={() => handleApplySeasonalProfile('yearEnd')}
                    className="sr-only"
                  />
                  <span>Final de Ano</span>
                </label>
              </div>
            </div>
          )}

          {/* Alocações Mensais */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Alocações Mensais
              </label>
              
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleDistributeEvenly}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm px-3 py-1 border border-blue-300 rounded-lg hover:bg-blue-50"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Distribuir Uniformemente</span>
                </button>
              </div>
            </div>
            
            {errors.allocations && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                <p>{errors.allocations}</p>
              </div>
            )}
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Total Alocado:</span>
                <span className={`font-bold ${
                  Math.abs(getAllocationDifference()) > 0.01 ? 'text-red-600' : 'text-green-600'
                }`}>
                  R$ {getTotalAllocated().toLocaleString()}
                  {Math.abs(getAllocationDifference()) > 0.01 && (
                    <span className="ml-2">
                      ({getAllocationDifference() > 0 ? 'faltam' : 'excedem'} R$ {Math.abs(getAllocationDifference()).toLocaleString()})
                    </span>
                  )}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {monthlyAllocations.map((allocation) => (
                <div key={allocation.month} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{monthNames[allocation.month - 1]}</h4>
                    <span className="text-xs text-gray-500">{allocation.year}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Valor Planejado</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={allocation.plannedAmount || ''}
                          onChange={(e) => handleMonthlyAllocationChange(allocation.month, parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          disabled={formData.distributionType !== 'custom'}
                        />
                      </div>
                    </div>
                    
                    {allocation.actualAmount !== undefined && (
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Valor Realizado</label>
                        <div className="flex items-center">
                          <input
                            type="number"
                            value={allocation.actualAmount || ''}
                            disabled
                            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ 
                          width: `${formData.totalAmount > 0 
                            ? Math.min((allocation.plannedAmount / formData.totalAmount) * 100, 100) 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        {formData.totalAmount > 0 
                          ? ((allocation.plannedAmount / formData.totalAmount) * 100).toFixed(1) 
                          : '0.0'}%
                      </span>
                      {allocation.actualAmount !== undefined && (
                        <span className={`${
                          allocation.actualAmount > allocation.plannedAmount ? 'text-red-500' : 'text-green-500'
                        }`}>
                          {allocation.actualAmount > allocation.plannedAmount ? '+' : ''}
                          {((allocation.actualAmount - allocation.plannedAmount) / allocation.plannedAmount * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Observações sobre a alocação orçamentária..."
            />
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
            >
              <Save className="w-4 h-4" />
              <span>{submitButtonText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}