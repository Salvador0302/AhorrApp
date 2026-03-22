import React from 'react';
// Ajuste: cambiamos a PNG (los SVG ya no existen)
import proj7d from '../assets/projections/7dias.png';
import projMes from '../assets/projections/1mes.png';
import projAnio from '../assets/projections/1año.png';
import { formatCurrency } from '../utils/currency';
import { Zap, TrendingUp, DollarSign, Camera, FileText, Lightbulb, Home, Receipt, Plug, Sparkles, CreditCard, BarChart3, CheckCircle2, Clock } from 'lucide-react';
import type { Screen } from '../App';
import { getGreenTokenBalance } from '../services/greenTokenService';
import { getLatestVampireScan } from '../services/vampireScannerService';

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
  const greenTokens = getGreenTokenBalance();
  const latestVampireScan = getLatestVampireScan();

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
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 max-w-4xl mx-auto">
      {/* Welcome Header */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-5 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-medium text-white mb-1">
          Hola, {user.name}
        </h2>
        <p className="text-white/50 text-sm">
          Asistente de ahorro energético
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-lg border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-white/60" />
            <span className="text-white/50 text-xs font-normal">Consumo</span>
          </div>
          <p className="text-2xl font-medium text-white mb-0.5">
            {totalConsumption.toFixed(1)}
          </p>
          <p className="text-white/40 text-xs">kWh/día</p>
        </div>

        <div className="bg-white/5 rounded-lg border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-white/60" />
            <span className="text-white/50 text-xs font-normal">Costo</span>
          </div>
          <p className="text-2xl font-medium text-white mb-0.5">
            {formatCurrency(Number(estimatedMonthlyCost.toFixed(0)), { decimals: 0 })}
          </p>
          <p className="text-white/40 text-xs">mensual</p>
        </div>

        <div className="bg-emerald-500/10 rounded-lg border border-emerald-300/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span className="text-emerald-100/80 text-xs font-normal">Green Tokens</span>
          </div>
          <p className="text-2xl font-medium text-white mb-0.5">{greenTokens}</p>
          <p className="text-emerald-100/70 text-xs">GTKN acumulados</p>
        </div>

        <div className="bg-blue-500/10 rounded-lg border border-blue-300/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-blue-200" />
            <span className="text-blue-100/80 text-xs font-normal">ROI Scanner</span>
          </div>
          <p className="text-2xl font-medium text-white mb-0.5">
            {latestVampireScan ? (Number.isFinite(latestVampireScan.roiMonths) ? latestVampireScan.roiMonths.toFixed(1) : '-') : '-'}
          </p>
          <p className="text-blue-100/70 text-xs">meses (ultimo analisis)</p>
        </div>
      </div>

      {latestVampireScan && (
        <div className="bg-white/5 rounded-lg border border-white/10 p-4">
          <h3 className="text-white font-medium mb-2 text-sm">Escaner Inteligente IA Vision</h3>
          <p className="text-white/70 text-sm">
            Equipo detectado en categoria <span className="capitalize">{latestVampireScan.category}</span> con consumo estimado de {Math.round(latestVampireScan.averageWatts)}W.
            Cambiar a modelo Energy Star A++ podria ahorrar {formatCurrency(latestVampireScan.monthlySavingsSoles)} al mes.
          </p>
        </div>
      )}

      {/* Progress Overview */}
      <div className="bg-white/5 rounded-lg border border-white/10 p-4">
        <h3 className="text-white font-medium mb-4 flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-white/60" />
          Progreso
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-sm">Recibo</span>
            <div className="flex items-center gap-1.5">
              {receipt ? (
                <CheckCircle2 className="w-4 h-4 text-white/60" />
              ) : (
                <Clock className="w-4 h-4 text-white/30" />
              )}
              <span className={`text-sm ${receipt ? 'text-white/80' : 'text-white/40'}`}>
                {receipt ? 'Completado' : 'Pendiente'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-sm">Aparatos</span>
            <div className="flex items-center gap-1.5">
              {totalAppliances > 0 ? (
                <CheckCircle2 className="w-4 h-4 text-white/60" />
              ) : (
                <Clock className="w-4 h-4 text-white/30" />
              )}
              <span className={`text-sm ${totalAppliances > 0 ? 'text-white/80' : 'text-white/40'}`}>
                {totalAppliances > 0 ? `${totalAppliances}` : '0'}
              </span>
            </div>
          </div>
          
          <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
            <div 
              className="bg-white/30 h-1 rounded-full transition-all duration-500"
              style={{ width: `${((receipt ? 50 : 0) + (totalAppliances > 0 ? 50 : 0))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onNavigate(action.screen)}
              className={`w-full bg-white/5 rounded-lg border border-white/10 p-4 text-left hover:bg-white/10 transition-all group`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <IconComponent className="w-5 h-5 text-white/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-medium text-sm">{action.title}</h4>
                    {action.completed && (
                      <CheckCircle2 className="w-4 h-4 text-white/50" />
                    )}
                  </div>
                  <p className="text-white/40 text-xs mt-0.5">{action.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Recent Activity */}
      {(receipt || totalAppliances > 0) && (
        <div className="bg-white/5 rounded-lg border border-white/10 p-4">
          <h3 className="text-white font-medium mb-3 text-sm">Actividad</h3>
          
          <div className="space-y-2">
            {receipt && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                <span className="text-white/50">Recibo {receipt.period}</span>
              </div>
            )}
            
            {totalAppliances > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                <span className="text-white/50">{totalAppliances} aparatos</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Proyecciones (Previews) */}
      <div className="bg-white/5 rounded-lg border border-white/10 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-medium text-sm">Proyecciones</h3>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs text-white/50 hover:text-white/70 transition-colors"
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
              className="group relative rounded-lg overflow-hidden border border-white/10 hover:border-white/20 transition-all"
            >
              <img src={item.img} alt={`Proyección ${item.label}`} className="w-full h-20 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] py-1 text-center backdrop-blur-sm">
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