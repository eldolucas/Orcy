import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Save, Plus, Trash2, BarChart3 } from 'lucide-react';
import { Forecast, ForecastDataPoint } from '../../types';

interface ForecastFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (forecast: Omit<Forecast, 'id' | 'createdAt' | 'lastUpdated'> | Forecast) => void;
  initialData?: Forecast | null;
}

export function ForecastFormModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: ForecastFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'expense' as const,
    method: 'linear' as const,
    period: 'monthly' as const,
    horizon: 12,
    createdBy: 'Usuário Atual'
  });

  const [baseData, setBaseData] = useState<Omit<ForecastDataPoint, 'lowerBound' | 'upperBound' | 'confidence'>[]>([
    { period: '', actual: 0, projected: 0 }
  ]);

  const [projections, setProjections] = useState<ForecastDataPoint[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        type: initialData.type,
        method: initialData.method,
        period: initialData.period,
        horizon: initialData.horizon,
        createdBy: initialData.createdBy
      });
      setBaseData(initialData.baseData.map(data => ({
        period: data.period,
        actual: data.actual || 0,
        projected: data.projected
      })));
      setProjections(initialData.projections);
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'expense',
        method: 'linear',
        period: 'monthly',
        horizon: 12,
        createdBy: 'Usuário Atual'
      });
      setBaseData([
        { period: '', actual: 0, projected: 0 }
      ]);
      setProjections([]);
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (formData.horizon < 1 || formData.horizon > 60) {
      newErrors.horizon = 'Horizonte deve estar entre 1 e 60 períodos';
    }

    // Validate base data
    const validBaseData = baseData.filter(data => data.period.trim() && data.actual > 0);
    if (validBaseData.length === 0) {
      newErrors.baseData = 'Pelo menos um dado base válido é obrigatório';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Generate projections if not already generated
      let finalProjections = projections;
      if (projections.length === 0) {
        finalProjections = generateProjections();
      }

      // Process base data with bounds and confidence
      const processedBaseData: ForecastDataPoint[] = validBaseData.map(data => ({
        ...data,
        lowerBound: data.actual * 0.95,
        upperBound: data.actual * 1.05,
        confidence: 95
      }));

      const forecastData = {
        ...formData,
        baseData: processedBaseData,
        projections: finalProjections,
        accuracy: calculateAccuracy(processedBaseData),
        confidence: calculateAverageConfidence(finalProjections)
      };

      if (initialData) {
        // Editing existing forecast
        onSave({
          ...initialData,
          ...forecastData
        });
      } else {
        // Creating new forecast
        onSave(forecastData);
      }

      onClose();
    }
  };

  const generateProjections = () => {
    const validBaseData = baseData.filter(data => data.period.trim() && data.actual > 0);
    if (validBaseData.length === 0) return [];

    const actualValues = validBaseData.map(data => data.actual);
    const projectedValues: ForecastDataPoint[] = [];

    switch (formData.method) {
      case 'linear':
        const trend = actualValues.length > 1 
          ? (actualValues[actualValues.length - 1] - actualValues[0]) / (actualValues.length - 1)
          : 0;
        
        for (let i = 0; i < formData.horizon; i++) {
          const projected = actualValues[actualValues.length - 1] + (trend * (i + 1));
          const adjustedProjected = Math.max(0, projected);
          projectedValues.push({
            period: generatePeriodName(i + 1),
            projected: adjustedProjected,
            lowerBound: adjustedProjected * 0.9,
            upperBound: adjustedProjected * 1.1,
            confidence: Math.max(60, 90 - (i * 2))
          });
        }
        break;
        
      case 'exponential':
        const growthRate = actualValues.length > 1
          ? Math.pow(actualValues[actualValues.length - 1] / actualValues[0], 1 / (actualValues.length - 1)) - 1
          : 0.05;
        
        for (let i = 0; i < formData.horizon; i++) {
          const projected = actualValues[actualValues.length - 1] * Math.pow(1 + growthRate, i + 1);
          projectedValues.push({
            period: generatePeriodName(i + 1),
            projected: projected,
            lowerBound: projected * 0.85,
            upperBound: projected * 1.15,
            confidence: Math.max(50, 85 - (i * 3))
          });
        }
        break;
        
      case 'seasonal':
        const seasonalPattern = [1.0, 0.95, 1.1, 1.05, 1.0, 0.9, 0.85, 0.9, 1.05, 1.15, 1.1, 1.2];
        const baseValue = actualValues.reduce((sum, val) => sum + val, 0) / actualValues.length;
        
        for (let i = 0; i < formData.horizon; i++) {
          const seasonalFactor = seasonalPattern[i % 12];
          const projected = baseValue * seasonalFactor * (1 + 0.05); // 5% growth
          projectedValues.push({
            period: generatePeriodName(i + 1),
            projected: projected,
            lowerBound: projected * 0.8,
            upperBound: projected * 1.2,
            confidence: Math.max(60, 80 - (i * 2))
          });
        }
        break;

      case 'regression':
        // Simplified linear regression
        const n = actualValues.length;
        const sumX = actualValues.reduce((sum, _, index) => sum + index, 0);
        const sumY = actualValues.reduce((sum, val) => sum + val, 0);
        const sumXY = actualValues.reduce((sum, val, index) => sum + (index * val), 0);
        const sumXX = actualValues.reduce((sum, _, index) => sum + (index * index), 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        for (let i = 0; i < formData.horizon; i++) {
          const x = actualValues.length + i;
          const projected = Math.max(0, slope * x + intercept);
          projectedValues.push({
            period: generatePeriodName(i + 1),
            projected: projected,
            lowerBound: projected * 0.88,
            upperBound: projected * 1.12,
            confidence: Math.max(65, 88 - (i * 2))
          });
        }
        break;
    }

    return projectedValues;
  };

  const generatePeriodName = (index: number) => {
    const currentDate = new Date();
    const futureDate = new Date(currentDate);
    
    switch (formData.period) {
      case 'monthly':
        futureDate.setMonth(currentDate.getMonth() + index);
        return futureDate.toISOString().slice(0, 7); // YYYY-MM
      case 'quarterly':
        futureDate.setMonth(currentDate.getMonth() + (index * 3));
        return `Q${Math.ceil((futureDate.getMonth() + 1) / 3)}/${futureDate.getFullYear()}`;
      case 'yearly':
        futureDate.setFullYear(currentDate.getFullYear() + index);
        return futureDate.getFullYear().toString();
      default:
        return `Período ${index}`;
    }
  };

  const calculateAccuracy = (baseData: ForecastDataPoint[]) => {
    if (baseData.length === 0) return 0;
    
    // Simplified accuracy calculation based on confidence
    const avgConfidence = baseData.reduce((sum, data) => sum + (data.confidence || 90), 0) / baseData.length;
    return Math.min(95, avgConfidence + Math.random() * 10);
  };

  const calculateAverageConfidence = (projections: ForecastDataPoint[]) => {
    if (projections.length === 0) return 0;
    return projections.reduce((sum, proj) => sum + proj.confidence, 0) / projections.length;
  };

  const addBaseData = () => {
    setBaseData(prev => [...prev, { period: '', actual: 0, projected: 0 }]);
  };

  const removeBaseData = (index: number) => {
    if (baseData.length > 1) {
      setBaseData(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateBaseData = (index: number, field: string, value: any) => {
    setBaseData(prev => 
      prev.map((data, i) => 
        i === index 
          ? { ...data, [field]: value }
          : data
      )
    );
  };

  const handleGenerateProjections = () => {
    const newProjections = generateProjections();
    setProjections(newProjections);
  };

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar Projeção' : 'Nova Projeção';
  const submitButtonText = isEditing ? 'Salvar Alterações' : 'Criar Projeção';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
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
                Nome da Projeção *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Projeção Despesas TI 2025"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Projeção
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="expense">Despesas</option>
                <option value="revenue">Receitas</option>
                <option value="budget">Orçamento</option>
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Descrição detalhada da projeção..."
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Method and Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Projeção
              </label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="linear">Linear</option>
                <option value="exponential">Exponencial</option>
                <option value="seasonal">Sazonal</option>
                <option value="regression">Regressão</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <select
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="monthly">Mensal</option>
                <option value="quarterly">Trimestral</option>
                <option value="yearly">Anual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horizonte (períodos) *
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={formData.horizon}
                onChange={(e) => setFormData({ ...formData, horizon: parseInt(e.target.value) || 12 })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.horizon ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="12"
              />
              {errors.horizon && <p className="text-red-500 text-xs mt-1">{errors.horizon}</p>}
            </div>
          </div>

          {/* Method Description */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Sobre o Método Selecionado:</h4>
            <p className="text-sm text-gray-600">
              {formData.method === 'linear' && 'Projeção baseada em tendência linear dos dados históricos. Ideal para dados com crescimento constante.'}
              {formData.method === 'exponential' && 'Projeção baseada em crescimento exponencial. Adequada para dados com taxa de crescimento percentual constante.'}
              {formData.method === 'seasonal' && 'Projeção que considera padrões sazonais. Útil para dados com variações cíclicas previsíveis.'}
              {formData.method === 'regression' && 'Projeção baseada em regressão linear simples. Oferece maior precisão estatística para tendências lineares.'}
            </p>
          </div>

          {/* Base Data */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Dados Base (Histórico)
              </label>
              <button
                type="button"
                onClick={addBaseData}
                className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Período</span>
              </button>
            </div>

            <div className="space-y-3">
              {baseData.map((data, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={data.period}
                      onChange={(e) => updateBaseData(index, 'period', e.target.value)}
                      placeholder="Ex: 2024-01 ou Q1/2024"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={data.actual || ''}
                      onChange={(e) => updateBaseData(index, 'actual', parseFloat(e.target.value) || 0)}
                      placeholder="Valor real"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  {baseData.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBaseData(index)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {errors.baseData && <p className="text-red-500 text-xs mt-1">{errors.baseData}</p>}
          </div>

          {/* Generate Projections */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleGenerateProjections}
              className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Gerar Projeções</span>
            </button>
          </div>

          {/* Projections Preview */}
          {projections.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Projeções Geradas</h4>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {projections.slice(0, 12).map((projection, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-sm">
                        <div className="font-medium text-gray-800 mb-1">{projection.period}</div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Projetado:</span>
                            <span className="font-medium">R$ {projection.projected.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Faixa:</span>
                            <span className="text-gray-500">
                              {projection.lowerBound.toLocaleString()} - {projection.upperBound.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Confiança:</span>
                            <span className="font-medium text-green-600">{projection.confidence.toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {projections.length > 12 && (
                  <p className="text-center text-sm text-gray-500 mt-3">
                    ... e mais {projections.length - 12} períodos
                  </p>
                )}
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
              disabled={projections.length === 0}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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