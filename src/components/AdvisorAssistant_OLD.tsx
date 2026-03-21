import { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Sparkles } from 'lucide-react';
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
      
      let welcomeText = `👋 ¡Hola! Soy tu Asistente Virtual de AhorrApp. `;
      
      if (kb.receipt.exists && kb.appliances.total > 0) {
        welcomeText += `\n\n📊 He analizado tu información:\n`;
        welcomeText += `• Recibo: ${kb.receipt.consumption} kWh por $${kb.receipt.amount} (${kb.receipt.period})\n`;
        welcomeText += `• Electrodomésticos registrados: ${kb.appliances.total}\n`;
        
        if (kb.appliances.highestConsumer) {
          welcomeText += `• Mayor consumidor: ${kb.appliances.highestConsumer.name} ($${kb.appliances.highestConsumer.cost.toFixed(2)}/mes)\n`;
        }
        
        if (kb.receipt.consumptionChange) {
          const change = kb.receipt.consumptionChange;
          welcomeText += `• Cambio vs mes anterior: ${change.direction === 'increase' ? '↑' : '↓'} ${change.difference} kWh (${change.percentage.toFixed(1)}%)\n`;
        }
        
        welcomeText += `\n💡 Puedo responder cualquier pregunta sobre tu consumo, costos, electrodomésticos o darte recomendaciones personalizadas.\n\n`;
        welcomeText += `Por ejemplo, puedes preguntarme:\n`;
        welcomeText += `• "¿Por qué aumentó mi consumo?"\n`;
        welcomeText += `• "¿Cuánto gasta mi refrigerador?"\n`;
        welcomeText += `• "¿Cómo puedo ahorrar más?"\n`;
        welcomeText += `• "Dame consejos personalizados"\n\n`;
        welcomeText += `¿Qué te gustaría saber? 😊`;
      } else {
        welcomeText += `Tengo acceso a toda tu información de consumo energético y estoy listo para responder tus preguntas.\n\n`;
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
  }, []); // Solo se ejecuta una vez al montar el componente

  // Eliminamos los mensajes contextuales automáticos para mantenerlo limpio
  // El usuario interactúa cuando quiere

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
      text: "Analizando tus datos... 🔍",
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
        responseText = '✨ Aquí tienes algunos tips rápidos:\n\n' + tips.map((tip, i) => `${i + 1}. ${tip}`).join('\n');
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
                text: '❌ Lo siento, tuve un problema. Por favor, intenta de nuevo.',
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
        text: '❌ Lo siento, tuve un problema al procesar tu pregunta. ¿Podrías reformularla o intentar con otra pregunta?',
        isBot: true,
        timestamp: new Date()
      };
    }
  };

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmed,
      isBot: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const loadingId = Date.now().toString();
    const loadingMessage: Message = {
      id: loadingId,
      text: 'Pensando... 💭',
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
        className="fixed bottom-24 right-4 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg z-30 animate-bounce"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 left-4 bg-black/90 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl z-30 max-h-96 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">
              Asistente de Recomendaciones
            </h3>
            <p className="text-white/60 text-xs">
              💡 Experto en ahorro energético
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <span className="text-white text-sm">−</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-64">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                message.isBot
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30'
                  : 'bg-white/10 border border-white/20'
              }`}
            >
              <p className="text-white text-sm whitespace-pre-wrap">{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-white/10 space-y-2">
        {/* Sugerencias de preguntas rápidas */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setInputValue('¿Cuánto gasto al mes?')}
            disabled={isLoading}
            className="flex-shrink-0 bg-white/5 hover:bg-white/10 text-white/70 text-xs px-2.5 py-1.5 rounded-full disabled:opacity-40 transition-all"
          >
            💰 ¿Cuánto gasto?
          </button>
          <button
            onClick={() => setInputValue('¿Qué consume más?')}
            disabled={isLoading}
            className="flex-shrink-0 bg-white/5 hover:bg-white/10 text-white/70 text-xs px-2.5 py-1.5 rounded-full disabled:opacity-40 transition-all"
          >
            🔍 ¿Qué consume más?
          </button>
          <button
            onClick={() => setInputValue('¿Cómo puedo ahorrar?')}
            disabled={isLoading}
            className="flex-shrink-0 bg-white/5 hover:bg-white/10 text-white/70 text-xs px-2.5 py-1.5 rounded-full disabled:opacity-40 transition-all"
          >
            � ¿Cómo ahorrar?
          </button>
          <button
            onClick={() => handleQuickAction('analysis')}
            disabled={isLoading}
            className="flex-shrink-0 bg-white/5 hover:bg-white/10 text-white/70 text-xs px-2.5 py-1.5 rounded-full disabled:opacity-40 transition-all"
          >
            � Analizar consumo
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ej: ¿Cuánto consume mi refrigerador?"
            disabled={isLoading}
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-40"
            aria-label="Mensaje para el asistente"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvisorAssistant;
