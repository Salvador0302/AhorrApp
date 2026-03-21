import React, { useState, useRef } from 'react';
import { formatCurrency } from '../utils/currency';
import { Camera, Plus, CreditCard as Edit3, ArrowLeft, Zap } from 'lucide-react';
import type { Screen } from '../App';

interface Appliance {
  id: string;
  name: string;
  type: string;
  consumption: number;
  hoursPerDay: number;
  image?: string;
  detected: boolean;
}

interface AppliancesScreenProps {
  appliances: Appliance[];
  onApplianceAdd: (appliance: Appliance) => void;
  onApplianceUpdate: (id: string, updates: Partial<Appliance>) => void;
  onNavigate: (screen: Screen) => void;
}

const AppliancesScreen: React.FC<AppliancesScreenProps> = ({ 
  appliances, 
  onApplianceAdd, 
  onApplianceUpdate, 
  onNavigate 
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ consumption: 0, hoursPerDay: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const commonAppliances = [
    { name: 'Refrigerador', type: 'cooling', consumption: 150, icon: '❄️' },
    { name: 'Aire Acondicionado', type: 'cooling', consumption: 2000, icon: '🌬️' },
    { name: 'Lavadora', type: 'cleaning', consumption: 500, icon: '👕' },
    { name: 'Televisor', type: 'entertainment', consumption: 100, icon: '📺' },
    { name: 'Microondas', type: 'cooking', consumption: 800, icon: '🍽️' },
    { name: 'Plancha', type: 'cleaning', consumption: 1000, icon: '👔' },
    { name: 'Ventilador', type: 'cooling', consumption: 75, icon: '🌀' },
    { name: 'Computadora', type: 'electronics', consumption: 200, icon: '💻' },
    { name: 'Cocina a Electrica', type: 'cooking', consumption: 4500, icon: '🔥' },
    { name: 'Licuadora', type: 'cooking', consumption: 300, icon: '🥤' },
    { name: 'Ducha Eléctrica', type: 'heating', consumption: 5500, icon: '🚿' },
    { name: 'Arrocera', type: 'cooking', consumption: 400, icon: '🍚' },
    { name: 'Cargadores', type: 'electronics', consumption: 20, icon: '🔌' }
  ];

  const handleImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsDetecting(true);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setTimeout(() => {
          // Simulate AI detection
          const randomAppliance = commonAppliances[Math.floor(Math.random() * commonAppliances.length)];
          const detectedAppliance: Appliance = {
            id: Date.now().toString(),
            name: randomAppliance.name,
            type: randomAppliance.type,
            consumption: randomAppliance.consumption,
            hoursPerDay: Math.floor(Math.random() * 12) + 2,
            image: e.target?.result as string,
            detected: true
          };
          
          onApplianceAdd(detectedAppliance);
          setIsDetecting(false);
        }, 2500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualAdd = (appliance: typeof commonAppliances[0]) => {
    const newAppliance: Appliance = {
      id: Date.now().toString(),
      name: appliance.name,
      type: appliance.type,
      consumption: appliance.consumption,
      hoursPerDay: 8,
      detected: false
    };
    onApplianceAdd(newAppliance);
  };

  const handleEdit = (appliance: Appliance) => {
    setEditingAppliance(appliance.id);
    setEditForm({
      consumption: appliance.consumption,
      hoursPerDay: appliance.hoursPerDay
    });
  };

  const handleSaveEdit = () => {
    if (editingAppliance) {
      onApplianceUpdate(editingAppliance, editForm);
      setEditingAppliance(null);
    }
  };

  const getApplianceIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      cooling: '❄️',
      cleaning: '🧽',
      entertainment: '📺',
      cooking: '🍽️',
      electronics: '💻'
    };
    return icons[type] || '⚡';
  };

  const totalDailyConsumption = appliances.reduce((sum, app) => sum + (app.consumption * app.hoursPerDay / 1000), 0);
  const estimatedMonthlyCost = totalDailyConsumption * 30 * 0.15;

  if (isDetecting) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">Detectando electrodoméstico...</h3>
          <p className="text-white/70 text-sm mb-4">La IA está analizando la imagen</p>
          <div className="w-48 bg-white/10 rounded-full h-2 mx-auto">
            <div className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('home')}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="text-xl font-bold text-white">Mis Electrodomésticos</h2>
      </div>

      {/* Summary */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{appliances.length}</p>
            <p className="text-white/70 text-sm">Aparatos registrados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{formatCurrency(Number(estimatedMonthlyCost.toFixed(0)), { decimals: 0 })}</p>
            <p className="text-white/70 text-sm">Costo estimado/mes</p>
          </div>
        </div>
      </div>

      {/* Add Appliance Options */}
      <div className="space-y-4">
        <h3 className="text-white font-semibold">Agregar Electrodoméstico</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold py-4 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all flex flex-col items-center gap-2"
          >
            <Camera className="w-6 h-6" />
            <span className="text-sm">Detectar con IA</span>
          </button>
          
          <button
            onClick={() => {/* Show manual selection */}}
            className="bg-white/10 border border-white/20 text-white font-semibold py-4 rounded-xl hover:bg-white/20 transition-all flex flex-col items-center gap-2"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm">Agregar Manual</span>
          </button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageCapture}
          className="hidden"
        />
      </div>

      {/* Common Appliances */}
      <div className="space-y-3">
        <h4 className="text-white/80 font-medium">Electrodomésticos Comunes</h4>
        <div className="grid grid-cols-2 gap-2">
          {commonAppliances.map((appliance, index) => (
            <button
              key={index}
              onClick={() => handleManualAdd(appliance)}
              className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-all text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{appliance.icon}</span>
                <div>
                  <p className="text-white text-sm font-medium">{appliance.name}</p>
                  <p className="text-white/60 text-xs">{appliance.consumption}W</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Registered Appliances */}
      {appliances.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-white font-semibold">Tus Electrodomésticos</h3>
          
          {appliances.map((appliance) => (
            <div key={appliance.id} className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 p-4">
              <div className="flex items-start gap-3">
                {appliance.image ? (
                  <img 
                    src={appliance.image} 
                    alt={appliance.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-lg">{getApplianceIcon(appliance.type)}</span>
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{appliance.name}</h4>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(appliance)}
                        className="p-1 rounded bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-blue-400" />
                      </button>
                    </div>
                  </div>
                  
                  {editingAppliance === appliance.id ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-white/70 text-xs">Consumo (W)</label>
                          <input
                            type="number"
                            value={editForm.consumption}
                            onChange={(e) => setEditForm({...editForm, consumption: Number(e.target.value)})}
                            className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-white/70 text-xs">Horas/día</label>
                          <input
                            type="number"
                            value={editForm.hoursPerDay}
                            onChange={(e) => setEditForm({...editForm, hoursPerDay: Number(e.target.value)})}
                            className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingAppliance(null)}
                          className="px-3 py-1 bg-white/10 text-white/70 rounded text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-white/60">Consumo</p>
                        <p className="text-white font-medium">{appliance.consumption}W</p>
                      </div>
                      <div>
                        <p className="text-white/60">Uso diario</p>
                        <p className="text-white font-medium">{appliance.hoursPerDay}h</p>
                      </div>
                      <div>
                        <p className="text-white/60">Costo/día</p>
                        <p className="text-white font-medium">
                          {formatCurrency((appliance.consumption * appliance.hoursPerDay * 0.15) / 1000)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {appliance.detected && (
                    <div className="mt-2 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-400" />
                      <span className="text-yellow-400 text-xs">Detectado por IA</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppliancesScreen;