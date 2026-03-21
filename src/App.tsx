import React, { useState, useEffect } from 'react';
// Ajuste: no existe logo.svg, usamos logo.jpg
import logoImg from './assets/logo.jpg';
import AuthScreen from './components/AuthScreen';
import HomeScreen from './components/HomeScreen';
import ReceiptScreen from './components/ReceiptScreen';
import AppliancesScreen from './components/AppliancesScreen';
import RecommendationsScreen from './components/RecommendationsScreen';
import PaymentScreen from './components/PaymentScreen';
import HistoryScreen from './components/HistoryScreen';
import Assistant from './components/Assistant';

export type Screen = 'home' | 'receipt' | 'appliances' | 'recommendations' | 'payment' | 'history';

interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string;
}

interface Receipt {
  id: string;
  period: string;
  consumption: number;
  amount: number;
  dueDate: string;
  previousConsumption?: number;
  image?: string;
}

interface Appliance {
  id: string;
  name: string;
  type: string;
  consumption: number;
  hoursPerDay: number;
  image?: string;
  detected: boolean;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [user, setUser] = useState<User | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [showAssistant, setShowAssistant] = useState(true);

  // Simulate checking for existing session
  useEffect(() => {
    const savedUser = localStorage.getItem('ahorrapp_user');
    const savedReceipt = localStorage.getItem('ahorrapp_receipt');
    const savedAppliances = localStorage.getItem('ahorrapp_appliances');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    if (savedReceipt) {
      setReceipt(JSON.parse(savedReceipt));
    }
    if (savedAppliances) {
      setAppliances(JSON.parse(savedAppliances));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('ahorrapp_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('ahorrapp_user');
    localStorage.removeItem('ahorrapp_receipt');
    localStorage.removeItem('ahorrapp_appliances');
    setCurrentScreen('home');
    setReceipt(null);
    setAppliances([]);
  };

  const handleReceiptUpload = (receiptData: Receipt) => {
    setReceipt(receiptData);
    localStorage.setItem('ahorrapp_receipt', JSON.stringify(receiptData));
  };

  const handleApplianceAdd = (appliance: Appliance) => {
    const newAppliances = [...appliances, appliance];
    setAppliances(newAppliances);
    localStorage.setItem('ahorrapp_appliances', JSON.stringify(newAppliances));
  };

  const handleApplianceUpdate = (id: string, updates: Partial<Appliance>) => {
    const updatedAppliances = appliances.map(app => 
      app.id === id ? { ...app, ...updates } : app
    );
    setAppliances(updatedAppliances);
    localStorage.setItem('ahorrapp_appliances', JSON.stringify(updatedAppliances));
  };

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen user={user!} onNavigate={setCurrentScreen} receipt={receipt} appliances={appliances} />;
      case 'receipt':
        return <ReceiptScreen onReceiptUpload={handleReceiptUpload} receipt={receipt} onNavigate={setCurrentScreen} />;
      case 'appliances':
        return <AppliancesScreen appliances={appliances} onApplianceAdd={handleApplianceAdd} onApplianceUpdate={handleApplianceUpdate} onNavigate={setCurrentScreen} />;
      case 'recommendations':
        return <RecommendationsScreen receipt={receipt} appliances={appliances} onNavigate={setCurrentScreen} />;
      case 'payment':
        return <PaymentScreen receipt={receipt} onNavigate={setCurrentScreen} />;
      case 'history':
        return <HistoryScreen onNavigate={setCurrentScreen} />;
      default:
        return <HomeScreen user={user!} onNavigate={setCurrentScreen} receipt={receipt} appliances={appliances} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden">
              <img src={logoImg} alt="AhorrApp" className="w-8 h-8 object-cover" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              AhorrApp
            </h1>
          </div>
          
          <button
            onClick={handleLogout}
            className="text-white/70 hover:text-white text-sm"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {renderScreen()}
      </main>

      {/* Assistant */}
      {showAssistant && (
        <Assistant 
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
          onClose={() => setShowAssistant(false)}
          hasReceipt={!!receipt}
          hasAppliances={appliances.length > 0}
        />
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-md border-t border-white/10 px-4 py-2">
        <div className="flex justify-around">
          {[
            { id: 'home', label: 'Inicio', icon: '🏠' },
            { id: 'receipt', label: 'Recibo', icon: '📄' },
            { id: 'appliances', label: 'Aparatos', icon: '🔌' },
            { id: 'recommendations', label: 'Tips', icon: '💡' },
            { id: 'payment', label: 'Pagar', icon: '💳' },
            { id: 'history', label: 'Historial', icon: '📊' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id as Screen)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all ${
                currentScreen === item.id
                  ? 'bg-gradient-to-r from-blue-500/20 to-green-500/20 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Assistant Toggle Button */}
      <button
        onClick={() => setShowAssistant(true)}
        className="fixed bottom-24 right-4 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg z-30"
      >
        <span className="text-white text-xl">🤖</span>
      </button>
    </div>
  );
}

export default App;