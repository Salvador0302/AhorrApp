import React from 'react';

interface EnergyChartProps {
  period: string;
}

const EnergyChart: React.FC<EnergyChartProps> = ({ period }) => {
  // Generate sample data based on period
  const generateData = () => {
    switch (period) {
      case 'today':
        return Array.from({ length: 24 }, (_, i) => ({
          label: `${i}:00`,
          value: Math.random() * 3 + 0.5,
          peak: i >= 18 && i <= 22 // Peak hours 6-10 PM
        }));
      case 'week':
        return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, i) => ({
          label: day,
          value: Math.random() * 25 + 15,
          peak: i >= 4 && i <= 5 // Weekend peak
        }));
      case 'month':
        return Array.from({ length: 30 }, (_, i) => ({
          label: `${i + 1}`,
          value: Math.random() * 30 + 10,
          peak: (i + 1) % 7 === 0 || (i + 1) % 7 === 6 // Weekends
        }));
      case 'year':
        return ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map((month, i) => ({
          label: month,
          value: Math.random() * 200 + 400 + (i >= 5 && i <= 8 ? 100 : 0), // Summer peak
          peak: i >= 5 && i <= 8 // Summer months
        }));
      default:
        return [];
    }
  };

  const data = generateData();
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="h-64 flex items-end justify-between gap-1 px-2">
        {data.map((point, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="flex-1 flex items-end">
              <div
                className={`w-full rounded-t-lg transition-all duration-500 hover:opacity-80 ${
                  point.peak
                    ? 'bg-gradient-to-t from-red-500 to-orange-400'
                    : 'bg-gradient-to-t from-blue-500 to-green-400'
                }`}
                style={{
                  height: `${(point.value / maxValue) * 100}%`,
                  minHeight: '8px'
                }}
                title={`${point.label}: ${point.value.toFixed(2)} kWh${point.peak ? ' (Pico)' : ''}`}
              />
            </div>
            <span className="text-xs text-white/60 -rotate-45 origin-center">
              {point.label}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-green-400 rounded"></div>
          <span className="text-sm text-white/70">Consumo Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-orange-400 rounded"></div>
          <span className="text-sm text-white/70">Pico de Consumo</span>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white/5 rounded-lg p-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/70">Promedio:</span>
          <span className="text-white font-medium">
            {(data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(2)} kWh
          </span>
        </div>
        <div className="flex justify-between items-center text-sm mt-2">
          <span className="text-white/70">Máximo:</span>
          <span className="text-white font-medium">{maxValue.toFixed(2)} kWh</span>
        </div>
      </div>
    </div>
  );
};

export default EnergyChart;