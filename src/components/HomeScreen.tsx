import React from 'react';
// Ajuste: cambiamos a PNG (los SVG ya no existen)
import proj7d from '../assets/projections/7dias.png';
import projMes from '../assets/projections/1mes.png';
import projAnio from '../assets/projections/1año.png';
import { formatCurrency } from '../utils/currency';
import { Zap, TrendingUp, DollarSign, Camera, FileText, Lightbulb } from 'lucide-react';
import type { Screen } from '../App';

interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string;
}

interface Receipt {
  id: string;
  period: string;
  consumption: number;
  amount: number;
  dueDate: string;
  previousConsumption?: number;
  image?: string;
}

interface Appliance {
  id: string;
  name: string;
  type: string;
  consumption: number;
  hoursPerDay: number;
  image?: string;
  detected: boolean;
}

interface HomeScreenProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  receipt: Receipt | null;
  appliances: Appliance[];
}

const HomeScreen: React.FC<HomeScreenProps> = ({ user, onNavigate, receipt, appliances }) => {
  const totalAppliances = appliances.length;
  const totalConsumption = appliances.reduce((sum, app) => sum + (app.consumption * app.hoursPerDay), 0);
  const estimatedMonthlyCost = totalConsumption * 30 * 0.15; // Estimación básica

  const quickActions = [
    {
      id: 'receipt',
      title: 'Subir Recibo',
      description: 'Analiza tu factura de luz',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      screen: 'receipt' as Screen,
      completed: !!receipt
    },
    {
      id: 'appliances',
      title: 'Mis Aparatos',
      description: 'Registra electrodomésticos',
      icon: Camera,
      color: 'from-green-500 to-emerald-500',
      screen: 'appliances' as Screen,
      completed: totalAppliances > 0
    },
    {
      id: 'recommendations',
      title: 'Recomendaciones',
      description: 'Tips personalizados',
      icon: Lightbulb,
      color: 'from-yellow-500 to-orange-500',
      screen: 'recommendations' as Screen,
      completed: false
    }
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 backdrop-blur-md rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-2">
          ¡Hola, {user.name}! 👋
        </h2>
        <p className="text-white/70 text-sm">
          Bienvenido a tu asistente de ahorro energético
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <span className="text-white/80 text-sm font-medium">Consumo Est.</span>
          </div>
          <p className="text-xl font-bold text-white">
            {totalConsumption.toFixed(1)} kWh
          </p>
          <p className="text-white/60 text-xs">por día</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-white/80 text-sm font-medium">Costo Est.</span>
          </div>
          <p className="text-xl font-bold text-white">
            {formatCurrency(Number(estimatedMonthlyCost.toFixed(0)), { decimals: 0 })}
          </p>
          <p className="text-white/60 text-xs">por mes</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 p-4">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          Tu Progreso
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Recibo analizado</span>
            <span className={`text-sm font-medium ${receipt ? 'text-green-400' : 'text-white/50'}`}>
              {receipt ? '✓ Completado' : 'Pendiente'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Aparatos registrados</span>
            <span className={`text-sm font-medium ${totalAppliances > 0 ? 'text-green-400' : 'text-white/50'}`}>
              {totalAppliances > 0 ? `${totalAppliances} aparatos` : 'Ninguno'}
            </span>
          </div>
          
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-400 to-green-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((receipt ? 50 : 0) + (totalAppliances > 0 ? 50 : 0))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-white font-semibold text-lg">Acciones Rápidas</h3>
        
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onNavigate(action.screen)}
              className={`w-full bg-gradient-to-r ${action.color} bg-opacity-20 backdrop-blur-md rounded-xl border border-white/20 p-4 text-left hover:bg-opacity-30 transition-all`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-semibold">{action.title}</h4>
                    {action.completed && (
                      <span className="text-green-400 text-sm">✓</span>
                    )}
                  </div>
                  <p className="text-white/70 text-sm">{action.description}</p>
                </div>
                <div className="text-white/50">
                  →
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Recent Activity */}
      {(receipt || totalAppliances > 0) && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 p-4">
          <h3 className="text-white font-semibold mb-3">Actividad Reciente</h3>
          
          <div className="space-y-2">
            {receipt && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-white/70">Recibo de {receipt.period} analizado</span>
              </div>
            )}
            
            {totalAppliances > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white/70">{totalAppliances} electrodomésticos registrados</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Proyecciones (Previews) */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg">Consumo & Proyección</h3>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs text-blue-400 hover:text-blue-300"
          >Ver más</button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: '7d', img: proj7d, label: '7 días' },
            { id: '1m', img: projMes, label: '1 mes' },
            { id: '1y', img: projAnio, label: '1 año' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { localStorage.setItem('history_view', item.id); onNavigate('history'); }}
              className="group relative rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition-colors"
            >
              <img src={item.img} alt={`Proyección ${item.label}`} className="w-full h-20 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] py-1 text-center font-medium backdrop-blur-sm">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;