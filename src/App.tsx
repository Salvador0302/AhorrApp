import React, { useState, useEffect } from 'react';
import { Zap, Home, TrendingUp, Bell, BookOpen, Settings, User, LogOut } from 'lucide-react';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import Recommendations from './components/Recommendations';
import Education from './components/Education';
import Notifications from './components/Notifications';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState(null);

  // Simulate checking for existing session
  useEffect(() => {
    const savedUser = localStorage.getItem('ahorrapp_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
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
    { id: 'notifications', label: 'Alertas', icon: Bell },
    { id: 'education', label: 'Educación', icon: BookOpen },
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'recommendations':
        return <Recommendations user={user} />;
      case 'notifications':
        return <Notifications user={user} />;
      case 'education':
        return <Education />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-green-400 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                AhorrApp
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white/80">
                <User className="w-5 h-5" />
                <span className="font-medium">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-black/10 backdrop-blur-md min-h-[calc(100vh-80px)] border-r border-white/10">
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setCurrentView(item.id)}
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
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}

export default App;