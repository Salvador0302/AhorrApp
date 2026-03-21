import { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Lightbulb, TrendingDown, Sparkles } from 'lucide-react';
import type { Screen } from '../App';
import {
  generatePersonalizedRecommendation,
  generateQuickTips,
  analyzeConsumption,
  type Receipt,
  type Appliance
} from '../services/advisorService';

interface AdvisorAssistantProps {
  currentScreen: Screen;
  onNavigate?: (screen: Screen) => void;
  onClose: () => void;
  receipt: Receipt | null;
  appliances: Appliance[];
}

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: () => void;
    icon?: string;
  }>;
}

const AdvisorAssistant: React.FC<AdvisorAssistantProps> = ({
  currentScreen,
  onClose,
  receipt,
  appliances
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
    // Mensaje de bienvenida del asistente de recomendaciones
    const initWelcome = async () => {
      const welcomeText = `🎉 ¡Hola! Soy tu Asistente de Recomendaciones. Ya tengo toda tu información y estoy listo para ayudarte a optimizar tu consumo energético. Puedo darte consejos personalizados, responder tus preguntas y analizar tu consumo. ¿En qué te puedo ayudar?`;

      const welcomeMessage: Message = {
        id: '1',
        text: welcomeText,
        isBot: true,
        timestamp: new Date(),
        actions: [
          {
            label: '💡 Dame un consejo',
            action: () => handleQuickAction('recommendation'),
            icon: '💡'
          },
          {
            label: '📊 Analiza mi consumo',
            action: () => handleQuickAction('analysis'),
            icon: '📊'
          },
          {
            label: '✨ Tips rápidos',
            action: () => handleQuickAction('tips'),
            icon: '✨'
          }
        ]
      };
      setMessages([welcomeMessage]);
    };

    initWelcome();
  }, []);

  useEffect(() => {
    // Mensajes contextuales enfocados en interacción y recomendaciones
    const addContextualMessage = async () => {
      if (currentScreen === 'recommendations' && messages.length === 1) {
        const contextMessage: Message = {
          id: Date.now().toString(),
          text: '💡 Estás en la pantalla de recomendaciones. Aquí puedes ver todos los tips que he generado para ti. También puedes preguntarme cualquier cosa sobre ahorro energético.',
          isBot: true,
          timestamp: new Date()
        };
        
        if (!messages.some(m => m.text.includes('pantalla de recomendaciones'))) {
          setMessages(prev => [...prev, contextMessage]);
        }
      }
    };

    const timer = setTimeout(addContextualMessage, 1500);
    return () => clearTimeout(timer);
  }, [currentScreen, messages]);

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
        responseText = await generatePersonalizedRecommendation(receipt, appliances);
      } else if (actionType === 'analysis') {
        responseText = await analyzeConsumption(receipt, appliances);
      } else if (actionType === 'tips') {
        const tips = await generateQuickTips(receipt, appliances);
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
      const response = await generatePersonalizedRecommendation(
        receipt,
        appliances,
        text
      );

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
        text: '❌ Lo siento, tuve un problema al procesar tu pregunta. ¿Podrías reformularla?',
        isBot: true,
        timestamp: new Date(),
        actions: [
          {
            label: '💡 Dame un consejo',
            action: () => handleQuickAction('recommendation'),
            icon: '💡'
          },
          {
            label: '📊 Analiza mi consumo',
            action: () => handleQuickAction('analysis'),
            icon: '📊'
          }
        ]
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

              {message.actions && (
                <div className="mt-3 space-y-2">
                  {message.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium py-2 px-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-1"
                    >
                      {action.icon && <span>{action.icon}</span>}
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions + Input */}
      <div className="p-3 border-t border-white/10 space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleQuickAction('recommendation')}
            disabled={isLoading}
            className="p-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 bg-white/10 text-white/70 hover:bg-white/20 disabled:opacity-40"
            aria-label="Consejo"
          >
            <Lightbulb className="w-4 h-4" />
            Consejo
          </button>
          <button
            onClick={() => handleQuickAction('analysis')}
            disabled={isLoading}
            className="p-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 bg-white/10 text-white/70 hover:bg-white/20 disabled:opacity-40"
            aria-label="Análisis"
          >
            <TrendingDown className="w-4 h-4" />
            Análisis
          </button>
          <button
            onClick={() => handleQuickAction('tips')}
            disabled={isLoading}
            className="p-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 bg-white/10 text-white/70 hover:bg-white/20 disabled:opacity-40"
            aria-label="Tips"
          >
            <Sparkles className="w-4 h-4" />
            Tips
          </button>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregúntame sobre ahorro energético..."
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
