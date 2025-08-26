import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Package,
  Tag,
  ListChecks,
  BookOpen,
  Building,
  Calendar,
  PieChart,
  BarChart, 
  FileText,
  Bell, 
  Settings, 
  Users,
  LogOut,
  Menu,
  X,
  Receipt,
  TrendingUp,
  CheckCircle,
  Target,
  Calculator,
  Shield, 
  Monitor,
  GitBranch
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ activeSection, onSectionChange, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'companies', label: 'Empresas', icon: Building },
    { id: 'cost-centers', label: 'Centros de Custo', icon: Building2 },
    { id: 'insumos', label: 'Insumos', icon: Package },
    { id: 'labor-budget', label: 'Mão de Obra Orçada', icon: Users },
    { id: 'contracts', label: 'Contratos', icon: FileText },
    { id: 'fixed-assets', label: 'Ativos Imobilizados', icon: Monitor },
    { id: 'expense-classifications', label: 'Classificação de Gastos', icon: Tag },
    { id: 'accounting-classifications', label: 'Classificação Contábil', icon: BookOpen },
    { id: 'fiscal-years', label: 'Exercícios Financeiros', icon: Calendar },
    { id: 'expenses', label: 'Gastos (Despesas)', icon: Receipt },
    { id: 'revenues', label: 'Receitas', icon: TrendingUp },
  ];

  return (
    <div className={`bg-white shadow-lg h-screen flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-800">Orcy</h1>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>

      {/* User Profile */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'}
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.department}</p>
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                user?.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800'
                  : user?.role === 'manager'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {user?.role === 'admin' ? 'Administrador' : user?.role === 'manager' ? 'Gestor' : 'Usuário'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="text-sm font-medium">Sair</span>}
        </button>
      </div>
    </div>
  );
}