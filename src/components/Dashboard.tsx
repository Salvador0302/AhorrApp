import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Activity,
  Thermometer,
  Wind,
  Sun
} from 'lucide-react';
import EnergyChart from './EnergyChart';
import QuickStats from './QuickStats';
import PredictionChart from './PredictionChart';

interface DashboardProps {
  user: any;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [realTimeData, setRealTimeData] = useState({
    currentConsumption: 2.4,
    temperature: 22,
    humidity: 65,
    isAcOn: true
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        currentConsumption: Number((Math.random() * 3 + 1.5).toFixed(2)),
        temperature: Math.floor(Math.random() * 5 + 20),
        humidity: Math.floor(Math.random() * 20 + 55)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const periods = [
    { id: 'today', label: 'Hoy' },
    { id: 'week', label: 'Esta Semana' },
    { id: 'month', label: 'Este Mes' },
    { id: 'year', label: 'Este Año' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 backdrop-blur-md rounded-2xl border border-white/10 p-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          ¡Bienvenido de vuelta, {user?.name}! 👋
        </h2>
        <p className="text-white/70">
          Aquí tienes un resumen de tu consumo energético y recomendaciones personalizadas.
        </p>
      </div>

      {/* Real-time Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Consumo Actual</p>
              <p className="text-white font-semibold">{realTimeData.currentConsumption} kW</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-400 to-green-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(realTimeData.currentConsumption / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Thermometer className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Temperatura</p>
              <p className="text-white font-semibold">{realTimeData.temperature}°C</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Wind className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Humedad</p>
              <p className="text-white font-semibold">{realTimeData.humidity}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Sun className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Estado AC</p>
              <p className="text-white font-semibold">
                {realTimeData.isAcOn ? 'Encendido' : 'Apagado'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 overflow-x-auto">
        {periods.map((period) => (
          <button
            key={period.id}
            onClick={() => setSelectedPeriod(period.id)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedPeriod === period.id
                ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg'
                : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Quick Stats */}
      <QuickStats selectedPeriod={selectedPeriod} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6">
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            Consumo Energético
          </h3>
          <EnergyChart period={selectedPeriod} />
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6">
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Predicción IA
          </h3>
          <PredictionChart />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6">
        <h3 className="text-white font-semibold text-lg mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-400/30 rounded-xl p-4 text-left hover:from-blue-500/30 hover:to-blue-600/30 transition-all">
            <Calendar className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-white font-medium">Programar Dispositivos</p>
            <p className="text-white/70 text-sm">Optimiza horarios de uso</p>
          </button>
          
          <button className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-400/30 rounded-xl p-4 text-left hover:from-green-500/30 hover:to-green-600/30 transition-all">
            <TrendingDown className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-white font-medium">Modo Ahorro</p>
            <p className="text-white/70 text-sm">Activa el modo eficiente</p>
          </button>
          
          <button className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-400/30 rounded-xl p-4 text-left hover:from-purple-500/30 hover:to-purple-600/30 transition-all">
            <DollarSign className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-white font-medium">Reporte Costos</p>
            <p className="text-white/70 text-sm">Análisis detallado</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;