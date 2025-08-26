import { useState, useEffect } from 'react';
import { CostCenter } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Mock hierarchical data
const mockCostCenters: CostCenter[] = [
  // Level 0 - Root departments
  {
    id: '1',
    name: 'Tecnologia da Informação',
    code: 'TI',
    description: 'Departamento de Tecnologia',
    department: 'TI',
    manager: 'João Silva',
    level: 0,
    path: 'TI',
    budget: 800000,
    spent: 620000,
    allocatedBudget: 800000,
    inheritedBudget: 0,
    status: 'active',
    isExpanded: true,
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'Marketing',
    code: 'MKT',
    description: 'Departamento de Marketing',
    department: 'Marketing',
    manager: 'Maria Santos',
    level: 0,
    path: 'MKT',
    budget: 400000,
    spent: 298750,
    allocatedBudget: 400000,
    inheritedBudget: 0,
    status: 'active',
    isExpanded: true,
    createdAt: '2024-01-01'
  },
  {
    id: '3',
    name: 'Recursos Humanos',
    code: 'RH',
    description: 'Departamento de RH',
    department: 'RH',
    manager: 'Pedro Costa',
    level: 0,
    path: 'RH',
    budget: 300000,
    spent: 245000,
    allocatedBudget: 300000,
    inheritedBudget: 0,
    status: 'active',
    isExpanded: false,
    createdAt: '2024-01-01'
  },
  // Level 1 - TI subdivisions
  {
    id: '11',
    name: 'Desenvolvimento',
    code: 'TI-DEV',
    description: 'Equipe de desenvolvimento de software',
    department: 'TI',
    manager: 'Carlos Oliveira',
    parentId: '1',
    level: 1,
    path: 'TI/DEV',
    budget: 350000,
    spent: 287500,
    allocatedBudget: 350000,
    inheritedBudget: 0,
    status: 'active',
    isExpanded: true,
    createdAt: '2024-01-01'
  },
  {
    id: '12',
    name: 'Infraestrutura',
    code: 'TI-INFRA',
    description: 'Infraestrutura e operações',
    department: 'TI',
    manager: 'Ana Rodrigues',
    parentId: '1',
    level: 1,
    path: 'TI/INFRA',
    budget: 300000,
    spent: 232500,
    allocatedBudget: 300000,
    inheritedBudget: 0,
    status: 'active',
    isExpanded: false,
    createdAt: '2024-01-01'
  },
  {
    id: '13',
    name: 'Segurança',
    code: 'TI-SEC',
    description: 'Segurança da informação',
    department: 'TI',
    manager: 'Roberto Lima',
    parentId: '1',
    level: 1,
    path: 'TI/SEC',
    budget: 150000,
    spent: 100000,
    allocatedBudget: 150000,
    inheritedBudget: 0,
    status: 'active',
    isExpanded: false,
    createdAt: '2024-01-01'
  },
  // Level 2 - Development teams
  {
    id: '111',
    name: 'Frontend',
    code: 'TI-DEV-FE',
    description: 'Desenvolvimento frontend',
    department: 'TI',
    manager: 'Lucia Fernandes',
    parentId: '11',
    level: 2,
    path: 'TI/DEV/FE',
    budget: 150000,
    spent: 125000,
    allocatedBudget: 150000,
    inheritedBudget: 0,
    status: 'active',
    isExpanded: false,
    createdAt: '2024-01-01'
  },
  {
    id: '112',
    name: 'Backend',
    code: 'TI-DEV-BE',
    description: 'Desenvolvimento backend',
    department: 'TI',
    manager: 'Fernando Santos',
    parentId: '11',
    level: 2,
    path: 'TI/DEV/BE',
    budget: 120000,
    spent: 98000,
    allocatedBudget: 120000,
    inheritedBudget: 0,
    status: 'active',
    isExpanded: false,
    createdAt: '2024-01-01'
  },
  {
    id: '113',
    name: 'Mobile',
    code: 'TI-DEV-MOB',
    description: 'Desenvolvimento mobile',
    department: 'TI',
    manager: 'Patricia Alves',
    parentId: '11',
    level: 2,
    path: 'TI/DEV/MOB',
    budget: 80000,
    spent: 64500,
    allocatedBudget: 80000,
    inheritedBudget: 0,
    status: 'active',
    isExpanded: false,
    createdAt: '2024-01-01'
  },
  // Level 1 - Marketing subdivisions
  {
    id: '21',
    name: 'Marketing Digital',
    code: 'MKT-DIG',
    description: 'Marketing digital e online',
    department: 'Marketing',
    manager: 'Juliana Costa',
    parentId: '2',
    level: 1,
    path: 'MKT/DIG',
    budget: 200000,
    spent: 165000,
    allocatedBudget: 200000,
    inheritedBudget: 0,
    status: 'active',
    isExpanded: false,
    createdAt: '2024-01-01'
  },
  {
    id: '22',
    name: 'Marketing Tradicional',
    code: 'MKT-TRAD',
    description: 'Marketing tradicional e eventos',
    department: 'Marketing',
    manager: 'Ricardo Pereira',
    parentId: '2',
    level: 1,
    path: 'MKT/TRAD',
    budget: 120000,
    spent: 89750,
    allocatedBudget: 120000,
    inheritedBudget: 0,
    status: 'active',
    isExpanded: false,
    createdAt: '2024-01-01'
  },
  {
    id: '23',
    name: 'Branding',
    code: 'MKT-BRAND',
    description: 'Gestão de marca e identidade',
    department: 'Marketing',
    manager: 'Camila Souza',
    parentId: '2',
    level: 1,
    path: 'MKT/BRAND',
    budget: 80000,
    spent: 44000,
    allocatedBudget: 80000,
    inheritedBudget: 0,
    status: 'active',
    isExpanded: false,
    createdAt: '2024-01-01'
  }
];

export function useCostCenters() {
  const { activeCompany } = useAuth();
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filtrar centros de custo pela empresa ativa (simulação)
      // Em uma implementação real, isso seria feito no backend
      const filteredCostCenters = activeCompany 
        ? mockCostCenters.filter(center => {
            // Aqui estamos simulando que os centros de TI pertencem à empresa 1
            // e os centros de Marketing pertencem à empresa 2
            if (activeCompany.id === '1' && center.department === 'TI') {
              return true;
            } else if (activeCompany.id === '2' && center.department === 'Marketing') {
              return true;
            } else if (activeCompany.id === '3' && center.department === 'RH') {
              return true;
            }
            return false;
          })
        : mockCostCenters;
      
      setCostCenters(filteredCostCenters);
      setIsLoading(false);
    };

    fetchData();
  }, [activeCompany]);

  const buildHierarchy = (centers: CostCenter[]): CostCenter[] => {
    const centerMap = new Map<string, CostCenter>();
    const rootCenters: CostCenter[] = [];

    // Create a map of all centers
    centers.forEach(center => {
      centerMap.set(center.id, { ...center, children: [] });
    });

    // Build the hierarchy
    centers.forEach(center => {
      const centerWithChildren = centerMap.get(center.id)!;
      
      if (center.parentId) {
        const parent = centerMap.get(center.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(centerWithChildren);
        }
      } else {
        rootCenters.push(centerWithChildren);
      }
    });

    return rootCenters;
  };

  const toggleExpansion = (centerId: string) => {
    setCostCenters(prev => 
      prev.map(center => 
        center.id === centerId 
          ? { ...center, isExpanded: !center.isExpanded }
          : center
      )
    );
  };

  const getFilteredCenters = (searchTerm: string, statusFilter: string) => {
    let filtered = costCenters;

    if (searchTerm) {
      filtered = filtered.filter(center =>
        center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.manager.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(center => center.status === statusFilter);
    }

    return filtered;
  };

  const hierarchicalCenters = buildHierarchy(costCenters);

  return {
    costCenters,
    hierarchicalCenters,
    isLoading,
    toggleExpansion,
    getFilteredCenters,
    setCostCenters
  };
}