import React, { useEffect, useState } from 'react';
import { formatCurrency } from '../utils/currency';
import { FileText, TrendingUp, TrendingDown, Info, ArrowLeft, CheckCircle, Upload } from 'lucide-react';
import type { Screen } from '../App';
import ImageUploader from './ImageUploader';
import {
  evaluateAndMintGreenTokens,
  getGreenTokenBalance,
  type GreenMintResult
} from '../services/greenTokenService';
import { getReceiptTrend } from '../services/database';

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
  const [greenMintResult, setGreenMintResult] = useState<GreenMintResult | null>(null);
  const [greenTokenBalance, setGreenTokenBalance] = useState(0);
  const [preferredNetwork, setPreferredNetwork] = useState<'Base' | 'Polygon'>('Base');
  const [receiptTrend, setReceiptTrend] = useState(() => getReceiptTrend(6));

  useEffect(() => {
    setGreenTokenBalance(getGreenTokenBalance());
    setReceiptTrend(getReceiptTrend(6));
  }, []);

  const parseNumber = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const normalized = Number(value.replace(',', '.').replace(/[^0-9.-]/g, ''));
      if (Number.isFinite(normalized)) return normalized;
    }
    return null;
  };

  const buildReceiptFromOCR = (data: Record<string, unknown>, currentReceipt: Receipt | null): Receipt => {
    const currentKWh = parseNumber(data.kWh) ?? 0;
    const previousFromOCR = parseNumber(data.kWh_anterior);
    const inferredPrevious = currentReceipt?.consumption;

    return {
      id: Date.now().toString(),
      period: String(data.periodo || 'Periodo no identificado'),
      consumption: currentKWh,
      amount: parseNumber(data.costo) ?? 0,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      previousConsumption: previousFromOCR ?? inferredPrevious,
      image: typeof data.imagen === 'string' ? data.imagen : undefined
    };
  };

  const processMint = (newReceipt: Receipt) => {
    const mint = evaluateAndMintGreenTokens({
      receiptId: newReceipt.id,
      currentKWh: newReceipt.consumption,
      previousKWh: newReceipt.previousConsumption,
      network: preferredNetwork
    });
    setGreenMintResult(mint);
    setGreenTokenBalance(getGreenTokenBalance());
    setReceiptTrend(getReceiptTrend(6));
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
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('home')}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="text-xl sm:text-2xl font-semibold text-white">Análisis de Recibo</h2>
      </div>

      {!receipt ? (
        <>
          {/* Upload Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg sm:text-xl mb-2">Sube tu recibo de luz</h3>
            <p className="text-white/60 text-sm sm:text-base mb-6 sm:mb-8">
              Toma una foto o selecciona una imagen de tu factura eléctrica
            </p>
            
            <div className="mt-4">
            <ImageUploader 
              type="receipt"
              onProcessed={(data) => {
                const newReceipt = buildReceiptFromOCR(data as Record<string, unknown>, receipt);
                onReceiptUpload(newReceipt);
                processMint(newReceipt);
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
          <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl border border-blue-500/20 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-blue-400 font-medium mb-2 text-sm sm:text-base">¿Qué información extraemos?</h4>
                <ul className="text-white/60 text-sm space-y-1.5">
                  <li>• Consumo en kWh del período</li>
                  <li>• Monto total a pagar</li>
                  <li>• Comparación con mes anterior</li>
                  <li>• Fecha de vencimiento</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/10 backdrop-blur-sm rounded-xl border border-emerald-400/25 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-emerald-300 font-medium mb-1 text-sm sm:text-base">Protocolo Green Tokens (L2)</h4>
                <p className="text-white/70 text-xs sm:text-sm">Si el OCR valida reduccion de kWh vs mes anterior, se ejecuta mint() de GTKN en Base o Polygon.</p>
              </div>
              <select
                value={preferredNetwork}
                onChange={(e) => setPreferredNetwork(e.target.value as 'Base' | 'Polygon')}
                className="bg-black/30 border border-emerald-300/30 rounded-lg px-2 py-1 text-xs text-white"
                aria-label="Red L2 preferida"
              >
                <option value="Base">Base</option>
                <option value="Polygon">Polygon</option>
              </select>
            </div>
            <p className="text-emerald-200 text-sm mt-2">Balance actual: <span className="font-semibold">{greenTokenBalance} GTKN</span></p>
          </div>

          {receiptTrend.length > 1 && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 sm:p-5">
              <h4 className="text-white font-medium mb-3 text-sm sm:text-base">Evolucion de consumo (%) vs meses previos</h4>
              <div className="space-y-2">
                {receiptTrend.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm bg-black/20 rounded-lg px-3 py-2">
                    <span className="text-white/80">{item.period}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white/70">{item.consumption} kWh</span>
                      <span className={`font-medium ${item.changeVsPreviousPercent === null ? 'text-white/50' : item.changeVsPreviousPercent <= 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {item.changeVsPreviousPercent === null ? 'Base' : `${item.changeVsPreviousPercent > 0 ? '+' : ''}${item.changeVsPreviousPercent}%`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/50 mt-2">Porcentaje calculado con respecto al recibo inmediatamente anterior: ((actual - previo) / previo) * 100.</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Receipt Analysis Results */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5 sm:p-6">
            <h3 className="text-white font-semibold text-lg sm:text-xl mb-4 sm:mb-5 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
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

            {greenMintResult && (
              <div className={`mb-5 flex items-start gap-3 rounded-xl p-4 border ${greenMintResult.eligible ? 'bg-emerald-500/15 border-emerald-400/30' : 'bg-amber-500/15 border-amber-400/30'}`}>
                <CheckCircle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${greenMintResult.eligible ? 'text-emerald-300' : 'text-amber-300'}`} />
                <div className="text-sm w-full">
                  {greenMintResult.eligible ? (
                    <>
                      <p className="text-emerald-200 font-medium">Mint de GTKN confirmado en {greenMintResult.network}</p>
                      <p className="text-white/80 mt-1">Reduccion validada: {greenMintResult.reductionKWh} kWh. Tokens emitidos: {greenMintResult.tokensMinted} GTKN.</p>
                      <p className="text-white/70 mt-1">Ahorro mensual estimado: {formatCurrency(greenMintResult.monthlySavingsSoles, { decimals: 2 })}</p>
                      {greenMintResult.txHash && (
                        <p className="text-[11px] text-white/60 mt-1 break-all">tx: {greenMintResult.txHash}</p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-amber-200 font-medium">Mint no ejecutado</p>
                      <p className="text-white/80 mt-1">{greenMintResult.reason}</p>
                    </>
                  )}
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
              className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium py-3 rounded-lg transition-all"
            >
              Pagar Recibo
            </button>
            
            <button
              onClick={() => onNavigate('recommendations')}
              className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium py-3 rounded-lg transition-all"
            >
              Ver Tips
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
                  const newReceipt = buildReceiptFromOCR(data as Record<string, unknown>, receipt);
                  onReceiptUpload(newReceipt);
                  processMint(newReceipt);
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

      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4">
        <h4 className="text-white font-medium mb-2">Utilidad de GTKN</h4>
        <p className="text-white/70 text-sm mb-2">B2C: canjea tokens por focos LED, merch o beneficios en el dashboard.</p>
        <p className="text-white/70 text-sm">B2B: empresas locales pueden comprar GTKN para compensar su huella de carbono con trazabilidad descentralizada.</p>
      </div>
    </div>
  );
};

export default ReceiptScreen; 