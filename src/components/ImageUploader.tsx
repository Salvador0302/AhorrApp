import React, { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { fileToBase64, queryImage } from '../services/geminiService';

interface ImageUploaderProps {
  type: 'receipt' | 'appliance';
  onProcessed: (data: any) => void;
  onError: (error: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ type, onProcessed, onError }) => {
  const [image, setImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        // Mostrar imagen seleccionada
        const reader = new FileReader();
        reader.onload = (event) => {
          setImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
        
        // Procesar con Gemini
        await processImage(file);
      } catch (error) {
        console.error("Error al procesar imagen:", error);
        onError("Error al procesar la imagen. Intenta de nuevo.");
      }
    }
  };

  const processImage = async (file: File) => {
    setProcessing(true);
    try {
      const base64Data = await fileToBase64(file);
      const mimeType = file.type;
      
      let prompt = '';
      if (type === 'receipt') {
        prompt = `Extrae del recibo: periodo, kWh facturados, costo total en S/. 
                  Devuélvelo SOLO en JSON EXACTO con llaves: {periodo, kWh, costo}. 
                  Sin texto adicional, sin explicaciones.`;
      } else {
        prompt = `Extrae de la etiqueta: potencia (W) y modelo. 
                  Devuélvelo SOLO en JSON EXACTO con llaves: {potenciaW, modelo, estimacion_kWh_mes, costo_mensual_soles}. 
                  Sin texto adicional.`;
      }
      
      const result = await queryImage(base64Data, mimeType, prompt);
      
      if (result.jsonData) {
        onProcessed(result.jsonData);
      } else {
        onError("No se pudo extraer información. Intenta con otra imagen o ajusta el ángulo.");
      }
    } catch (error) {
      console.error("Error en proceso de imagen:", error);
      onError("Error al procesar con IA. Intenta de nuevo más tarde.");
    } finally {
      setProcessing(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {!image ? (
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={triggerFileInput}
            className="w-full h-40 border-2 border-dashed border-white/30 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors"
            disabled={processing}
          >
            <Camera className="w-8 h-8 text-white/70" />
            <span className="text-white/70 text-sm font-medium">
              {type === 'receipt' ? 'Toma foto del recibo' : 'Captura etiqueta del aparato'}
            </span>
            <span className="text-white/50 text-xs">
              {type === 'receipt' ? 'Enfoca bien la sección de consumo' : 'Enfoca la etiqueta energética'}
            </span>
          </button>
          
          <button
            onClick={triggerFileInput}
            className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Subir desde galería</span>
          </button>
        </div>
      ) : (
        <div className="relative">
          <img 
            src={image} 
            alt="Imagen seleccionada" 
            className="w-full h-auto rounded-xl" 
          />
          
          {processing && (
            <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                <span className="text-white text-sm">Procesando con IA...</span>
              </div>
            </div>
          )}
          
          {!processing && (
            <button 
              onClick={clearImage}
              className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;