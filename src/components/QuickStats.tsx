import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Zap, Leaf, Clock } from 'lucide-react';

interface QuickStatsProps {
  selectedPeriod: string;
}

const QuickStats: React.FC<QuickStatsProps> = ({ selectedPeriod }) => {
  // Simulate data based on selected period
  const getStatsData = () => {
    switch (selectedPeriod) {
      case 'today':
        return {
          consumption: { value: 18.4, change: -5.2, unit: 'kWh' },
          cost: { value: 45.60, change: -12.3, unit: '$' },
          efficiency: { value: 92, change: 8.1, unit: '%' },
          savings: { value: 23.40, change: 15.7, unit: '$' }
        };
      case 'week':
        return {
          consumption: { value: 142.8, change: -8.4, unit: 'kWh' },
          cost: { value: 356.20, change: -15.6, unit: '$' },
          efficiency: { value: 88, change: 12.3, unit: '%' },
          savings: { value: 182.90, change: 22.1, unit: '$' }
        };
      case 'month':
        return {
          consumption: { value: 620.5, change: -12.7, unit: 'kWh' },
          cost: { value: 1545.80, change: -18.9, unit: '$' },
          efficiency: { value: 85, change: 15.2, unit: '%' },
          savings: { value: 789.40, change: 28.3, unit: '$' }
        };
      case 'year':
        return {
          consumption: { value: 7456.2, change: -15.3, unit: 'kWh' },
          cost: { value: 18640.50, change: -22.1, unit: '$' },
          efficiency: { value: 82, change: 18.7, unit: '%' },
          savings: { value: 9472.80, change: 35.4, unit: '$' }
        };
      default:
        return {
          consumption: { value: 18.4, change: -5.2, unit: 'kWh' },
          cost: { value: 45.60, change: -12.3, unit: '$' },
          efficiency: { value: 92, change: 8.1, unit: '%' },
          savings: { value: 23.40, change: 15.7, unit: '$' }
        };
    }
  };

  const stats = getStatsData();

  const statCards = [
    {
      title: 'Consumo Total',
      value: stats.consumption.value,
      unit: stats.consumption.unit,
      change: stats.consumption.change,
      icon: Zap,
      color: 'blue'
    },
    {
      title: 'Costo Energético',
      value: stats.cost.value,
      unit: stats.cost.unit,
      change: stats.cost.change,
      icon: DollarSign,
      color: 'orange'
    },
    {
      title: 'Eficiencia',
      value: stats.efficiency.value,
      unit: stats.efficiency.unit,
      change: stats.efficiency.change,
      icon: Leaf,
      color: 'green'
    },
    {
      title: 'Ahorro Total',
      value: stats.savings.value,
      unit: stats.savings.unit,
      change: stats.savings.change,
      icon: TrendingDown,
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-500/20',
          text: 'text-blue-400',
          border: 'border-blue-400/30'
        };
      case 'orange':
        return {
          bg: 'bg-orange-500/20',
          text: 'text-orange-400',
          border: 'border-orange-400/30'
        };
      case 'green':
        return {
          bg: 'bg-green-500/20',
          text: 'text-green-400',
          border: 'border-green-400/30'
        };
      case 'purple':
        return {
          bg: 'bg-purple-500/20',
          text: 'text-purple-400',
          border: 'border-purple-400/30'
        };
      default:
        return {
          bg: 'bg-blue-500/20',
          text: 'text-blue-400',
          border: 'border-blue-400/30'
        };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const colors = getColorClasses(stat.color);
        const IconComponent = stat.icon;
        const isPositiveChange = stat.change > 0;
        const isEfficiency = stat.title === 'Eficiencia';
        const showPositive = isEfficiency ? isPositiveChange : !isPositiveChange;
        
        return (
          <div
            key={index}
            className={`bg-white/10 backdrop-blur-md rounded-xl border ${colors.border} p-6 hover:bg-white/15 transition-all duration-200`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
                <IconComponent className={`w-6 h-6 ${colors.text}`} />
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                showPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {showPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(stat.change).toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-white">
                {stat.unit === '$' && stat.unit}
                {stat.value.toLocaleString()}
                {stat.unit !== '$' && ` ${stat.unit}`}
              </p>
            </div>
            
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-white/60 text-xs">
                {showPositive ? 
                  (isEfficiency ? 'Mejora vs período anterior' : 'Ahorro vs período anterior') : 
                  (isEfficiency ? 'Baja vs período anterior' : 'Incremento vs período anterior')
                }
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuickStats;