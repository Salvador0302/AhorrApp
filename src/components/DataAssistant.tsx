import { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, FileText, Camera, Send, Zap, CheckCircle2, Info } from 'lucide-react';
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
}

const DataAssistant: React.FC<DataAssistantProps> = ({ 
  onClose, 
  hasReceipt, 
  hasAppliances 
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
    // Mensaje de bienvenida conversacional - SOLO al montar el componente
    let welcomeText = 'Hola, soy tu Asistente Virtual de AhorraPE.\n\n';
    
    if (!hasReceipt && !hasAppliances) {
      welcomeText += 'Para comenzar a optimizar tu consumo energético, necesito que:\n\n';
      welcomeText += '1. Subas tu recibo de luz (ve a la pantalla "Recibo")\n';
      welcomeText += '2. Registres tus electrodomésticos (ve a la pantalla "Aparatos")\n\n';
      welcomeText += 'Mientras tanto, puedes preguntarme sobre:\n';
      welcomeText += '• ¿Cómo subir mi recibo?\n';
      welcomeText += '• ¿Cómo registrar electrodomésticos?\n';
      welcomeText += '• ¿Qué información necesito?\n';
      welcomeText += '• Tips generales de ahorro\n\n';
      welcomeText += '¿En qué te puedo ayudar?';
    } else if (!hasReceipt) {
      welcomeText += 'Ya registraste tus electrodomésticos.\n\n';
      welcomeText += 'Ahora necesito que subas tu recibo de luz para completar tu perfil.\n\n';
      welcomeText += 'Ve a la pantalla "Recibo" para tomar una foto de tu factura.\n\n';
      welcomeText += '¿Tienes alguna pregunta?';
    } else if (!hasAppliances) {
      welcomeText += 'Ya subiste tu recibo de luz.\n\n';
      welcomeText += 'Ahora necesito que registres tus electrodomésticos.\n\n';
      welcomeText += 'Ve a la pantalla "Aparatos" para agregar tus dispositivos.\n\n';
      welcomeText += '¿Tienes alguna pregunta?';
    }
    
    const welcomeMessage: Message = {
      id: '1',
      text: welcomeText,
      isBot: true,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vacío = solo se ejecuta al montar

  // Eliminamos mensajes contextuales automáticos - el usuario interactúa cuando quiera



  const generateBotReply = async (text: string): Promise<Message> => {
    const lower = text.toLowerCase();
    let geminiResponse: string | null = null;

    try {
      const contextPrompt = `
        Eres el Asistente Virtual de AhorraPE. Tu función es ayudar a los usuarios a:
        1. Subir y registrar su recibo de luz
        2. Registrar sus electrodomésticos (manualmente o con cámara)
        
        Contexto actual:
        - Usuario ha subido recibo: ${hasReceipt ? 'Sí' : 'No'}
        - Usuario ha registrado electrodomésticos: ${hasAppliances ? 'Sí' : 'No'}
        
        El usuario pregunta: "${text}"
        
        Responde de forma conversacional y amigable (máximo 3 frases).
        - Si preguntan sobre el registro, guíalos a las pantallas correctas
        - Si preguntan sobre recomendaciones y AÚN NO tienen datos completos, explícales que primero necesitan completar el registro
        - Si YA tienen datos completos (recibo Y electrodomésticos), felicítalos y diles que pueden ver recomendaciones
        - Sé útil y usa emojis relevantes
      `;
      
      geminiResponse = await chatWithGemini(contextPrompt);
    } catch (error) {
      console.error("Error al consultar Gemini:", error);
      
      // Respuestas de fallback
      if (/(recibo|factura)/.test(lower)) {
        geminiResponse = hasReceipt
          ? 'Ya tienes un recibo registrado. Si quieres subir uno nuevo, ve a la pantalla "Recibo".'
          : 'Para registrar tu recibo, ve a la pantalla "Recibo" y toma una foto de tu factura.';
      } else if (/(aparat|electro|dispositivo)/.test(lower)) {
        geminiResponse = hasAppliances
          ? 'Ya tienes electrodomésticos registrados. Puedes agregar más o editarlos en la pantalla "Aparatos".'
          : 'Para registrar electrodomésticos, ve a la pantalla "Aparatos". Puedes usar la cámara o agregarlos manualmente.';
      } else if (/(tip|recomenda|ahorro|consejo)/.test(lower)) {
        if (hasReceipt && hasAppliances) {
          geminiResponse = 'Ya tienes todo registrado. Ve a la pantalla "Recomendaciones" para obtener consejos personalizados basados en tus datos.';
        } else {
          geminiResponse = 'Para darte recomendaciones personalizadas, primero necesito que completes el registro de tu recibo y electrodomésticos.';
        }
      } else if (/(cómo|como|ayuda|qué|que)/.test(lower)) {
        let helpText = 'Puedo ayudarte con:\n\n';
        if (!hasReceipt) helpText += '• Cómo subir tu recibo\n';
        if (!hasAppliances) helpText += '• Cómo registrar electrodomésticos\n';
        if (hasReceipt && hasAppliances) {
          helpText = 'Ya completaste el registro. Ahora puedes ver recomendaciones personalizadas en la pantalla "Recomendaciones".';
        } else {
          helpText += '\n¿Con cuál te ayudo?';
        }
        geminiResponse = helpText;
      } else {
        geminiResponse = 'Estoy aquí para ayudarte con el registro de tu recibo y electrodomésticos. ¿Qué necesitas saber?';
      }
    }
    
    return {
      id: Date.now().toString(),
      text: geminiResponse,
      isBot: true,
      timestamp: new Date()
    };
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



  const getProgressMessage = (): string => {
    if (hasReceipt && hasAppliances) {
      return 'Registro completo';
    }
    if (hasReceipt) return 'Recibo listo';
    if (hasAppliances) return 'Electrodomésticos listos';
    return 'Asistente de Registro';
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-4 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-xl z-50 hover:scale-110 transition-transform duration-300 group"
      >
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-slate-900" />
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
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-white/70" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-orange-500 rounded-full border-2 border-slate-800" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-base">
              Asistente de Registro
            </h3>
            <p className="text-white/50 text-xs flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {getProgressMessage()}
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
      <div className="flex-1 overflow-y-auto p-4 space-y-3 relative scrollbar-hide" style={{ maxHeight: 'calc(100vh - 280px)', minHeight: '200px' }}>
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-fadeIn`}>
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
        {/* Estado del registro con diseño mejorado */}
        <div className="flex gap-2 text-xs">
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
            hasReceipt 
              ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
              : 'bg-white/5 border border-white/10 text-white/50'
          }`}>
            <FileText className="w-3.5 h-3.5" />
            <span className="font-medium text-xs">Recibo</span>
            {hasReceipt && <CheckCircle2 className="w-3 h-3 text-white/60" />}
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
            hasAppliances 
              ? 'bg-white/10 border border-white/20 text-white/80' 
              : 'bg-white/5 border border-white/10 text-white/50'
          }`}>
            <Camera className="w-3.5 h-3.5" />
            <span className="font-medium text-xs">Aparatos</span>
            {hasAppliances && <CheckCircle2 className="w-3 h-3 text-white/60" />}
          </div>
        </div>
        
        {/* Sugerencias rápidas mejoradas */}
        {!hasReceipt || !hasAppliances ? (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {!hasReceipt && (
              <button
                onClick={() => setInputValue('¿Cómo subir mi recibo?')}
                className="flex-shrink-0 bg-white/10 hover:bg-white/15 border border-white/20 text-white/80 hover:text-white text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                ¿Cómo subir recibo?
              </button>
            )}
            {!hasAppliances && (
              <button
                onClick={() => setInputValue('¿Cómo registrar electrodomésticos?')}
                className="flex-shrink-0 bg-white/10 hover:bg-white/15 border border-white/20 text-white/80 hover:text-white text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                ¿Cómo registrar aparatos?
              </button>
            )}
            <button
              onClick={() => setInputValue('¿Qué información necesito?')}
              className="flex-shrink-0 bg-white/10 hover:bg-white/15 border border-white/20 text-white/80 hover:text-white text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5" />
              ¿Qué necesito?
            </button>
          </div>
        ) : null}
        
        <div className="flex items-center gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasReceipt && hasAppliances ? "¡Registro completo! ¿Alguna pregunta?" : "Pregúntame lo que necesites..."}
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-40 transition-all"
            aria-label="Mensaje para el asistente"
            disabled={isLoading}
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

export default DataAssistant;
