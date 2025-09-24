import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  TrendingUp, 
  Zap, 
  CheckCircle, 
  X,
  Clock,
  DollarSign,
  Thermometer,
  Settings,
  BellRing,
  Filter
} from 'lucide-react';

interface NotificationsProps {
  user: any;
}

interface Notification {
  id: string;
  type: 'alert' | 'recommendation' | 'achievement' | 'system';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionRequired?: boolean;
  data?: any;
}

const Notifications: React.FC<NotificationsProps> = ({ user }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'alerts' | 'recommendations'>('all');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Generate sample notifications
  useEffect(() => {
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        type: 'alert',
        priority: 'high',
        title: 'Consumo Elevado Detectado',
        message: 'Tu consumo actual (3.8 kWh) está 45% por encima del promedio para esta hora.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 min ago
        isRead: false,
        actionRequired: true,
        data: { currentConsumption: 3.8, averageConsumption: 2.6, device: 'Aire Acondicionado' }
      },
      {
        id: '2',
        type: 'recommendation',
        priority: 'medium',
        title: 'Oportunidad de Ahorro',
        message: 'Las tarifas nocturnas están activas. Es el momento ideal para usar la lavadora.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: false,
        actionRequired: false,
        data: { savings: 2.50, timeWindow: '22:00 - 06:00' }
      },
      {
        id: '3',
        type: 'achievement',
        priority: 'low',
        title: '¡Meta Cumplida!',
        message: 'Has reducido tu consumo en 12% esta semana. ¡Excelente trabajo!',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        isRead: true,
        actionRequired: false,
        data: { reduction: 12, period: 'week' }
      },
      {
        id: '4',
        type: 'alert',
        priority: 'medium',
        title: 'Temperatura Alta',
        message: 'La temperatura exterior es de 35°C. Considera ajustar el termostato.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        isRead: false,
        actionRequired: false,
        data: { temperature: 35, suggestion: 'Aumentar temperatura AC a 24°C' }
      },
      {
        id: '5',
        type: 'system',
        priority: 'low',
        title: 'Actualización Disponible',
        message: 'Nueva versión de AhorrApp disponible con mejoras en predicciones.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        isRead: true,
        actionRequired: false,
        data: { version: '2.1.0' }
      },
      {
        id: '6',
        type: 'recommendation',
        priority: 'high',
        title: 'Dispositivo Ineficiente',
        message: 'Tu refrigerador está consumiendo 25% más de lo normal. Te recomendamos una revisión.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        isRead: false,
        actionRequired: true,
        data: { device: 'Refrigerador', excessConsumption: 25, estimatedCost: 15.30 }
      }
    ];

    setNotifications(sampleNotifications);
  }, []);

  // Simulate real-time notifications
  useEffect(() => {
    if (!notificationsEnabled) return;

    const interval = setInterval(() => {
      // Randomly add new notifications (10% chance every 30 seconds)
      if (Math.random() < 0.1) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: Math.random() > 0.5 ? 'alert' : 'recommendation',
          priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
          title: 'Nueva Detección IA',
          message: 'Hemos detectado un patrón inusual en tu consumo energético.',
          timestamp: new Date(),
          isRead: false,
          actionRequired: Math.random() > 0.6
        };

        setNotifications(prev => [newNotification, ...prev]);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [notificationsEnabled]);

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'alerts':
        return notification.type === 'alert';
      case 'recommendations':
        return notification.type === 'recommendation';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getNotificationIcon = (type: string, priority: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className={`w-5 h-5 ${priority === 'high' ? 'text-red-400' : 'text-yellow-400'}`} />;
      case 'recommendation':
        return <TrendingUp className="w-5 h-5 text-blue-400" />;
      case 'achievement':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'system':
        return <Settings className="w-5 h-5 text-gray-400" />;
      default:
        return <Bell className="w-5 h-5 text-white" />;
    }
  };

  const getPriorityStyles = (priority: string, isRead: boolean) => {
    if (isRead) {
      return 'bg-white/5 border-white/10';
    }
    
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 border-red-400/30 shadow-lg shadow-red-500/10';
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-400/30';
      case 'low':
        return 'bg-blue-500/10 border-blue-400/30';
      default:
        return 'bg-white/10 border-white/10';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `hace ${minutes} min`;
    } else if (hours < 24) {
      return `hace ${hours}h`;
    } else {
      return `hace ${days}d`;
    }
  };

  const filters = [
    { id: 'all', label: 'Todas', count: notifications.length },
    { id: 'unread', label: 'No Leídas', count: unreadCount },
    { id: 'alerts', label: 'Alertas', count: notifications.filter(n => n.type === 'alert').length },
    { id: 'recommendations', label: 'Recomendaciones', count: notifications.filter(n => n.type === 'recommendation').length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-md rounded-2xl border border-orange-400/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-xl flex items-center justify-center relative">
              <Bell className="w-6 h-6 text-white" />
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{unreadCount}</span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Notificaciones</h2>
              <p className="text-white/70">Alertas y recomendaciones personalizadas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`p-2 rounded-lg transition-all ${
                notificationsEnabled
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
              title={notificationsEnabled ? 'Desactivar notificaciones' : 'Activar notificaciones'}
            >
              <BellRing className="w-5 h-5" />
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg text-blue-400 font-medium transition-all"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-white/80 font-medium">Alertas Críticas</span>
            </div>
            <p className="text-2xl font-bold text-white">{highPriorityCount}</p>
            <p className="text-white/60 text-sm">requieren atención</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span className="text-white/80 font-medium">Recomendaciones</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {notifications.filter(n => n.type === 'recommendation' && !n.isRead).length}
            </p>
            <p className="text-white/60 text-sm">nuevas sugerencias</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-white/80 font-medium">Esta Semana</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {notifications.filter(n => {
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return n.timestamp > weekAgo;
              }).length}
            </p>
            <p className="text-white/60 text-sm">notificaciones</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map(filterOption => (
          <button
            key={filterOption.id}
            onClick={() => setFilter(filterOption.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
              filter === filterOption.id
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
            }`}
          >
            {filterOption.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              filter === filterOption.id
                ? 'bg-white/20 text-white'
                : 'bg-white/10 text-white/60'
            }`}>
              {filterOption.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No hay notificaciones
            </h3>
            <p className="text-white/60">
              {filter === 'unread' 
                ? 'Todas las notificaciones han sido leídas'
                : 'Cuando tengas nuevas alertas o recomendaciones aparecerán aquí'
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`backdrop-blur-md rounded-2xl border p-6 transition-all duration-200 hover:bg-white/15 ${
                getPriorityStyles(notification.priority, notification.isRead)
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  notification.priority === 'high' && !notification.isRead
                    ? 'bg-red-500/20 animate-pulse'
                    : notification.isRead
                      ? 'bg-white/10'
                      : 'bg-white/20'
                }`}>
                  {getNotificationIcon(notification.type, notification.priority)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-semibold ${
                      notification.isRead ? 'text-white/70' : 'text-white'
                    }`}>
                      {notification.title}
                      {!notification.isRead && (
                        <span className="inline-block w-2 h-2 bg-blue-400 rounded-full ml-2"></span>
                      )}
                    </h3>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-lg ${
                        notification.priority === 'high'
                          ? 'bg-red-500/20 text-red-400'
                          : notification.priority === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {notification.priority === 'high' ? 'Alta' : 
                         notification.priority === 'medium' ? 'Media' : 'Baja'}
                      </span>
                      <button
                        onClick={() => dismissNotification(notification.id)}
                        className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <X className="w-4 h-4 text-white/60" />
                      </button>
                    </div>
                  </div>
                  
                  <p className={`mb-3 ${
                    notification.isRead ? 'text-white/50' : 'text-white/80'
                  }`}>
                    {notification.message}
                  </p>
                  
                  {notification.data && (
                    <div className="bg-white/5 rounded-lg p-3 mb-3 space-y-1">
                      {notification.data.currentConsumption && (
                        <p className="text-white/70 text-sm">
                          <Zap className="w-4 h-4 inline mr-1" />
                          Consumo actual: {notification.data.currentConsumption} kWh
                        </p>
                      )}
                      {notification.data.savings && (
                        <p className="text-green-400 text-sm">
                          <DollarSign className="w-4 h-4 inline mr-1" />
                          Ahorro potencial: ${notification.data.savings}
                        </p>
                      )}
                      {notification.data.temperature && (
                        <p className="text-orange-400 text-sm">
                          <Thermometer className="w-4 h-4 inline mr-1" />
                          Temperatura: {notification.data.temperature}°C
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimestamp(notification.timestamp)}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      {notification.actionRequired && !notification.isRead && (
                        <button className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg text-blue-400 text-sm font-medium transition-all">
                          Ver Detalles
                        </button>
                      )}
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 hover:text-white text-sm font-medium transition-all"
                        >
                          Marcar como leída
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notification Settings */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-400" />
          Configuración de Notificaciones
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white/90 font-medium mb-3">Tipos de Alertas</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-500 bg-white/10 border-white/30 rounded focus:ring-blue-500"
                  defaultChecked
                />
                <span className="text-white/80">Consumo elevado</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-500 bg-white/10 border-white/30 rounded focus:ring-blue-500"
                  defaultChecked
                />
                <span className="text-white/80">Oportunidades de ahorro</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-500 bg-white/10 border-white/30 rounded focus:ring-blue-500"
                  defaultChecked
                />
                <span className="text-white/80">Mantenimiento de dispositivos</span>
              </label>
            </div>
          </div>
          
          <div>
            <h4 className="text-white/90 font-medium mb-3">Frecuencia</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="frequency"
                  className="w-4 h-4 text-blue-500 bg-white/10 border-white/30 focus:ring-blue-500"
                  defaultChecked
                />
                <span className="text-white/80">Tiempo real</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="frequency"
                  className="w-4 h-4 text-blue-500 bg-white/10 border-white/30 focus:ring-blue-500"
                />
                <span className="text-white/80">Cada hora</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="frequency"
                  className="w-4 h-4 text-blue-500 bg-white/10 border-white/30 focus:ring-blue-500"
                />
                <span className="text-white/80">Diariamente</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;