import React, { useState, useEffect } from 'react';
import { X, DollarSign, Save, Upload } from 'lucide-react';
import { Revenue, CostCenter, Budget, FiscalYear } from '../../types';

interface RevenueFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (revenue: Omit<Revenue, 'id' | 'lastUpdated'> | Revenue) => void;
  costCenters: CostCenter[];
  budgets: Budget[];
  fiscalYears: FiscalYear[];
  initialData?: Revenue | null;
}

export function RevenueFormModal({ 
  isOpen, 
  onClose, 
  onSave, 
  costCenters, 
  budgets, 
  fiscalYears,
  initialData 
}: RevenueFormModalProps) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    source: '',
    costCenterId: '',
    budgetId: '',
    fiscalYearId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending' as const,
    notes: '',
    recurrenceType: 'none' as const,
    nextRecurrenceDate: '',
    createdBy: 'Usuário Atual' // In a real app, this would come from auth context
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Common revenue sources
  const revenueSources = [
    'Vendas Diretas',
    'Licenças',
    'Serviços',
    'Consultoria',
    'Publicidade',
    'Assinaturas',
    'Comissões',
    'Royalties',
    'Juros',
    'Dividendos',
    'Vendas de Ativos',
    'Educação',
    'Eventos',
    'Parcerias',
    'Outros'
  ];

  // Initialize form with initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        description: initialData.description,
        amount: initialData.amount.toString(),
        source: initialData.source,
        costCenterId: initialData.costCenterId,
        budgetId: initialData.budgetId,
        fiscalYearId: initialData.fiscalYearId,
        date: initialData.date,
        status: initialData.status,
        notes: initialData.notes || '',
        recurrenceType: initialData.recurrenceType || 'none',
        nextRecurrenceDate: initialData.nextRecurrenceDate || '',
        createdBy: initialData.createdBy
      });
    } else {
      setFormData({
        description: '',
        amount: '',
        source: '',
        costCenterId: '',
        budgetId: '',
        fiscalYearId: '',
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        notes: '',
        recurrenceType: 'none',
        nextRecurrenceDate: '',
        createdBy: 'Usuário Atual'
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }
    if (!formData.source) newErrors.source = 'Fonte é obrigatória';
    if (!formData.costCenterId) newErrors.costCenterId = 'Centro de custo é obrigatório';
    if (!formData.budgetId) newErrors.budgetId = 'Orçamento é obrigatório';
    if (!formData.fiscalYearId) newErrors.fiscalYearId = 'Exercício orçamentário é obrigatório';
    if (!formData.date) newErrors.date = 'Data é obrigatória';

    // Validate date is not in the future
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (selectedDate > today) {
      newErrors.date = 'Data não pode ser no futuro';
    }

    // Validate recurrence date if recurrence is set
    if (formData.recurrenceType !== 'none' && !formData.nextRecurrenceDate) {
      newErrors.nextRecurrenceDate = 'Data da próxima recorrência é obrigatória';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const revenueData = {
        ...formData,
        amount: parseFloat(formData.amount),
        nextRecurrenceDate: formData.recurrenceType !== 'none' ? formData.nextRecurrenceDate : undefined
      };

      onSave(revenueData);
    }
  };

  const handleCostCenterChange = (costCenterId: string) => {
    setFormData(prev => ({
      ...prev,
      costCenterId,
      budgetId: '' // Reset budget when cost center changes
    }));
  };

  const handleRecurrenceChange = (recurrenceType: string) => {
    setFormData(prev => ({
      ...prev,
      recurrenceType: recurrenceType as any,
      nextRecurrenceDate: recurrenceType === 'none' ? '' : prev.nextRecurrenceDate
    }));
  };

  // Filter budgets by selected cost center
  const availableBudgets = budgets.filter(budget => 
    budget.costCenterId === formData.costCenterId && 
    budget.status === 'active'
  );

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar Receita' : 'Nova Receita';
  const submitButtonText = isEditing ? 'Salvar Alterações' : 'Criar Receita';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição da Receita *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Receita de vendas, licenciamento, etc."
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor (R$) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data da Receita *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fonte da Receita *
            </label>
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.source ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecione uma fonte</option>
              {revenueSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
            {errors.source && <p className="text-red-500 text-xs mt-1">{errors.source}</p>}
          </div>

          {/* Cost Center and Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Centro de Custo *
              </label>
              <select
                value={formData.costCenterId}
                onChange={(e) => handleCostCenterChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
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
                Orçamento *
              </label>
              <select
                value={formData.budgetId}
                onChange={(e) => setFormData({ ...formData, budgetId: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.budgetId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={!formData.costCenterId}
              >
                <option value="">Selecione um orçamento</option>
                {availableBudgets.map((budget) => (
                  <option key={budget.id} value={budget.id}>
                    {budget.name}
                  </option>
                ))}
              </select>
              {errors.budgetId && <p className="text-red-500 text-xs mt-1">{errors.budgetId}</p>}
              {formData.costCenterId && availableBudgets.length === 0 && (
                <p className="text-yellow-600 text-xs mt-1">
                  Nenhum orçamento ativo encontrado para este centro de custo
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exercício Orçamentário *
            </label>
            <select
              value={formData.fiscalYearId}
              onChange={(e) => setFormData({ ...formData, fiscalYearId: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.fiscalYearId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecione um exercício</option>
              {fiscalYears.filter(fy => fy.status === 'active' || fy.status === 'planning').map((fiscalYear) => (
                <option key={fiscalYear.id} value={fiscalYear.id}>
                  {fiscalYear.name} ({fiscalYear.year})
                </option>
              ))}
            </select>
            {errors.fiscalYearId && <p className="text-red-500 text-xs mt-1">{errors.fiscalYearId}</p>}
          </div>

          {/* Recurrence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Recorrência
              </label>
              <select
                value={formData.recurrenceType}
                onChange={(e) => handleRecurrenceChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="none">Sem recorrência</option>
                <option value="monthly">Mensal</option>
                <option value="quarterly">Trimestral</option>
                <option value="yearly">Anual</option>
              </select>
            </div>

            {formData.recurrenceType !== 'none' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Próxima Recorrência *
                </label>
                <input
                  type="date"
                  value={formData.nextRecurrenceDate}
                  onChange={(e) => setFormData({ ...formData, nextRecurrenceDate: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.nextRecurrenceDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.nextRecurrenceDate && <p className="text-red-500 text-xs mt-1">{errors.nextRecurrenceDate}</p>}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Informações adicionais sobre a receita..."
            />
          </div>

          {/* File Upload Placeholder */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anexos (Opcional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG até 10MB
                </p>
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
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
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