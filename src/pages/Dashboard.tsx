import React from 'react';
import { DollarSign, TrendingUp, AlertTriangle, PieChart } from 'lucide-react';
import { MetricCard } from '../components/Dashboard/MetricCard';
import { BudgetChart } from '../components/Dashboard/BudgetChart';
import { RecentTransactions } from '../components/Dashboard/RecentTransactions';
import { useBudgetData } from '../hooks/useBudgetData';

export function Dashboard() {
  const { metrics, isLoading } = useBudgetData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Orçamento Total"
          value={`R$ ${metrics.totalBudget.toLocaleString()}`}
          change={metrics.monthlyTrend}
          icon={DollarSign}
          color="blue"
          subtitle="Este ano"
        />
        
        <MetricCard
          title="Total Gasto"
          value={`R$ ${metrics.totalSpent.toLocaleString()}`}
          change={(metrics.totalSpent / metrics.totalBudget - 1) * 100}
          icon={TrendingUp}
          color="purple"
          subtitle="Até agora"
        />
        
        <MetricCard
          title="Disponível"
          value={`R$ ${metrics.totalRemaining.toLocaleString()}`}
          icon={PieChart}
          color="green"
          subtitle="Restante"
        />
        
        <MetricCard
          title="Utilização"
          value={`${metrics.budgetUtilization.toFixed(1)}%`}
          change={metrics.budgetUtilization - 75}
          icon={AlertTriangle}
          color={metrics.budgetUtilization > 90 ? 'red' : metrics.budgetUtilization > 75 ? 'yellow' : 'green'}
          subtitle="Do orçamento"
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BudgetChart data={metrics.departmentBreakdown} />
        </div>
        
        <div>
          <RecentTransactions transactions={metrics.recentTransactions} />
        </div>
      </div>

      {/* Alerts Section */}
      {metrics.activeAlerts.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Alertas Ativos</h3>
          <div className="space-y-3">
            {metrics.activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.type === 'danger'
                    ? 'bg-red-50 border-red-400'
                    : alert.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-400'
                    : 'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(alert.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}