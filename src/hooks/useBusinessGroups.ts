import { useState, useEffect } from 'react';
import { BusinessGroup, BusinessGroupFormData, BusinessGroupMembership, CompanyGroupAssociation, CompanyGroupTransfer } from '../types/businessGroup';
import { Company } from '../types/company';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Função para converter dados do Supabase para o formato da aplicação
const mapSupabaseToBusinessGroup = (data: any): BusinessGroup => ({
  id: data.id,
  name: data.name,
  code: data.code,
  description: data.description,
  headquartersAddress: data.headquarters_address,
  headquartersCity: data.headquarters_city,
  headquartersState: data.headquarters_state,
  headquartersCountry: data.headquarters_country,
  mainCnpj: data.main_cnpj,
  website: data.website,
  phone: data.phone,
  email: data.email,
  status: data.status,
  totalCompanies: data.total_companies || 0,
  totalRevenue: parseFloat(data.total_revenue) || 0,
  createdAt: data.created_at?.split('T') || '',
  updatedAt: data.updated_at?.split('T') || '',
  createdBy: data.created_by
});

// Função para converter dados da aplicação para o formato do Supabase
const mapBusinessGroupToSupabase = (group: BusinessGroupFormData) => ({
  name: group.name,
  code: group.code,
  description: group.description,
  headquarters_address: group.headquartersAddress,
  headquarters_city: group.headquartersCity,
  headquarters_state: group.headquartersState,
  headquarters_country: group.headquartersCountry,
  main_cnpj: group.mainCnpj,
  website: group.website,
  phone: group.phone,
  email: group.email,
  status: group.status
});

const mapSupabaseToMembership = (data: any): BusinessGroupMembership => ({
  id: data.id,
  businessGroupId: data.business_group_id,
  companyId: data.company_id,
  action: data.action,
  previousGroupId: data.previous_group_id,
  effectiveDate: data.effective_date,
  reason: data.reason,
  createdBy: data.created_by,
  createdAt: data.created_at?.split('T') || ''
});

export function useBusinessGroups() {
  const { user } = useAuth();
  const [businessGroups, setBusinessGroups] = useState<BusinessGroup[]>([]);
  const [memberships, setMemberships] = useState<BusinessGroupMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinessGroups = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('business_groups')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedGroups = data?.map(mapSupabaseToBusinessGroup) || [];
        setBusinessGroups(mappedGroups);
      } catch (err) {
        console.error('Erro ao buscar grupos empresariais:', err);
        setError('Erro ao carregar grupos empresariais. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchMemberships = async () => {
      try {
        const { data, error } = await supabase
          .from('business_group_memberships')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedMemberships = data?.map(mapSupabaseToMembership) || [];
        setMemberships(mappedMemberships);
      } catch (err) {
        console.error('Erro ao buscar histórico de associações:', err);
      }
    };

    fetchBusinessGroups();
    fetchMemberships();
  }, []);

  const addBusinessGroup = async (groupData: BusinessGroupFormData): Promise<BusinessGroup> => {
    try {
      const supabaseData = {
        ...mapBusinessGroupToSupabase(groupData),
        created_by: user?.name || 'Usuário Atual'
      };

      const { data, error } = await supabase
        .from('business_groups')
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      const newGroup = mapSupabaseToBusinessGroup(data);
      setBusinessGroups(prev => [newGroup, ...prev]);
      
      return newGroup;
    } catch (err) {
      console.error('Erro ao adicionar grupo empresarial:', err);
      setError('Erro ao adicionar grupo empresarial. Por favor, tente novamente.');
      throw err;
    }
  };

  const updateBusinessGroup = async (id: string, updates: Partial<BusinessGroupFormData>): Promise<BusinessGroup> => {
    try {
      const supabaseUpdates = mapBusinessGroupToSupabase(updates as BusinessGroupFormData);

      const { data, error } = await supabase
        .from('business_groups')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedGroup = mapSupabaseToBusinessGroup(data);
      setBusinessGroups(prev => 
        prev.map(group => group.id === id ? updatedGroup : group)
      );
      
      return updatedGroup;
    } catch (err) {
      console.error('Erro ao atualizar grupo empresarial:', err);
      setError('Erro ao atualizar grupo empresarial. Por favor, tente novamente.');
      throw err;
    }
  };

  const deleteBusinessGroup = async (id: string): Promise<void> => {
    try {
      // Verifica se há empresas associadas ao grupo
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id')
        .eq('business_group_id', id);

      if (companiesError) throw companiesError;

      if (companies && companies.length > 0) {
        throw new Error('Não é possível excluir um grupo que possui empresas associadas. Desvincule as empresas primeiro.');
      }

      const { error } = await supabase
        .from('business_groups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBusinessGroups(prev => prev.filter(group => group.id !== id));
    } catch (err) {
      console.error('Erro ao excluir grupo empresarial:', err);
      setError('Erro ao excluir grupo empresarial. Por favor, tente novamente.');
      throw err;
    }
  };

  const associateCompanyToGroup = async (association: CompanyGroupAssociation): Promise<void> => {
    try {
      // Atualiza a empresa para associá-la ao grupo
      const { error: companyError } = await supabase
        .from('companies')
        .update({ 
          business_group_id: association.businessGroupId,
          joined_group_at: new Date().toISOString()
        })
        .eq('id', association.companyId);

      if (companyError) throw companyError;

      // Registra a associação no histórico
      const { error: membershipError } = await supabase
        .from('business_group_memberships')
        .insert([{
          business_group_id: association.businessGroupId,
          company_id: association.companyId,
          action: 'joined',
          effective_date: new Date().toISOString().split('T'),
          reason: association.reason,
          created_by: user?.name || 'Usuário Atual'
        }]);

      if (membershipError) throw membershipError;

      // Atualiza o contador de empresas no grupo
      await updateGroupCompanyCount(association.businessGroupId);

      // Atualiza o estado local (seria melhor refetch, mas para simplicidade...)
      // Em uma implementação real, você faria um refetch dos dados
      console.log('Empresa associada ao grupo com sucesso');
      
    } catch (err) {
      console.error('Erro ao associar empresa ao grupo:', err);
      setError('Erro ao associar empresa ao grupo. Por favor, tente novamente.');
      throw err;
    }
  };

  const dissociateCompanyFromGroup = async (companyId: string, reason?: string): Promise<void> => {
    try {
      // Obtém o grupo atual da empresa antes de desassociar
      const { data: companyData, error: fetchCompanyError } = await supabase
        .from('companies')
        .select('business_group_id')
        .eq('id', companyId)
        .single();

      if (fetchCompanyError) throw fetchCompanyError;

      const previousGroupId = companyData?.business_group_id;

      // Atualiza a empresa para desassociá-la do grupo
      const { error: companyError } = await supabase
        .from('companies')
        .update({ 
          business_group_id: null,
          joined_group_at: null
        })
        .eq('id', companyId);

      if (companyError) throw companyError;

      // Registra a desassociação no histórico
      const { error: membershipError } = await supabase
        .from('business_group_memberships')
        .insert([{
          business_group_id: previousGroupId, // Registra de qual grupo ela saiu
          company_id: companyId,
          action: 'left',
          effective_date: new Date().toISOString().split('T'),
          reason: reason,
          created_by: user?.name || 'Usuário Atual'
        }]);

      if (membershipError) throw membershipError;

      // Atualiza o contador de empresas no grupo anterior
      if (previousGroupId) {
        await updateGroupCompanyCount(previousGroupId);
      }

      console.log('Empresa desassociada do grupo com sucesso');
    } catch (err) {
      console.error('Erro ao desvincular empresa do grupo:', err);
      setError('Erro ao desvincular empresa do grupo. Por favor, tente novamente.');
      throw err;
    }
  };

  const transferCompanyBetweenGroups = async (transfer: CompanyGroupTransfer): Promise<void> => {
    try {
      // Atualiza a empresa para transferi-la para o novo grupo
      const { error: companyError } = await supabase
        .from('companies')
        .update({ 
          business_group_id: transfer.toGroupId,
          joined_group_at: new Date().toISOString()
        })
        .eq('id', transfer.companyId);

      if (companyError) throw companyError;

      // Registra a saída do grupo anterior no histórico
      const { error: membershipLeftError } = await supabase
        .from('business_group_memberships')
        .insert([{
          business_group_id: transfer.fromGroupId,
          company_id: transfer.companyId,
          action: 'transferred_from',
          previous_group_id: transfer.fromGroupId,
          effective_date: new Date().toISOString().split('T'),
          reason: transfer.reason,
          created_by: user?.name || 'Usuário Atual'
        }]);

      if (membershipLeftError) throw membershipLeftError;

      // Registra a entrada no novo grupo no histórico
      const { error: membershipJoinedError } = await supabase
        .from('business_group_memberships')
        .insert([{
          business_group_id: transfer.toGroupId,
          company_id: transfer.companyId,
          action: 'transferred_to',
          previous_group_id: transfer.fromGroupId,
          effective_date: new Date().toISOString().split('T'),
          reason: transfer.reason,
          created_by: user?.name || 'Usuário Atual'
        }]);

      if (membershipJoinedError) throw membershipJoinedError;

      // Atualiza os contadores de empresas nos grupos envolvidos
      await updateGroupCompanyCount(transfer.fromGroupId);
      await updateGroupCompanyCount(transfer.toGroupId);

      console.log('Empresa transferida entre grupos com sucesso');
    } catch (err) {
      console.error('Erro ao transferir empresa entre grupos:', err);
      setError('Erro ao transferir empresa entre grupos. Por favor, tente novamente.');
      throw err;
    }
  };

  const updateGroupCompanyCount = async (groupId: string): Promise<void> => {
    try {
      // Conta o número de empresas associadas ao grupo
      const { count, error: countError } = await supabase
        .from('companies')
        .select('id', { count: 'exact' })
        .eq('business_group_id', groupId);

      if (countError) throw countError;

      // Atualiza o campo total_companies no grupo
      const { error: updateError } = await supabase
        .from('business_groups')
        .update({ total_companies: count || 0 })
        .eq('id', groupId);

      if (updateError) throw updateError;

      // Atualiza o estado local dos grupos
      setBusinessGroups(prev => 
        prev.map(group => 
          group.id === groupId ? { ...group, totalCompanies: count || 0 } : group
        )
      );
    } catch (err) {
      console.error('Erro ao atualizar contador de empresas do grupo:', err);
      setError('Erro ao atualizar contador de empresas do grupo. Por favor, tente novamente.');
    }
  };

  const getCompaniesByGroup = (groupId: string, allCompanies: Company[]): Company[] => {
    return allCompanies.filter(company => company.businessGroupId === groupId);
  };

  const getUnassignedCompanies = (allCompanies: Company[]): Company[] => {
    return allCompanies.filter(company => !company.businessGroupId);
  };

  const getMembershipHistory = (groupId: string): BusinessGroupMembership[] => {
    return memberships.filter(membership => membership.businessGroupId === groupId);
  };

  const getFilteredBusinessGroups = (
    searchTerm: string = '', 
    statusFilter: string = 'all'
  ): BusinessGroup[] => {
    let filtered = businessGroups;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(group => 
        group.name.toLowerCase().includes(term) ||
        group.code.toLowerCase().includes(term) ||
        (group.description && group.description.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(group => group.status === statusFilter);
    }

    return filtered;
  };

  return {
    businessGroups,
    isLoading,
    error,
    addBusinessGroup,
    updateBusinessGroup,
    deleteBusinessGroup,
    associateCompanyToGroup,
    dissociateCompanyFromGroup,
    transferCompanyBetweenGroups,
    getCompaniesByGroup,
    getUnassignedCompanies,
    getMembershipHistory,
    getFilteredBusinessGroups
  };
}