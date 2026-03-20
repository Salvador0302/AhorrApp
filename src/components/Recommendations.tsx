import React, { useState } from 'react';
import { 
  Lightbulb, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  Thermometer,
  Zap,
  Calendar,
  Star,
  CheckCircle,
  XCircle,
  RotateCcw
} from 'lucide-react';

interface RecommendationsProps {
  user: any;
}

const Recommendations: React.FC<RecommendationsProps> = ({ user }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [dismissedRecommendations, setDismissedRecommendations] = useState<number[]>([]);
  const [completedRecommendations, setCompletedRecommendations] = useState<number[]>([]);

  const recommendations = [
    {
      id: 1,
      type: 'schedule',
      priority: 'high',
      title: 'Optimiza el horario de tu lavadora',
      description: 'Utiliza la lavadora después de las 10 PM para aprovechar tarifas más bajas.',
      impact: 'Ahorro estimado: $24.50/mes',
      savings: 24.50,
      effort: 'Fácil',
      category: 'scheduling',
      icon: Clock,
      device: 'Lavadora',
      timeframe: '1 semana',
      details: [
        'Las tarifas eléctricas son 40% más bajas después de las 10 PM',
        'Tu lavadora consume aproximadamente 2.1 kWh por ciclo',
        'Cambiar 15 lavadas mensuales al horario nocturno'
      ]
    },
    {
      id: 2,
      type: 'temperature',
      priority: 'medium',
      title: 'Ajusta la temperatura del aire acondicionado',
      description: 'Aumentar 2°C la temperatura del AC reducirá significativamente el consumo.',
      impact: 'Ahorro estimado: $45.80/mes',
      savings: 45.80,
      effort: 'Muy fácil',
      category: 'temperature',
      icon: Thermometer,
      device: 'Aire Acondicionado',
      timeframe: 'Inmediato',
      details: [
        'Cambiar de 20°C a 22°C reduce el consumo en 15%',
        'Mantén la temperatura entre 22-24°C para mayor eficiencia',
        'Usa ventiladores para mejorar la sensación térmica'
      ]
    },
    {
      id: 3,
      type: 'efficiency',
      priority: 'high',
      title: 'Revisa la eficiencia del refrigerador',
      description: 'Tu refrigerador está consumiendo 25% más de lo esperado. Considera una revisión.',
      impact: 'Ahorro estimado: $32.20/mes',
      savings: 32.20,
      effort: 'Moderado',
      category: 'maintenance',
      icon: Zap,
      device: 'Refrigerador',
      timeframe: '2-3 días',
      details: [
        'Limpia las bobinas del condensador cada 6 meses',
        'Revisa el sello de las puertas',
        'Mantén la temperatura entre 3-5°C'
      ]
    },
    {
      id: 4,
      type: 'automation',
      priority: 'medium',
      title: 'Programa dispositivos inteligentes',
      description: 'Configura horarios automáticos para tus dispositivos conectados.',
      impact: 'Ahorro estimado: $18.90/mes',
      savings: 18.90,
      effort: 'Fácil',
      category: 'automation',
      icon: Calendar,
      device: 'Dispositivos IoT',
      timeframe: '1 día',
      details: [
        'Programa el calentador de agua para funcionar en horarios de tarifa baja',
        'Configura luces inteligentes con sensores de movimiento',
        'Establece rutinas de apagado automático'
      ]
    },
    {
      id: 5,
      type: 'usage',
      priority: 'low',
      title: 'Optimiza el uso de electrodomésticos',
      description: 'Evita usar múltiples electrodomésticos de alto consumo simultáneamente.',
      impact: 'Ahorro estimado: $12.30/mes',
      savings: 12.30,
      effort: 'Fácil',
      category: 'usage',
      icon: TrendingDown,
      device: 'Varios',
      timeframe: 'Continuo',
      details: [
        'No uses lavavajillas y lavadora al mismo tiempo',
        'Cocina en lotes para aprovechar mejor el horno',
        'Usa la secadora solo cuando sea necesario'
      ]
    }
  ];

  const filters = [
    { id: 'all', label: 'Todas', count: recommendations.length },
    { id: 'high', label: 'Alta Prioridad', count: recommendations.filter(r => r.priority === 'high').length },
    { id: 'medium', label: 'Media Prioridad', count: recommendations.filter(r => r.priority === 'medium').length },
    { id: 'scheduling', label: 'Horarios', count: recommendations.filter(r => r.category === 'scheduling').length },
    { id: 'temperature', label: 'Temperatura', count: recommendations.filter(r => r.category === 'temperature').length }
  ];

  const filteredRecommendations = recommendations.filter(rec => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'high' || activeFilter === 'medium') return rec.priority === activeFilter;
    return rec.category === activeFilter;
  }).filter(rec => !dismissedRecommendations.includes(rec.id));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-400/30 bg-red-500/10';
      case 'medium': return 'border-yellow-400/30 bg-yellow-500/10';
      case 'low': return 'border-blue-400/30 bg-blue-500/10';
      default: return 'border-white/10 bg-white/10';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return { label: 'Alta', color: 'bg-red-500/20 text-red-400' };
      case 'medium': return { label: 'Media', color: 'bg-yellow-500/20 text-yellow-400' };
      case 'low': return { label: 'Baja', color: 'bg-blue-500/20 text-blue-400' };
      default: return { label: 'Normal', color: 'bg-gray-500/20 text-gray-400' };
    }
  };

  const handleMarkCompleted = (id: number) => {
    setCompletedRecommendations([...completedRecommendations, id]);
  };

  const handleDismiss = (id: number) => {
    setDismissedRecommendations([...dismissedRecommendations, id]);
  };

  const handleRestore = (id: number) => {
    setDismissedRecommendations(dismissedRecommendations.filter(recId => recId !== id));
    setCompletedRecommendations(completedRecommendations.filter(recId => recId !== id));
  };

  const totalPotentialSavings = recommendations
    .filter(rec => !completedRecommendations.includes(rec.id) && !dismissedRecommendations.includes(rec.id))
    .reduce((sum, rec) => sum + rec.savings, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-2xl border border-purple-400/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Recomendaciones IA</h2>
            <p className="text-white/70">Optimización personalizada basada en tu consumo</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-white/80 font-medium">Ahorro Potencial</span>
            </div>
            <p className="text-2xl font-bold text-white">${totalPotentialSavings.toFixed(2)}</p>
            <p className="text-white/60 text-sm">por mes</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-white/80 font-medium">Completadas</span>
            </div>
            <p className="text-2xl font-bold text-white">{completedRecommendations.length}</p>
            <p className="text-white/60 text-sm">de {recommendations.length} recomendaciones</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-blue-400" />
              <span className="text-white/80 font-medium">Impacto</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {((completedRecommendations.length / recommendations.length) * 100).toFixed(0)}%
            </p>
            <p className="text-white/60 text-sm">reducción estimada</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeFilter === filter.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
            }`}
          >
            {filter.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeFilter === filter.id
                ? 'bg-white/20 text-white'
                : 'bg-white/10 text-white/60'
            }`}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.map(recommendation => {
          const IconComponent = recommendation.icon;
          const priority = getPriorityBadge(recommendation.priority);
          const isCompleted = completedRecommendations.includes(recommendation.id);
          
          return (
            <div
              key={recommendation.id}
              className={`bg-white/10 backdrop-blur-md rounded-2xl border p-6 transition-all duration-200 hover:bg-white/15 ${
                isCompleted ? 'opacity-60 border-green-400/30' : getPriorityColor(recommendation.priority)
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-green-500/20' 
                    : recommendation.priority === 'high' 
                      ? 'bg-red-500/20' 
                      : recommendation.priority === 'medium'
                        ? 'bg-yellow-500/20'
                        : 'bg-blue-500/20'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <IconComponent className={`w-6 h-6 ${
                      recommendation.priority === 'high' 
                        ? 'text-red-400' 
                        : recommendation.priority === 'medium'
                          ? 'text-yellow-400'
                          : 'text-blue-400'
                    }`} />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`font-semibold ${isCompleted ? 'text-white/60 line-through' : 'text-white'}`}>
                          {recommendation.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${priority.color}`}>
                          {priority.label}
                        </span>
                      </div>
                      <p className={`mb-3 ${isCompleted ? 'text-white/40' : 'text-white/70'}`}>
                        {recommendation.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white/60 text-xs mb-1">Ahorro</p>
                      <p className={`font-semibold ${isCompleted ? 'text-white/60' : 'text-green-400'}`}>
                        ${recommendation.savings.toFixed(2)}/mes
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white/60 text-xs mb-1">Esfuerzo</p>
                      <p className={`font-semibold ${isCompleted ? 'text-white/60' : 'text-white'}`}>
                        {recommendation.effort}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white/60 text-xs mb-1">Dispositivo</p>
                      <p className={`font-semibold ${isCompleted ? 'text-white/60' : 'text-white'}`}>
                        {recommendation.device}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white/60 text-xs mb-1">Tiempo</p>
                      <p className={`font-semibold ${isCompleted ? 'text-white/60' : 'text-white'}`}>
                        {recommendation.timeframe}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="bg-white/5 rounded-lg p-4 mb-4">
                    <h4 className={`font-medium mb-2 ${isCompleted ? 'text-white/60' : 'text-white'}`}>
                      Detalles de implementación:
                    </h4>
                    <ul className="space-y-1">
                      {recommendation.details.map((detail, index) => (
                        <li key={index} className={`text-sm flex items-start gap-2 ${
                          isCompleted ? 'text-white/40' : 'text-white/70'
                        }`}>
                          <span className="text-white/50">•</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!isCompleted ? (
                      <>
                        <button
                          onClick={() => handleMarkCompleted(recommendation.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-lg text-green-400 font-medium transition-all"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Marcar como Completada
                        </button>
                        <button
                          onClick={() => handleDismiss(recommendation.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white/70 hover:text-white font-medium transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                          Descartar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRestore(recommendation.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg text-blue-400 font-medium transition-all"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restaurar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRecommendations.length === 0 && (
        <div className="text-center py-12">
          <Lightbulb className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No hay recomendaciones disponibles
          </h3>
          <p className="text-white/60">
            {dismissedRecommendations.length > 0 
              ? 'Has descartado todas las recomendaciones de esta categoría.'
              : 'Cambiar los filtros para ver más recomendaciones.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Recommendations;