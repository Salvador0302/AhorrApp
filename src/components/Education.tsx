import React, { useState } from 'react';
import { 
  BookOpen, 
  Lightbulb, 
  Zap, 
  Home, 
  Thermometer,
  WashingMachine,
  Monitor,
  ChevronRight,
  Play,
  Clock,
  Award,
  TrendingDown
} from 'lucide-react';

const Education: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('basics');
  const [completedArticles, setCompletedArticles] = useState<string[]>([]);

  const categories = [
    { id: 'basics', label: 'Conceptos Básicos', icon: Lightbulb },
    { id: 'appliances', label: 'Electrodomésticos', icon: Home },
    { id: 'hvac', label: 'Climatización', icon: Thermometer },
    { id: 'tips', label: 'Tips Avanzados', icon: TrendingDown }
  ];

  const educationContent = {
    basics: [
      {
        id: 'energy-basics',
        title: 'Entendiendo el Consumo Energético',
        description: 'Aprende los conceptos fundamentales sobre energía eléctrica en el hogar.',
        readTime: 5,
        difficulty: 'Básico',
        content: {
          summary: 'La energía eléctrica se mide en kilowatt-hora (kWh). Un kWh es la cantidad de energía que consume un aparato de 1000 watts funcionando durante una hora.',
          tips: [
            'El consumo se mide en kWh (kilowatt-hora)',
            'Un aparato de 100W funcionando 10 horas consume 1 kWh',
            'Los electrodomésticos más grandes consumen más energía',
            'El precio varía según el horario y temporada'
          ],
          facts: [
            'Un refrigerador promedio consume 400-800 kWh al año',
            'Las tarifas nocturnas pueden ser hasta 40% más baratas',
            'Los aparatos en standby consumen entre 5-10% de energía'
          ]
        }
      },
      {
        id: 'reading-bills',
        title: 'Cómo Leer tu Factura de Luz',
        description: 'Entiende cada componente de tu factura eléctrica y identifica oportunidades de ahorro.',
        readTime: 7,
        difficulty: 'Básico',
        content: {
          summary: 'Tu factura incluye consumo base, cargos por demanda, impuestos y tarifas variables según el horario.',
          tips: [
            'Identifica tu consumo en kWh en los últimos 12 meses',
            'Compara con meses anteriores para detectar aumentos',
            'Revisa los cargos por demanda máxima',
            'Verifica si tienes tarifa diferenciada por horarios'
          ],
          facts: [
            'Los cargos fijos representan 20-30% de la factura',
            'La demanda máxima afecta el costo total',
            'Los impuestos pueden ser hasta 15% del total'
          ]
        }
      }
    ],
    appliances: [
      {
        id: 'refrigerator-efficiency',
        title: 'Optimizando tu Refrigerador',
        description: 'Tu refrigerador consume el 13% de la energía del hogar. Aprende a optimizarlo.',
        readTime: 6,
        difficulty: 'Intermedio',
        content: {
          summary: 'El refrigerador funciona 24/7, por lo que pequeñas mejoras tienen gran impacto en el consumo anual.',
          tips: [
            'Mantén la temperatura entre 3-5°C en el refrigerador',
            'El congelador debe estar a -18°C',
            'No coloques alimentos calientes dentro',
            'Limpia las bobinas del condensador cada 6 meses',
            'Verifica que las puertas sellen correctamente'
          ],
          facts: [
            'Un refrigerador viejo puede consumir 3x más energía',
            'Cada grado menos de temperatura aumenta el consumo 5%',
            'Un refrigerador lleno consume menos energía que uno vacío'
          ]
        }
      },
      {
        id: 'washing-drying',
        title: 'Lavado y Secado Eficiente',
        description: 'Reduce hasta 50% el consumo de tu lavadora y secadora con estas técnicas.',
        readTime: 8,
        difficulty: 'Intermedio',
        content: {
          summary: 'El 90% del consumo de la lavadora se debe al calentamiento del agua. La secadora es uno de los electrodomésticos que más energía consume.',
          tips: [
            'Usa agua fría siempre que sea posible',
            'Carga completa pero no sobrecargues',
            'Limpia el filtro de pelusa después de cada uso',
            'Seca cargas similares juntas',
            'Usa el tendedero cuando el clima lo permita'
          ],
          facts: [
            'Lavar con agua fría puede ahorrar hasta $60 anuales',
            'La secadora consume 2-4 kWh por carga',
            'Secar al aire libre es 100% gratuito'
          ]
        }
      }
    ],
    hvac: [
      {
        id: 'ac-optimization',
        title: 'Aire Acondicionado Inteligente',
        description: 'El AC puede representar hasta 50% de tu factura en verano. Optimiza su uso.',
        readTime: 10,
        difficulty: 'Avanzado',
        content: {
          summary: 'Cada grado de diferencia puede representar 6-8% de ahorro. La programación y mantenimiento son clave.',
          tips: [
            'Programa temperaturas más altas cuando no estés en casa',
            'Usa ventiladores para mejorar la circulación',
            'Sella puertas y ventanas para evitar fugas',
            'Cambia o limpia filtros mensualmente',
            'Considera un termostato programable'
          ],
          facts: [
            'Subir de 20°C a 24°C puede ahorrar 20-30% de energía',
            'Un filtro sucio puede aumentar el consumo 15%',
            'Los ventiladores permiten sentir 3-4°C menos'
          ]
        }
      }
    ],
    tips: [
      {
        id: 'smart-scheduling',
        title: 'Programación Inteligente',
        description: 'Aprovecha las tarifas diferenciadas y programa tus dispositivos automáticamente.',
        readTime: 12,
        difficulty: 'Avanzado',
        content: {
          summary: 'Las tarifas eléctricas varían según el horario. Programa dispositivos de alto consumo en horarios de tarifa baja.',
          tips: [
            'Identifica los horarios de tarifa baja en tu zona',
            'Programa lavadora, lavavajillas y calentador de agua',
            'Usa timers para dispositivos no inteligentes',
            'Carga vehículos eléctricos durante la madrugada',
            'Evita usar múltiples dispositivos de alto consumo simultáneamente'
          ],
          facts: [
            'Las tarifas nocturnas pueden ser 40% más baratas',
            'Los horarios pico suelen ser 6-10 PM',
            'La programación puede ahorrar 15-25% mensual'
          ]
        }
      }
    ]
  };

  const handleCompleteArticle = (articleId: string) => {
    if (!completedArticles.includes(articleId)) {
      setCompletedArticles([...completedArticles, articleId]);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'básico':
        return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'intermedio':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      case 'avanzado':
        return 'bg-red-500/20 text-red-400 border-red-400/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
    }
  };

  const totalArticles = Object.values(educationContent).flat().length;
  const completedCount = completedArticles.length;
  const completionRate = (completedCount / totalArticles) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-md rounded-2xl border border-green-400/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Centro Educativo</h2>
            <p className="text-white/70">Aprende a optimizar tu consumo energético</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="text-white/80 font-medium">Progreso</span>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-white">{completedCount}</p>
              <p className="text-white/60">/ {totalArticles} artículos</p>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-white/80 font-medium">Tiempo Invertido</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {completedArticles.length * 7} min
            </p>
            <p className="text-white/60 text-sm">aprendiendo</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-green-400" />
              <span className="text-white/80 font-medium">Ahorro Potencial</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {(completionRate * 2).toFixed(0)}%
            </p>
            <p className="text-white/60 text-sm">reducción estimada</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(category => {
          const IconComponent = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {category.label}
            </button>
          );
        })}
      </div>

      {/* Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {educationContent[activeCategory as keyof typeof educationContent]?.map(article => {
          const isCompleted = completedArticles.includes(article.id);
          
          return (
            <div
              key={article.id}
              className={`bg-white/10 backdrop-blur-md rounded-2xl border p-6 transition-all duration-200 hover:bg-white/15 ${
                isCompleted ? 'border-green-400/30 bg-green-500/5' : 'border-white/10'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`text-lg font-semibold ${isCompleted ? 'text-green-400' : 'text-white'}`}>
                      {article.title}
                    </h3>
                    {isCompleted && (
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Award className="w-4 h-4 text-green-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-white/70 mb-4">{article.description}</p>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1 text-white/60">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{article.readTime} min</span>
                    </div>
                    <div className={`px-2 py-1 rounded-lg border text-xs font-medium ${getDifficultyColor(article.difficulty)}`}>
                      {article.difficulty}
                    </div>
                  </div>
                </div>
              </div>

              {/* Article Content Preview */}
              <div className="space-y-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/80 text-sm leading-relaxed">
                    {article.content.summary}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-2">Tips principales:</h4>
                  <ul className="space-y-1">
                    {article.content.tips.slice(0, 3).map((tip, index) => (
                      <li key={index} className="text-white/70 text-sm flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleCompleteArticle(article.id)}
                disabled={isCompleted}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                  isCompleted
                    ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                    : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isCompleted ? (
                  <>
                    <Award className="w-4 h-4" />
                    Completado
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Leer Artículo
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Additional Resources */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Recursos Adicionales
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <Monitor className="w-8 h-8 text-blue-400 mb-3" />
            <h4 className="text-white font-medium mb-2">Calculadora de Consumo</h4>
            <p className="text-white/70 text-sm mb-3">
              Calcula el consumo y costo de tus electrodomésticos
            </p>
            <button className="text-blue-400 text-sm font-medium hover:text-blue-300">
              Próximamente →
            </button>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4">
            <WashingMachine className="w-8 h-8 text-green-400 mb-3" />
            <h4 className="text-white font-medium mb-2">Guía de Electrodomésticos</h4>
            <p className="text-white/70 text-sm mb-3">
              Base de datos con consumos de diferentes marcas y modelos
            </p>
            <button className="text-green-400 text-sm font-medium hover:text-green-300">
              Próximamente →
            </button>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4">
            <Thermometer className="w-8 h-8 text-orange-400 mb-3" />
            <h4 className="text-white font-medium mb-2">Simulador de Ahorro</h4>
            <p className="text-white/70 text-sm mb-3">
              Simula diferentes escenarios de ahorro energético
            </p>
            <button className="text-orange-400 text-sm font-medium hover:text-orange-300">
              Próximamente →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Education;