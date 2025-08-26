import React, { useState, useEffect } from 'react';
import { X, Calendar, Save } from 'lucide-react';
import { FinancialYear, FinancialYearFormData, financialYearStatusLabels } from '../../types/financialYear';

interface FinancialYearFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (financialYear: FinancialYearFormData) => void;
  initialData?: FinancialYear | null;
}

export function FinancialYearForm({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: FinancialYearFormProps) {
  const [formData, setFormData] = useState<FinancialYearFormData>({
    year: new Date().getFullYear() + 1,
    name: '',
    startDate: '',
    endDate: '',
    status: 'planning',
    description: '',
    isDefault: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        year: initialData.year,
        name: initialData.name,
        startDate: initialData.startDate,
        endDate: initialData.endDate,
        status: initialData.status,
        description: initialData.description || '',
        isDefault: initialData.isDefault
      });
    } else {
      // Reset form when creating new
      const nextYear = new Date().getFullYear() + 1;
      setFormData({
        year: nextYear,
        name: `Exercício ${nextYear}`,
        startDate: `${nextYear}-01-01`,
        endDate: `${nextYear}-12-31`,
        status: 'planning',
        description: '',
        isDefault: false
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.startDate) newErrors.startDate = 'Data de início é obrigatória';
    if (!formData.endDate) newErrors.endDate = 'Data de fim é obrigatória';
    if (formData.year < 2020 || formData.year > 2050) {
      newErrors.year = 'Ano deve estar entre 2020 e 2050';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (startDate >= endDate) {
        newErrors.endDate = 'Data de fim deve ser posterior à data de início';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSave(formData);
    }
  };

  const handleYearChange = (year: number) => {
    setFormData(prev => ({
      ...prev,
      year,
      name: `Exercício ${year}`,
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`
    }));
  };

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar Exercício Financeiro' : 'Novo Exercício Financeiro';
  const submitButtonText = isEditing ? 'Salvar Alterações' : 'Criar Exercício';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano *
              </label>
              <input
                type="number"
                min="2020"
                max="2050"
                value={formData.year}
                onChange={(e) => handleYearChange(parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.year ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isEditing && (initialData?.status === 'closed' || initialData?.status === 'archived')}
              >
                {Object.entries(financialYearStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {isEditing && (initialData?.status === 'closed' || initialData?.status === 'archived') && (
                <p className="text-yellow-600 text-xs mt-1">
                  O status não pode ser alterado para exercícios encerrados ou arquivados
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Exercício *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Exercício 2025"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Início *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Fim *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descrição opcional do exercício financeiro"
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isEditing && initialData?.isDefault}
              />
              <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                Definir como exercício padrão
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              O exercício padrão será usado como referência principal para relatórios e análises
            </p>
            {isEditing && initialData?.isDefault && (
              <p className="text-yellow-600 text-xs ml-6">
                Não é possível remover o status de padrão. Defina outro exercício como padrão primeiro.
              </p>
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
              <span>{submitButtonText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}