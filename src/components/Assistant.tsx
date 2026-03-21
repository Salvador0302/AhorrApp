import { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, FileText, Lightbulb, Camera } from 'lucide-react';
import type { Screen } from '../App';
// Importamos ambos servicios y usamos un try/catch para decidir cuál usar
import * as geminiService from '../services/geminiService';
import * as geminiServiceMock from '../services/geminiServiceMock';

// Determinar qué servicio usar
const useMock = import.meta.env.VITE_USE_MOCK === 'true';
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const useRealService = !useMock && !!apiKey;

console.log("Usando servicio real:", useRealService ? "Sí" : "No (modo simulado)");
const { chatWithGemini } = useRealService ? geminiService : geminiServiceMock;

interface AssistantProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onClose: () => void;
  hasReceipt: boolean;
  hasAppliances: boolean;
}

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  actions?: Array<{
    label: string;
    screen: Screen;
    icon?: string;
  }>;
}

const Assistant: React.FC<AssistantProps> = ({ 
  currentScreen, 
  onNavigate, 
  onClose, 
  hasReceipt, 
  hasAppliances 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll al final cuando cambian mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: Message = {
      id: '1',
      text: '¡Hola! 👋 Soy tu asistente de AhorrApp. Te ayudo a optimizar tu consumo energético. ¿Por dónde quieres empezar?',
      isBot: true,
      timestamp: new Date(),
      actions: [
        { label: '📄 Subir Recibo', screen: 'receipt', icon: '📄' },
        { label: '🔌 Registrar Aparatos', screen: 'appliances', icon: '🔌' },
        { label: '💡 Ver Tips', screen: 'recommendations', icon: '💡' }
      ]
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    // Add contextual messages based on current screen and progress
    const addContextualMessage = () => {
      let newMessage: Message | null = null;

      switch (currentScreen) {
        case 'receipt':
          if (!hasReceipt) {
            newMessage = {
              id: Date.now().toString(),
              text: '📸 ¡Perfecto! Toma una foto de tu recibo de luz y yo lo analizaré para extraer toda la información importante.',
              isBot: true,
              timestamp: new Date()
            };
          } else {
            newMessage = {
              id: Date.now().toString(),
              text: '✅ ¡Excelente! Ya tienes tu recibo analizado. Ahora puedes ver recomendaciones personalizadas o proceder al pago.',
              isBot: true,
              timestamp: new Date(),
              actions: [
                { label: '💡 Ver Recomendaciones', screen: 'recommendations' },
                { label: '💳 Pagar Recibo', screen: 'payment' }
              ]
            };
          }
          break;

        case 'appliances':
          if (!hasAppliances) {
            newMessage = {
              id: Date.now().toString(),
              text: '🔌 Registra tus electrodomésticos para obtener análisis más precisos. Puedes usar la cámara para detectarlos automáticamente.',
              isBot: true,
              timestamp: new Date()
            };
          } else {
            newMessage = {
              id: Date.now().toString(),
              text: '👍 ¡Genial! Ya tienes aparatos registrados. Esto me ayuda a darte recomendaciones más precisas.',
              isBot: true,
              timestamp: new Date(),
              actions: [
                { label: '💡 Ver Tips Personalizados', screen: 'recommendations' }
              ]
            };
          }
          break;

        case 'recommendations':
          if (hasReceipt && hasAppliances) {
            newMessage = {
              id: Date.now().toString(),
              text: '🎯 ¡Perfecto! Con tu recibo y aparatos registrados, puedo darte las mejores recomendaciones personalizadas.',
              isBot: true,
              timestamp: new Date()
            };
          } else {
            newMessage = {
              id: Date.now().toString(),
              text: '💡 Para recomendaciones más precisas, te sugiero subir tu recibo y registrar tus electrodomésticos.',
              isBot: true,
              timestamp: new Date(),
              actions: [
                ...(hasReceipt ? [] : [{ label: '📄 Subir Recibo', screen: 'receipt' as Screen }]),
                ...(hasAppliances ? [] : [{ label: '🔌 Registrar Aparatos', screen: 'appliances' as Screen }])
              ]
            };
          }
          break;

        case 'payment':
          newMessage = {
            id: Date.now().toString(),
            text: '💳 Aquí puedes pagar tu recibo de forma segura. Gestionamos un ahorro del 10% que se aplicará a tu próxima factura.',
            isBot: true,
            timestamp: new Date()
          };
          break;

        case 'history':
          newMessage = {
            id: Date.now().toString(),
            text: '📊 En tu historial puedes ver todos tus pagos anteriores y el ahorro acumulado con AhorrApp.',
            isBot: true,
            timestamp: new Date()
          };
          break;
      }

      if (newMessage && !messages.some(m => m.text === newMessage!.text)) {
        setMessages(prev => [...prev, newMessage!]);
      }
    };

    const timer = setTimeout(addContextualMessage, 1000);
    return () => clearTimeout(timer);
  }, [currentScreen, hasReceipt, hasAppliances, messages]);

  const handleActionClick = (screen: Screen) => {
    onNavigate(screen);
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: `Ir a ${getScreenName(screen)}`,
      isBot: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
  };

  const generateBotReply = async (text: string): Promise<Message> => {
    const lower = text.toLowerCase();
    let geminiResponse: string | null = null;
    let actions: Array<{ label: string; screen: Screen; icon?: string }> | undefined;

    // Configuración de acciones según el contexto
    if (/(recibo|factura)/.test(lower)) {
      actions = [{ label: '📄 Ir a Recibo', screen: 'receipt' }];
    } else if (/(aparat|electro|dispositivo)/.test(lower)) {
      actions = [{ label: '🔌 Ir a Aparatos', screen: 'appliances' }];
    } else if (/(tip|recomenda|ahorro)/.test(lower)) {
      actions = [{ label: '💡 Ver Tips', screen: 'recommendations' }];
    } else if (/(pagar|pago|tarjeta)/.test(lower)) {
      actions = [{ label: '💳 Ir a Pago', screen: 'payment' }];
    } else if (/(historial|meses|anterior)/.test(lower)) {
      actions = [{ label: '📊 Ir a Historial', screen: 'history' }];
    } else {
      // Acciones genéricas para consultas no identificadas
      actions = [
        { label: '📄 Recibo', screen: 'receipt' },
        { label: '🔌 Aparatos', screen: 'appliances' },
        { label: '💡 Tips', screen: 'recommendations' }
      ];
    }

    try {
      // Crear un prompt enriquecido con contexto para Gemini
      const contextPrompt = `
        Actúas como el asistente virtual de AhorrApp, una aplicación para ayudar a usuarios a ahorrar en su consumo eléctrico.
        Contexto actual:
        - Pantalla actual: ${getScreenName(currentScreen)}
        - Usuario ha subido recibo: ${hasReceipt ? 'Sí' : 'No'}
        - Usuario ha registrado electrodomésticos: ${hasAppliances ? 'Sí' : 'No'}
        
        El usuario pregunta: "${text}"
        
        Responde brevemente (máximo 3 frases) y de forma amigable como asistente de ahorro energético.
        Incluye emojis relevantes al inicio de tu respuesta.
        No menciones que estás usando Gemini ni que eres una IA.
      `;
      
      geminiResponse = await chatWithGemini(contextPrompt);
    } catch (error) {
      console.error("Error al consultar Gemini:", error);
      
      // Respuestas de fallback según contexto (reglas simples como antes)
      if (/(recibo|factura)/.test(lower)) {
        geminiResponse = hasReceipt
          ? '✅ Ya tienes un recibo analizado. ¿Quieres verlo o subir uno nuevo?'
          : 'Aún no has subido un recibo. Pulsa el botón Recibo o envíame una imagen desde la pantalla de Recibo.';
      } else if (/(aparat|electro|dispositivo)/.test(lower)) {
        geminiResponse = hasAppliances
          ? '🔌 Ya registraste aparatos. Puedes editarlos para mejorar la estimación de consumo.'
          : 'Puedes registrar aparatos manualmente o con la cámara para detección simulada.';
      } else if (/(tip|recomenda|ahorro)/.test(lower)) {
        geminiResponse = '💡 Las recomendaciones se generan a partir de tu recibo y aparatos. Marca las completadas para ver tu progreso.';
      } else if (/(pagar|pago|tarjeta)/.test(lower)) {
        geminiResponse = '💳 El módulo de pago es una simulación. Puedes revisarlo para ver cómo se reflejaría un pago y el ahorro gestionado.';
      } else if (/(historial|meses|anterior)/.test(lower)) {
        geminiResponse = '📊 En Historial ves consumos pasados y tu ahorro acumulado. Muy pronto añadiremos análisis comparativos.';
      } else {
        geminiResponse = '🤔 Gracias por tu mensaje. Puedo ayudarte con: recibo, aparatos, recomendaciones, pago o historial. Prueba mencionando uno de esos temas.';
      }
    }
    
    return {
      id: Date.now().toString(),
      text: geminiResponse,
      isBot: true,
      timestamp: new Date(),
      actions
    };
  };

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    
    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmed,
      isBot: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Mostrar indicador de carga
    const loadingId = Date.now().toString();
    const loadingMessage: Message = {
      id: loadingId,
      text: "Pensando...",
      isBot: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, loadingMessage]);
    
    try {
      // Obtener respuesta de Gemini
      const reply = await generateBotReply(trimmed);
      
      // Reemplazar indicador de carga con la respuesta real
      setMessages(prev => prev.map(msg => 
        msg.id === loadingId ? reply : msg
      ));
    } catch (error) {
      // En caso de error, mostrar mensaje de error
      console.error("Error al generar respuesta:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === loadingId ? {
          id: loadingId,
          text: "Lo siento, tuve un problema para responder. ¿Podrías intentarlo de nuevo?",
          isBot: true,
          timestamp: new Date(),
          actions: [
            { label: '📄 Recibo', screen: 'receipt' },
            { label: '🔌 Aparatos', screen: 'appliances' },
            { label: '💡 Tips', screen: 'recommendations' }
          ]
        } : msg
      ));
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getScreenName = (screen: Screen): string => {
    const names = {
      home: 'Inicio',
      receipt: 'Recibo',
      appliances: 'Electrodomésticos',
      recommendations: 'Recomendaciones',
      payment: 'Pago',
      history: 'Historial'
    };
    return names[screen];
  };

  const getProgressMessage = (): string => {
    const progress = (hasReceipt ? 50 : 0) + (hasAppliances ? 50 : 0);
    if (progress === 100) return '🎉 ¡Configuración completa! Ya puedes aprovechar todas las funciones.';
    if (progress === 50) return '⚡ ¡Vas por buen camino! Completa el otro paso para mejores resultados.';
    return '🚀 ¡Empecemos! Sube tu recibo y registra tus aparatos para comenzar a ahorrar.';
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
            <span className="text-white text-sm">🤖</span>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Asistente AhorrApp</h3>
            <p className="text-white/60 text-xs">{getProgressMessage()}</p>
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
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              message.isBot 
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30' 
                : 'bg-white/10 border border-white/20'
            }`}>
              <p className="text-white text-sm">{message.text}</p>
              
              {message.actions && (
                <div className="mt-3 space-y-2">
                  {message.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleActionClick(action.screen)}
                      className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white text-xs font-medium py-2 px-3 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all flex items-center justify-center gap-1"
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
            onClick={() => handleActionClick('receipt')}
            className={`p-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 ${
              hasReceipt 
                ? 'bg-green-500/20 text-green-400 border border-green-400/30' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            aria-label="Ir a recibo"
          >
            <FileText className="w-4 h-4" />
            Recibo
          </button>
          <button
            onClick={() => handleActionClick('appliances')}
            className={`p-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 ${
              hasAppliances 
                ? 'bg-green-500/20 text-green-400 border border-green-400/30' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            aria-label="Ir a aparatos"
          >
            <Camera className="w-4 h-4" />
            Aparatos
          </button>
          <button
            onClick={() => handleActionClick('recommendations')}
            className="p-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 bg-white/10 text-white/70 hover:bg-white/20"
            aria-label="Ir a recomendaciones"
          >
            <Lightbulb className="w-4 h-4" />
            Tips
          </button>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta..."
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Mensaje para el asistente"
          />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Enviar
            </button>
        </div>
      </div>
    </div>
  );
};

export default Assistant;