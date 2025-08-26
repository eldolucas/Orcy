import React from 'react';

interface BudgetChartProps {
  data: Array<{
    department: string;
    budgeted: number;
    spent: number;
    utilization: number;
  }>;
}

export function BudgetChart({ data }: BudgetChartProps) {
  const maxValue = Math.max(...data.map(d => Math.max(d.budgeted, d.spent)));

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Orçamento por Departamento</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Orçado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600">Realizado</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">{item.department}</h4>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-600">
                  R$ {item.spent.toLocaleString()} / R$ {item.budgeted.toLocaleString()}
                </span>
                <span className={`font-medium ${
                  item.utilization > 90 ? 'text-red-600' : 
                  item.utilization > 75 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {item.utilization.toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="relative">
              {/* Background bar */}
              <div className="w-full h-6 bg-gray-100 rounded-lg overflow-hidden">
                {/* Budgeted amount (background) */}
                <div 
                  className="h-full bg-blue-100 border-r-2 border-blue-300"
                  style={{ width: `${(item.budgeted / maxValue) * 100}%` }}
                ></div>
              </div>
              
              {/* Spent amount (foreground) */}
              <div 
                className={`absolute top-0 h-6 rounded-lg ${
                  item.utilization > 100 ? 'bg-red-500' :
                  item.utilization > 90 ? 'bg-yellow-500' : 'bg-purple-500'
                }`}
                style={{ width: `${Math.min((item.spent / maxValue) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}