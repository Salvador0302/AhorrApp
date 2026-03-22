// Mock de servicios de Gemini para desarrollo
// Utiliza este archivo mientras configuras correctamente la API key

// Función para convertir archivo a base64
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Extraer la parte base64 del resultado
      const base64String = reader.result as string;
      // Si es un data URL, extraer solo la parte base64
      const base64Match = base64String.match(/;base64,(.*)$/);
      resolve(base64Match ? base64Match[1] : base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Función simulada para consultar imágenes
export async function queryImage(
  imageBase64: string, 
  mimeType: string, 
  promptText: string
): Promise<{ rawText: string; jsonData: any | null }> {
  console.log("Simulando análisis de imagen...", { mimeType, promptLength: promptText.length });
  
  // Simular tiempo de procesamiento
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Datos simulados según el tipo de consulta
  let jsonData = null;
  
  if (promptText.includes("recibo")) {
    jsonData = {
      periodo: "Octubre 2025",
      kWh: "245",
      costo: "156.80"
    };
  } else if (promptText.includes("etiqueta") || promptText.includes("electrodoméstico")) {
    jsonData = {
      potenciaW: "1200",
      modelo: "FridgeMaster Pro",
      estimacion_kWh_mes: "36",
      costo_mensual_soles: "24.50"
    };
  }
  
  return { 
    rawText: `He analizado la imagen y he encontrado: ${JSON.stringify(jsonData, null, 2)}`, 
    jsonData 
  };
}

// Función simulada para consultar múltiples imágenes juntas
export async function queryMultipleImages(
  images: Array<{ base64: string; mimeType: string }>,
  promptText: string
): Promise<string> {
  console.log("Simulando análisis de múltiples imágenes...", { 
    imageCount: images.length,
    promptLength: promptText.length 
  });
  
  // Simular tiempo de procesamiento
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  return "He analizado todas las imágenes proporcionadas. En la primera imagen veo un recibo de electricidad. " +
         "En la segunda imagen veo la etiqueta de un electrodoméstico. Basado en estos datos, " +
         "puedo estimar que tu consumo mensual es de aproximadamente 245 kWh con un costo de S/156.80.";
}

// Función simulada para chatear con Gemini
export async function chatWithGemini(message: string): Promise<string> {
  console.log("Simulando chat con Gemini...", { messageLength: message.length });
  
  // Simular tiempo de procesamiento
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Respuestas simples basadas en palabras clave
  const lower = message.toLowerCase();
  
  if (lower.includes("recibo") || lower.includes("factura")) {
    return "📄 Para analizar tu recibo de luz, dirígete a la sección 'Recibo' y toma una foto clara donde se vea el consumo en kWh y el monto a pagar. Intentaré extraer toda la información importante para ti.";
  }
  
  if (lower.includes("electrodoméstico") || lower.includes("aparato") || lower.includes("dispositivo")) {
    return "🔌 Para registrar un electrodoméstico, ve a la sección 'Aparatos' y toma una foto de la etiqueta energética o placa de características donde aparezca la potencia (W). Esto me ayudará a calcular su consumo estimado.";
  }
  
  if (lower.includes("ahorro") || lower.includes("consejo") || lower.includes("tip")) {
    return "💡 Para ahorrar energía, considera: 1) Apagar los aparatos en stand-by, 2) Utilizar electrodomésticos de alta eficiencia, 3) Aprovechar la luz natural, 4) Usar iluminación LED. ¿Quieres que te explique alguno en particular?";
  }
  
  if (lower.includes("pago") || lower.includes("pagar")) {
    return "💳 El módulo de pago es una simulación. Puedes acceder a él desde la sección 'Pago' y ver cómo funcionaría en un entorno real. Recuerda que aplicamos un descuento del 10% para tu próxima factura.";
  }
  
  // Respuesta por defecto
  return "👋 Soy el asistente virtual de AhorraPE. Puedo ayudarte con información sobre tu consumo eléctrico, análisis de recibos, registro de electrodomésticos y consejos para ahorrar energía. ¿En qué puedo ayudarte hoy?";
} 