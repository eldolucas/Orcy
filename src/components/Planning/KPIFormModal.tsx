import React, { useState, useEffect } from 'react';
import { X, BarChart3, Save } from 'lucide-react';
import { KPI } from '../../types';

interface KPIFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (kpi: Omit<KPI, 'id' | 'lastUpdated'> | KPI) => void;
  initialData?: KPI | null;
}

export function KPIFormModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: KPIFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    formula: '',
    target: 0,
    current: 0,
    trend: 'stable' as const,
    status: 'good' as const,
    unit: '%',
    frequency: 'monthly' as const,
    owner: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        category: initialData.category,
        formula: initialData.formula,
        target: initialData.target,
        current: initialData.current,
        trend: initialData.trend,
        status: initialData.status,
        unit: initialData.unit,
        frequency: initialData.frequency,
        owner: initialData.owner
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        formula: '',
        target: 0,
        current: 0,
        trend: 'stable',
        status: 'good',
        unit: '%',
        frequency: 'monthly',
        owner: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.category.trim()) newErrors.category = 'Categoria é obrigatória';
    if (!formData.formula.trim()) newErrors.formula = 'Fórmula é obrigatória';
    if (!formData.owner.trim()) newErrors.owner = 'Responsável é obrigatório';
    if (formData.target <= 0) newErrors.target = 'Meta deve ser maior que zero';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const kpiData = {
        ...formData
      };

      if (initialData) {
        // Editing existing KPI
        onSave({
          ...initialData,
          ...kpiData
        });
      } else {
        // Creating new KPI
        onSave(kpiData);
      }

      onClose();
    }
  };

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar KPI' : 'Novo KPI';
  const submitButtonText = isEditing ? 'Salvar Alterações' : 'Criar KPI';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-orange-600" />
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
                Nome do KPI *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Execução Orçamentária"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione uma categoria</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Performance">Performance</option>
                <option value="Controle">Controle</option>
                <option value="Qualidade">Qualidade</option>
                <option value="Eficiência">Eficiência</option>
                <option value="Produtividade">Produtividade</option>
                <option value="Satisfação">Satisfação</option>
                <option value="Crescimento">Crescimento</option>
                <option value="Operacional">Operacional</option>
                <option value="Estratégico">Estratégico</option>
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Descrição detalhada do indicador..."
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fórmula de Cálculo *
            </label>
            <textarea
              value={formData.formula}
              onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
              rows={2}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.formula ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: (Gasto Atual / Orçamento Total) * 100"
            />
            {errors.formula && <p className="text-red-500 text-xs mt-1">{errors.formula}</p>}
          </div>

          {/* Values and Targets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: parseFloat(e.target.value) || 0 })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.target ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.target && <p className="text-red-500 text-xs mt-1">{errors.target}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Atual
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.current}
                onChange={(e) => setFormData({ ...formData, current: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidade
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="%">%</option>
                <option value="R$">R$</option>
                <option value="unidades">unidades</option>
                <option value="pontos">pontos</option>
                <option value="dias">dias</option>
                <option value="horas">horas</option>
                <option value="índice">índice</option>
                <option value="ratio">ratio</option>
              </select>
            </div>
          </div>

          {/* Status and Trend */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tendência
              </label>
              <select
                value={formData.trend}
                onChange={(e) => setFormData({ ...formData, trend: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="up">Subindo</option>
                <option value="down">Descendo</option>
                <option value="stable">Estável</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="excellent">Excelente</option>
                <option value="good">Bom</option>
                <option value="warning">Atenção</option>
                <option value="critical">Crítico</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequência
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
                <option value="quarterly">Trimestral</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Responsável *
            </label>
            <input
              type="text"
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.owner ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nome do responsável pelo KPI"
            />
            {errors.owner && <p className="text-red-500 text-xs mt-1">{errors.owner}</p>}
          </div>

          {/* Performance Preview */}
          {formData.target > 0 && formData.current > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Prévia da Performance</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Progresso:</span>
                  <span className="text-lg font-bold text-gray-800">
                    {((formData.current / formData.target) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      formData.current >= formData.target ? 'bg-green-500' : 
                      formData.current >= formData.target * 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((formData.current / formData.target) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Atual: {formData.current}{formData.unit}</span>
                  <span>Meta: {formData.target}{formData.unit}</span>
                </div>
              </div>
            </div>
          )}

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
              className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
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