import React, { useState, useEffect } from 'react';
import { Zap, Home, TrendingUp, Bell, BookOpen, Settings, User, LogOut, FileText, Menu } from 'lucide-react';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import Recommendations from './components/Recommendations';
import Education from './components/Education';
import Notifications from './components/Notifications';
import ReceiptAnalysis from './components/ReceiptAnalysis';
import MobileLayout from './components/MobileLayout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Simulate checking for existing session
  useEffect(() => {
    const savedUser = localStorage.getItem('ahorrapp_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('ahorrapp_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('ahorrapp_user');
    setCurrentView('dashboard');
  };

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'recommendations', label: 'Recomendaciones', icon: TrendingUp },
    { id: 'receipt', label: 'Análisis Recibo', icon: FileText },
    { id: 'notifications', label: 'Alertas', icon: Bell },
    { id: 'education', label: 'Educación', icon: BookOpen },
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'recommendations':
        return <Recommendations user={user} />;
      case 'receipt':
        return <ReceiptAnalysis user={user} />;
      case 'notifications':
        return <Notifications user={user} />;
      case 'education':
        return <Education />;
      default:
        return <Dashboard user={user} />;
    }
  };

  const header = (
    <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-400 to-green-400 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
            </div>
            <h1 className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              AhorrApp
            </h1>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="hidden sm:flex items-center gap-2 text-white/80">
              <User className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="font-medium text-sm lg:text-base">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white"
            >
              <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  const sidebar = (
    <nav className="p-4">
      <ul className="space-y-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <li key={item.id}>
              <button
                onClick={() => {
                  setCurrentView(item.id);
                  if (isMobile) setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-gradient-to-r from-blue-500/20 to-green-500/20 border border-blue-400/30 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <MobileLayout
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebar={sidebar}
        header={header}
      >
        {renderCurrentView()}
      </MobileLayout>
    </div>
  );
}

export default App;