export interface ModelLookupResult {
  found: boolean;
  source: 'wikipedia' | 'openfoodfacts' | 'none';
  modelQuery: string;
  estimatedWatts?: number;
  confidence: number;
  snippet?: string;
}

function parseWattsFromText(text: string): number | null {
  const normalized = text.toLowerCase();
  const patterns = [
    /(\d{2,5})\s?w(?:atts?)?\b/gi,
    /(\d{2,5})\s?w\b/gi,
    /(\d{2,5})\s?kw\b/gi
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(normalized);
    if (!match || !match[1]) continue;
    const raw = Number(match[1]);
    if (!Number.isFinite(raw)) continue;

    // Si es kW en el texto, convertir a W
    if (match[0].includes('kw')) {
      return raw * 1000;
    }

    if (raw >= 20 && raw <= 8000) return raw;
  }
  return null;
}

async function lookupWikipedia(modelQuery: string): Promise<ModelLookupResult> {
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(modelQuery)} power consumption watts&format=json&origin=*`;
  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) {
    return { found: false, source: 'none', modelQuery, confidence: 0 };
  }

  const searchData = await searchRes.json() as {
    query?: { search?: Array<{ title: string; snippet: string }> };
  };
  const first = searchData.query?.search?.[0];
  if (!first) {
    return { found: false, source: 'none', modelQuery, confidence: 0 };
  }

  const plainSnippet = first.snippet.replace(/<[^>]*>/g, ' ');
  const watts = parseWattsFromText(plainSnippet);

  return {
    found: typeof watts === 'number',
    source: watts ? 'wikipedia' : 'none',
    modelQuery,
    estimatedWatts: watts ?? undefined,
    confidence: watts ? 0.55 : 0,
    snippet: plainSnippet
  };
}

async function lookupOpenFoodFacts(modelQuery: string): Promise<ModelLookupResult> {
  // Fuente alternativa ligera con CORS abierto; puede contener datos de potencia en descripciones de producto.
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(modelQuery)}&search_simple=1&action=process&json=1&page_size=5`;
  const res = await fetch(url);
  if (!res.ok) {
    return { found: false, source: 'none', modelQuery, confidence: 0 };
  }

  const data = await res.json() as {
    products?: Array<{ product_name?: string; generic_name?: string }>;
  };

  const textBlob = (data.products || [])
    .map((p) => `${p.product_name || ''} ${p.generic_name || ''}`.trim())
    .join(' ');

  if (!textBlob) {
    return { found: false, source: 'none', modelQuery, confidence: 0 };
  }

  const watts = parseWattsFromText(textBlob);
  return {
    found: typeof watts === 'number',
    source: watts ? 'openfoodfacts' : 'none',
    modelQuery,
    estimatedWatts: watts ?? undefined,
    confidence: watts ? 0.35 : 0,
    snippet: textBlob.slice(0, 240)
  };
}

export async function lookupModelWattsOnline(modelQuery: string): Promise<ModelLookupResult> {
  if (!modelQuery || modelQuery.trim().length < 3) {
    return { found: false, source: 'none', modelQuery, confidence: 0 };
  }

  try {
    const wiki = await lookupWikipedia(modelQuery);
    if (wiki.found) return wiki;
  } catch (error) {
    console.warn('Wikipedia lookup falló:', error);
  }

  try {
    const off = await lookupOpenFoodFacts(modelQuery);
    if (off.found) return off;
  } catch (error) {
    console.warn('OpenFoodFacts lookup falló:', error);
  }

  return {
    found: false,
    source: 'none',
    modelQuery,
    confidence: 0
  };
} 