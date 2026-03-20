import React, { useState, useRef } from 'react';
import { Camera, Upload, FileText, TrendingUp, TrendingDown, Info, ArrowLeft } from 'lucide-react';
import type { Screen } from '../App';

interface Receipt {
  id: string;
  period: string;
  consumption: number;
  amount: number;
  dueDate: string;
  previousConsumption?: number;
  image?: string;
}

interface ReceiptScreenProps {
  onReceiptUpload: (receipt: Receipt) => void;
  receipt: Receipt | null;
  onNavigate: (screen: Screen) => void;
}

const ReceiptScreen: React.FC<ReceiptScreenProps> = ({ onReceiptUpload, receipt, onNavigate }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsAnalyzing(true);
      
      // Simulate image processing
      const reader = new FileReader();
      reader.onload = (e) => {
        setTimeout(() => {
          // Simulate AI analysis results
          const mockReceipt: Receipt = {
            id: Date.now().toString(),
            period: 'Noviembre 2024',
            consumption: Math.floor(Math.random() * 200) + 150,
            amount: Math.floor(Math.random() * 500) + 300,
            dueDate: '2024-12-15',
            previousConsumption: Math.floor(Math.random() * 180) + 140,
            image: e.target?.result as string
          };
          
          onReceiptUpload(mockReceipt);
          setIsAnalyzing(false);
        }, 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const glossaryTerms = [
    { term: 'kWh', definition: 'Kilowatt-hora: unidad que mide tu consumo de energía' },
    { term: 'Demanda', definition: 'Máxima potencia que usaste en el mes' },
    { term: 'Cargo Fijo', definition: 'Costo base que pagas sin importar tu consumo' },
    { term: 'Tarifa', definition: 'Precio por cada kWh que consumes' },
    { term: 'Factor de Potencia', definition: 'Eficiencia en el uso de la energía eléctrica' }
  ];

  if (isAnalyzing) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">Analizando tu recibo...</h3>
          <p className="text-white/70 text-sm mb-4">La IA está procesando la información</p>
          <div className="w-48 bg-white/10 rounded-full h-2 mx-auto">
            <div className="bg-gradient-to-r from-blue-400 to-green-400 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
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
        <h2 className="text-xl font-bold text-white">Análisis de Recibo</h2>
      </div>

      {!receipt ? (
        <>
          {/* Upload Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Sube tu recibo de luz</h3>
            <p className="text-white/70 text-sm mb-6">
              Toma una foto o selecciona una imagen de tu factura eléctrica
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold py-3 rounded-xl hover:from-blue-600 hover:to-green-600 transition-all flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Tomar Foto
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-white/10 border border-white/20 text-white font-semibold py-3 rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Subir desde Galería
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Info Section */}
          <div className="bg-blue-500/10 backdrop-blur-md rounded-xl border border-blue-400/20 p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-blue-400 font-medium mb-1">¿Qué información extraemos?</h4>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>• Consumo en kWh del período</li>
                  <li>• Monto total a pagar</li>
                  <li>• Comparación con mes anterior</li>
                  <li>• Fecha de vencimiento</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Receipt Analysis Results */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6">
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-400" />
              Resumen de tu Recibo
            </h3>
            
            {receipt.image && (
              <div className="mb-4">
                <img 
                  src={receipt.image} 
                  alt="Recibo de luz" 
                  className="w-full h-32 object-cover rounded-lg border border-white/20"
                />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white/60 text-xs mb-1">Período</p>
                <p className="text-white font-semibold">{receipt.period}</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white/60 text-xs mb-1">Vencimiento</p>
                <p className="text-white font-semibold">
                  {new Date(receipt.dueDate).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-400/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-400 font-medium">Consumo Total</span>
                  <span className="text-white text-xl font-bold">{receipt.consumption} kWh</span>
                </div>
                {receipt.previousConsumption && (
                  <div className="flex items-center gap-2">
                    {receipt.consumption > receipt.previousConsumption ? (
                      <TrendingUp className="w-4 h-4 text-red-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-green-400" />
                    )}
                    <span className={`text-sm ${
                      receipt.consumption > receipt.previousConsumption ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {Math.abs(receipt.consumption - receipt.previousConsumption)} kWh vs mes anterior
                    </span>
                  </div>
                )}
              </div>
              
              <div className="bg-green-500/10 rounded-lg p-4 border border-green-400/20">
                <div className="flex items-center justify-between">
                  <span className="text-green-400 font-medium">Monto a Pagar</span>
                  <span className="text-white text-xl font-bold">${receipt.amount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('payment')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all"
            >
              💳 Pagar Recibo
            </button>
            
            <button
              onClick={() => onNavigate('recommendations')}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-3 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all"
            >
              💡 Ver Tips
            </button>
          </div>

          {/* Upload New Receipt */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-white/10 border border-white/20 text-white font-medium py-3 rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Subir Nuevo Recibo
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
          />
        </>
      )}

      {/* Glossary */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 p-4">
        <button
          onClick={() => setShowGlossary(!showGlossary)}
          className="w-full flex items-center justify-between text-white font-medium"
        >
          <span className="flex items-center gap-2">
            <Info className="w-5 h-5 text-purple-400" />
            Glosario de Términos
          </span>
          <span className={`transform transition-transform ${showGlossary ? 'rotate-180' : ''}`}>
            ↓
          </span>
        </button>
        
        {showGlossary && (
          <div className="mt-4 space-y-3">
            {glossaryTerms.map((item, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-3">
                <h4 className="text-purple-400 font-medium text-sm">{item.term}</h4>
                <p className="text-white/70 text-xs mt-1">{item.definition}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptScreen;