import { fileToBase64, queryImage } from './geminiService';
import { lookupModelWattsOnline } from './modelLookupService';

export type ApplianceCategory =
  | 'refrigeracion'
  | 'climatizacion'
  | 'cocina'
  | 'lavado'
  | 'entretenimiento'
  | 'electronica'
  | 'otro';

export interface VampireScanResult {
  id: string;
  category: ApplianceCategory;
  brand?: string;
  modelName?: string;
  estimatedAgeYears: number;
  averageWatts: number;
  modernWatts: number;
  estimatedUseHoursPerDay: number;
  newEquipmentCostSoles: number;
  monthlySavingsSoles: number;
  roiMonths: number;
  recommendation: string;
  sourceModel: string;
  webLookupSource?: string;
  webLookupConfidence?: number;
  createdAt: string;
}

const STORAGE_KEY = 'ahorrapp_vampire_scans';

const categoryDefaults: Record<ApplianceCategory, { modernWatts: number; replacementCost: number }> = {
  refrigeracion: { modernWatts: 110, replacementCost: 2600 },
  climatizacion: { modernWatts: 900, replacementCost: 2200 },
  cocina: { modernWatts: 650, replacementCost: 900 },
  lavado: { modernWatts: 350, replacementCost: 1400 },
  entretenimiento: { modernWatts: 70, replacementCost: 1300 },
  electronica: { modernWatts: 120, replacementCost: 1800 },
  otro: { modernWatts: 180, replacementCost: 1200 }
};

function sanitizeNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const normalized = Number(value.replace(',', '.').replace(/[^0-9.-]/g, ''));
    if (Number.isFinite(normalized)) return normalized;
  }
  return fallback;
}

function normalizeCategory(value: unknown): ApplianceCategory {
  const text = String(value || '').toLowerCase();
  if (text.includes('refriger')) return 'refrigeracion';
  if (text.includes('aire') || text.includes('clima')) return 'climatizacion';
  if (text.includes('cocina') || text.includes('micro') || text.includes('horno')) return 'cocina';
  if (text.includes('lavad') || text.includes('planch')) return 'lavado';
  if (text.includes('tv') || text.includes('tele') || text.includes('entre')) return 'entretenimiento';
  if (text.includes('compu') || text.includes('electr')) return 'electronica';
  return 'otro';
}

function saveScan(result: VampireScanResult): void {
  const current = getVampireScans();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([result, ...current].slice(0, 20)));
}

export function getVampireScans(): VampireScanResult[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as VampireScanResult[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function getLatestVampireScan(): VampireScanResult | null {
  const scans = getVampireScans();
  return scans.length > 0 ? scans[0] : null;
}

export async function runVampireScanner(file: File): Promise<VampireScanResult> {
  const imageBase64 = await fileToBase64(file);
  const mimeType = file.type || 'image/jpeg';

  const systemPrompt = [
    'SYSTEM PROMPT MULTIMODAL:',
    'Eres un auditor energetico de hogares en Peru para AhorrApp.',
    'Usa la imagen para identificar el equipo o su placa tecnica y responde en JSON.',
    'Debes identificar: categoria, edad estimada en anios y consumo promedio en Watts.',
    'Luego compara el equipo viejo con un modelo moderno Energy Star A++ y calcula ROI.',
    'Formula obligatoria: ROI_meses = costo_nuevo / ahorro_mensual_soles.',
    'Responde SOLO con JSON valido sin texto adicional.'
  ].join(' ');

  const userPrompt = `
Devuelve este formato JSON exacto:
{
  "categoria": "refrigeracion|climatizacion|cocina|lavado|entretenimiento|electronica|otro",
  "marca": "",
  "modelo": "",
  "edad_estimada_anios": 0,
  "consumo_promedio_watts": 0,
  "uso_horas_dia": 0,
  "consumo_moderno_watts": 0,
  "costo_nuevo_soles": 0,
  "ahorro_mensual_soles": 0,
  "roi_meses": 0,
  "recomendacion": "texto corto"
}

Contexto local: tarifa aproximada residencial S/ 0.65 por kWh.
`;

  const { jsonData } = await queryImage(imageBase64, mimeType, `${systemPrompt}\n${userPrompt}`, 'gemini-1.5-flash');

  const brand = String(jsonData?.marca || '').trim();
  const modelName = String(jsonData?.modelo || '').trim();
  const modelQuery = `${brand} ${modelName}`.trim();
  const webLookup = await lookupModelWattsOnline(modelQuery);

  const category = normalizeCategory(jsonData?.categoria);
  const defaults = categoryDefaults[category];
  const averageWatts = Math.max(
    20,
    sanitizeNumber(
      webLookup.found ? webLookup.estimatedWatts : jsonData?.consumo_promedio_watts,
      defaults.modernWatts * 1.7
    )
  );
  const useHours = Math.max(1, sanitizeNumber(jsonData?.uso_horas_dia, 6));
  const modernWatts = Math.max(10, sanitizeNumber(jsonData?.consumo_moderno_watts, defaults.modernWatts));
  const newCost = Math.max(250, sanitizeNumber(jsonData?.costo_nuevo_soles, defaults.replacementCost));

  const wattsSaved = Math.max(0, averageWatts - modernWatts);
  const monthlySavings = sanitizeNumber(
    jsonData?.ahorro_mensual_soles,
    ((wattsSaved * useHours * 30) / 1000) * 0.65
  );
  const roiMonths = monthlySavings > 0
    ? sanitizeNumber(jsonData?.roi_meses, newCost / monthlySavings)
    : Number.POSITIVE_INFINITY;

  const result: VampireScanResult = {
    id: Date.now().toString(),
    category,
    brand: brand || undefined,
    modelName: modelName || undefined,
    estimatedAgeYears: Math.max(1, sanitizeNumber(jsonData?.edad_estimada_anios, 8)),
    averageWatts,
    modernWatts,
    estimatedUseHoursPerDay: useHours,
    newEquipmentCostSoles: newCost,
    monthlySavingsSoles: Math.max(0, monthlySavings),
    roiMonths,
    recommendation: String(jsonData?.recomendacion || 'Considera reemplazar el equipo por uno con certificacion Energy Star A++.'),
    sourceModel: 'gemini-1.5-flash',
    webLookupSource: webLookup.source,
    webLookupConfidence: webLookup.confidence,
    createdAt: new Date().toISOString()
  };

  saveScan(result);
  return result;
} 