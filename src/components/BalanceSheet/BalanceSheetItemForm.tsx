import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign } from 'lucide-react';
import { BalanceSheetItem, BalanceSheetItemFormData, AccountingAccount, accountTypeLabels, accountGroupLabels } from '../../types/balanceSheet';

interface BalanceSheetItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: BalanceSheetItemFormData) => void;
  initialData?: BalanceSheetItem | null;
  accounts: AccountingAccount[];
  excludedAccountIds?: string[]; // IDs de contas que já estão no balanço
}

export function BalanceSheetItemForm({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
  accounts,
  excludedAccountIds = []
}: BalanceSheetItemFormProps) {
  const [formData, setFormData] = useState<BalanceSheetItemFormData>({
    accountId: '',
    amount: 0,
    budgetedAmount: undefined,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedAccountType, setSelectedAccountType] = useState<string>('all');
  const [selectedAccountGroup, setSelectedAccountGroup] = useState<string>('all');

  // Inicializa o formulário com os dados iniciais quando estiver editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        accountId: initialData.accountId,
        amount: initialData.amount,
        budgetedAmount: initialData.budgetedAmount,
        notes: initialData.notes || ''
      });
      
      // Define o tipo e grupo da conta selecionada
      const account = accounts.find(acc => acc.id === initialData.accountId);
      if (account) {
        setSelectedAccountType(account.type);
        setSelectedAccountGroup(account.group);
      }
    } else {
      // Reset do formulário quando for um novo item
      setFormData({
        accountId: '',
        amount: 0,
        budgetedAmount: undefined,
        notes: ''
      });
      
      setSelectedAccountType('all');
      setSelectedAccountGroup('all');
    }
    
    setErrors({});
  }, [initialData, isOpen, accounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    const newErrors: Record<string, string> = {};
    
    if (!formData.accountId) newErrors.accountId = 'Conta contábil é obrigatória';
    if (formData.amount < 0) newErrors.amount = 'Valor deve ser maior ou igual a zero';
    if (formData.budgetedAmount !== undefined && formData.budgetedAmount < 0) {
      newErrors.budgetedAmount = 'Valor orçado deve ser maior ou igual a zero';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSave(formData);
      onClose();
    }
  };

  const handleAccountTypeChange = (type: string) => {
    setSelectedAccountType(type);
    setSelectedAccountGroup('all');
    setFormData({ ...formData, accountId: '' });
  };

  const handleAccountGroupChange = (group: string) => {
    setSelectedAccountGroup(group);
    setFormData({ ...formData, accountId: '' });
  };

  // Filtra as contas disponíveis
  const filteredAccounts = accounts.filter(account => {
    // Exclui contas que já estão no balanço
    if (excludedAccountIds.includes(account.id) && (!initialData || account.id !== initialData.accountId)) {
      return false;
    }
    
    // Filtra por tipo
    if (selectedAccountType !== 'all' && account.type !== selectedAccountType) {
      return false;
    }
    
    // Filtra por grupo
    if (selectedAccountGroup !== 'all' && account.group !== selectedAccountGroup) {
      return false;
    }
    
    return true;
  });

  // Obtém os grupos disponíveis para o tipo selecionado
  const availableGroups = selectedAccountType !== 'all'
    ? [...new Set(accounts
        .filter(account => account.type === selectedAccountType)
        .map(account => account.group))]
    : [];

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar Item do Balanço' : 'Adicionar Item ao Balanço';
  const submitButtonText = isEditing ? 'Salvar Alterações' : 'Adicionar Item';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
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
          {/* Filtros de Conta */}
          {!isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Tipo
                </label>
                <select
                  value={selectedAccountType}
                  onChange={(e) => handleAccountTypeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos os tipos</option>
                  {Object.entries(accountTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {selectedAccountType !== 'all' && availableGroups.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filtrar por Grupo
                  </label>
                  <select
                    value={selectedAccountGroup}
                    onChange={(e) => handleAccountGroupChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos os grupos</option>
                    {availableGroups.map((group) => (
                      <option key={group} value={group}>
                        {accountGroupLabels[group as keyof typeof accountGroupLabels] || group}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Conta Contábil */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conta Contábil *
            </label>
            <select
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.accountId ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isEditing} // Não permite alterar a conta ao editar
            >
              <option value="">Selecione uma conta</option>
              {filteredAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.code} - {account.name} ({accountTypeLabels[account.type]})
                </option>
              ))}
            </select>
            {errors.accountId && <p className="text-red-500 text-xs mt-1">{errors.accountId}</p>}
            {isEditing && (
              <p className="text-yellow-600 text-xs mt-1">A conta contábil não pode ser alterada após a criação</p>
            )}
          </div>

          {/* Valores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Real *
              </label>
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Orçado (Opcional)
              </label>
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.budgetedAmount || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    budgetedAmount: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.budgetedAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.budgetedAmount && <p className="text-red-500 text-xs mt-1">{errors.budgetedAmount}</p>}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Observações sobre este item..."
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