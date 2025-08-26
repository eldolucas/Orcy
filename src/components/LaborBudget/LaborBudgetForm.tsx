import React, { useState, useEffect } from 'react';
import { X, Save, Briefcase, DollarSign, Users, Plus, Trash2 } from 'lucide-react';
import { LaborBudget, LaborBudgetFormData, LaborBenefit, LaborCharge, defaultBenefits, defaultCharges, departmentOptions } from '../../types/laborBudget';
import { useLaborBudget } from '../../hooks/useLaborBudget';
import { useCostCenters } from '../../hooks/useCostCenters';
import { useFinancialYears } from '../../hooks/useFinancialYears';

interface LaborBudgetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (laborBudget: LaborBudgetFormData) => void;
  initialData?: LaborBudget | null;
}

export function LaborBudgetForm({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: LaborBudgetFormProps) {
  const { calculateTotalCost } = useLaborBudget();
  const { costCenters } = useCostCenters();
  const { financialYears } = useFinancialYears();
  
  const [formData, setFormData] = useState<LaborBudgetFormData>({
    position: '',
    department: '',
    baseSalary: 0,
    benefits: [...defaultBenefits],
    charges: [...defaultCharges],
    quantity: 1,
    costCenterId: '',
    fiscalYearId: '',
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'benefits' | 'charges'>('basic');
  const [estimatedCost, setEstimatedCost] = useState<number>(0);

  // Inicializa o formulário com os dados iniciais quando estiver editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        position: initialData.position,
        department: initialData.department,
        baseSalary: initialData.baseSalary,
        benefits: initialData.benefits.map(({ id, ...rest }) => rest),
        charges: initialData.charges.map(({ id, ...rest }) => rest),
        quantity: initialData.quantity,
        costCenterId: initialData.costCenterId,
        fiscalYearId: initialData.fiscalYearId,
        isActive: initialData.isActive
      });
    } else {
      // Reset do formulário quando for um novo registro
      setFormData({
        position: '',
        department: '',
        baseSalary: 0,
        benefits: [...defaultBenefits],
        charges: [...defaultCharges],
        quantity: 1,
        costCenterId: '',
        fiscalYearId: '',
        isActive: true
      });
    }
    setErrors({});
    setActiveTab('basic');
  }, [initialData, isOpen]);

  // Recalcula o custo estimado quando os dados relevantes mudam
  useEffect(() => {
    const cost = calculateTotalCost(
      formData.baseSalary,
      formData.benefits,
      formData.charges,
      formData.quantity
    );
    setEstimatedCost(cost);
  }, [formData.baseSalary, formData.benefits, formData.charges, formData.quantity, calculateTotalCost]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    const newErrors: Record<string, string> = {};
    
    if (!formData.position.trim()) newErrors.position = 'Cargo/Função é obrigatório';
    if (!formData.department.trim()) newErrors.department = 'Departamento é obrigatório';
    if (!formData.baseSalary || formData.baseSalary <= 0) {
      newErrors.baseSalary = 'Salário base deve ser maior que zero';
    }
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Quantidade deve ser maior que zero';
    }
    if (!formData.costCenterId) newErrors.costCenterId = 'Centro de custo é obrigatório';
    if (!formData.fiscalYearId) newErrors.fiscalYearId = 'Exercício financeiro é obrigatório';
    
    // Validação de benefícios
    const invalidBenefits = formData.benefits.some(b => !b.name.trim() || b.value < 0);
    if (invalidBenefits) {
      newErrors.benefits = 'Todos os benefícios devem ter nome e valor válido';
    }
    
    // Validação de encargos
    const invalidCharges = formData.charges.some(c => !c.name.trim() || c.percentage < 0 || c.percentage > 100);
    if (invalidCharges) {
      newErrors.charges = 'Todos os encargos devem ter nome e percentual válido (0-100%)';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSave(formData);
      onClose();
    } else {
      // Se houver erros, muda para a aba que contém o primeiro erro
      const firstErrorField = Object.keys(newErrors)[0];
      
      if (['position', 'department', 'baseSalary', 'quantity', 'costCenterId', 'fiscalYearId'].includes(firstErrorField)) {
        setActiveTab('basic');
      } else if (firstErrorField === 'benefits') {
        setActiveTab('benefits');
      } else if (firstErrorField === 'charges') {
        setActiveTab('charges');
      }
    }
  };

  const handleAddBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [
        ...prev.benefits,
        {
          name: '',
          value: 0,
          type: 'fixed',
          isMonthly: true,
          months: 12
        }
      ]
    }));
  };

  const handleRemoveBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateBenefit = (index: number, field: keyof Omit<LaborBenefit, 'id'>, value: any) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) => 
        i === index ? { ...benefit, [field]: value } : benefit
      )
    }));
  };

  const handleAddCharge = () => {
    setFormData(prev => ({
      ...prev,
      charges: [
        ...prev.charges,
        {
          name: '',
          percentage: 0,
          baseIncludesBenefits: false
        }
      ]
    }));
  };

  const handleRemoveCharge = (index: number) => {
    setFormData(prev => ({
      ...prev,
      charges: prev.charges.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateCharge = (index: number, field: keyof Omit<LaborCharge, 'id'>, value: any) => {
    setFormData(prev => ({
      ...prev,
      charges: prev.charges.map((charge, i) => 
        i === index ? { ...charge, [field]: value } : charge
      )
    }));
  };

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar Mão de Obra Orçada' : 'Nova Mão de Obra Orçada';
  const submitButtonText = isEditing ? 'Salvar Alterações' : 'Criar Registro';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600" />
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

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'basic'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Informações Básicas
            </button>
            <button
              onClick={() => setActiveTab('benefits')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'benefits'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Benefícios
            </button>
            <button
              onClick={() => setActiveTab('charges')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'charges'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Encargos
            </button>
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tab: Informações Básicas */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo/Função *
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.position ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Desenvolvedor Sênior, Analista Financeiro"
                  />
                  {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.department ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione um departamento</option>
                    {departmentOptions.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salário Base (R$) *
                  </label>
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.baseSalary || ''}
                      onChange={(e) => setFormData({ ...formData, baseSalary: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.baseSalary ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.baseSalary && <p className="text-red-500 text-xs mt-1">{errors.baseSalary}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade de Funcionários *
                  </label>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={formData.quantity || ''}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.quantity ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="1"
                    />
                  </div>
                  {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
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
                    onChange={(e) => setFormData({ ...formData, fiscalYearId: e.target.value })}
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

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Ativo</span>
                </label>
              </div>

              {/* Custo Estimado */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Custo Total Anual Estimado:</span>
                  </div>
                  <div className="text-lg font-bold text-blue-800">
                    R$ {estimatedCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Custo mensal por funcionário: R$ {(estimatedCost / (formData.quantity * 12)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}

          {/* Tab: Benefícios */}
          {activeTab === 'benefits' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Benefícios</h3>
                <button
                  type="button"
                  onClick={handleAddBenefit}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Benefício</span>
                </button>
              </div>

              {errors.benefits && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  <p>{errors.benefits}</p>
                </div>
              )}

              <div className="space-y-4">
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nome do Benefício
                        </label>
                        <input
                          type="text"
                          value={benefit.name}
                          onChange={(e) => handleUpdateBenefit(index, 'name', e.target.value)}
                          placeholder="Ex: Vale Refeição"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Valor
                        </label>
                        <input
                          type="number"
                          min="0"
                          step={benefit.type === 'fixed' ? '0.01' : '0.01'}
                          value={benefit.value || ''}
                          onChange={(e) => handleUpdateBenefit(index, 'value', parseFloat(e.target.value) || 0)}
                          placeholder={benefit.type === 'fixed' ? "0.00" : "0.00"}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Tipo
                        </label>
                        <select
                          value={benefit.type}
                          onChange={(e) => handleUpdateBenefit(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          <option value="fixed">Valor Fixo (R$)</option>
                          <option value="percentage">Percentual (%)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Meses no Ano
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={benefit.months}
                          onChange={(e) => handleUpdateBenefit(index, 'months', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={benefit.isMonthly}
                          onChange={(e) => handleUpdateBenefit(index, 'isMonthly', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Pagamento Mensal</span>
                      </label>
                      
                      {formData.benefits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBenefit(index)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remover</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Encargos */}
          {activeTab === 'charges' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Encargos</h3>
                <button
                  type="button"
                  onClick={handleAddCharge}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Encargo</span>
                </button>
              </div>

              {errors.charges && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  <p>{errors.charges}</p>
                </div>
              )}

              <div className="space-y-4">
                {formData.charges.map((charge, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nome do Encargo
                        </label>
                        <input
                          type="text"
                          value={charge.name}
                          onChange={(e) => handleUpdateCharge(index, 'name', e.target.value)}
                          placeholder="Ex: INSS, FGTS"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Percentual (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={charge.percentage || ''}
                          onChange={(e) => handleUpdateCharge(index, 'percentage', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={charge.baseIncludesBenefits}
                            onChange={(e) => handleUpdateCharge(index, 'baseIncludesBenefits', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Incluir benefícios na base de cálculo</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      {formData.charges.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCharge(index)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remover</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-red-500 text-sm">*</span>
              <span className="text-gray-500 text-sm">Campos obrigatórios</span>
            </div>
            
            <div className="flex items-center space-x-3">
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
          </div>
        </form>
      </div>
    </div>
  );
}