import { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, FileText, Camera } from 'lucide-react';
import type { Screen } from '../App';
import { chatWithGemini } from '../services/geminiService';

interface DataAssistantProps {
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

const DataAssistant: React.FC<DataAssistantProps> = ({ 
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Mensaje de bienvenida enfocado en carga de datos
    const welcomeMessage: Message = {
      id: '1',
      text: '👋 ¡Hola! Soy tu asistente de registro de datos. Mi trabajo es ayudarte a cargar tu recibo de luz y registrar tus electrodomésticos. Una vez completes estos pasos, te presentaré a mi compañero, el asistente de recomendaciones. 🎯',
      isBot: true,
      timestamp: new Date(),
      actions: [
        { label: '📄 Subir Recibo', screen: 'receipt', icon: '📄' },
        { label: '🔌 Registrar Electrodomésticos', screen: 'appliances', icon: '🔌' }
      ]
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    const addContextualMessage = () => {
      let newMessage: Message | null = null;

      // Mensajes contextuales enfocados en carga de datos
      switch (currentScreen) {
        case 'receipt':
          if (!hasReceipt) {
            newMessage = {
              id: Date.now().toString(),
              text: '📸 Perfecto, estás en la pantalla de recibos. Toma una foto de tu recibo de luz y yo lo analizaré automáticamente. Necesito extraer información como tu consumo, monto a pagar y fecha de vencimiento.',
              isBot: true,
              timestamp: new Date()
            };
          } else {
            newMessage = {
              id: Date.now().toString(),
              text: '✅ ¡Excelente! Ya tengo tu recibo registrado. Ahora necesito que registres tus electrodomésticos para tener la información completa.',
              isBot: true,
              timestamp: new Date(),
              actions: [
                { label: '🔌 Registrar Electrodomésticos', screen: 'appliances' }
              ]
            };
          }
          break;

        case 'appliances':
          if (!hasAppliances) {
            newMessage = {
              id: Date.now().toString(),
              text: '🔌 Genial, ahora vamos a registrar tus electrodomésticos. Puedes usar la cámara para detectarlos automáticamente o agregarlos manualmente. Necesito saber cuáles tienes y cuántas horas al día los usas.',
              isBot: true,
              timestamp: new Date()
            };
          } else if (!hasReceipt) {
            newMessage = {
              id: Date.now().toString(),
              text: '👍 ¡Bien! Ya tienes electrodomésticos registrados. Ahora solo falta que subas tu recibo de luz para completar el registro.',
              isBot: true,
              timestamp: new Date(),
              actions: [
                { label: '📄 Subir Recibo', screen: 'receipt' }
              ]
            };
          } else {
            newMessage = {
              id: Date.now().toString(),
              text: '🎉 ¡Perfecto! Ya tienes toda la información registrada. Ahora puedes acceder al asistente de recomendaciones para obtener consejos personalizados y respuestas a tus preguntas. Ve a la pantalla de Recomendaciones para cambiar de asistente.',
              isBot: true,
              timestamp: new Date(),
              actions: [
                { label: '💡 Ver Recomendaciones', screen: 'recommendations' }
              ]
            };
          }
          break;

        case 'home':
          if (!hasReceipt && !hasAppliances) {
            newMessage = {
              id: Date.now().toString(),
              text: '🚀 ¡Empecemos! Para poder darte las mejores recomendaciones, primero necesito que: 1️⃣ Subas tu recibo de luz, 2️⃣ Registres tus electrodomésticos. ¿Por cuál quieres empezar?',
              isBot: true,
              timestamp: new Date(),
              actions: [
                { label: '📄 Subir Recibo', screen: 'receipt' },
                { label: '🔌 Registrar Electrodomésticos', screen: 'appliances' }
              ]
            };
          } else if (!hasReceipt) {
            newMessage = {
              id: Date.now().toString(),
              text: '📄 Ya tienes electrodomésticos registrados. Ahora necesitas subir tu recibo de luz para completar el registro.',
              isBot: true,
              timestamp: new Date(),
              actions: [
                { label: '📄 Ir a Recibo', screen: 'receipt' }
              ]
            };
          } else if (!hasAppliances) {
            newMessage = {
              id: Date.now().toString(),
              text: '🔌 Ya tienes tu recibo cargado. Ahora registra tus electrodomésticos para completar el proceso.',
              isBot: true,
              timestamp: new Date(),
              actions: [
                { label: '🔌 Ir a Electrodomésticos', screen: 'appliances' }
              ]
            };
          }
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

    // Acciones solo para carga de datos
    if (/(recibo|factura)/.test(lower)) {
      actions = [{ label: '📄 Ir a Recibo', screen: 'receipt' }];
    } else if (/(aparat|electro|dispositivo)/.test(lower)) {
      actions = [{ label: '🔌 Ir a Electrodomésticos', screen: 'appliances' }];
    } else {
      actions = [
        { label: '📄 Recibo', screen: 'receipt' },
        { label: '🔌 Electrodomésticos', screen: 'appliances' }
      ];
    }

    try {
      const contextPrompt = `
        Eres el Asistente de Registro de Datos de AhorrApp. Tu ÚNICA función es ayudar a los usuarios a:
        1. Subir y registrar su recibo de luz
        2. Registrar sus electrodomésticos (manualmente o con cámara)
        
        NO das recomendaciones de ahorro, NO respondes preguntas sobre optimización energética.
        Para eso existe otro asistente especializado que el usuario podrá usar después.
        
        Contexto actual:
        - Usuario ha subido recibo: ${hasReceipt ? 'Sí ✅' : 'No ❌'}
        - Usuario ha registrado electrodomésticos: ${hasAppliances ? 'Sí ✅' : 'No ❌'}
        
        El usuario pregunta: "${text}"
        
        Responde brevemente (máximo 2 frases) enfocándote SOLO en el registro de datos.
        Si preguntan sobre recomendaciones o tips, explícales que existe otro asistente para eso.
        Usa emojis relevantes.
      `;
      
      geminiResponse = await chatWithGemini(contextPrompt);
    } catch (error) {
      console.error("Error al consultar Gemini:", error);
      
      // Respuestas de fallback enfocadas en carga de datos
      if (/(recibo|factura)/.test(lower)) {
        geminiResponse = hasReceipt
          ? '✅ Ya tienes un recibo registrado. Si quieres subir uno nuevo, ve a la pantalla de Recibo.'
          : '📄 Para registrar tu recibo, ve a la pantalla de Recibo y toma una foto con tu cámara.';
      } else if (/(aparat|electro|dispositivo)/.test(lower)) {
        geminiResponse = hasAppliances
          ? '✅ Ya tienes electrodomésticos registrados. Puedes agregar más o editarlos en la pantalla de Electrodomésticos.'
          : '🔌 Para registrar tus electrodomésticos, ve a la pantalla correspondiente. Puedes usar la cámara o agregarlos manualmente.';
      } else if (/(tip|recomenda|ahorro|consejo)/.test(lower)) {
        geminiResponse = '💡 Las recomendaciones las maneja mi compañero, el Asistente de Recomendaciones. Primero completa el registro de datos (recibo + electrodomésticos) y luego podrás acceder a él.';
      } else {
        geminiResponse = '📋 Mi función es ayudarte a registrar tu recibo y electrodomésticos. ¿En qué parte del registro necesitas ayuda?';
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
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmed,
      isBot: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    const loadingId = Date.now().toString();
    const loadingMessage: Message = {
      id: loadingId,
      text: "Analizando...",
      isBot: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, loadingMessage]);
    
    try {
      const reply = await generateBotReply(trimmed);
      setMessages(prev => prev.map(msg => 
        msg.id === loadingId ? reply : msg
      ));
    } catch (error) {
      console.error("Error al generar respuesta:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === loadingId ? {
          id: loadingId,
          text: "Lo siento, tuve un problema. ¿Podrías intentarlo de nuevo?",
          isBot: true,
          timestamp: new Date(),
          actions: [
            { label: '📄 Recibo', screen: 'receipt' },
            { label: '🔌 Electrodomésticos', screen: 'appliances' }
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
    if (hasReceipt && hasAppliances) {
      return '✅ Registro completo. Ve a Recomendaciones para el otro asistente.';
    }
    if (hasReceipt) return '⚡ Recibo listo. Falta registrar electrodomésticos.';
    if (hasAppliances) return '⚡ Electrodomésticos listos. Falta subir recibo.';
    return '📋 Asistente de Registro de Datos';
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-24 right-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg z-30 animate-bounce"
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
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">📋</span>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Asistente de Registro</h3>
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
                ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30' 
                : 'bg-white/10 border border-white/20'
            }`}>
              <p className="text-white text-sm">{message.text}</p>
              
              {message.actions && (
                <div className="mt-3 space-y-2">
                  {message.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleActionClick(action.screen)}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-medium py-2 px-3 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-1"
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
        <div className="grid grid-cols-2 gap-2">
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
            Recibo {hasReceipt && '✓'}
          </button>
          <button
            onClick={() => handleActionClick('appliances')}
            className={`p-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 ${
              hasAppliances 
                ? 'bg-green-500/20 text-green-400 border border-green-400/30' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            aria-label="Ir a electrodomésticos"
          >
            <Camera className="w-4 h-4" />
            Electrodomésticos {hasAppliances && '✓'}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregunta sobre registro de datos..."
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Mensaje para el asistente"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:from-blue-600 hover:to-cyan-600 transition-all"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataAssistant;
