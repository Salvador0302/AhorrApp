import { chatWithGemini } from './geminiService';
import {
  buildKnowledgeBase,
  generateContextForAI,
  queryKnowledgeBase
} from './knowledgeBase';
import { getLatestReceipt, getAllAppliances } from './database';

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
 * Obtiene los datos actuales del usuario desde la base de datos
 */
function getUserData(): { receipt: Receipt | null; appliances: Appliance[] } {
  const receiptRecord = getLatestReceipt();
  const applianceRecords = getAllAppliances();

  const receipt = receiptRecord ? {
    id: receiptRecord.id,
    period: receiptRecord.period,
    consumption: receiptRecord.consumption,
    amount: receiptRecord.amount,
    dueDate: receiptRecord.dueDate,
    previousConsumption: receiptRecord.previousConsumption,
    image: receiptRecord.image
  } : null;

  const appliances: Appliance[] = applianceRecords.map(record => ({
    id: record.id,
    name: record.name,
    type: record.type,
    consumption: record.consumption,
    hoursPerDay: record.hoursPerDay,
    image: record.image,
    detected: record.detected
  }));

  return { receipt, appliances };
}

/**
 * Servicio especializado para el AdvisorAssistant
 * Genera recomendaciones e interactúa basándose en datos completos
 * Utiliza una base de conocimientos estructurada para respuestas precisas
 */

export async function generatePersonalizedRecommendation(
  userQuestion?: string
): Promise<string> {
  // Obtener datos actuales del usuario desde la base de datos
  const { receipt, appliances } = getUserData();
  
  // Construir base de conocimientos estructurada
  const kb = buildKnowledgeBase(receipt, appliances);
  const contextText = generateContextForAI(kb);

  // Intentar respuesta rápida desde la base de conocimientos
  if (userQuestion) {
    const quickAnswer = queryKnowledgeBase(kb, userQuestion);
    if (quickAnswer) {
      // Si encontramos una respuesta directa, complementamos con Gemini para hacerla más conversacional
      const enhancePrompt = `
Eres el Asistente de Recomendaciones de AhorraPE. 
Información: "${quickAnswer}"
Pregunta del usuario: "${userQuestion}"

Reformula la información de manera amigable y conversacional (máximo 3 frases).
Usa emojis relevantes. Si es apropiado, añade un consejo relacionado breve.
`;
      try {
        return await chatWithGemini(enhancePrompt);
      } catch (error) {
        return `📊 ${quickAnswer}`;
      }
    }
  }

  const prompt = userQuestion
    ? `
Eres el Asistente de Recomendaciones de AhorraPE, un experto en optimización de consumo energético.
Tienes acceso a una base de conocimientos completa sobre el usuario:

${contextText}

El usuario pregunta: "${userQuestion}"

INSTRUCCIONES:
- Responde de forma personalizada usando DATOS ESPECÍFICOS de la base de conocimientos
- Menciona números exactos (kWh, costos, electrodomésticos específicos)
- Sé conversacional, amigable y usa emojis relevantes
- Da consejos específicos y accionables
- Si preguntan algo fuera de ahorro energético, redirige amablemente
- Máximo 5 frases
- Si el usuario pide cálculos o comparaciones, hazlos con los datos disponibles
- Si no hay datos suficientes para responder, indícalo claramente

EJEMPLOS DE BUEN USO DE LA BASE DE CONOCIMIENTOS:
- "Tu Refrigerador consume 135 kWh/mes ($20.25), es tu mayor consumidor"
- "Comparando con el mes anterior, tu consumo aumentó 15 kWh (7.5%)"
- "Si reduces el uso de tu Aire Acondicionado de 10h a 6h diarias, ahorrarías $18/mes"
`
    : `
Eres el Asistente de Recomendaciones de AhorraPE.

${contextText}

Genera UNA recomendación personalizada (máximo 3 frases) usando datos ESPECÍFICOS de la base de conocimientos.
Menciona electrodomésticos, consumos o patrones concretos detectados.
Usa emojis relevantes y sé específico con números.

EJEMPLO: "💡 Tu Aire Acondicionado (2000W, 10h/día) consume $90/mes. Reducir su uso a 6h diarias te ahorraría $36/mes."
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
export async function generateQuickTips(): Promise<string[]> {
  // Obtener datos actuales del usuario desde la base de datos
  const { receipt, appliances } = getUserData();
  
  const kb = buildKnowledgeBase(receipt, appliances);
  const contextText = generateContextForAI(kb);

  const prompt = `
${contextText}

TAREA: Genera EXACTAMENTE 3 tips específicos y accionables para ahorrar energía.

REQUISITOS:
- Cada tip debe ser UNA frase concisa
- Usa DATOS ESPECÍFICOS de la base de conocimientos (nombres de electrodomésticos, consumos, costos)
- Incluye un emoji relevante al inicio
- Sé específico con números cuando sea posible

Responde SOLO en formato JSON:
{
  "tips": ["emoji tip 1", "emoji tip 2", "emoji tip 3"]
}

EJEMPLO:
{
  "tips": [
    "🌬️ Reduce tu Aire Acondicionado de 10h a 6h diarias para ahorrar $36/mes",
    "❄️ Tu Refrigerador consume $20/mes, verifica que el sello esté en buen estado",
    "💡 Desconecta tu Televisor en standby para ahorrar $8/mes"
  ]
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
    
    if (lines.length > 0) return lines;
    
    // Fallback inteligente basado en la base de conocimientos
    const fallbackTips = [];
    
    if (kb.appliances.highestConsumer) {
      fallbackTips.push(
        `💰 Tu ${kb.appliances.highestConsumer.name} es el mayor consumidor ($${kb.appliances.highestConsumer.cost.toFixed(2)}/mes)`
      );
    }
    
    if (kb.receipt.consumptionChange?.direction === 'increase') {
      fallbackTips.push(
        `📈 Tu consumo aumentó ${kb.receipt.consumptionChange.difference} kWh, revisa qué cambió`
      );
    } else {
      fallbackTips.push('💡 Desconecta dispositivos en modo standby');
    }
    
    const highUsageAppliance = kb.appliances.list.find(a => a.hoursPerDay > 10);
    if (highUsageAppliance) {
      fallbackTips.push(
        `⏰ ${highUsageAppliance.name} se usa ${highUsageAppliance.hoursPerDay}h/día, considera reducir su uso`
      );
    } else {
      fallbackTips.push('🌙 Usa temporizadores para optimizar horarios de uso');
    }
    
    return fallbackTips.slice(0, 3);
  } catch (error) {
    console.error('Error al generar tips:', error);
    
    // Fallback final con base de conocimientos
    if (kb.appliances.highestConsumer) {
      return [
        `💰 Tu ${kb.appliances.highestConsumer.name} consume más ($${kb.appliances.highestConsumer.cost.toFixed(2)}/mes)`,
        '💡 Desconecta dispositivos en standby',
        '❄️ Mantén el refrigerador entre 3-5°C'
      ];
    }
    
    return [
      '💡 Desconecta dispositivos en modo standby',
      '🌙 Usa temporizadores para cargar dispositivos de noche',
      '❄️ Mantén el refrigerador entre 3-5°C'
    ];
  }
}

/**
 * Analiza el consumo y genera un reporte detallado
 */
export async function analyzeConsumption(): Promise<string> {
  // Obtener datos actuales del usuario desde la base de datos
  const { receipt, appliances } = getUserData();
  
  const kb = buildKnowledgeBase(receipt, appliances);

  if (!receipt) {
    if (appliances.length > 0) {
      return `📊 Aún no tienes un recibo registrado, pero basándome en tus ${kb.appliances.total} electrodomésticos, tu consumo mensual estimado es de ${kb.appliances.totalMonthlyConsumption.toFixed(2)} kWh (≈$${kb.appliances.estimatedMonthlyCost.toFixed(2)}/mes). Tu mayor consumidor es ${kb.appliances.highestConsumer?.name || 'desconocido'}. Sube tu recibo para un análisis más preciso.`;
    }
    return '📊 Aún no tienes un recibo registrado ni electrodomésticos. Sube tu recibo y registra tus aparatos para obtener un análisis completo.';
  }

  const contextText = generateContextForAI(kb);

  const prompt = `
${contextText}

TAREA: Como experto en energía, analiza el consumo del usuario de forma detallada y profesional.

INSTRUCCIONES:
- Compara el consumo real del recibo con el estimado de los electrodomésticos
- Si hay consumo anterior, analiza la tendencia (aumento/disminución)
- Identifica el electrodoméstico con mayor impacto
- Da un consejo específico y accionable
- Usa datos numéricos exactos de la base de conocimientos
- Máximo 5 frases
- Usa emojis relevantes

ESTRUCTURA SUGERIDA:
1. Consumo actual y comparación con mes anterior (si existe)
2. Relación entre consumo real y estimado
3. Mayor consumidor y su impacto
4. Observación clave
5. Consejo accionable
`;

  try {
    const response = await chatWithGemini(prompt);
    return response;
  } catch (error) {
    console.error('Error al analizar consumo:', error);
    
    // Fallback con base de conocimientos
    let analysis = `📊 Análisis de tu consumo:\n\n`;
    analysis += `Tu consumo actual es ${receipt.consumption} kWh`;
    
    if (receipt.previousConsumption) {
      const change = kb.receipt.consumptionChange!;
      analysis += `, ${change.direction === 'increase' ? 'aumentó' : 'disminuyó'} ${change.difference} kWh (${change.percentage.toFixed(1)}%) vs el mes anterior`;
    }
    analysis += `. `;
    
    if (appliances.length > 0) {
      analysis += `El consumo estimado de tus ${appliances.length} electrodomésticos es ${kb.appliances.totalMonthlyConsumption.toFixed(2)} kWh/mes. `;
      
      if (kb.appliances.highestConsumer) {
        analysis += `Tu ${kb.appliances.highestConsumer.name} es el mayor consumidor con $${kb.appliances.highestConsumer.cost.toFixed(2)}/mes. `;
      }
    }
    
    analysis += `💡 Consejo: ${kb.insights.recommendations[0] || 'Revisa los dispositivos que permanecen en standby'}.`;
    
    return analysis;
  }
}
 