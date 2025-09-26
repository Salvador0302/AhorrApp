import React, { useState } from 'react';
import { Lightbulb, Clock, DollarSign, TrendingDown, ArrowLeft, CheckCircle } from 'lucide-react';
import type { Screen } from '../App';

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

interface RecommendationsScreenProps {
  receipt: Receipt | null;
  appliances: Appliance[];
  onNavigate: (screen: Screen) => void;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  savings: number;
  savingsPercent: number;
  difficulty: 'Fácil' | 'Medio' | 'Difícil';
  appliance?: string;
  timeframe: string;
  icon: string;
  completed: boolean;
}

const RecommendationsScreen: React.FC<RecommendationsScreenProps> = ({ 
  receipt, 
  appliances, 
  onNavigate 
}) => {
  const [completedRecommendations, setCompletedRecommendations] = useState<string[]>([]);

  // Generate personalized recommendations based on receipt and appliances
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    // Base recommendations
    if (receipt && receipt.consumption > 200) {
      recommendations.push({
        id: '1',
        title: 'Reduce el consumo nocturno',
        description: 'Tu consumo es alto. Desconecta aparatos en standby durante la noche.',
        savings: 25,
        savingsPercent: 8,
        difficulty: 'Fácil',
        timeframe: 'Inmediato',
        icon: '🌙',
        completed: false
      });
    }

    // Appliance-specific recommendations
    const ac = appliances.find(a => a.name.includes('Aire') || a.type === 'cooling');
    if (ac && ac.hoursPerDay > 8) {
      recommendations.push({
        id: '2',
        title: 'Optimiza el aire acondicionado',
        description: 'Usar el AC después de 10 PM reduce costos por tarifas nocturnas.',
        savings: 45,
        savingsPercent: 12,
        difficulty: 'Fácil',
        appliance: ac.name,
        timeframe: '1 semana',
        icon: '🌬️',
        completed: false
      });
    }

    const washer = appliances.find(a => a.name.includes('Lavadora'));
    if (washer) {
      recommendations.push({
        id: '3',
        title: 'Programa la lavadora',
        description: 'Usar la lavadora después de 10 PM ahorra hasta 12% en tu factura.',
        savings: 18,
        savingsPercent: 12,
        difficulty: 'Fácil',
        appliance: washer.name,
        timeframe: 'Continuo',
        icon: '👕',
        completed: false
      });
    }

    const fridge = appliances.find(a => a.name.includes('Refrigerador'));
    if (fridge && fridge.consumption > 150) {
      recommendations.push({
        id: '4',
        title: 'Revisa el refrigerador',
        description: 'Tu refrigerador consume más de lo normal. Revisa el sello de las puertas.',
        savings: 32,
        savingsPercent: 15,
        difficulty: 'Medio',
        appliance: fridge.name,
        timeframe: '2-3 días',
        icon: '❄️',
        completed: false
      });
    }

    const tv = appliances.find(a => a.name.includes('Televisor'));
    if (tv && tv.hoursPerDay > 6) {
      recommendations.push({
        id: '5',
        title: 'Reduce el tiempo de TV',
        description: 'Limitar el uso del televisor a 4 horas diarias puede generar ahorros.',
        savings: 12,
        savingsPercent: 5,
        difficulty: 'Medio',
        appliance: tv.name,
        timeframe: 'Continuo',
        icon: '📺',
        completed: false
      });
    }

    // General recommendations
    recommendations.push({
      id: '6',
      title: 'Cambia a LED',
      description: 'Reemplaza focos incandescentes por LED para reducir consumo de iluminación.',
      savings: 15,
      savingsPercent: 10,
      difficulty: 'Fácil',
      timeframe: '1 día',
      icon: '💡',
      completed: false
    });

    return recommendations.slice(0, 6); // Limit to 6 recommendations
  };

  const recommendations = generateRecommendations();
  const totalPotentialSavings = recommendations
    .filter(r => !completedRecommendations.includes(r.id))
    .reduce((sum, r) => sum + r.savings, 0);

  const handleCompleteRecommendation = (id: string) => {
    setCompletedRecommendations([...completedRecommendations, id]);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-500/20 text-green-400';
      case 'Medio': return 'bg-yellow-500/20 text-yellow-400';
      case 'Difícil': return 'bg-red-500/20 text-red-400';
      default: return 'bg-blue-500/20 text-blue-400';
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
        <h2 className="text-xl font-bold text-white">Recomendaciones</h2>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-md rounded-xl border border-yellow-400/20 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Tips Personalizados</h3>
            <p className="text-white/70 text-sm">Basados en tu recibo y aparatos</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-white/70 text-xs mb-1">Ahorro Potencial</p>
            <p className="text-white font-bold text-lg">${totalPotentialSavings}</p>
            <p className="text-white/60 text-xs">por mes</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-white/70 text-xs mb-1">Completadas</p>
            <p className="text-white font-bold text-lg">{completedRecommendations.length}</p>
            <p className="text-white/60 text-xs">de {recommendations.length}</p>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((recommendation) => {
          const isCompleted = completedRecommendations.includes(recommendation.id);
          
          return (
            <div
              key={recommendation.id}
              className={`bg-white/10 backdrop-blur-md rounded-xl border border-white/10 p-4 transition-all ${
                isCompleted ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isCompleted ? 'bg-green-500/20' : 'bg-white/20'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <span className="text-lg">{recommendation.icon}</span>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className={`font-semibold ${isCompleted ? 'text-white/60 line-through' : 'text-white'}`}>
                      {recommendation.title}
                    </h4>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getDifficultyColor(recommendation.difficulty)}`}>
                      {recommendation.difficulty}
                    </span>
                  </div>
                  
                  <p className={`text-sm mb-3 ${isCompleted ? 'text-white/40' : 'text-white/70'}`}>
                    {recommendation.description}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-white/5 rounded-lg p-2">
                      <p className="text-white/60 text-xs">Ahorro</p>
                      <p className={`font-semibold text-sm ${isCompleted ? 'text-white/60' : 'text-green-400'}`}>
                        ${recommendation.savings}/mes
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <p className="text-white/60 text-xs">Reducción</p>
                      <p className={`font-semibold text-sm ${isCompleted ? 'text-white/60' : 'text-blue-400'}`}>
                        {recommendation.savingsPercent}%
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <p className="text-white/60 text-xs">Tiempo</p>
                      <p className={`font-semibold text-sm ${isCompleted ? 'text-white/60' : 'text-white'}`}>
                        {recommendation.timeframe}
                      </p>
                    </div>
                  </div>
                  
                  {recommendation.appliance && (
                    <div className="mb-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                        isCompleted ? 'bg-white/5 text-white/50' : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        🔌 {recommendation.appliance}
                      </span>
                    </div>
                  )}
                  
                  {!isCompleted && (
                    <button
                      onClick={() => handleCompleteRecommendation(recommendation.id)}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium py-2 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Marcar como Completada
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Data State */}
      {recommendations.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">
            ¡Sube tu recibo para obtener tips!
          </h3>
          <p className="text-white/70 text-sm mb-4">
            Necesitamos analizar tu consumo para generar recomendaciones personalizadas
          </p>
          <button
            onClick={() => onNavigate('receipt')}
            className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold py-2 px-6 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all"
          >
            Subir Recibo
          </button>
        </div>
      )}

      {/* Progress */}
      {recommendations.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Progreso</span>
            <span className="text-white/70 text-sm">
              {completedRecommendations.length}/{recommendations.length}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(completedRecommendations.length / recommendations.length) * 100}%` }}
            />
          </div>
          <p className="text-white/60 text-xs mt-2">
            Ahorro acumulado: ${recommendations
              .filter(r => completedRecommendations.includes(r.id))
              .reduce((sum, r) => sum + r.savings, 0)} por mes
          </p>
        </div>
      )}
    </div>
  );
};

export default RecommendationsScreen;