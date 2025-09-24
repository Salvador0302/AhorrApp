import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const PredictionChart: React.FC = () => {
  // Generate historical and predicted data
  const generatePredictionData = () => {
    const historical = Array.from({ length: 7 }, (_, i) => ({
      day: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i],
      actual: Math.random() * 25 + 15,
      predicted: null,
      isHistorical: true
    }));

    const future = Array.from({ length: 7 }, (_, i) => ({
      day: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i] + '*',
      actual: null,
      predicted: Math.random() * 25 + 15,
      isHistorical: false,
      confidence: Math.random() * 20 + 80 // 80-100% confidence
    }));

    return [...historical, ...future];
  };

  const data = generatePredictionData();
  const maxValue = Math.max(...data.map(d => Math.max(d.actual || 0, d.predicted || 0)));

  const predictions = [
    {
      text: "Se espera un aumento del 12% en consumo esta semana",
      type: "warning",
      confidence: 89
    },
    {
      text: "Oportunidad de ahorro del 8% optimizando horarios",
      type: "success",
      confidence: 94
    },
    {
      text: "Pico de demanda previsto el jueves 6-8 PM",
      type: "info",
      confidence: 76
    }
  ];

  return (
    <div className="space-y-6">
      {/* Prediction Chart */}
      <div className="h-48 flex items-end justify-between gap-1">
        {data.map((point, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="flex-1 flex items-end relative">
              {point.actual && (
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg opacity-80"
                  style={{
                    height: `${(point.actual / maxValue) * 100}%`,
                    minHeight: '4px'
                  }}
                  title={`${point.day}: ${point.actual.toFixed(1)} kWh (Real)`}
                />
              )}
              {point.predicted && (
                <div
                  className="w-full bg-gradient-to-t from-purple-500 to-pink-400 rounded-t-lg opacity-60 border-2 border-purple-300 border-dashed"
                  style={{
                    height: `${(point.predicted / maxValue) * 100}%`,
                    minHeight: '4px'
                  }}
                  title={`${point.day}: ${point.predicted.toFixed(1)} kWh (Predicción ${point.confidence?.toFixed(0)}%)`}
                />
              )}
            </div>
            <span className={`text-xs -rotate-45 origin-center ${
              point.isHistorical ? 'text-white/60' : 'text-purple-400'
            }`}>
              {point.day}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-300 rounded"></div>
          <span className="text-sm text-white/70">Datos Reales</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-400 rounded border-2 border-purple-300 border-dashed"></div>
          <span className="text-sm text-white/70">Predicción IA</span>
        </div>
      </div>

      {/* AI Predictions */}
      <div className="space-y-3">
        <h4 className="text-white font-medium flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          Análisis Predictivo
        </h4>
        {predictions.map((prediction, index) => {
          const getIcon = () => {
            switch (prediction.type) {
              case 'warning':
                return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
              case 'success':
                return <CheckCircle className="w-4 h-4 text-green-400" />;
              default:
                return <TrendingUp className="w-4 h-4 text-blue-400" />;
            }
          };

          const getBgColor = () => {
            switch (prediction.type) {
              case 'warning':
                return 'bg-yellow-500/10 border-yellow-400/20';
              case 'success':
                return 'bg-green-500/10 border-green-400/20';
              default:
                return 'bg-blue-500/10 border-blue-400/20';
            }
          };

          return (
            <div key={index} className={`p-3 rounded-lg border ${getBgColor()}`}>
              <div className="flex items-start gap-3">
                {getIcon()}
                <div className="flex-1">
                  <p className="text-white text-sm">{prediction.text}</p>
                  <p className="text-white/50 text-xs mt-1">
                    Confianza: {prediction.confidence}%
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PredictionChart;