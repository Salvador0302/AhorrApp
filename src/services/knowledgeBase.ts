/**
 * Servicio de Base de Conocimientos
 * Compila toda la metadata extraída del recibo y electrodomésticos
 * en un formato estructurado para que Gemini pueda responder preguntas
 */

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

export interface KnowledgeBase {
  receipt: {
    exists: boolean;
    period?: string;
    consumption?: number;
    amount?: number;
    dueDate?: string;
    previousConsumption?: number;
    consumptionChange?: {
      difference: number;
      percentage: number;
      direction: 'increase' | 'decrease' | 'same';
    };
  };
  appliances: {
    total: number;
    list: Array<{
      name: string;
      type: string;
      consumption: number;
      hoursPerDay: number;
      dailyConsumption: number;
      monthlyConsumption: number;
      monthlyCost: number;
      detected: boolean;
    }>;
    byType: Record<string, number>;
    totalDailyConsumption: number;
    totalMonthlyConsumption: number;
    estimatedMonthlyCost: number;
    highestConsumer?: {
      name: string;
      consumption: number;
      cost: number;
    };
  };
  insights: {
    hasCompleteData: boolean;
    consumptionTrend?: 'up' | 'down' | 'stable';
    potentialSavings: number;
    recommendations: string[];
  };
}

/**
 * Genera la base de conocimientos completa
 */
export function buildKnowledgeBase(
  receipt: Receipt | null,
  appliances: Appliance[]
): KnowledgeBase {
  const kwhRate = 0.15; // Tarifa promedio por kWh

  // Procesar información del recibo
  const receiptData: KnowledgeBase['receipt'] = {
    exists: !!receipt
  };

  if (receipt) {
    receiptData.period = receipt.period;
    receiptData.consumption = receipt.consumption;
    receiptData.amount = receipt.amount;
    receiptData.dueDate = receipt.dueDate;
    receiptData.previousConsumption = receipt.previousConsumption;

    if (receipt.previousConsumption) {
      const diff = receipt.consumption - receipt.previousConsumption;
      const percentage = (diff / receipt.previousConsumption) * 100;
      
      receiptData.consumptionChange = {
        difference: Math.abs(diff),
        percentage: Math.abs(percentage),
        direction: diff > 0 ? 'increase' : diff < 0 ? 'decrease' : 'same'
      };
    }
  }

  // Procesar electrodomésticos
  const appliancesList = appliances.map(app => {
    const dailyKwh = (app.consumption * app.hoursPerDay) / 1000;
    const monthlyKwh = dailyKwh * 30;
    const monthlyCost = monthlyKwh * kwhRate;

    return {
      name: app.name,
      type: app.type,
      consumption: app.consumption,
      hoursPerDay: app.hoursPerDay,
      dailyConsumption: dailyKwh,
      monthlyConsumption: monthlyKwh,
      monthlyCost: monthlyCost,
      detected: app.detected
    };
  });

  // Agrupar por tipo
  const byType: Record<string, number> = {};
  appliances.forEach(app => {
    byType[app.type] = (byType[app.type] || 0) + 1;
  });

  // Calcular totales
  const totalDailyConsumption = appliancesList.reduce(
    (sum, app) => sum + app.dailyConsumption,
    0
  );
  const totalMonthlyConsumption = totalDailyConsumption * 30;
  const estimatedMonthlyCost = totalMonthlyConsumption * kwhRate;

  // Encontrar mayor consumidor
  const highestConsumer = appliancesList.length > 0
    ? appliancesList.reduce((max, app) =>
        app.monthlyCost > max.monthlyCost ? app : max
      )
    : undefined;

  const appliancesData: KnowledgeBase['appliances'] = {
    total: appliances.length,
    list: appliancesList,
    byType,
    totalDailyConsumption,
    totalMonthlyConsumption,
    estimatedMonthlyCost,
    highestConsumer: highestConsumer
      ? {
          name: highestConsumer.name,
          consumption: highestConsumer.monthlyConsumption,
          cost: highestConsumer.monthlyCost
        }
      : undefined
  };

  // Generar insights
  const hasCompleteData = !!receipt && appliances.length > 0;
  let consumptionTrend: 'up' | 'down' | 'stable' | undefined;
  
  if (receipt?.previousConsumption) {
    const diff = receipt.consumption - receipt.previousConsumption;
    if (diff > 10) consumptionTrend = 'up';
    else if (diff < -10) consumptionTrend = 'down';
    else consumptionTrend = 'stable';
  }

  // Calcular ahorro potencial (estimado)
  const potentialSavings = Math.min(
    estimatedMonthlyCost * 0.2, // 20% del costo estimado
    receipt?.amount ? receipt.amount * 0.15 : 0 // 15% del recibo real
  );

  const recommendations: string[] = [];
  if (highestConsumer) {
    recommendations.push(
      `Tu ${highestConsumer.name} es el mayor consumidor con $${highestConsumer.monthlyCost.toFixed(2)}/mes`
    );
  }
  if (consumptionTrend === 'up') {
    recommendations.push('Tu consumo ha aumentado respecto al mes anterior');
  }
  if (appliancesList.some(a => a.hoursPerDay > 12)) {
    recommendations.push('Tienes electrodomésticos usados más de 12 horas al día');
  }

  const insights: KnowledgeBase['insights'] = {
    hasCompleteData,
    consumptionTrend,
    potentialSavings,
    recommendations
  };

  return {
    receipt: receiptData,
    appliances: appliancesData,
    insights
  };
}

/**
 * Genera un contexto textual detallado para Gemini
 */
export function generateContextForAI(kb: KnowledgeBase): string {
  let context = '=== BASE DE CONOCIMIENTOS DEL USUARIO ===\n\n';

  // Información del recibo
  if (kb.receipt.exists) {
    context += '📄 RECIBO DE LUZ:\n';
    context += `- Periodo: ${kb.receipt.period}\n`;
    context += `- Consumo actual: ${kb.receipt.consumption} kWh\n`;
    context += `- Monto a pagar: $${kb.receipt.amount}\n`;
    context += `- Fecha de vencimiento: ${kb.receipt.dueDate}\n`;
    
    if (kb.receipt.previousConsumption) {
      context += `- Consumo anterior: ${kb.receipt.previousConsumption} kWh\n`;
      const change = kb.receipt.consumptionChange!;
      context += `- Cambio: ${change.direction === 'increase' ? '↑' : '↓'} ${change.difference} kWh (${change.percentage.toFixed(1)}%)\n`;
    }
    context += '\n';
  } else {
    context += '📄 RECIBO: No registrado\n\n';
  }

  // Electrodomésticos
  if (kb.appliances.total > 0) {
    context += '🔌 ELECTRODOMÉSTICOS REGISTRADOS:\n';
    context += `Total: ${kb.appliances.total} aparatos\n\n`;

    kb.appliances.list.forEach((app, index) => {
      context += `${index + 1}. ${app.name} (${app.type}):\n`;
      context += `   - Potencia: ${app.consumption}W\n`;
      context += `   - Uso: ${app.hoursPerDay} horas/día\n`;
      context += `   - Consumo diario: ${app.dailyConsumption.toFixed(2)} kWh\n`;
      context += `   - Consumo mensual: ${app.monthlyConsumption.toFixed(2)} kWh\n`;
      context += `   - Costo mensual estimado: $${app.monthlyCost.toFixed(2)}\n`;
      context += `   - Detectado por IA: ${app.detected ? 'Sí' : 'No'}\n\n`;
    });

    context += '📊 RESUMEN DE CONSUMO:\n';
    context += `- Consumo diario total: ${kb.appliances.totalDailyConsumption.toFixed(2)} kWh\n`;
    context += `- Consumo mensual estimado: ${kb.appliances.totalMonthlyConsumption.toFixed(2)} kWh\n`;
    context += `- Costo mensual estimado: $${kb.appliances.estimatedMonthlyCost.toFixed(2)}\n`;

    if (kb.appliances.highestConsumer) {
      context += `- Mayor consumidor: ${kb.appliances.highestConsumer.name} ($${kb.appliances.highestConsumer.cost.toFixed(2)}/mes)\n`;
    }

    context += '\nElectrodomésticos por categoría:\n';
    Object.entries(kb.appliances.byType).forEach(([type, count]) => {
      context += `- ${type}: ${count}\n`;
    });
    context += '\n';
  } else {
    context += '🔌 ELECTRODOMÉSTICOS: Ninguno registrado\n\n';
  }

  // Insights
  context += '💡 ANÁLISIS E INSIGHTS:\n';
  context += `- Datos completos: ${kb.insights.hasCompleteData ? 'Sí' : 'No'}\n`;
  
  if (kb.insights.consumptionTrend) {
    const trendText = {
      up: 'Aumentando',
      down: 'Disminuyendo',
      stable: 'Estable'
    };
    context += `- Tendencia de consumo: ${trendText[kb.insights.consumptionTrend]}\n`;
  }
  
  context += `- Ahorro potencial estimado: $${kb.insights.potentialSavings.toFixed(2)}/mes\n`;

  if (kb.insights.recommendations.length > 0) {
    context += '\nObservaciones clave:\n';
    kb.insights.recommendations.forEach(rec => {
      context += `- ${rec}\n`;
    });
  }

  context += '\n=== FIN DE LA BASE DE CONOCIMIENTOS ===\n';

  return context;
}

/**
 * Busca información específica en la base de conocimientos
 */
export function queryKnowledgeBase(
  kb: KnowledgeBase,
  query: string
): string | null {
  const lowerQuery = query.toLowerCase();

  // Búsqueda de electrodomésticos específicos
  const applianceMatch = kb.appliances.list.find(app =>
    lowerQuery.includes(app.name.toLowerCase())
  );

  if (applianceMatch) {
    return `${applianceMatch.name}: ${applianceMatch.consumption}W, usado ${applianceMatch.hoursPerDay}h/día, consume ${applianceMatch.monthlyConsumption.toFixed(2)} kWh/mes (≈$${applianceMatch.monthlyCost.toFixed(2)}/mes)`;
  }

  // Búsqueda de consumo total
  if (/(cuánto|cuanto|consumo total|gasto total)/.test(lowerQuery)) {
    if (kb.receipt.exists) {
      return `Tu consumo total en ${kb.receipt.period} fue de ${kb.receipt.consumption} kWh, con un monto de $${kb.receipt.amount}.`;
    } else {
      return `Según tus electrodomésticos, tu consumo mensual estimado es ${kb.appliances.totalMonthlyConsumption.toFixed(2)} kWh (≈$${kb.appliances.estimatedMonthlyCost.toFixed(2)}/mes).`;
    }
  }

  // Búsqueda del mayor consumidor
  if (/(mayor consumidor|cuál consume más|qué consume más|más caro)/.test(lowerQuery)) {
    if (kb.appliances.highestConsumer) {
      return `El electrodoméstico que más consume es tu ${kb.appliances.highestConsumer.name}, con un consumo de ${kb.appliances.highestConsumer.consumption.toFixed(2)} kWh/mes (≈$${kb.appliances.highestConsumer.cost.toFixed(2)}/mes).`;
    }
  }

  return null; // No se encontró información específica
}
