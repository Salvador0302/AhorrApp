import { useState, useEffect } from 'react';
// Ajuste: no existe logo.svg, usamos logo.jpg
import logoImg from './assets/logo.jpg';
import { Home, FileText, Plug, Lightbulb, CreditCard, BarChart3 } from 'lucide-react';
import AuthScreen from './components/AuthScreen';
import HomeScreen from './components/HomeScreen';
import ReceiptScreen from './components/ReceiptScreen';
import AppliancesScreen from './components/AppliancesScreen';
import RecommendationsScreen from './components/RecommendationsScreen';
import PaymentScreen from './components/PaymentScreen';
import HistoryScreen from './components/HistoryScreen';
import DataAssistant from './components/DataAssistant';
import AdvisorAssistant from './components/AdvisorAssistant';
import { 
  getLatestReceipt, 
  getAllAppliances, 
  saveReceipt as saveReceiptToDB, 
  saveAppliance as saveApplianceToDB, 
  updateAppliance as updateApplianceInDB,
  deleteAppliance as deleteApplianceFromDB
} from './services/database';export type Screen = 'home' | 'receipt' | 'appliances' | 'recommendations' | 'payment' | 'history';

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

  // Load data from database on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('ahorrapp_user');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    
    // Cargar desde la base de datos
    const latestReceipt = getLatestReceipt();
    const allAppliances = getAllAppliances();
    
    if (latestReceipt) {
      // Convertir ReceiptRecord a Receipt
      setReceipt({
        id: latestReceipt.id,
        period: latestReceipt.period,
        consumption: latestReceipt.consumption,
        amount: latestReceipt.amount,
        dueDate: latestReceipt.dueDate,
        previousConsumption: latestReceipt.previousConsumption,
        image: latestReceipt.image
      });
    }
    
    if (allAppliances.length > 0) {
      // Convertir ApplianceRecord[] a Appliance[]
      setAppliances(allAppliances.map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        consumption: a.consumption,
        hoursPerDay: a.hoursPerDay,
        image: a.image,
        detected: a.detected
      })));
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
    // Guardar en la base de datos
    saveReceiptToDB({
      id: receiptData.id,
      period: receiptData.period,
      consumption: receiptData.consumption,
      amount: receiptData.amount,
      dueDate: receiptData.dueDate,
      previousConsumption: receiptData.previousConsumption,
      image: receiptData.image
    });
  };

  const handleApplianceAdd = (appliance: Appliance) => {
    const newAppliances = [...appliances, appliance];
    setAppliances(newAppliances);
    // Guardar en la base de datos
    saveApplianceToDB({
      id: appliance.id,
      name: appliance.name,
      type: appliance.type,
      consumption: appliance.consumption,
      hoursPerDay: appliance.hoursPerDay,
      image: appliance.image,
      detected: appliance.detected
    });
  };

  const handleApplianceUpdate = (id: string, updates: Partial<Appliance>) => {
    const updatedAppliances = appliances.map(app => 
      app.id === id ? { ...app, ...updates } : app
    );
    setAppliances(updatedAppliances);
    // Actualizar en la base de datos
    updateApplianceInDB(id, updates);
  };

  const handleApplianceDelete = (id: string) => {
    const updatedAppliances = appliances.filter(app => app.id !== id);
    setAppliances(updatedAppliances);
    // Eliminar de la base de datos
    deleteApplianceFromDB(id);
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
        return <AppliancesScreen appliances={appliances} onApplianceAdd={handleApplianceAdd} onApplianceUpdate={handleApplianceUpdate} onApplianceDelete={handleApplianceDelete} onNavigate={setCurrentScreen} />;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-lg border-b border-white/5 px-4 sm:px-6 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden ring-1 ring-white/10">
              <img src={logoImg} alt="AhorrApp" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-base sm:text-lg font-semibold text-white tracking-tight">
              AhorrApp
            </h1>
          </div>
          
          <button
            onClick={handleLogout}
            className="text-white/60 hover:text-white text-sm font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 sm:pb-24">
        {renderScreen()}
      </main>

      {/* Assistant - Muestra DataAssistant o AdvisorAssistant según el contexto */}
      {showAssistant && (
        <>
          {/* Mostrar DataAssistant si no hay datos completos */}
          {(!receipt || appliances.length === 0) && (
            <DataAssistant 
              currentScreen={currentScreen}
              onNavigate={setCurrentScreen}
              onClose={() => setShowAssistant(false)}
              hasReceipt={!!receipt}
              hasAppliances={appliances.length > 0}
            />
          )}
          
          {/* Mostrar AdvisorAssistant si ya hay datos completos */}
          {receipt && appliances.length > 0 && (
            <AdvisorAssistant 
              currentScreen={currentScreen}
              onNavigate={setCurrentScreen}
              onClose={() => setShowAssistant(false)}
            />
          )}
        </>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/5 px-2 sm:px-4 py-2 safe-area-inset-bottom">
        <div className="flex justify-around max-w-2xl mx-auto">
          {[
            { id: 'home', label: 'Inicio', icon: Home },
            { id: 'receipt', label: 'Recibo', icon: FileText },
            { id: 'appliances', label: 'Aparatos', icon: Plug },
            { id: 'recommendations', label: 'Tips', icon: Lightbulb },
            { id: 'payment', label: 'Pagar', icon: CreditCard },
            { id: 'history', label: 'Historial', icon: BarChart3 }
          ].map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id as Screen)}
                className={`flex flex-col items-center gap-1 py-2 px-2 sm:px-3 rounded-lg transition-all min-w-[60px] ${
                  currentScreen === item.id
                    ? 'text-white'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                <IconComponent className={`w-5 h-5 ${currentScreen === item.id ? 'text-white' : 'text-white/40'}`} />
                <span className="text-[10px] sm:text-xs font-normal leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Assistant Toggle Button - Cambia de icono según el asistente activo */}
      {!showAssistant && (
        <button
          onClick={() => setShowAssistant(true)}
          className={`fixed bottom-20 sm:bottom-24 right-4 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-xl z-30 transition-transform hover:scale-110 active:scale-95 bg-slate-800 hover:bg-slate-700 border border-white/10`}
        >
          {receipt && appliances.length > 0 ? (
            <Lightbulb className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          ) : (
            <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          )}
        </button>
      )}
    </div>
  );
}

export default App; 