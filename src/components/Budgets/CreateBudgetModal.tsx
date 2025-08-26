import React, { useState } from 'react';
import { X, PieChart, Save, Plus, Trash2 } from 'lucide-react';
import { Budget, BudgetCategory, CostCenter, FiscalYear } from '../../types';

interface CreateBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: Omit<Budget, 'id' | 'createdAt' | 'lastUpdated' | 'spent' | 'remaining'>) => void;
  costCenters: CostCenter[];
  fiscalYears: FiscalYear[];
}

export function CreateBudgetModal({ 
  isOpen, 
  onClose, 
  onSave, 
  costCenters, 
  fiscalYears 
}: CreateBudgetModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    costCenterId: '',
    fiscalYearId: '',
    period: '',
    totalBudget: '',
    status: 'planning' as const,
    createdBy: 'Usuário Atual' // In a real app, this would come from auth context
  });

  const [categories, setCategories] = useState<Omit<BudgetCategory, 'percentage'>[]>([
    { id: '1', name: '', budgeted: 0, spent: 0 }
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.costCenterId) newErrors.costCenterId = 'Centro de custo é obrigatório';
    if (!formData.fiscalYearId) newErrors.fiscalYearId = 'Exercício orçamentário é obrigatório';
    if (!formData.totalBudget || parseFloat(formData.totalBudget) <= 0) {
      newErrors.totalBudget = 'Orçamento deve ser maior que zero';
    }

    // Validate categories
    const validCategories = categories.filter(cat => cat.name.trim() && cat.budgeted > 0);
    if (validCategories.length === 0) {
      newErrors.categories = 'Pelo menos uma categoria válida é obrigatória';
    }

    const totalCategoriesBudget = validCategories.reduce((sum, cat) => sum + cat.budgeted, 0);
    const totalBudget = parseFloat(formData.totalBudget);
    
    if (totalCategoriesBudget > totalBudget) {
      newErrors.categories = 'A soma das categorias não pode exceder o orçamento total';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Find selected fiscal year to get period
      const selectedFiscalYear = fiscalYears.find(fy => fy.id === formData.fiscalYearId);
      
      const budgetCategories: BudgetCategory[] = validCategories.map(cat => ({
        ...cat,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        percentage: (cat.budgeted / totalBudget) * 100
      }));

      onSave({
        ...formData,
        period: selectedFiscalYear?.year.toString() || formData.period,
        totalBudget: totalBudget,
        categories: budgetCategories
      });

      // Reset form
      setFormData({
        name: '',
        costCenterId: '',
        fiscalYearId: '',
        period: '',
        totalBudget: '',
        status: 'planning',
        createdBy: 'Usuário Atual'
      });
      setCategories([{ id: '1', name: '', budgeted: 0, spent: 0 }]);
      setErrors({});
      onClose();
    }
  };

  const addCategory = () => {
    const newId = (categories.length + 1).toString();
    setCategories(prev => [...prev, { id: newId, name: '', budgeted: 0, spent: 0 }]);
  };

  const removeCategory = (id: string) => {
    if (categories.length > 1) {
      setCategories(prev => prev.filter(cat => cat.id !== id));
    }
  };

  const updateCategory = (id: string, field: keyof Omit<BudgetCategory, 'percentage'>, value: string | number) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === id 
          ? { ...cat, [field]: field === 'budgeted' ? parseFloat(value.toString()) || 0 : value }
          : cat
      )
    );
  };

  const handleFiscalYearChange = (fiscalYearId: string) => {
    const selectedFiscalYear = fiscalYears.find(fy => fy.id === fiscalYearId);
    setFormData(prev => ({
      ...prev,
      fiscalYearId,
      period: selectedFiscalYear?.year.toString() || ''
    }));
  };

  const totalCategoriesBudget = categories.reduce((sum, cat) => sum + (cat.budgeted || 0), 0);
  const totalBudget = parseFloat(formData.totalBudget) || 0;
  const remainingBudget = totalBudget - totalCategoriesBudget;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <PieChart className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Novo Orçamento</h2>
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
                Nome do Orçamento *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Orçamento TI 2024"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="planning">Planejamento</option>
                <option value="approved">Aprovado</option>
                <option value="active">Ativo</option>
                <option value="completed">Concluído</option>
              </select>
            </div>
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
                onChange={(e) => handleFiscalYearChange(e.target.value)}
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

          {/* Total Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Orçamento Total (R$) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.totalBudget}
              onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.totalBudget ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.totalBudget && <p className="text-red-500 text-xs mt-1">{errors.totalBudget}</p>}
          </div>

          {/* Budget Categories */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Categorias do Orçamento
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

            <div className="space-y-3">
              {categories.map((category, index) => (
                <div key={category.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                      placeholder="Nome da categoria"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={category.budgeted || ''}
                      onChange={(e) => updateCategory(category.id, 'budgeted', e.target.value)}
                      placeholder="Valor"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {categories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCategory(category.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {errors.categories && <p className="text-red-500 text-xs mt-1">{errors.categories}</p>}

            {/* Budget Summary */}
            {totalBudget > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total do Orçamento:</span>
                    <p className="font-semibold text-gray-800">R$ {totalBudget.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total das Categorias:</span>
                    <p className="font-semibold text-gray-800">R$ {totalCategoriesBudget.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Restante:</span>
                    <p className={`font-semibold ${remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      R$ {remainingBudget.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
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
              <span>Criar Orçamento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}