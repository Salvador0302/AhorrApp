import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Camera, 
  FileText, 
  Zap, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Loader,
  X,
  Eye
} from 'lucide-react';

interface ReceiptAnalysisProps {
  user: any;
}

interface AnalysisResult {
  consumption: number;
  cost: number;
  period: string;
  tariff: string;
  peakHours: string;
  comparison: {
    previousMonth: number;
    average: number;
  };
  recommendations: string[];
  alerts: string[];
  efficiency: number;
}

const ReceiptAnalysis: React.FC<ReceiptAnalysisProps> = ({ user }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      analyzeReceipt(file);
    }
  };

  const analyzeReceipt = async (file: File) => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis with realistic data
    setTimeout(() => {
      const mockAnalysis: AnalysisResult = {
        consumption: 450.5,
        cost: 1125.80,
        period: 'Marzo 2024',
        tariff: 'Tarifa 1C - Residencial',
        peakHours: '18:00 - 22:00',
        comparison: {
          previousMonth: -12.3,
          average: 8.7
        },
        recommendations: [
          'Tu consumo aumentó 8.7% respecto al promedio. Considera revisar el uso del aire acondicionado.',
          'Detectamos picos de consumo entre 6-10 PM. Programa electrodomésticos en horarios de tarifa baja.',
          'El costo por kWh es $2.50. Puedes ahorrar $45/mes optimizando horarios de uso.',
          'Tu refrigerador representa el 35% del consumo total. Revisa su eficiencia.'
        ],
        alerts: [
          'Consumo 15% superior al mes anterior',
          'Tarifa pico aplicada en 40% del consumo'
        ],
        efficiency: 72
      };
      
      setAnalysisResult(mockAnalysis);
      setIsAnalyzing(false);
    }, 3000);
  };

  const clearAnalysis = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setShowPreview(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-md rounded-2xl border border-indigo-400/20 p-4 lg:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-white">Análisis de Recibo</h2>
            <p className="text-white/70 text-sm lg:text-base">Sube tu recibo de luz para obtener insights personalizados</p>
          </div>
        </div>
        
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-white/80 font-medium text-sm">IA Avanzada</span>
          </div>
          <p className="text-white/70 text-sm">
            Nuestra IA analiza automáticamente tu recibo para extraer datos de consumo, 
            costos y generar recomendaciones personalizadas de ahorro.
          </p>
        </div>
      </div>

      {/* Upload Section */}
      {!uploadedFile && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Subir Recibo de Luz</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-white/30 rounded-xl hover:border-blue-400/50 hover:bg-blue-500/10 transition-all"
            >
              <Upload className="w-8 h-8 text-blue-400" />
              <div className="text-center">
                <p className="text-white font-medium">Subir desde Galería</p>
                <p className="text-white/60 text-sm">JPG, PNG hasta 10MB</p>
              </div>
            </button>
            
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-white/30 rounded-xl hover:border-green-400/50 hover:bg-green-500/10 transition-all"
            >
              <Camera className="w-8 h-8 text-green-400" />
              <div className="text-center">
                <p className="text-white font-medium">Tomar Foto</p>
                <p className="text-white/60 text-sm">Usa la cámara</p>
              </div>
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-medium text-sm mb-1">Tips para mejores resultados:</p>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>• Asegúrate de que el recibo esté bien iluminado</li>
                  <li>• Evita sombras y reflejos</li>
                  <li>• Incluye toda la información del recibo</li>
                  <li>• La imagen debe estar enfocada y legible</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis in Progress */}
      {isAnalyzing && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-center flex-col gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
              <Loader className="w-8 h-8 text-white animate-spin" />
            </div>
            <div className="text-center">
              <h3 className="text-white font-semibold text-lg mb-2">Analizando tu recibo...</h3>
              <p className="text-white/70">Nuestra IA está procesando la información</p>
            </div>
            <div className="w-full max-w-xs bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full animate-pulse" style={{ width: '70%' }} />
            </div>
          </div>
        </div>
      )}

      {/* Preview and Analysis Results */}
      {uploadedFile && !isAnalyzing && (
        <div className="space-y-6">
          {/* Image Preview */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">Recibo Subido</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreview(true)}
                  className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg text-blue-400 transition-all"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={clearAnalysis}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-lg text-red-400 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-white font-medium">{uploadedFile.name}</p>
                  <p className="text-white/60 text-sm">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-400 ml-auto" />
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          {analysisResult && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-blue-400/30 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="w-6 h-6 text-blue-400" />
                    <span className="text-white/80 font-medium text-sm">Consumo</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{analysisResult.consumption}</p>
                  <p className="text-white/60 text-sm">kWh en {analysisResult.period}</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-green-400/30 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-6 h-6 text-green-400" />
                    <span className="text-white/80 font-medium text-sm">Costo Total</span>
                  </div>
                  <p className="text-2xl font-bold text-white">${analysisResult.cost}</p>
                  <p className="text-white/60 text-sm">{analysisResult.tariff}</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-orange-400/30 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-6 h-6 text-orange-400" />
                    <span className="text-white/80 font-medium text-sm">vs Anterior</span>
                  </div>
                  <p className={`text-2xl font-bold ${analysisResult.comparison.previousMonth > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {analysisResult.comparison.previousMonth > 0 ? '+' : ''}{analysisResult.comparison.previousMonth}%
                  </p>
                  <p className="text-white/60 text-sm">mes anterior</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-purple-400/30 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-6 h-6 text-purple-400" />
                    <span className="text-white/80 font-medium text-sm">Eficiencia</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{analysisResult.efficiency}%</p>
                  <p className="text-white/60 text-sm">puntuación</p>
                </div>
              </div>

              {/* Alerts */}
              {analysisResult.alerts.length > 0 && (
                <div className="bg-red-500/10 backdrop-blur-md rounded-2xl border border-red-400/30 p-6">
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    Alertas Detectadas
                  </h3>
                  <div className="space-y-3">
                    {analysisResult.alerts.map((alert, index) => (
                      <div key={index} className="flex items-start gap-3 bg-white/5 rounded-lg p-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-white/90 text-sm">{alert}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-green-400" />
                  Recomendaciones Personalizadas
                </h3>
                <div className="space-y-4">
                  {analysisResult.recommendations.map((recommendation, index) => (
                    <div key={index} className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-400/20 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-green-400 font-bold text-sm">{index + 1}</span>
                        </div>
                        <p className="text-white/90 text-sm leading-relaxed">{recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <h3 className="text-white font-semibold text-lg mb-4">Detalles del Análisis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span className="text-white/80 font-medium text-sm">Período de Facturación</span>
                    </div>
                    <p className="text-white">{analysisResult.period}</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-white/80 font-medium text-sm">Horario Pico</span>
                    </div>
                    <p className="text-white">{analysisResult.peakHours}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Image Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">Vista Previa del Recibo</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={previewUrl}
              alt="Recibo de luz"
              className="w-full h-auto rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptAnalysis;