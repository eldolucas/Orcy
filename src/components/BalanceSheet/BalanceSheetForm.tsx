import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, FileText } from 'lucide-react';
import { BalanceSheet, BalanceSheetFormData, periodTypeLabels, balanceSheetStatusLabels } from '../../types/balanceSheet';
import { useFinancialYears } from '../../hooks/useFinancialYears';

interface BalanceSheetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (balanceSheet: BalanceSheetFormData) => void;
  initialData?: BalanceSheet | null;
}

export function BalanceSheetForm({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: BalanceSheetFormProps) {
  const { financialYears } = useFinancialYears();
  
  const [formData, setFormData] = useState<BalanceSheetFormData>({
    fiscalYearId: '',
    period: '',
    periodType: 'monthly',
    status: 'draft',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializa o formulário com os dados iniciais quando estiver editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        fiscalYearId: initialData.fiscalYearId,
        period: initialData.period,
        periodType: initialData.periodType,
        status: initialData.status,
        notes: initialData.notes || ''
      });
    } else {
      // Reset do formulário quando for um novo balanço
      setFormData({
        fiscalYearId: '',
        period: '',
        periodType: 'monthly',
        status: 'draft',
        notes: ''
      });
    }
    
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    const newErrors: Record<string, string> = {};
    
    if (!formData.fiscalYearId) newErrors.fiscalYearId = 'Exercício financeiro é obrigatório';
    if (!formData.period) newErrors.period = 'Período é obrigatório';
    
    // Validação específica para o formato do período
    if (formData.period) {
      const periodRegex = {
        monthly: /^\d{4}-\d{2}$/,
        quarterly: /^\d{4}-Q[1-4]$/,
        annual: /^\d{4}$/
      };
      
      if (!periodRegex[formData.periodType].test(formData.period)) {
        newErrors.period = `Formato inválido. Use ${
          formData.periodType === 'monthly' ? 'AAAA-MM' :
          formData.periodType === 'quarterly' ? 'AAAA-Q#' : 'AAAA'
        }`;
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSave(formData);
      onClose();
    }
  };

  const handlePeriodTypeChange = (type: 'monthly' | 'quarterly' | 'annual') => {
    // Ajusta o formato do período quando o tipo muda
    let newPeriod = '';
    const currentDate = new Date();
    
    switch (type) {
      case 'monthly':
        newPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'quarterly':
        const quarter = Math.floor(currentDate.getMonth() / 3) + 1;
        newPeriod = `${currentDate.getFullYear()}-Q${quarter}`;
        break;
      case 'annual':
        newPeriod = `${currentDate.getFullYear()}`;
        break;
    }
    
    setFormData({
      ...formData,
      periodType: type,
      period: newPeriod
    });
  };

  const getPeriodPlaceholder = () => {
    switch (formData.periodType) {
      case 'monthly':
        return 'AAAA-MM (ex: 2024-06)';
      case 'quarterly':
        return 'AAAA-Q# (ex: 2024-Q2)';
      case 'annual':
        return 'AAAA (ex: 2024)';
      default:
        return '';
    }
  };

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar Balanço' : 'Novo Balanço';
  const submitButtonText = isEditing ? 'Salvar Alterações' : 'Criar Balanço';

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
          {/* Exercício Financeiro */}
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
              disabled={isEditing} // Não permite alterar o exercício financeiro ao editar
            >
              <option value="">Selecione um exercício</option>
              {financialYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name} ({year.year})
                </option>
              ))}
            </select>
            {errors.fiscalYearId && <p className="text-red-500 text-xs mt-1">{errors.fiscalYearId}</p>}
            {isEditing && (
              <p className="text-yellow-600 text-xs mt-1">O exercício financeiro não pode ser alterado após a criação</p>
            )}
          </div>

          {/* Tipo de Período */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Período *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(periodTypeLabels).map(([value, label]) => (
                <label 
                  key={value} 
                  className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.periodType === value 
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="periodType"
                    value={value}
                    checked={formData.periodType === value}
                    onChange={() => handlePeriodTypeChange(value as any)}
                    className="sr-only"
                    disabled={isEditing} // Não permite alterar o tipo de período ao editar
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {isEditing && (
              <p className="text-yellow-600 text-xs mt-1">O tipo de período não pode ser alterado após a criação</p>
            )}
          </div>

          {/* Período */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período *
            </label>
            <input
              type="text"
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.period ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={getPeriodPlaceholder()}
              disabled={isEditing} // Não permite alterar o período ao editar
            />
            {errors.period && <p className="text-red-500 text-xs mt-1">{errors.period}</p>}
            {isEditing && (
              <p className="text-yellow-600 text-xs mt-1">O período não pode ser alterado após a criação</p>
            )}
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
              disabled={isEditing && initialData?.status !== 'draft'} // Só permite alterar o status se for rascunho
            >
              {Object.entries(balanceSheetStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {isEditing && initialData?.status !== 'draft' && (
              <p className="text-yellow-600 text-xs mt-1">O status só pode ser alterado para balanços em rascunho</p>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <div className="flex items-start">
              <FileText className="w-5 h-5 text-gray-400 mr-2 mt-2" />
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Observações sobre o balanço..."
              />
            </div>
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