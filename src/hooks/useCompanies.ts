import { useState, useEffect } from 'react';
import { Company, CompanyFormData } from '../types/company';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Função para converter dados do Supabase para o formato da aplicação
const mapSupabaseToCompany = (data: any): Company => ({
  id: data.id,
  razaoSocial: data.razao_social,
  apelido: data.apelido,
  cnpj: data.cnpj,
  codigoEmpresa: data.codigo_empresa,
  status: data.status,
  createdAt: data.created_at?.split('T')[0] || '',
  updatedAt: data.updated_at?.split('T')[0] || '',
  createdBy: data.created_by,
  endereco: data.endereco,
  cidade: data.cidade,
  estado: data.estado,
  cep: data.cep,
  telefone: data.telefone,
  email: data.email,
  website: data.website,
  responsavel: data.responsavel,
  observacoes: data.observacoes
});

// Função para converter dados da aplicação para o formato do Supabase
const mapCompanyToSupabase = (company: CompanyFormData) => ({
  razao_social: company.razaoSocial,
  apelido: company.apelido,
  cnpj: company.cnpj,
  codigo_empresa: company.codigoEmpresa,
  status: company.status,
  endereco: company.endereco,
  cidade: company.cidade,
  estado: company.estado,
  cep: company.cep,
  telefone: company.telefone,
  email: company.email,
  website: company.website,
  responsavel: company.responsavel,
  observacoes: company.observacoes
});

export function useCompanies() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedCompanies = data?.map(mapSupabaseToCompany) || [];
        setCompanies(mappedCompanies);
      } catch (err) {
        console.error('Erro ao buscar empresas:', err);
        setError('Erro ao carregar empresas. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const addCompany = async (companyData: CompanyFormData): Promise<Company> => {
    try {
      const supabaseData = {
        ...mapCompanyToSupabase(companyData),
        created_by: user?.name || 'Usuário Atual'
      };

      const { data, error } = await supabase
        .from('companies')
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      const newCompany = mapSupabaseToCompany(data);
      setCompanies(prev => [newCompany, ...prev]);
      
      return newCompany;
    } catch (err) {
      console.error('Erro ao adicionar empresa:', err);
      setError('Erro ao adicionar empresa. Por favor, tente novamente.');
      throw err;
    }
  };

  const updateCompany = async (id: string, updates: Partial<CompanyFormData>): Promise<Company> => {
    try {
      const supabaseUpdates = mapCompanyToSupabase(updates as CompanyFormData);

      const { data, error } = await supabase
        .from('companies')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedCompany = mapSupabaseToCompany(data);
      setCompanies(prev => 
        prev.map(company => company.id === id ? updatedCompany : company)
      );
      
      return updatedCompany;
    } catch (err) {
      console.error('Erro ao atualizar empresa:', err);
      setError('Erro ao atualizar empresa. Por favor, tente novamente.');
      throw err;
    }
  };

  const deleteCompany = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCompanies(prev => prev.filter(company => company.id !== id));
    } catch (err) {
      console.error('Erro ao excluir empresa:', err);
      setError('Erro ao excluir empresa. Por favor, tente novamente.');
      throw err;
    }
  };

  const getCompanyById = (id: string): Company | undefined => {
    return companies.find(company => company.id === id);
  };

  const getFilteredCompanies = (
    searchTerm: string = '', 
    statusFilter: string = 'all'
  ): Company[] => {
    let filtered = companies;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(company => 
        company.razaoSocial.toLowerCase().includes(term) ||
        company.apelido.toLowerCase().includes(term) ||
        company.cnpj.includes(term) ||
        company.codigoEmpresa.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(company => company.status === statusFilter);
    }

    return filtered;
  };

  return {
    companies,
    isLoading,
    error,
    addCompany,
    updateCompany,
    deleteCompany,
    getCompanyById,
    getFilteredCompanies
  };
}