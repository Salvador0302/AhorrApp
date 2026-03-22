import { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Sparkles, Send, Zap, TrendingUp, Lightbulb, BarChart3, Search } from 'lucide-react';
import type { Screen } from '../App';
import {
  generatePersonalizedRecommendation,
  generateQuickTips,
  analyzeConsumption
} from '../services/advisorService';
import { buildKnowledgeBase } from '../services/knowledgeBase';
import { getLatestReceipt, getAllAppliances } from '../services/database';

interface AdvisorAssistantProps {
  currentScreen: Screen;
  onNavigate?: (screen: Screen) => void;
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const AdvisorAssistant: React.FC<AdvisorAssistantProps> = ({
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  // Evita envíos múltiples por doble evento (Enter + click) o taps rápidos
  const sendingRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Mensaje de bienvenida conversacional
    const initWelcome = async () => {
      // Obtener datos actuales desde la base de datos
      const receiptRecord = getLatestReceipt();
      const applianceRecords = getAllAppliances();
      
      const receipt = receiptRecord ? {
        id: receiptRecord.id,
        period: receiptRecord.period,
        consumption: receiptRecord.consumption,
        amount: receiptRecord.amount,
        dueDate: receiptRecord.dueDate,
        previousConsumption: receiptRecord.previousConsumption,
        image: receiptRecord.image
      } : null;

      const appliances = applianceRecords.map(record => ({
        id: record.id,
        name: record.name,
        type: record.type,
        consumption: record.consumption,
        hoursPerDay: record.hoursPerDay,
        image: record.image,
        detected: record.detected
      }));
      
      // Construir base de conocimientos para personalizar el saludo
      const kb = buildKnowledgeBase(receipt, appliances);
      
      let welcomeText = `Hola, soy tu Asistente Virtual de AhorraPE.`;
      
      if (kb.receipt.exists && kb.appliances.total > 0) {
        welcomeText += `\n\nHe analizado tu información:\n`;
        welcomeText += `• Recibo: ${kb.receipt.consumption} kWh por $${kb.receipt.amount} (${kb.receipt.period})\n`;
        welcomeText += `• Electrodomésticos registrados: ${kb.appliances.total}\n`;
        
        if (kb.appliances.highestConsumer) {
          welcomeText += `• Mayor consumidor: ${kb.appliances.highestConsumer.name} ($${kb.appliances.highestConsumer.cost.toFixed(2)}/mes)\n`;
        }
        
        if (kb.receipt.consumptionChange) {
          const change = kb.receipt.consumptionChange;
          welcomeText += `• Cambio vs mes anterior: ${change.direction === 'increase' ? '↑' : '↓'} ${change.difference} kWh (${change.percentage.toFixed(1)}%)\n`;
        }
        
        welcomeText += `\nPuedo responder cualquier pregunta sobre tu consumo, costos, electrodomésticos o darte recomendaciones personalizadas.\n\n`;
        welcomeText += `Por ejemplo, puedes preguntarme:\n`;
        welcomeText += `• "¿Por qué aumentó mi consumo?"\n`;
        welcomeText += `• "¿Cuánto gasta mi refrigerador?"\n`;
        welcomeText += `• "¿Cómo puedo ahorrar más?"\n`;
        welcomeText += `• "Dame consejos personalizados"\n\n`;
        welcomeText += `¿Qué te gustaría saber?`;
      } else {
        welcomeText += `\n\nTengo acceso a toda tu información de consumo energético y estoy listo para responder tus preguntas.\n\n`;
        welcomeText += `¿Qué te gustaría saber sobre tu consumo o cómo ahorrar energía?`;
      }

      const welcomeMessage: Message = {
        id: '1',
        text: welcomeText,
        isBot: true,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    };

    initWelcome();
  }, []);

  const handleQuickAction = async (actionType: 'recommendation' | 'analysis' | 'tips') => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: actionType === 'recommendation' 
        ? 'Dame un consejo personalizado'
        : actionType === 'analysis'
        ? 'Analiza mi consumo'
        : 'Muéstrame tips rápidos',
      isBot: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    const loadingId = Date.now().toString();
    const loadingMessage: Message = {
      id: loadingId,
      text: "Analizando tus datos...",
      isBot: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      let responseText = '';

      if (actionType === 'recommendation') {
        responseText = await generatePersonalizedRecommendation();
      } else if (actionType === 'analysis') {
        responseText = await analyzeConsumption();
      } else if (actionType === 'tips') {
        const tips = await generateQuickTips();
        responseText = 'Aquí tienes algunos tips rápidos:\n\n' + tips.map((tip, i) => `${i + 1}. ${tip}`).join('\n');
      }

      setMessages(prev =>
        prev.map(msg =>
          msg.id === loadingId
            ? {
                id: loadingId,
                text: responseText,
                isBot: true,
                timestamp: new Date()
              }
            : msg
        )
      );
    } catch (error) {
      console.error('Error en acción rápida:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === loadingId
            ? {
                id: loadingId,
                text: 'Lo siento, tuve un problema. Por favor, intenta de nuevo.',
                isBot: true,
                timestamp: new Date()
              }
            : msg
        )
      );
    }
  };

  const generateBotReply = async (text: string): Promise<Message> => {
    try {
      const response = await generatePersonalizedRecommendation(text);

      return {
        id: Date.now().toString(),
        text: response,
        isBot: true,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error al generar respuesta:', error);
      return {
        id: Date.now().toString(),
        text: 'Lo siento, tuve un problema al procesar tu pregunta. ¿Podrías reformularla o intentar con otra pregunta?',
        isBot: true,
        timestamp: new Date()
      };
    }
  };

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading || sendingRef.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmed,
      isBot: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    sendingRef.current = true;

    const loadingId = Date.now().toString();
    const loadingMessage: Message = {
      id: loadingId,
      text: 'Pensando...',
      isBot: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const reply = await generateBotReply(trimmed);
      setMessages(prev =>
        prev.map(msg => (msg.id === loadingId ? reply : msg))
      );
    } catch (error) {
      console.error('Error al generar respuesta:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === loadingId
            ? {
                id: loadingId,
                text: '❌ Lo siento, tuve un problema para responder. ¿Podrías intentarlo de nuevo?',
                isBot: true,
                timestamp: new Date()
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      sendingRef.current = false;
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-4 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center shadow-xl z-50 hover:scale-110 transition-transform duration-300 group"
      >
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900" />
      </button>
    );
  }

  return (
    <div 
      className="fixed bottom-6 right-4 left-4 sm:left-auto sm:w-[420px] bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl z-50 flex flex-col overflow-hidden"
      style={{
        maxHeight: 'calc(100vh - 120px)'
      }}
    >
      {/* Header mejorado */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-800/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-base">
              Asistente AhorraPE
            </h3>
            <p className="text-white/50 text-xs flex items-center gap-1">
              <Zap className="w-3 h-3" />
              En línea
            </p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 group"
          >
            <span className="text-white text-sm group-hover:scale-110 inline-block transition-transform">−</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 transition-all duration-200 group"
          >
            <X className="w-4 h-4 text-white group-hover:text-red-400 transition-colors" />
          </button>
        </div>
      </div>

      {/* Messages mejorado */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3 relative scrollbar-hide"
        style={{ maxHeight: 'calc(100vh - 280px)', minHeight: '200px' }}
      >
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-fadeIn`}
          >
            <div
              className={`max-w-[85%] p-3 sm:p-4 rounded-xl transition-all ${
                message.isBot
                  ? 'bg-slate-700/50 border border-white/10'
                  : 'bg-blue-600/80 border border-blue-500/30'
              }`}
            >
              <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
              <span className="text-white/40 text-xs mt-1.5 block">
                {message.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area mejorado */}
      <div className="p-4 border-t border-white/10 bg-slate-800/80 backdrop-blur-sm space-y-3 relative z-10">
        {/* Sugerencias de preguntas rápidas mejoradas */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setInputValue('¿Cuánto gasto al mes?')}
            disabled={isLoading}
            className="flex-shrink-0 bg-white/10 hover:bg-white/15 border border-white/20 text-white/80 hover:text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-40 transition-all flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            ¿Cuánto gasto?
          </button>
          <button
            onClick={() => setInputValue('¿Qué consume más?')}
            disabled={isLoading}
            className="flex-shrink-0 bg-white/10 hover:bg-white/15 border border-white/20 text-white/80 hover:text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-40 transition-all flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            ¿Qué consume más?
          </button>
          <button
            onClick={() => setInputValue('¿Cómo puedo ahorrar?')}
            disabled={isLoading}
            className="flex-shrink-0 bg-white/10 hover:bg-white/15 border border-white/20 text-white/80 hover:text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-40 transition-all flex items-center gap-1.5"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            ¿Cómo ahorrar?
          </button>
          <button
            onClick={() => handleQuickAction('analysis')}
            disabled={isLoading}
            className="flex-shrink-0 bg-white/10 hover:bg-white/15 border border-white/20 text-white/80 hover:text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-40 transition-all flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analizar
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregúntame sobre tu consumo energético..."
            disabled={isLoading}
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-40 transition-all"
            aria-label="Mensaje para el asistente"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="hidden sm:inline">Pensando...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Enviar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvisorAssistant;
