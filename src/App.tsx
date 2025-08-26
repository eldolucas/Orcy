import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { CostCenters } from './pages/CostCenters';
import { Expenses } from './pages/Expenses';
import { Revenues } from './pages/Revenues';
import { AccountingClassificationsPage } from './pages/AccountingClassificationsPage';
import { FinancialYearsPage } from './pages/FinancialYearsPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { BusinessGroupsPage } from './pages/BusinessGroupsPage';
import { InsumosPage } from './pages/InsumosPage';
import { ExpenseClassificationsPage } from './pages/ExpenseClassificationsPage';
import { LaborBudgetPage } from './pages/LaborBudgetPage';
import { ContractsPage } from './pages/ContractsPage';
import { FixedAssetsPage } from './pages/FixedAssetsPage';
import { BusinessGroupsPage } from "./pages/BusinessGroups/BusinessGroupsPage";
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('companies');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'companies':
        return 'Empresas';
      case 'business-groups':
        return 'Grupos Empresariais';
      case 'cost-centers':
        return 'Centros de Custo';
      case 'insumos':
        return 'Insumos';
      case 'labor-budget':
        return 'Mão de Obra Orçada';
      case 'contracts':
        return 'Contratos';
      case 'fixed-assets':
        return 'Ativos Imobilizados';
      case 'expense-classifications':
        return 'Classificação de Gastos';
      case 'accounting-classifications':
        return 'Classificação Contábil';
      case 'fiscal-years':
        return 'Exercícios Orçamentários';
      case 'expenses':
        return 'Gastos (Despesas)';
      case 'revenues':
        return 'Receitas';
      default:
        return 'Empresas';
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'companies':
        return <CompaniesPage />;
      case 'business-groups':
        return <BusinessGroupsPage />;
      case 'cost-centers':
        return <CostCenters />;
      case 'insumos':
        return <InsumosPage />;
      case 'labor-budget':
        return <LaborBudgetPage />;
      case 'contracts':
        return <ContractsPage />;
      case 'fixed-assets':
        return <FixedAssetsPage />;
      case 'expense-classifications':
        return <ExpenseClassificationsPage />;
      case 'accounting-classifications':
        return <AccountingClassificationsPage />;
      case 'fiscal-years':
        return <FinancialYearsPage />;
      case 'expenses':
        return <Expenses />;
      case 'revenues':
        return <Revenues />;
      default:
        return <CompaniesPage />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getSectionTitle(activeSection)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;