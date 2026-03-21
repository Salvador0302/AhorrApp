import { chatWithGemini } from './geminiService';

export interface Receipt {
  id: string;
  period: string;
  consumption: number;
  amount: number;
  dueDate: string;
  previousConsumption?: number;
  image?: string;
}

export interface Appliance {
  id: string;
  name: string;
  type: string;
  consumption: number;
  hoursPerDay: number;
  image?: string;
  detected: boolean;
}

/**
 * Servicio especializado para el AdvisorAssistant
 * Genera recomendaciones e interactúa basándose en datos completos
 */

export async function generatePersonalizedRecommendation(
  receipt: Receipt | null,
  appliances: Appliance[],
  userQuestion?: string
): Promise<string> {
  // Construir contexto rico con todos los datos disponibles
  const appliancesSummary = appliances.length > 0
    ? appliances
        .map(
          (a) =>
            `- ${a.name} (${a.type}): ${a.consumption}W, usado ${a.hoursPerDay}h/día`
        )
        .join('\n')
    : 'No hay electrodomésticos registrados.';

  const consumptionInfo = receipt
    ? `Consumo actual: ${receipt.consumption} kWh, Monto a pagar: $${receipt.amount}, Periodo: ${receipt.period}`
    : 'No hay recibo registrado.';

  const previousInfo = receipt?.previousConsumption
    ? `Consumo anterior: ${receipt.previousConsumption} kWh (${receipt.consumption > receipt.previousConsumption ? 'aumentó' : 'disminuyó'} ${Math.abs(receipt.consumption - receipt.previousConsumption)} kWh)`
    : '';

  const prompt = userQuestion
    ? `
Eres el Asistente de Recomendaciones de AhorrApp, un experto en optimización de consumo energético.
Tienes acceso a la siguiente información del usuario:

RECIBO:
${consumptionInfo}
${previousInfo}

ELECTRODOMÉSTICOS:
${appliancesSummary}

El usuario pregunta: "${userQuestion}"

Responde de forma personalizada, usando la información específica del usuario.
- Sé conversacional, amigable y usa emojis relevantes
- Da consejos específicos basados en sus electrodomésticos y consumo
- Si preguntan algo que no está relacionado con ahorro energético, redirige amablemente
- Máximo 4 frases
- Si el usuario pide cálculos, hazlos con los datos disponibles
`
    : `
Eres el Asistente de Recomendaciones de AhorrApp.
Basándote en estos datos:

RECIBO:
${consumptionInfo}
${previousInfo}

ELECTRODOMÉSTICOS:
${appliancesSummary}

Genera UNA recomendación personalizada (máximo 3 frases) para que el usuario ahorre energía.
Sé específico y menciona electrodomésticos o patrones de consumo detectados.
Usa emojis relevantes.
`;

  try {
    const response = await chatWithGemini(prompt);
    return response;
  } catch (error) {
    console.error('Error al generar recomendación:', error);
    return '💡 Lo siento, tuve un problema al generar la recomendación. Por favor, intenta de nuevo.';
  }
}

/**
 * Genera múltiples tips rápidos basados en los datos del usuario
 */
export async function generateQuickTips(
  receipt: Receipt | null,
  appliances: Appliance[]
): Promise<string[]> {
  const appliancesSummary = appliances.length > 0
    ? appliances
        .map(
          (a) =>
            `${a.name} (${a.type}): ${a.consumption}W, ${a.hoursPerDay}h/día`
        )
        .join(', ')
    : 'Sin electrodomésticos';

  const consumptionInfo = receipt
    ? `${receipt.consumption} kWh, $${receipt.amount}`
    : 'Sin recibo';

  const prompt = `
Basándote en estos datos:
- Consumo: ${consumptionInfo}
- Electrodomésticos: ${appliancesSummary}

Genera EXACTAMENTE 3 tips cortos (máximo 1 frase cada uno) para ahorrar energía.
Responde en formato JSON así:
{
  "tips": ["tip 1", "tip 2", "tip 3"]
}
`;

  try {
    const response = await chatWithGemini(prompt);
    
    // Intentar extraer JSON
    const jsonMatch = response.match(/\{[\s\S]*"tips"[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.tips || [];
    }
    
    // Fallback: dividir por líneas
    const lines = response
      .split('\n')
      .filter((line) => line.trim() && !line.includes('{') && !line.includes('}'))
      .slice(0, 3);
    
    return lines.length > 0
      ? lines
      : [
          '💡 Desconecta dispositivos en modo standby',
          '🌙 Usa temporizadores para cargar dispositivos de noche',
          '❄️ Mantén el refrigerador entre 3-5°C'
        ];
  } catch (error) {
    console.error('Error al generar tips:', error);
    return [
      '💡 Desconecta dispositivos en modo standby',
      '🌙 Usa temporizadores para cargar dispositivos de noche',
      '❄️ Mantén el refrigerador entre 3-5°C'
    ];
  }
}

/**
 * Analiza el consumo y genera un reporte
 */
export async function analyzeConsumption(
  receipt: Receipt | null,
  appliances: Appliance[]
): Promise<string> {
  if (!receipt) {
    return '📊 Aún no tienes un recibo registrado. Sube uno para que pueda analizar tu consumo.';
  }

  const totalEstimatedConsumption = appliances.reduce(
    (acc, app) => acc + (app.consumption * app.hoursPerDay * 30) / 1000,
    0
  );

  const prompt = `
Como experto en energía, analiza brevemente (máximo 3 frases):
- Consumo real: ${receipt.consumption} kWh
- Consumo estimado de electrodomésticos: ${totalEstimatedConsumption.toFixed(2)} kWh
${receipt.previousConsumption ? `- Consumo anterior: ${receipt.previousConsumption} kWh` : ''}

Da un análisis objetivo y un consejo práctico. Usa emojis.
`;

  try {
    return await chatWithGemini(prompt);
  } catch (error) {
    console.error('Error al analizar consumo:', error);
    return `📊 Tu consumo es de ${receipt.consumption} kWh. El consumo estimado de tus electrodomésticos es ${totalEstimatedConsumption.toFixed(2)} kWh. Revisa los dispositivos que más consumen.`;
  }
}
