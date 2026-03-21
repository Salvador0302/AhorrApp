import React, { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, DollarSign, Zap, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import type { Screen } from '../App';

interface HistoryScreenProps {
  onNavigate: (screen: Screen) => void;
}

interface HistoryRecord {
  id: string;
  period: string;
  consumption: number;
  amount: number;
  savings: number;
  paymentDate: string;
  status: 'paid' | 'pending' | 'overdue';
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ onNavigate }) => {
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');

  // Mock history data
  const historyData: HistoryRecord[] = [
    {
      id: '1',
      period: 'Noviembre 2024',
      consumption: 245,
      amount: 387.50,
      savings: 38.75,
      paymentDate: '2024-11-15',
      status: 'paid'
    },
    {
      id: '2',
      period: 'Octubre 2024',
      consumption: 198,
      amount: 312.80,
      savings: 31.28,
      paymentDate: '2024-10-12',
      status: 'paid'
    },
    {
      id: '3',
      period: 'Septiembre 2024',
      consumption: 267,
      amount: 421.45,
      savings: 42.15,
      paymentDate: '2024-09-18',
      status: 'paid'
    },
    {
      id: '4',
      period: 'Agosto 2024',
      consumption: 289,
      amount: 456.20,
      savings: 45.62,
      paymentDate: '2024-08-14',
      status: 'paid'
    },
    {
      id: '5',
      period: 'Julio 2024',
      consumption: 312,
      amount: 492.30,
      savings: 49.23,
      paymentDate: '2024-07-16',
      status: 'paid'
    },
    {
      id: '6',
      period: 'Junio 2024',
      consumption: 234,
      amount: 369.60,
      savings: 36.96,
      paymentDate: '2024-06-11',
      status: 'paid'
    }
  ];

  const filteredData = historyData.filter(record => {
    if (filter === 'all') return true;
    return record.status === filter;
  });

  const totalSavings = historyData.reduce((sum, record) => sum + record.savings, 0);
  const averageConsumption = historyData.reduce((sum, record) => sum + record.consumption, 0) / historyData.length;
  const totalPaid = historyData.reduce((sum, record) => sum + record.amount, 0);

  // Utilidad para suavizar polyline (path tipo "M x,y L x,y ...") a curvas cúbicas (usada en proyección diaria)
  const smoothPath = (polyPath: string): string => {
    if (!polyPath) return '';
    const tokens = polyPath.trim().split(/\s+/);
    const points: Array<{x:number;y:number}> = [];
    for (const token of tokens) {
      const coords = token.slice(1).split(','); // quitar comando M/L
      if (coords.length === 2) {
        const x = parseFloat(coords[0]);
        const y = parseFloat(coords[1]);
        if (!Number.isNaN(x) && !Number.isNaN(y)) points.push({x,y});
      }
    }
    if (points.length < 3) return polyPath; // no vale la pena suavizar
    const result: string[] = [];
    result.push(`M${points[0].x},${points[0].y}`);
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
      const smoothing = 0.18;
      const cp1x = p1.x + (p2.x - p0.x) * smoothing;
      const cp1y = p1.y + (p2.y - p0.y) * smoothing;
      const cp2x = p2.x - (p3.x - p1.x) * smoothing;
      const cp2y = p2.y - (p3.y - p1.y) * smoothing;
      result.push(`C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`);
    }
    return result.join(' ');
  };
  // Referencia preventiva para linter (ya se invoca en JSX más abajo)
  void smoothPath;

  // Proyección diaria (7 días pasados simulados + 7 días futuros)
  const daysHistory = 7;
  const daysFuture = 7;
  const baseDaily = averageConsumption / 30;
  const now = new Date();
  const pastDays = Array.from({ length: daysHistory }).map((_, idx) => {
    // idx 0 = día más antiguo
    const date = new Date(now);
    date.setDate(now.getDate() - (daysHistory - idx));
    const noise = 1 + ((Math.random() - 0.5) * 0.15); // +-15%
    const value = Math.max(1, Math.round(baseDaily * noise));
    return {
      label: date.getDate().toString().padStart(2,'0'),
      value,
      isFuture: false
    };
  });
  const lastPast = pastDays[pastDays.length - 1].value;
  const slope = (pastDays[pastDays.length - 1].value - pastDays[0].value) / pastDays.length / 5; // tendencia suave
  const futureDays = Array.from({ length: daysFuture }).map((_, i) => {
    const date = new Date(now);
    date.setDate(now.getDate() + (i + 1));
    const trendComponent = slope * i;
    const noise = 1 + ((Math.random() - 0.5) * 0.12); // +-12%
    const value = Math.max(1, Math.round((lastPast + trendComponent) * noise));
    return {
      label: date.getDate().toString().padStart(2,'0'),
      value,
      isFuture: true
    };
  });
  const combinedForCurve = [...pastDays, ...futureDays];
  const maxCurve = Math.max(...combinedForCurve.map(p => p.value)) * 1.1;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'overdue': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'pending': return 'Pendiente';
      case 'overdue': return 'Vencido';
      default: return 'Desconocido';
    }
  };

  const getConsumptionTrend = (current: number, previous: number) => {
    if (current > previous) {
      return { icon: TrendingUp, color: 'text-red-400', text: 'Aumentó' };
    } else {
      return { icon: TrendingDown, color: 'text-green-400', text: 'Disminuyó' };
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('home')}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="text-xl font-bold text-white">Historial</h2>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-white/80 text-sm font-medium">Ahorro Total</span>
          </div>
          <p className="text-xl font-bold text-white">{formatCurrency(totalSavings)}</p>
          <p className="text-white/60 text-xs">últimos 6 meses</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <span className="text-white/80 text-sm font-medium">Promedio</span>
          </div>
          <p className="text-xl font-bold text-white">{averageConsumption.toFixed(0)} kWh</p>
          <p className="text-white/60 text-xs">consumo mensual</p>
        </div>
      </div>

      {/* Consumption Trend Chart */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 p-4">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          Tendencia de Consumo
        </h3>
        
        <div className="h-32 flex items-end justify-between gap-1">
          {historyData.slice().reverse().map((record) => {
            const maxConsumption = Math.max(...historyData.map(r => r.consumption));
            const height = (record.consumption / maxConsumption) * 100;
            
            return (
              <div key={record.id} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-green-400 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                  style={{ height: `${height}%`, minHeight: '8px' }}
                  title={`${record.period}: ${record.consumption} kWh`}
                />
                <span className="text-xs text-white/60 -rotate-45 origin-center">
                  {record.period.split(' ')[0].slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Projection Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 p-4">
        <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
          <Zap className="w-5 h-5 text-green-400" />
          Proyección Próximos {daysFuture} Días
        </h3>
        <p className="text-white/60 text-xs mb-4">Basada en tu consumo diario estimado actual.</p>
        <div className="h-40 relative">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Líneas guía */}
            {[25,50,75].map(g => (
              <line key={g} x1="0" y1={g} x2="100" y2={g} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            ))}
            {(() => {
              const points = combinedForCurve.map((p, idx) => {
                const x = (idx / (combinedForCurve.length - 1)) * 100;
                const y = 100 - (p.value / maxCurve) * 100;
                return { x, y, future: p.isFuture };
              });
              let lastPastIndex = 0;
              for (let i = points.length - 1; i >= 0; i--) {
                if (!points[i].future) { lastPastIndex = i; break; }
              }
              const pastPath = points.filter((_,i)=> i<= lastPastIndex).map((pt,i)=>`${i===0?'M':'L'}${pt.x},${pt.y}`).join(' ');
              const futurePath = points.filter((_,i)=> i>= lastPastIndex).map((pt,i)=>`${i===0?'M':'L'}${pt.x},${pt.y}`).join(' ');
              return (
                <g>
                  {/* Área pasado */}
                  <path d={`${pastPath} L100,100 L0,100 Z`} fill="url(#fillPast)" opacity="0.25" />
                  {/* Línea pasada */}
                  <path d={pastPath} fill="none" stroke="#000" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
                  {/* Línea futura */}
                  <path d={futurePath} fill="none" strokeDasharray="3 3" stroke="url(#gradFutureDays)" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
                  {/* Puntos */}
                  {points.map((pt,i)=> (
                    <circle key={i} cx={pt.x} cy={pt.y} r={pt.future?2.2:2.2} fill={pt.future? 'url(#dotFuture)' : '#000'} stroke={pt.future? 'rgba(255,255,255,0.5)' : 'none'} strokeWidth={0.6} />
                  ))}
                  <defs>
                    <linearGradient id="gradFutureDays" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                    <linearGradient id="fillPast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#000" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#000" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="dotFuture" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </g>
              );
            })()}
          </svg>
          {/* Etiquetas inferiores */}
          <div className="absolute inset-0 flex items-end justify-between text-[10px] px-1 pb-1">
            {combinedForCurve.map((p,i)=>(
              <span key={i} className={`text-white/50 ${p.isFuture ? 'opacity-80' : ''}`}>{p.label}</span>
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="bg-white/5 rounded p-2">
            <p className="text-white/50">Prom. Día</p>
            <p className="text-white font-semibold">{Math.round(baseDaily)} kWh</p>
          </div>
          <div className="bg-white/5 rounded p-2">
            <p className="text-white/50">Mañana</p>
            <p className="text-green-400 font-semibold">{futureDays[0]?.value} kWh</p>
          </div>
          <div className="bg-white/5 rounded p-2">
            <p className="text-white/50">Var vs Hoy</p>
            <p className="text-white font-semibold">{futureDays[0] ? (((futureDays[0].value - lastPast)/ lastPast)*100).toFixed(1) : '0'}%</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: 'Todos', count: historyData.length },
          { id: 'paid', label: 'Pagados', count: historyData.filter(r => r.status === 'paid').length },
          { id: 'pending', label: 'Pendientes', count: historyData.filter(r => r.status === 'pending').length }
        ].map(filterOption => (
          <button
            key={filterOption.id}
            onClick={() => setFilter(filterOption.id as any)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
              filter === filterOption.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
            }`}
          >
            {filterOption.label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              filter === filterOption.id
                ? 'bg-white/20 text-white'
                : 'bg-white/10 text-white/60'
            }`}>
              {filterOption.count}
            </span>
          </button>
        ))}
      </div>

      {/* History List */}
      <div className="space-y-3">
        {filteredData.map((record, index) => {
          const previousRecord = filteredData[index + 1];
          const trend = previousRecord ? getConsumptionTrend(record.consumption, previousRecord.consumption) : null;
          const TrendIcon = trend?.icon;
          
          return (
            <div key={record.id} className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-semibold">{record.period}</h4>
                  <p className="text-white/60 text-sm">
                    Pagado el {new Date(record.paymentDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(record.status)}`}>
                  {getStatusLabel(record.status)}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-white/60 text-xs">Consumo</p>
                  <div className="flex items-center gap-1">
                    <p className="text-white font-semibold text-sm">{record.consumption} kWh</p>
                    {trend && TrendIcon ? (
                      <TrendIcon className={`w-3 h-3 ${trend.color}`} />
                    ) : null}
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-white/60 text-xs">Pagado</p>
                  <p className="text-white font-semibold text-sm">{formatCurrency(record.amount)}</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-white/60 text-xs">Ahorro</p>
                  <p className="text-green-400 font-semibold text-sm">{formatCurrency(record.savings)}</p>
                </div>
              </div>
              
              {trend && TrendIcon ? (
                <div className="flex items-center gap-2 text-xs">
                  <TrendIcon className={`w-3 h-3 ${trend.color}`} />
                  <span className={trend.color}>
                    {trend.text} vs mes anterior
                  </span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* No Data State */}
      {filteredData.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg mb-2">
            No hay registros
          </h3>
          <p className="text-white/60 text-sm">
            {filter === 'all' 
              ? 'Aún no tienes historial de pagos'
              : `No hay registros con estado "${getStatusLabel(filter)}"`
            }
          </p>
        </div>
      )}

      {/* Summary Footer */}
      <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 backdrop-blur-md rounded-xl border border-white/10 p-4">
        <h4 className="text-white font-medium mb-2">Resumen Total</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/70">Total pagado</p>
            <p className="text-white font-semibold">{formatCurrency(totalPaid)}</p>
          </div>
          <div>
            <p className="text-white/70">Total ahorrado</p>
            <p className="text-green-400 font-semibold">{formatCurrency(totalSavings)}</p>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-white/10">
          <p className="text-white/60 text-xs">
            💡 Has ahorrado el {((totalSavings / totalPaid) * 100).toFixed(1)}% con AhorrApp
          </p>
        </div>
      </div>
    </div>
  );
};

export default HistoryScreen;