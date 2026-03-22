import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, DollarSign, Zap, ArrowLeft } from 'lucide-react';
// Imágenes estáticas de proyección (reemplazan la curva dinámica previa)
import proj7d from '../assets/projections/7dias.png';
import projMes from '../assets/projections/1mes.png';
import projAnio from '../assets/projections/1año.png';
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
  const [view, setView] = useState<'7d' | '1m' | '1y'>('7d');
  useEffect(() => {
    const stored = localStorage.getItem('history_view');
    if (stored === '7d' || stored === '1m' || stored === '1y') {
      setView(stored);
    }
  }, []);

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

  // Se eliminó la generación dinámica de curva y datos sintéticos.
  // Ahora solo se muestran imágenes estáticas provistas por el usuario.

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

      {/* Projection Tabs */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-400" />
            Consumo y Proyección
          </h3>
          <div className="flex gap-2 text-xs">
            {[
              { id: '7d', label: '7 días' },
              { id: '1m', label: '1 mes' },
              { id: '1y', label: '1 año' }
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => { setView(btn.id as any); localStorage.setItem('history_view', btn.id); }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  view === btn.id
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow'
                    : 'bg-white/10 text-white/60 hover:text-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
        {view === '7d' && (
          <div className="mb-4 w-full overflow-hidden rounded-lg border border-white/10">
            <img src={proj7d} alt="Proyección 7 días" className="w-full h-auto" />
          </div>
        )}
        {view === '1m' && (
          <div className="mb-4 w-full overflow-hidden rounded-lg border border-white/10">
            <img src={projMes} alt="Consumo último mes" className="w-full h-auto" />
          </div>
        )}
        {view === '1y' && (
          <div className="mb-4 w-full overflow-hidden rounded-lg border border-white/10">
            <img src={projAnio} alt="Consumo último año" className="w-full h-auto" />
          </div>
        )}
        {/* Se removieron descripción, curva y métricas dinámicas para usar solo las imágenes proporcionadas. */}
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
            💡 Has ahorrado el {((totalSavings / totalPaid) * 100).toFixed(1)}% con AhorraPE
          </p>
        </div>
      </div>
    </div>
  );
};

export default HistoryScreen;