import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Camera, FileText, Lightbulb, CreditCard, BarChart3 } from 'lucide-react';
import type { Screen } from '../App';

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
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-t border-white/10">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleActionClick('receipt')}
            className={`p-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 ${
              hasReceipt 
                ? 'bg-green-500/20 text-green-400 border border-green-400/30' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
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
          >
            <Camera className="w-4 h-4" />
            Aparatos
          </button>
          
          <button
            onClick={() => handleActionClick('recommendations')}
            className="p-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 bg-white/10 text-white/70 hover:bg-white/20"
          >
            <Lightbulb className="w-4 h-4" />
            Tips
          </button>
        </div>
      </div>
    </div>
  );
};

export default Assistant;