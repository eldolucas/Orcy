import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Calendar, Calculator } from 'lucide-react';
import { BudgetRevision, BudgetRevisionFormData, budgetRevisionStatusLabels } from '../../types/budgetRevision';
import { FinancialYear } from '../../types/financialYear';

interface BudgetRevisionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (revision: BudgetRevisionFormData) => void;
  initialData?: BudgetRevision | null;
  financialYears: FinancialYear[];
}

export function BudgetRevisionForm({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
  financialYears
}: BudgetRevisionFormProps) {
  const [formData, setFormData] = useState<BudgetRevisionFormData>({
    financialYearId: '',
    revisionNumber: 1,
    revisionDate: new Date().toISOString().split('T')[0],
    description: '',
    status: 'draft',
    totalBudgetBefore: 0,
    totalBudgetAfter: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [changePercentage, setChangePercentage] = useState<number>(0);

  // Initialize form with initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        financialYearId: initialData.financialYearId,
        revisionNumber: initialData.revisionNumber,
        revisionDate: initialData.revisionDate,
        description: initialData.description,
        status: initialData.status,
        totalBudgetBefore: initialData.totalBudgetBefore,
        totalBudgetAfter: initialData.totalBudgetAfter
      });
      
      // Calculate change percentage
      if (initialData.totalBudgetBefore && initialData.totalBudgetAfter) {
        const percentage = ((initialData.totalBudgetAfter - initialData.totalBudgetBefore) / initialData.totalBudgetBefore) * 100;
        setChangePercentage(percentage);
      }
    } else {
      // Reset form when creating new
      setFormData({
        financialYearId: '',
        revisionNumber: 1,
        revisionDate: new Date().toISOString().split('T')[0],
        description: '',
        status: 'draft',
        totalBudgetBefore: 0,
        totalBudgetAfter: 0
      });
      setChangePercentage(0);
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Calculate change percentage when budget values change
  useEffect(() => {
    if (formData.totalBudgetBefore && formData.totalBudgetAfter) {
      const percentage = ((formData.totalBudgetAfter - formData.totalBudgetBefore) / formData.totalBudgetBefore) * 100;
      setChangePercentage(percentage);
    } else {
      setChangePercentage(0);
    }
  }, [formData.totalBudgetBefore, formData.totalBudgetAfter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.financialYearId) newErrors.financialYearId = 'Exercício financeiro é obrigatório';
    if (!formData.revisionDate) newErrors.revisionDate = 'Data da revisão é obrigatória';
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.totalBudgetBefore || formData.totalBudgetBefore <= 0) {
      newErrors.totalBudgetBefore = 'Orçamento anterior deve ser maior que zero';
    }
    if (!formData.totalBudgetAfter || formData.totalBudgetAfter <= 0) {
      newErrors.totalBudgetAfter = 'Orçamento revisado deve ser maior que zero';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSave(formData);
    }
  };

  const handleFinancialYearChange = (financialYearId: string) => {
    setFormData(prev => ({
      ...prev,
      financialYearId
    }));
    
    // In a real app, you would fetch the latest budget value for this financial year
    // and set it as totalBudgetBefore
    const selectedYear = financialYears.find(year => year.id === financialYearId);
    if (selectedYear && selectedYear.totalBudget) {
      setFormData(prev => ({
        ...prev,
        financialYearId,
        totalBudgetBefore: selectedYear.totalBudget || 0,
        totalBudgetAfter: selectedYear.totalBudget || 0
      }));
    }
  };

  const getChangeColor = (percentage: number) => {
    if (percentage > 0) return 'text-green-600';
    if (percentage < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar Revisão Orçamentária' : 'Nova Revisão Orçamentária';
  const submitButtonText = isEditing ? 'Salvar Alterações' : 'Criar Revisão';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
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
          {/* Financial Year and Revision Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exercício Financeiro *
              </label>
              <select
                value={formData.financialYearId}
                onChange={(e) => handleFinancialYearChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.financialYearId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isEditing} // Can't change financial year when editing
              >
                <option value="">Selecione um exercício</option>
                {financialYears
                  .filter(year => year.status === 'active' || year.status === 'planning')
                  .map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name} ({year.year})
                    </option>
                  ))}
              </select>
              {errors.financialYearId && <p className="text-red-500 text-xs mt-1">{errors.financialYearId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número da Revisão
              </label>
              <input
                type="number"
                min="1"
                value={formData.revisionNumber}
                onChange={(e) => setFormData({ ...formData, revisionNumber: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isEditing} // Can't change revision number when editing
              />
              <p className="text-xs text-gray-500 mt-1">
                Número sequencial da revisão para este exercício
              </p>
            </div>
          </div>

          {/* Revision Date and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data da Revisão *
              </label>
              <input
                type="date"
                value={formData.revisionDate}
                onChange={(e) => setFormData({ ...formData, revisionDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.revisionDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.revisionDate && <p className="text-red-500 text-xs mt-1">{errors.revisionDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {Object.entries(budgetRevisionStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Descreva o motivo desta revisão orçamentária..."
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Budget Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orçamento Anterior (R$) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.totalBudgetBefore || ''}
                onChange={(e) => setFormData({ ...formData, totalBudgetBefore: parseFloat(e.target.value) || 0 })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.totalBudgetBefore ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.totalBudgetBefore && <p className="text-red-500 text-xs mt-1">{errors.totalBudgetBefore}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orçamento Revisado (R$) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.totalBudgetAfter || ''}
                onChange={(e) => setFormData({ ...formData, totalBudgetAfter: parseFloat(e.target.value) || 0 })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.totalBudgetAfter ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.totalBudgetAfter && <p className="text-red-500 text-xs mt-1">{errors.totalBudgetAfter}</p>}
            </div>
          </div>

          {/* Change Percentage */}
          {(formData.totalBudgetBefore > 0 && formData.totalBudgetAfter > 0) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Variação Orçamentária:</span>
                </div>
                <div className={`text-lg font-bold ${getChangeColor(changePercentage)}`}>
                  {changePercentage > 0 ? '+' : ''}{changePercentage.toFixed(2)}%
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {changePercentage > 0 
                  ? 'Aumento no orçamento total' 
                  : changePercentage < 0 
                  ? 'Redução no orçamento total' 
                  : 'Sem alteração no orçamento total'}
              </p>
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
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
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