import { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, FileText, Camera, Send, Zap } from 'lucide-react';
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
    let welcomeText = '👋 ¡Hola! Soy tu Asistente Virtual de AhorrApp.\n\n';
    
    if (!hasReceipt && !hasAppliances) {
      welcomeText += '📋 Para comenzar a optimizar tu consumo energético, necesito que:\n\n';
      welcomeText += '1️⃣ Subas tu recibo de luz (ve a la pantalla "Recibo")\n';
      welcomeText += '2️⃣ Registres tus electrodomésticos (ve a la pantalla "Aparatos")\n\n';
      welcomeText += '💬 Mientras tanto, puedes preguntarme sobre:\n';
      welcomeText += '• ¿Cómo subir mi recibo?\n';
      welcomeText += '• ¿Cómo registrar electrodomésticos?\n';
      welcomeText += '• ¿Qué información necesito?\n';
      welcomeText += '• Tips generales de ahorro\n\n';
      welcomeText += '¿En qué te puedo ayudar?';
    } else if (!hasReceipt) {
      welcomeText += '✅ Ya registraste tus electrodomésticos.\n\n';
      welcomeText += '📄 Ahora necesito que subas tu recibo de luz para completar tu perfil.\n\n';
      welcomeText += 'Ve a la pantalla "Recibo" para tomar una foto de tu factura.\n\n';
      welcomeText += '¿Tienes alguna pregunta?';
    } else if (!hasAppliances) {
      welcomeText += '✅ Ya subiste tu recibo de luz.\n\n';
      welcomeText += '🔌 Ahora necesito que registres tus electrodomésticos.\n\n';
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
        Eres el Asistente Virtual de AhorrApp. Tu función es ayudar a los usuarios a:
        1. Subir y registrar su recibo de luz
        2. Registrar sus electrodomésticos (manualmente o con cámara)
        
        Contexto actual:
        - Usuario ha subido recibo: ${hasReceipt ? 'Sí ✅' : 'No ❌'}
        - Usuario ha registrado electrodomésticos: ${hasAppliances ? 'Sí ✅' : 'No ❌'}
        
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
          ? '✅ Ya tienes un recibo registrado. Si quieres subir uno nuevo, ve a la pantalla "Recibo".'
          : '📄 Para registrar tu recibo, ve a la pantalla "Recibo" y toma una foto de tu factura.';
      } else if (/(aparat|electro|dispositivo)/.test(lower)) {
        geminiResponse = hasAppliances
          ? '✅ Ya tienes electrodomésticos registrados. Puedes agregar más o editarlos en la pantalla "Aparatos".'
          : '🔌 Para registrar electrodomésticos, ve a la pantalla "Aparatos". Puedes usar la cámara o agregarlos manualmente.';
      } else if (/(tip|recomenda|ahorro|consejo)/.test(lower)) {
        if (hasReceipt && hasAppliances) {
          geminiResponse = '🎉 ¡Genial! Ya tienes todo registrado. Ve a la pantalla "Recomendaciones" para obtener consejos personalizados basados en tus datos.';
        } else {
          geminiResponse = '💡 Para darte recomendaciones personalizadas, primero necesito que completes el registro de tu recibo y electrodomésticos.';
        }
      } else if (/(cómo|como|ayuda|qué|que)/.test(lower)) {
        let helpText = '📋 Puedo ayudarte con:\n\n';
        if (!hasReceipt) helpText += '• Cómo subir tu recibo\n';
        if (!hasAppliances) helpText += '• Cómo registrar electrodomésticos\n';
        if (hasReceipt && hasAppliances) {
          helpText = '✅ Ya completaste el registro. Ahora puedes ver recomendaciones personalizadas en la pantalla "Recomendaciones".';
        } else {
          helpText += '\n¿Con cuál te ayudo?';
        }
        geminiResponse = helpText;
      } else {
        geminiResponse = '💬 Estoy aquí para ayudarte con el registro de tu recibo y electrodomésticos. ¿Qué necesitas saber?';
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
        className="fixed bottom-6 right-4 w-14 h-14 bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl z-50 hover:scale-110 transition-transform duration-300 group"
        style={{
          boxShadow: '0 0 30px rgba(59, 130, 246, 0.4), 0 0 60px rgba(6, 182, 212, 0.2)'
        }}
      >
        <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full border-2 border-black animate-pulse" />
      </button>
    );
  }

  return (
    <div 
      className="fixed bottom-6 right-4 left-4 md:left-auto md:w-[420px] bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-cyan-900/85 backdrop-blur-xl rounded-3xl border border-blue-500/30 shadow-2xl z-50 flex flex-col overflow-hidden"
      style={{
        boxShadow: '0 0 40px rgba(59, 130, 246, 0.3), 0 0 80px rgba(6, 182, 212, 0.1), 0 20px 60px rgba(0, 0, 0, 0.5)',
        maxHeight: 'calc(100vh - 96px)' // Asegura que nunca sea más alto que la ventana y deje espacio para UI del navegador
      }}
    >
      {/* Efecto de brillo animado en el borde */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent animate-pulse" />
      </div>

      {/* Header mejorado */}
  <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm relative z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <span className="text-white text-lg">📋</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-orange-400 rounded-full border-2 border-gray-900 animate-pulse" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base bg-gradient-to-r from-blue-200 via-cyan-200 to-teal-200 bg-clip-text text-transparent">
              Asistente de Registro
            </h3>
            <p className="text-white/60 text-xs flex items-center gap-1">
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
  <div className="flex-1 overflow-y-auto p-4 space-y-4 relative" style={{ maxHeight: 'calc(100vh - 280px)', minHeight: '200px' }}>
        {/* Fondo con patrón sutil */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />
        
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-fadeIn`}>
            <div 
              className={`max-w-[85%] p-4 rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                message.isBot 
                  ? 'bg-gradient-to-br from-blue-600/30 via-cyan-600/20 to-teal-600/30 border border-blue-400/40 backdrop-blur-sm' 
                  : 'bg-gradient-to-br from-white/15 to-white/5 border border-white/20 backdrop-blur-sm'
              }`}
              style={message.isBot ? {
                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              } : {
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
              <span className="text-white/40 text-xs mt-2 block">
                {message.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area mejorado */}
      <div className="p-4 border-t border-white/10 bg-gradient-to-b from-transparent to-black/30 backdrop-blur-sm space-y-3 relative z-10">
        {/* Estado del registro con diseño mejorado */}
        <div className="flex gap-2 text-xs">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
            hasReceipt 
              ? 'bg-gradient-to-r from-green-600/30 to-emerald-600/30 border border-green-400/40 text-green-300 shadow-lg' 
              : 'bg-white/5 border border-white/10 text-white/50'
          }`}>
            <FileText className="w-3.5 h-3.5" />
            <span className="font-medium">Recibo {hasReceipt && '✓'}</span>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
            hasAppliances 
              ? 'bg-gradient-to-r from-green-600/30 to-emerald-600/30 border border-green-400/40 text-green-300 shadow-lg' 
              : 'bg-white/5 border border-white/10 text-white/50'
          }`}>
            <Camera className="w-3.5 h-3.5" />
            <span className="font-medium">Aparatos {hasAppliances && '✓'}</span>
          </div>
        </div>
        
        {/* Sugerencias rápidas mejoradas */}
        {!hasReceipt || !hasAppliances ? (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {!hasReceipt && (
              <button
                onClick={() => setInputValue('¿Cómo subir mi recibo?')}
                className="flex-shrink-0 bg-gradient-to-r from-blue-600/30 to-cyan-600/30 hover:from-blue-600/50 hover:to-cyan-600/50 border border-blue-400/30 text-white/80 hover:text-white text-xs px-3 py-2 rounded-full transition-all duration-300 flex items-center gap-1.5 shadow-lg hover:scale-105"
              >
                📄 ¿Cómo subir recibo?
              </button>
            )}
            {!hasAppliances && (
              <button
                onClick={() => setInputValue('¿Cómo registrar electrodomésticos?')}
                className="flex-shrink-0 bg-gradient-to-r from-cyan-600/30 to-teal-600/30 hover:from-cyan-600/50 hover:to-teal-600/50 border border-cyan-400/30 text-white/80 hover:text-white text-xs px-3 py-2 rounded-full transition-all duration-300 flex items-center gap-1.5 shadow-lg hover:scale-105"
              >
                🔌 ¿Cómo registrar aparatos?
              </button>
            )}
            <button
              onClick={() => setInputValue('¿Qué información necesito?')}
              className="flex-shrink-0 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 hover:to-purple-600/50 border border-indigo-400/30 text-white/80 hover:text-white text-xs px-3 py-2 rounded-full transition-all duration-300 flex items-center gap-1.5 shadow-lg hover:scale-105"
            >
              ℹ️ ¿Qué necesito?
            </button>
          </div>
        ) : null}
        
        <div className="flex items-center gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasReceipt && hasAppliances ? "¡Registro completo! ¿Alguna pregunta?" : "Pregúntame lo que necesites..."}
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:bg-white/15 disabled:opacity-40"
            aria-label="Mensaje para el asistente"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:scale-105 flex items-center gap-2"
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
