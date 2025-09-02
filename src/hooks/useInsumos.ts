import { useState, useEffect } from 'react';
import { Insumo, InsumoFormData } from '../types/insumo';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Função para converter dados do Supabase para o formato da aplicação
const mapSupabaseToInsumo = (data: any): Insumo => ({
  id: data.id,
  name: data.name,
  description: data.description,
  type: data.type,
  unit: data.unit,
  cost: parseFloat(data.cost) || 0,
  isActive: data.is_active,
  companyId: data.company_id,
  createdAt: data.created_at?.split('T')[0] || '',
  updatedAt: data.updated_at?.split('T')[0] || '',
  createdBy: data.created_by
});

// Função para converter dados da aplicação para o formato do Supabase
const mapInsumoToSupabase = (insumo: InsumoFormData) => ({
  name: insumo.name,
  description: insumo.description,
  type: insumo.type,
  unit: insumo.unit,
  cost: insumo.cost,
  is_active: insumo.isActive
});

export function useInsumos() {
  const { activeCompany, user } = useAuth();
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsumos = async () => {
      if (!activeCompany) {
        setInsumos([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('insumos')
          .select('*')
          .eq('company_id', activeCompany.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedInsumos = data?.map(mapSupabaseToInsumo) || [];
        setInsumos(mappedInsumos);
      } catch (err) {
        console.error('Erro ao buscar insumos:', err);
        setError('Erro ao carregar insumos. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsumos();
  }, [activeCompany]);

  const addInsumo = async (insumoData: InsumoFormData): Promise<Insumo> => {
    try {
      if (!activeCompany) {
        throw new Error('Nenhuma empresa ativa selecionada');
      }

      const supabaseData = {
        ...mapInsumoToSupabase(insumoData),
        company_id: activeCompany.id,
        created_by: user?.name || 'Usuário Atual'
      };

      const { data, error } = await supabase
        .from('insumos')
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      const newInsumo = mapSupabaseToInsumo(data);
      setInsumos(prev => [newInsumo, ...prev]);
      
      return newInsumo;
    } catch (err) {
      console.error('Erro detalhado ao adicionar insumo:', err);
      console.error('Dados enviados:', {
        ...mapInsumoToSupabase(insumoData),
        company_id: activeCompany?.id,
        created_by: user?.name || 'Usuário Atual'
      });
      setError('Erro ao adicionar insumo. Por favor, tente novamente.');
      throw err;
    }
  };

  const updateInsumo = async (id: string, updates: Partial<InsumoFormData>): Promise<Insumo> => {
    try {
      const supabaseUpdates = mapInsumoToSupabase(updates as InsumoFormData);

      const { data, error } = await supabase
        .from('insumos')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedInsumo = mapSupabaseToInsumo(data);
      setInsumos(prev => 
        prev.map(insumo => insumo.id === id ? updatedInsumo : insumo)
      );
      
      return updatedInsumo;
    } catch (err) {
      console.error('Erro ao atualizar insumo:', err);
      setError('Erro ao atualizar insumo. Por favor, tente novamente.');
      throw err;
    }
  };

  const deleteInsumo = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('insumos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setInsumos(prev => prev.filter(insumo => insumo.id !== id));
    } catch (err) {
      console.error('Erro ao excluir insumo:', err);
      setError('Erro ao excluir insumo. Por favor, tente novamente.');
      throw err;
    }
  };

  const getInsumoById = (id: string): Insumo | undefined => {
    return insumos.find(insumo => insumo.id === id);
  };

  const getFilteredInsumos = (
    searchTerm: string = '', 
    typeFilter: string = 'all',
    statusFilter: string = 'all'
  ): Insumo[] => {
    let filtered = insumos;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(insumo => 
        insumo.name.toLowerCase().includes(term) ||
        (insumo.description && insumo.description.toLowerCase().includes(term))
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(insumo => insumo.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(insumo => insumo.isActive === isActive);
    }

    return filtered;
  };

  const getInsumosByType = (type: 'product' | 'service' | 'fund'): Insumo[] => {
    return insumos.filter(insumo => insumo.type === type);
  };

  return {
    insumos,
    isLoading,
    error,
    addInsumo,
    updateInsumo,
    deleteInsumo,
    getInsumoById,
    getFilteredInsumos,
    getInsumosByType
  };
}