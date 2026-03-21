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
}

const DataAssistant: React.FC<DataAssistantProps> = ({ 
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
    // Mensaje de bienvenida conversacional
    let welcomeText = '👋 ¡Hola! Soy tu Asistente Virtual de AhorrApp.\n\n';
    
    if (!hasReceipt && !hasAppliances) {
      welcomeText += '� Para comenzar a optimizar tu consumo energético, necesito que:\n\n';
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
  }, [hasReceipt, hasAppliances]);

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
              <p className="text-white text-sm whitespace-pre-wrap">{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-white/10 space-y-2">
        {/* Estado del registro */}
        <div className="flex gap-2 text-xs">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
            hasReceipt ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60'
          }`}>
            <FileText className="w-3 h-3" />
            <span>Recibo {hasReceipt && '✓'}</span>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
            hasAppliances ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60'
          }`}>
            <Camera className="w-3 h-3" />
            <span>Aparatos {hasAppliances && '✓'}</span>
          </div>
        </div>
        
        {/* Sugerencias rápidas */}
        {!hasReceipt || !hasAppliances ? (
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {!hasReceipt && (
              <button
                onClick={() => setInputValue('¿Cómo subir mi recibo?')}
                className="flex-shrink-0 bg-white/5 hover:bg-white/10 text-white/70 text-xs px-2.5 py-1.5 rounded-full transition-all"
              >
                📄 ¿Cómo subir recibo?
              </button>
            )}
            {!hasAppliances && (
              <button
                onClick={() => setInputValue('¿Cómo registrar electrodomésticos?')}
                className="flex-shrink-0 bg-white/5 hover:bg-white/10 text-white/70 text-xs px-2.5 py-1.5 rounded-full transition-all"
              >
                🔌 ¿Cómo registrar aparatos?
              </button>
            )}
            <button
              onClick={() => setInputValue('¿Qué información necesito?')}
              className="flex-shrink-0 bg-white/5 hover:bg-white/10 text-white/70 text-xs px-2.5 py-1.5 rounded-full transition-all"
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
