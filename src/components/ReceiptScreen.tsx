import React, { useState } from 'react';
import { formatCurrency } from '../utils/currency';
import { FileText, TrendingUp, TrendingDown, Info, ArrowLeft, CheckCircle, Upload } from 'lucide-react';
import type { Screen } from '../App';
import ImageUploader from './ImageUploader';

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
  const [isAnalyzing] = useState(false);
  // Estado para mostrar banner de éxito inmediatamente después de procesar
  const [justProcessed, setJustProcessed] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);

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
            
            <div className="mt-4">
            <ImageUploader 
              type="receipt"
              onProcessed={(data) => {
                // Crear objeto de recibo a partir de datos de Gemini
                const newReceipt: Receipt = {
                  id: Date.now().toString(),
                  period: data.periodo || 'Periodo no identificado',
                  consumption: parseFloat(data.kWh) || 0,
                  amount: parseFloat(data.costo) || 0,
                  dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 días después
                  previousConsumption: (parseFloat(data.kWh) || 0) * 0.9 // Simulamos un consumo anterior para comparación
                };
                onReceiptUpload(newReceipt);
                setJustProcessed(true);
                setTimeout(() => setJustProcessed(false), 6000);
              }}
              onError={(error) => {
                console.error("Error en análisis de recibo:", error);
                alert(error);
              }}
            />
          </div>
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
            {justProcessed && (
              <div className="mb-5 flex items-start gap-3 bg-green-500/15 border border-green-400/30 rounded-xl p-4 animate-fade-in">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-green-300 font-medium">¡Recibo procesado con éxito!</p>
                  <p className="text-white/70 mt-1">Hemos extraído los datos clave y generado conclusiones iniciales basadas en tu consumo.</p>
                </div>
              </div>
            )}
            
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
                  <span className="text-white text-xl font-bold">{formatCurrency(receipt.amount, { decimals: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Conclusiones de la IA (mock) */}
            {(() => {
              const conclusions: string[] = [];
              conclusions.push(
                `El consumo del período (${receipt.period}) es de ${receipt.consumption} kWh` +
                (receipt.previousConsumption ? ` (${receipt.consumption > receipt.previousConsumption ? '↑' : '↓'} ${Math.abs(receipt.consumption - receipt.previousConsumption)} kWh vs mes anterior).` : '.')
              );
              conclusions.push(
                `El monto estimado a pagar es ${formatCurrency(receipt.amount)} con vencimiento el ${new Date(receipt.dueDate).toLocaleDateString('es-ES')}.`
              );
              if (receipt.previousConsumption) {
                if (receipt.consumption > receipt.previousConsumption) {
                  conclusions.push('Se detecta un incremento de consumo que podría relacionarse con mayor uso de climatización o electrodomésticos de alto consumo.');
                } else if (receipt.consumption < receipt.previousConsumption) {
                  conclusions.push('Lograste reducir tu consumo respecto al mes anterior, sigue aplicando buenas prácticas.');
                }
              }
              conclusions.push('Recomendación rápida: identifica aparatos que permanecen en modo espera y desconéctalos cuando no se usen.');
              conclusions.push('Considera revisar el horario de uso de equipos de alto consumo para desplazar parte de la demanda a horas de menor tarifa.');
              return (
                <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-5">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Conclusiones del Análisis
                  </h4>
                  <ul className="list-disc pl-5 space-y-2">
                    {conclusions.map((c, i) => (
                      <li key={i} className="text-white/80 text-sm leading-relaxed">{c}</li>
                    ))}
                  </ul>
                </div>
              );
            })()}
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
          <div className="w-full bg-white/10 border border-white/20 text-white font-medium py-3 rounded-xl">
            <h4 className="text-center mb-2 flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              Subir Nuevo Recibo
            </h4>
            <div className="px-2">
              <ImageUploader 
                type="receipt"
                onProcessed={(data) => {
                  // Crear objeto de recibo a partir de datos de Gemini
                  const newReceipt: Receipt = {
                    id: Date.now().toString(),
                    period: data.periodo || 'Periodo no identificado',
                    consumption: parseFloat(data.kWh) || 0,
                    amount: parseFloat(data.costo) || 0,
                    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    previousConsumption: (parseFloat(data.kWh) || 0) * 0.9
                  };
                  onReceiptUpload(newReceipt);
                  setJustProcessed(true);
                  setTimeout(() => setJustProcessed(false), 6000);
                }}
                onError={(error) => {
                  console.error("Error en análisis de recibo:", error);
                  alert(error);
                }}
              />
            </div>
          </div>
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