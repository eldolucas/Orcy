import { useState, useEffect } from 'react';
import { FixedAsset, FixedAssetFormData } from '../types/fixedAsset';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Função para converter dados do Supabase para o formato da aplicação
const mapSupabaseToFixedAsset = (data: any): FixedAsset => ({
  id: data.id,
  name: data.name,
  description: data.description,
  category: data.category,
  acquisitionDate: data.acquisition_date,
  acquisitionValue: parseFloat(data.acquisition_value) || 0,
  depreciationRate: parseFloat(data.depreciation_rate) || 0,
  depreciationMethod: data.depreciation_method,
  usefulLifeYears: data.useful_life_years || 0,
  currentValue: parseFloat(data.current_value) || 0,
  status: data.status,
  disposalDate: data.disposal_date,
  disposalValue: data.disposal_value ? parseFloat(data.disposal_value) : undefined,
  costCenterId: data.cost_center_id,
  fiscalYearId: data.fiscal_year_id,
  supplier: data.supplier,
  invoiceNumber: data.invoice_number,
  serialNumber: data.serial_number,
  location: data.location,
  notes: data.notes,
  companyId: data.company_id,
  createdAt: data.created_at?.split('T')[0] || '',
  updatedAt: data.updated_at?.split('T')[0] || '',
  createdBy: data.created_by
});

// Função para converter dados da aplicação para o formato do Supabase
const mapFixedAssetToSupabase = (asset: FixedAssetFormData & { currentValue: number }) => ({
  name: asset.name,
  description: asset.description,
  category: asset.category,
  acquisition_date: asset.acquisitionDate,
  acquisition_value: asset.acquisitionValue,
  depreciation_rate: asset.depreciationRate,
  depreciation_method: asset.depreciationMethod,
  useful_life_years: asset.usefulLifeYears,
  current_value: asset.currentValue,
  status: asset.status,
  disposal_date: asset.disposalDate,
  disposal_value: asset.disposalValue,
  cost_center_id: asset.costCenterId,
  fiscal_year_id: asset.fiscalYearId,
  supplier: asset.supplier,
  invoice_number: asset.invoiceNumber,
  serial_number: asset.serialNumber,
  location: asset.location,
  notes: asset.notes
});

export function useFixedAssets() {
  const { activeCompany, user } = useAuth();
  const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFixedAssets = async () => {
      if (!activeCompany) {
        setFixedAssets([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('fixed_assets')
          .select('*')
          .eq('company_id', activeCompany.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedFixedAssets = data?.map(mapSupabaseToFixedAsset) || [];
        setFixedAssets(mappedFixedAssets);
      } catch (err) {
        console.error('Erro ao buscar ativos imobilizados:', err);
        setError('Erro ao carregar ativos imobilizados. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFixedAssets();
  }, [activeCompany]);

  const calculateYearsElapsed = (acquisitionDate: string): number => {
    const today = new Date();
    const acquisition = new Date(acquisitionDate);
    return (today.getTime() - acquisition.getTime()) / (1000 * 60 * 60 * 24 * 365);
  };

  const calculateCurrentValue = (asset: FixedAssetFormData): number => {
    if (asset.status === 'planned' || asset.depreciationMethod === 'none') {
      return asset.acquisitionValue;
    }
    
    const yearsElapsed = calculateYearsElapsed(asset.acquisitionDate);
    let totalDepreciation = 0;
    
    switch (asset.depreciationMethod) {
      case 'linear':
        totalDepreciation = Math.min(yearsElapsed * asset.depreciationRate, 100);
        break;
      case 'accelerated':
        // Método acelerado: depreciação maior nos primeiros anos
        totalDepreciation = Math.min(yearsElapsed * asset.depreciationRate * 1.5, 100);
        break;
      default:
        totalDepreciation = 0;
    }
    
    return Math.max(0, asset.acquisitionValue * (1 - totalDepreciation / 100));
  };

  const addFixedAsset = async (assetData: FixedAssetFormData): Promise<FixedAsset> => {
    try {
      if (!activeCompany) {
        throw new Error('Nenhuma empresa ativa selecionada');
      }
      
      // Calcula o valor atual
      const currentValue = calculateCurrentValue(assetData);
      
      const supabaseData = {
        ...mapFixedAssetToSupabase({ ...assetData, currentValue }),
        company_id: activeCompany.id,
        created_by: user?.name || 'Usuário Atual'
      };

      const { data, error } = await supabase
        .from('fixed_assets')
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      const newFixedAsset = mapSupabaseToFixedAsset(data);
      setFixedAssets(prev => [newFixedAsset, ...prev]);
      
      return newFixedAsset;
    } catch (err) {
      console.error('Erro ao adicionar ativo imobilizado:', err);
      setError('Erro ao adicionar ativo imobilizado. Por favor, tente novamente.');
      throw err;
    }
  };

  const updateFixedAsset = async (id: string, updates: Partial<FixedAssetFormData>): Promise<FixedAsset> => {
    try {
      // Busca o ativo atual para calcular o novo valor
      const currentAsset = fixedAssets.find(a => a.id === id);
      if (!currentAsset) {
        throw new Error('Ativo imobilizado não encontrado');
      }
      
      // Mescla os dados atuais com as atualizações
      const updatedData = {
        name: updates.name ?? currentAsset.name,
        description: updates.description ?? currentAsset.description,
        category: updates.category ?? currentAsset.category,
        acquisitionDate: updates.acquisitionDate ?? currentAsset.acquisitionDate,
        acquisitionValue: updates.acquisitionValue ?? currentAsset.acquisitionValue,
        depreciationRate: updates.depreciationRate ?? currentAsset.depreciationRate,
        depreciationMethod: updates.depreciationMethod ?? currentAsset.depreciationMethod,
        usefulLifeYears: updates.usefulLifeYears ?? currentAsset.usefulLifeYears,
        status: updates.status ?? currentAsset.status,
        disposalDate: updates.disposalDate ?? currentAsset.disposalDate,
        disposalValue: updates.disposalValue ?? currentAsset.disposalValue,
        costCenterId: updates.costCenterId ?? currentAsset.costCenterId,
        fiscalYearId: updates.fiscalYearId ?? currentAsset.fiscalYearId,
        supplier: updates.supplier ?? currentAsset.supplier,
        invoiceNumber: updates.invoiceNumber ?? currentAsset.invoiceNumber,
        serialNumber: updates.serialNumber ?? currentAsset.serialNumber,
        location: updates.location ?? currentAsset.location,
        notes: updates.notes ?? currentAsset.notes
      };
      
      // Calcula o novo valor atual
      const currentValue = calculateCurrentValue(updatedData);
      
      const supabaseUpdates = mapFixedAssetToSupabase({ ...updatedData, currentValue });

      const { data, error } = await supabase
        .from('fixed_assets')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedFixedAsset = mapSupabaseToFixedAsset(data);
      setFixedAssets(prev => 
        prev.map(asset => asset.id === id ? updatedFixedAsset : asset)
      );
      
      return updatedFixedAsset;
    } catch (err) {
      console.error('Erro ao atualizar ativo imobilizado:', err);
      setError('Erro ao atualizar ativo imobilizado. Por favor, tente novamente.');
      throw err;
    }
  };

  const deleteFixedAsset = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('fixed_assets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFixedAssets(prev => prev.filter(asset => asset.id !== id));
    } catch (err) {
      console.error('Erro ao excluir ativo imobilizado:', err);
      setError('Erro ao excluir ativo imobilizado. Por favor, tente novamente.');
      throw err;
    }
  };

  const getFixedAssetById = (id: string): FixedAsset | undefined => {
    return fixedAssets.find(asset => asset.id === id);
  };

  const getFilteredFixedAssets = (
    searchTerm: string = '', 
    categoryFilter: string = 'all',
    statusFilter: string = 'all',
    costCenterFilter: string = 'all',
    fiscalYearFilter: string = 'all'
  ): FixedAsset[] => {
    let filtered = fixedAssets;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(term) ||
        (asset.description && asset.description.toLowerCase().includes(term)) ||
        (asset.serialNumber && asset.serialNumber.toLowerCase().includes(term)) ||
        (asset.invoiceNumber && asset.invoiceNumber.toLowerCase().includes(term))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(asset => asset.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(asset => asset.status === statusFilter);
    }

    if (costCenterFilter !== 'all') {
      filtered = filtered.filter(asset => asset.costCenterId === costCenterFilter);
    }

    if (fiscalYearFilter !== 'all') {
      filtered = filtered.filter(asset => asset.fiscalYearId === fiscalYearFilter);
    }

    return filtered;
  };

  const getFixedAssetsByCategory = (category: string): FixedAsset[] => {
    return fixedAssets.filter(asset => asset.category === category);
  };

  const getFixedAssetsByStatus = (status: string): FixedAsset[] => {
    return fixedAssets.filter(asset => asset.status === status);
  };

  const getTotalAcquisitionValue = (): number => {
    return fixedAssets.reduce((sum, asset) => sum + asset.acquisitionValue, 0);
  };

  const getTotalCurrentValue = (): number => {
    return fixedAssets.reduce((sum, asset) => sum + asset.currentValue, 0);
  };

  const getTotalDepreciation = (): number => {
    return fixedAssets.reduce((sum, asset) => sum + (asset.acquisitionValue - asset.currentValue), 0);
  };

  const calculateDepreciation = (asset: FixedAsset): number => {
    if (asset.depreciationMethod === 'none' || asset.status === 'planned') {
      return 0;
    }
    
    const yearsElapsed = calculateYearsElapsed(asset.acquisitionDate);
    let totalDepreciation = 0;
    
    switch (asset.depreciationMethod) {
      case 'linear':
        totalDepreciation = Math.min(yearsElapsed * asset.depreciationRate, 100);
        break;
      case 'accelerated':
        totalDepreciation = Math.min(yearsElapsed * asset.depreciationRate * 1.5, 100);
        break;
      default:
        totalDepreciation = 0;
    }
    
    return asset.acquisitionValue * (totalDepreciation / 100);
  };

  return {
    fixedAssets,
    isLoading,
    error,
    addFixedAsset,
    updateFixedAsset,
    deleteFixedAsset,
    getFixedAssetById,
    getFilteredFixedAssets,
    getFixedAssetsByCategory,
    getFixedAssetsByStatus,
    getTotalAcquisitionValue,
    getTotalCurrentValue,
    getTotalDepreciation,
    calculateDepreciation
  };
}