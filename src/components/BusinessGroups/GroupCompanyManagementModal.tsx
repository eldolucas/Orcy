import React, { useState, useEffect } from 'react';
import { X, Building, Plus, Minus, ArrowRight, History } from 'lucide-react';
import { BusinessGroup, BusinessGroupMembership, membershipActionLabels } from '../../types/businessGroup';
import { Company } from '../../types/company';

interface GroupCompanyManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessGroup: BusinessGroup | null;
  groupCompanies: Company[];
  unassignedCompanies: Company[];
  allBusinessGroups: BusinessGroup[];
  membershipHistory: BusinessGroupMembership[];
  onAssociateCompany: (companyId: string, reason?: string) => void;
  onDissociateCompany: (companyId: string, reason?: string) => void;
  onTransferCompany: (companyId: string, fromGroupId: string, toGroupId: string, reason?: string) => void;
}

export function GroupCompanyManagementModal({
  isOpen,
  onClose,
  businessGroup,
  groupCompanies,
  unassignedCompanies,
  allBusinessGroups,
  membershipHistory,
  onAssociateCompany,
  onDissociateCompany,
  onTransferCompany
}: GroupCompanyManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'associate' | 'transfer' | 'history'>('associate');
  const [selectedCompanyToAssociate, setSelectedCompanyToAssociate] = useState<string>('');
  const [associateReason, setAssociateReason] = useState<string>('');
  const [selectedCompanyToTransfer, setSelectedCompanyToTransfer] = useState<string>('');
  const [transferToGroup, setTransferToGroup] = useState<string>('');
  const [transferReason, setTransferReason] = useState<string>('');
  const [dissociateReason, setDissociateReason] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab('associate');
      setSelectedCompanyToAssociate('');
      setAssociateReason('');
      setSelectedCompanyToTransfer('');
      setTransferToGroup('');
      setTransferReason('');
      setDissociateReason('');
    }
  }, [isOpen]);

  if (!isOpen || !businessGroup) return null;

  const handleAssociate = () => {
    if (selectedCompanyToAssociate) {
      onAssociateCompany(selectedCompanyToAssociate, associateReason);
      setSelectedCompanyToAssociate('');
      setAssociateReason('');
    }
  };

  const handleDissociate = (companyId: string) => {
    if (window.confirm(`Tem certeza que deseja desvincular esta empresa do grupo ${businessGroup.name}?`)) {
      onDissociateCompany(companyId, dissociateReason);
      setDissociateReason('');
    }
  };

  const handleTransfer = () => {
    if (selectedCompanyToTransfer && transferToGroup && businessGroup) {
      onTransferCompany(selectedCompanyToTransfer, businessGroup.id, transferToGroup, transferReason);
      setSelectedCompanyToTransfer('');
      setTransferToGroup('');
      setTransferReason('');
    }
  };

  const getGroupName = (groupId: string) => {
    const group = allBusinessGroups.find(g => g.id === groupId);
    return group ? group.name : 'Grupo Desconhecido';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Gerenciar Empresas do Grupo: {businessGroup.name}</h2>
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
              onClick={() => setActiveTab('associate')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'associate'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Associar/Desvincular
            </button>
            <button
              onClick={() => setActiveTab('transfer')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transfer'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Transferir Empresas
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Histórico de Associações
            </button>
          </nav>
        </div>

        {/* Tab: Associar/Desvincular */}
        {activeTab === 'associate' && (
          <div className="space-y-6">
            {/* Associar Empresa */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Associar Empresa ao Grupo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa para Associar
                  </label>
                  <select
                    value={selectedCompanyToAssociate}
                    onChange={(e) => setSelectedCompanyToAssociate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione uma empresa</option>
                    {unassignedCompanies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.apelido} ({company.cnpj})
                      </option>
                    ))}
                  </select>
                  {unassignedCompanies.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">Todas as empresas já estão associadas a um grupo.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo (Opcional)
                  </label>
                  <input
                    type="text"
                    value={associateReason}
                    onChange={(e) => setAssociateReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Nova aquisição, reestruturação"
                  />
                </div>
              </div>
              <button
                onClick={handleAssociate}
                disabled={!selectedCompanyToAssociate}
                className="mt-4 flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>Associar Empresa</span>
              </button>
            </div>

            {/* Empresas Atualmente no Grupo */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Empresas Atualmente no Grupo ({groupCompanies.length})</h3>
              {groupCompanies.length === 0 ? (
                <p className="text-gray-500">Nenhuma empresa associada a este grupo.</p>
              ) : (
                <div className="space-y-3">
                  {groupCompanies.map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{company.apelido}</p>
                        <p className="text-sm text-gray-600">{company.razaoSocial}</p>
                      </div>
                      <button
                        onClick={() => handleDissociate(company.id)}
                        className="flex items-center space-x-1 text-red-600 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                        <span>Desvincular</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Transferir Empresas */}
        {activeTab === 'transfer' && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Transferir Empresa para Outro Grupo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa para Transferir
                  </label>
                  <select
                    value={selectedCompanyToTransfer}
                    onChange={(e) => setSelectedCompanyToTransfer(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione uma empresa</option>
                    {groupCompanies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.apelido} ({company.cnpj})
                      </option>
                    ))}
                  </select>
                  {groupCompanies.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">Nenhuma empresa neste grupo para transferir.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transferir para o Grupo
                  </label>
                  <select
                    value={transferToGroup}
                    onChange={(e) => setTransferToGroup(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione um grupo</option>
                    {allBusinessGroups
                      .filter(group => group.id !== businessGroup.id) // Não pode transferir para o mesmo grupo
                      .map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                  </select>
                  {allBusinessGroups.filter(group => group.id !== businessGroup.id).length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">Nenhum outro grupo disponível para transferência.</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo (Opcional)
                </label>
                <input
                  type="text"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Reorganização interna, venda de unidade"
                />
              </div>
              <button
                onClick={handleTransfer}
                disabled={!selectedCompanyToTransfer || !transferToGroup}
                className="mt-4 flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Transferir Empresa</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab: Histórico de Associações */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Histórico de Associações ({membershipHistory.length})</h3>
              {membershipHistory.length === 0 ? (
                <p className="text-gray-500">Nenhum histórico de associação para este grupo.</p>
              ) : (
                <div className="space-y-3">
                  {membershipHistory.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <History className="w-4 h-4 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-800">
                            {membershipActionLabels[record.action as keyof typeof membershipActionLabels]}
                            {record.action === 'transferred_from' && ` do grupo ${getGroupName(record.previousGroupId || '')}`}
                            {record.action === 'transferred_to' && ` para o grupo ${getGroupName(record.businessGroupId)}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            Empresa: {companies.find(c => c.id === record.companyId)?.apelido || 'Desconhecida'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(record.effectiveDate).toLocaleDateString('pt-BR')} por {record.createdBy}
                          </p>
                        </div>
                      </div>
                      {record.reason && (
                        <p className="text-sm text-gray-600 italic max-w-xs truncate">"{record.reason}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center justify-end pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}