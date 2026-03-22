import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Smartphone } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

interface AuthScreenProps {
  onLogin: (user: { id: string; name: string; email: string; joinDate: string }) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate authentication
    const userData = {
      id: Date.now().toString(),
      name: isLogin ? 'Usuario Demo' : formData.name,
      email: formData.email,
      joinDate: new Date().toISOString()
    };
    
    onLogin(userData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm">
        {/* Logo and Title */}
        <div className="text-center mb-6 sm:mb-8">
          <img src={logoImg} alt="Logo AhorraPE" className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl mx-auto mb-4 shadow-lg border border-white/10" />
          <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-2 tracking-tight">
            AhorraPE
          </h1>
          <p className="text-white/60 text-sm sm:text-base">
            Optimiza tu consumo energético con IA
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 text-white/40">
            <Smartphone className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Versión Móvil</span>
          </div>
        </div>

        {/* Auth Form */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl">
          <div className="flex mb-6 bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 px-3 rounded-lg font-medium transition-all text-sm ${
                isLogin
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 px-3 rounded-lg font-medium transition-all text-sm ${
                !isLogin
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-white/90 font-medium mb-1 text-sm">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Tu nombre completo"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-white/90 font-medium mb-1 text-sm">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white/90 font-medium mb-1 text-sm">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-12 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>
          </form>

          {isLogin && (
            <div className="mt-4 text-center">
              <a href="#" className="text-blue-400 hover:text-blue-300 text-sm">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          )}
        </div>

        <div className="text-center mt-4 text-white/50 text-xs">
          Demo: Puedes usar cualquier email y contraseña para probar la aplicación
        </div>
      </div>
    </div>
  );
};

export default AuthScreen; 