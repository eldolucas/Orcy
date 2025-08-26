import React, { useState, useEffect } from 'react';
import { X, Target, Save, Plus, Trash2, PieChart } from 'lucide-react';
import { BudgetPlan, BudgetPlanCategory, CostCenter, FiscalYear } from '../../types';

interface BudgetPlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: Omit<BudgetPlan, 'id' | 'createdAt' | 'lastUpdated'> | BudgetPlan) => void;
  costCenters: CostCenter[];
  fiscalYears: FiscalYear[];
  initialData?: BudgetPlan | null;
}

export function BudgetPlanFormModal({ 
  isOpen, 
  onClose, 
  onSave, 
  costCenters, 
  fiscalYears,
  initialData 
}: BudgetPlanFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fiscalYearId: '',
    costCenterId: '',
    planType: 'annual' as const,
    status: 'draft' as const,
    createdBy: 'Usuário Atual'
  });

  const [categories, setCategories] = useState<Omit<BudgetPlanCategory, 'id'>[]>([
    { 
      name: '', 
      plannedAmount: 0, 
      growthRate: 0, 
      seasonality: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
      priority: 'medium' as const,
      justification: ''
    }
  ]);

  const [planScenarios, setPlanScenarios] = useState([
    {
      name: 'Cenário Realista',
      description: 'Cenário base de planejamento',
      type: 'realistic' as const,
      adjustmentFactor: 1.0,
      assumptions: '',
      isDefault: true
    }
  ]);

  const [planAssumptions, setPlanAssumptions] = useState([
    {
      category: '',
      description: '',
      value: 0,
      unit: '%',
      impact: 'medium' as const,
      confidence: 80,
      source: ''
    }
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        fiscalYearId: initialData.fiscalYearId,
        costCenterId: initialData.costCenterId,
        planType: initialData.planType,
        status: initialData.status,
        createdBy: initialData.createdBy
      });
      setCategories(initialData.categories.map(cat => ({
        name: cat.name,
        plannedAmount: cat.plannedAmount,
        growthRate: cat.growthRate,
        seasonality: cat.seasonality,
        priority: cat.priority,
        justification: cat.justification
      })));
      setPlanScenarios(initialData.scenarios.map(scenario => ({
        name: scenario.name,
        description: scenario.description,
        type: scenario.type,
        adjustmentFactor: scenario.adjustmentFactor,
        assumptions: scenario.assumptions.join(', '),
        isDefault: scenario.isDefault
      })));
      setPlanAssumptions(initialData.assumptions.map(assumption => ({
        category: assumption.category,
        description: assumption.description,
        value: assumption.value,
        unit: assumption.unit,
        impact: assumption.impact,
        confidence: assumption.confidence,
        source: assumption.source
      })));
    } else {
      setFormData({
        name: '',
        description: '',
        fiscalYearId: '',
        costCenterId: '',
        planType: 'annual',
        status: 'draft',
        createdBy: 'Usuário Atual'
      });
      setCategories([
        { 
          name: '', 
          plannedAmount: 0, 
          growthRate: 0, 
          seasonality: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
          priority: 'medium',
          justification: ''
        }
      ]);
      setPlanScenarios([
        {
          name: 'Cenário Realista',
          description: 'Cenário base de planejamento',
          type: 'realistic',
          adjustmentFactor: 1.0,
          assumptions: '',
          isDefault: true
        }
      ]);
      setPlanAssumptions([
        {
          category: '',
          description: '',
          value: 0,
          unit: '%',
          impact: 'medium',
          confidence: 80,
          source: ''
        }
      ]);
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.fiscalYearId) newErrors.fiscalYearId = 'Exercício orçamentário é obrigatório';
    if (!formData.costCenterId) newErrors.costCenterId = 'Centro de custo é obrigatório';

    // Validate categories
    const validCategories = categories.filter(cat => cat.name.trim() && cat.plannedAmount > 0);
    if (validCategories.length === 0) {
      newErrors.categories = 'Pelo menos uma categoria válida é obrigatória';
    }

    // Validate scenarios
    const validScenarios = planScenarios.filter(scenario => scenario.name.trim() && scenario.description.trim());
    if (validScenarios.length === 0) {
      newErrors.scenarios = 'Pelo menos um cenário válido é obrigatório';
    }

    const defaultScenarios = validScenarios.filter(scenario => scenario.isDefault);
    if (defaultScenarios.length === 0) {
      newErrors.scenarios = 'Pelo menos um cenário deve ser marcado como padrão';
    } else if (defaultScenarios.length > 1) {
      newErrors.scenarios = 'Apenas um cenário pode ser marcado como padrão';
    }

    // Validate assumptions
    const validAssumptions = planAssumptions.filter(assumption => 
      assumption.category.trim() && assumption.description.trim() && assumption.source.trim()
    );

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const totalPlanned = validCategories.reduce((sum, cat) => sum + cat.plannedAmount, 0);
      
      const planCategories: BudgetPlanCategory[] = validCategories.map((cat, index) => ({
        ...cat,
        id: Date.now().toString() + index.toString()
      }));

      const scenarios = validScenarios.map((scenario, index) => ({
        id: Date.now().toString() + 's' + index.toString(),
        name: scenario.name,
        description: scenario.description,
        type: scenario.type,
        adjustmentFactor: scenario.adjustmentFactor,
        assumptions: scenario.assumptions.split(',').map(a => a.trim()).filter(a => a),
        projectedTotal: totalPlanned * scenario.adjustmentFactor,
        isDefault: scenario.isDefault
      }));

      const assumptions = validAssumptions.map((assumption, index) => ({
        id: Date.now().toString() + 'a' + index.toString(),
        category: assumption.category,
        description: assumption.description,
        value: assumption.value,
        unit: assumption.unit,
        impact: assumption.impact,
        confidence: assumption.confidence,
        source: assumption.source
      }));

      const planData = {
        ...formData,
        totalPlanned,
        categories: planCategories,
        assumptions,
        scenarios
      };

      if (initialData) {
        // Editing existing plan
        onSave({
          ...initialData,
          ...planData
        });
      } else {
        // Creating new plan
        onSave(planData);
      }

      onClose();
    }
  };

  const addCategory = () => {
    setCategories(prev => [...prev, { 
      name: '', 
      plannedAmount: 0, 
      growthRate: 0, 
      seasonality: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
      priority: 'medium',
      justification: ''
    }]);
  };

  const removeCategory = (index: number) => {
    if (categories.length > 1) {
      setCategories(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateCategory = (index: number, field: keyof Omit<BudgetPlanCategory, 'id'>, value: any) => {
    setCategories(prev => 
      prev.map((cat, i) => 
        i === index 
          ? { ...cat, [field]: value }
          : cat
      )
    );
  };

  const addScenario = () => {
    setPlanScenarios(prev => [...prev, {
      name: '',
      description: '',
      type: 'realistic',
      adjustmentFactor: 1.0,
      assumptions: '',
      isDefault: false
    }]);
  };

  const removeScenario = (index: number) => {
    if (planScenarios.length > 1) {
      setPlanScenarios(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateScenario = (index: number, field: string, value: any) => {
    setPlanScenarios(prev => 
      prev.map((scenario, i) => {
        if (i === index) {
          // If setting isDefault to true, set all others to false
          if (field === 'isDefault' && value === true) {
            return { ...scenario, [field]: value };
          }
          return { ...scenario, [field]: value };
        } else if (field === 'isDefault' && value === true) {
          // Set all other scenarios to not default
          return { ...scenario, isDefault: false };
        }
        return scenario;
      })
    );
  };

  const addAssumption = () => {
    setPlanAssumptions(prev => [...prev, {
      category: '',
      description: '',
      value: 0,
      unit: '%',
      impact: 'medium',
      confidence: 80,
      source: ''
    }]);
  };

  const removeAssumption = (index: number) => {
    if (planAssumptions.length > 1) {
      setPlanAssumptions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateAssumption = (index: number, field: string, value: any) => {
    setPlanAssumptions(prev => 
      prev.map((assumption, i) => 
        i === index 
          ? { ...assumption, [field]: value }
          : assumption
      )
    );
  };

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar Plano Orçamentário' : 'Novo Plano Orçamentário';
  const submitButtonText = isEditing ? 'Salvar Alterações' : 'Criar Plano';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
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
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Plano *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Plano Orçamentário TI 2025"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo do Plano
              </label>
              <select
                value={formData.planType}
                onChange={(e) => setFormData({ ...formData, planType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="annual">Anual</option>
                <option value="quarterly">Trimestral</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Descrição detalhada do plano orçamentário..."
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Cost Center and Fiscal Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {center.path} - {center.name}
                  </option>
                ))}
              </select>
              {errors.costCenterId && <p className="text-red-500 text-xs mt-1">{errors.costCenterId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exercício Orçamentário *
              </label>
              <select
                value={formData.fiscalYearId}
                onChange={(e) => setFormData({ ...formData, fiscalYearId: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.fiscalYearId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione um exercício</option>
                {fiscalYears.map((fiscalYear) => (
                  <option key={fiscalYear.id} value={fiscalYear.id}>
                    {fiscalYear.name} ({fiscalYear.year})
                  </option>
                ))}
              </select>
              {errors.fiscalYearId && <p className="text-red-500 text-xs mt-1">{errors.fiscalYearId}</p>}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="draft">Rascunho</option>
              <option value="review">Em Revisão</option>
              <option value="approved">Aprovado</option>
              <option value="active">Ativo</option>
            </select>
          </div>

          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Categorias do Plano
              </label>
              <button
                type="button"
                onClick={addCategory}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Categoria</span>
              </button>
            </div>

            <div className="space-y-4">
              {categories.map((category, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Nome da Categoria
                      </label>
                      <input
                        type="text"
                        value={category.name}
                        onChange={(e) => updateCategory(index, 'name', e.target.value)}
                        placeholder="Ex: Infraestrutura"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Valor Planejado (R$)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={category.plannedAmount || ''}
                        onChange={(e) => updateCategory(index, 'plannedAmount', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Taxa de Crescimento (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={category.growthRate || ''}
                        onChange={(e) => updateCategory(index, 'growthRate', parseFloat(e.target.value) || 0)}
                        placeholder="0.0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Prioridade
                      </label>
                      <select
                        value={category.priority}
                        onChange={(e) => updateCategory(index, 'priority', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="low">Baixa</option>
                        <option value="medium">Média</option>
                        <option value="high">Alta</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Justificativa
                    </label>
                    <textarea
                      value={category.justification}
                      onChange={(e) => updateCategory(index, 'justification', e.target.value)}
                      rows={2}
                      placeholder="Justificativa para esta categoria..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  
                  {categories.length > 1 && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeCategory(index)}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remover</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {errors.categories && <p className="text-red-500 text-xs mt-1">{errors.categories}</p>}

            {/* Total Summary */}
            {categories.some(cat => cat.plannedAmount > 0) && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total Planejado:</span>
                  <span className="text-lg font-bold text-blue-600">
                    R$ {categories.reduce((sum, cat) => sum + (cat.plannedAmount || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Scenarios */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Cenários de Planejamento
              </label>
              <button
                type="button"
                onClick={addScenario}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Cenário</span>
              </button>
            </div>

            <div className="space-y-4">
              {planScenarios.map((scenario, index) => (
                <div key={index} className={`border-2 rounded-lg p-4 ${
                  scenario.isDefault ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Nome do Cenário
                      </label>
                      <input
                        type="text"
                        value={scenario.name}
                        onChange={(e) => updateScenario(index, 'name', e.target.value)}
                        placeholder="Ex: Cenário Otimista"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tipo do Cenário
                      </label>
                      <select
                        value={scenario.type}
                        onChange={(e) => updateScenario(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="optimistic">Otimista</option>
                        <option value="realistic">Realista</option>
                        <option value="pessimistic">Pessimista</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Fator de Ajuste
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        max="3.0"
                        step="0.1"
                        value={scenario.adjustmentFactor || ''}
                        onChange={(e) => updateScenario(index, 'adjustmentFactor', parseFloat(e.target.value) || 1.0)}
                        placeholder="1.0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Descrição
                      </label>
                      <textarea
                        value={scenario.description}
                        onChange={(e) => updateScenario(index, 'description', e.target.value)}
                        rows={2}
                        placeholder="Descrição do cenário..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Premissas (separadas por vírgula)
                      </label>
                      <textarea
                        value={scenario.assumptions}
                        onChange={(e) => updateScenario(index, 'assumptions', e.target.value)}
                        rows={2}
                        placeholder="Ex: Crescimento 15%, Inflação 4%"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`scenario-default-${index}`}
                        checked={scenario.isDefault}
                        onChange={(e) => updateScenario(index, 'isDefault', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`scenario-default-${index}`} className="text-xs text-gray-700">
                        Cenário padrão
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {categories.some(cat => cat.plannedAmount > 0) && (
                        <div className="text-right">
                          <span className="text-xs text-gray-600">Projeção:</span>
                          <span className="text-sm font-bold text-blue-600 ml-1">
                            R$ {(categories.reduce((sum, cat) => sum + (cat.plannedAmount || 0), 0) * scenario.adjustmentFactor).toLocaleString()}
                          </span>
                        </div>
                      )}
                      
                      {planScenarios.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeScenario(index)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remover</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {errors.scenarios && <p className="text-red-500 text-xs mt-1">{errors.scenarios}</p>}
          </div>

          {/* Assumptions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Premissas de Planejamento
              </label>
              <button
                type="button"
                onClick={addAssumption}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Premissa</span>
              </button>
            </div>

            <div className="space-y-4">
              {planAssumptions.map((assumption, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Categoria
                      </label>
                      <select
                        value={assumption.category}
                        onChange={(e) => updateAssumption(index, 'category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="">Selecione uma categoria</option>
                        <option value="Crescimento">Crescimento</option>
                        <option value="Inflação">Inflação</option>
                        <option value="Taxa de Câmbio">Taxa de Câmbio</option>
                        <option value="Taxa de Juros">Taxa de Juros</option>
                        <option value="Mercado">Mercado</option>
                        <option value="Regulamentação">Regulamentação</option>
                        <option value="Tecnologia">Tecnologia</option>
                        <option value="Recursos Humanos">Recursos Humanos</option>
                        <option value="Operacional">Operacional</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Valor
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={assumption.value || ''}
                        onChange={(e) => updateAssumption(index, 'value', parseFloat(e.target.value) || 0)}
                        placeholder="0.0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Unidade
                      </label>
                      <select
                        value={assumption.unit}
                        onChange={(e) => updateAssumption(index, 'unit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="%">%</option>
                        <option value="R$">R$</option>
                        <option value="unidades">unidades</option>
                        <option value="meses">meses</option>
                        <option value="anos">anos</option>
                        <option value="pontos">pontos</option>
                        <option value="múltiplo">múltiplo</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Descrição
                      </label>
                      <textarea
                        value={assumption.description}
                        onChange={(e) => updateAssumption(index, 'description', e.target.value)}
                        rows={2}
                        placeholder="Descrição detalhada da premissa..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Fonte
                      </label>
                      <input
                        type="text"
                        value={assumption.source}
                        onChange={(e) => updateAssumption(index, 'source', e.target.value)}
                        placeholder="Ex: Banco Central, Projeção comercial..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Impacto
                      </label>
                      <select
                        value={assumption.impact}
                        onChange={(e) => updateAssumption(index, 'impact', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="low">Baixo</option>
                        <option value="medium">Médio</option>
                        <option value="high">Alto</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Confiança (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={assumption.confidence || ''}
                        onChange={(e) => updateAssumption(index, 'confidence', parseInt(e.target.value) || 0)}
                        placeholder="80"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  
                  {planAssumptions.length > 1 && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeAssumption(index)}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remover</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
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