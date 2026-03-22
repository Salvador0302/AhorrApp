export type TokenNetwork = 'Base' | 'Polygon';

export interface GreenMintRecord {
  id: string;
  receiptId: string;
  network: TokenNetwork;
  reductionKWh: number;
  tokensMinted: number;
  monthlySavingsSoles: number;
  txHash: string;
  createdAt: string;
}

export interface GreenMintResult {
  eligible: boolean;
  reason?: string;
  network: TokenNetwork;
  reductionKWh: number;
  tokensMinted: number;
  monthlySavingsSoles: number;
  txHash?: string;
}

const TOKEN_KEY = 'ahorrapp_green_tokens';
const TOKENS_PER_KWH = 2;

function readLedger(): GreenMintRecord[] {
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as GreenMintRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLedger(records: GreenMintRecord[]): void {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(records));
}

function buildTxHash(): string {
  const randomChunk = Math.random().toString(16).slice(2, 14);
  const timestampChunk = Date.now().toString(16);
  return `0x${timestampChunk}${randomChunk}`.slice(0, 66);
}

export function getGreenTokenLedger(): GreenMintRecord[] {
  return readLedger().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getGreenTokenBalance(): number {
  return readLedger().reduce((sum, entry) => sum + entry.tokensMinted, 0);
}

export function getMintByReceipt(receiptId: string): GreenMintRecord | null {
  return readLedger().find((entry) => entry.receiptId === receiptId) || null;
}

export function evaluateAndMintGreenTokens(params: {
  receiptId: string;
  currentKWh: number;
  previousKWh?: number;
  tariffSolesPerKWh?: number;
  network?: TokenNetwork;
}): GreenMintResult {
  const {
    receiptId,
    currentKWh,
    previousKWh,
    tariffSolesPerKWh = 0.65,
    network = 'Base'
  } = params;

  if (typeof previousKWh !== 'number' || previousKWh <= 0) {
    return {
      eligible: false,
      reason: 'No se pudo validar la reduccion de kWh por falta del consumo previo.',
      network,
      reductionKWh: 0,
      tokensMinted: 0,
      monthlySavingsSoles: 0
    };
  }

  const reductionKWh = Number((previousKWh - currentKWh).toFixed(2));
  if (reductionKWh <= 0) {
    return {
      eligible: false,
      reason: 'No hubo reduccion de kWh en este periodo, no aplica mint().',
      network,
      reductionKWh,
      tokensMinted: 0,
      monthlySavingsSoles: 0
    };
  }

  const tokensMinted = Math.max(1, Math.floor(reductionKWh * TOKENS_PER_KWH));
  const monthlySavingsSoles = Number((reductionKWh * tariffSolesPerKWh).toFixed(2));
  const txHash = buildTxHash();

  const current = readLedger();
  const alreadyMinted = current.some((entry) => entry.receiptId === receiptId);
  if (alreadyMinted) {
    return {
      eligible: false,
      reason: 'Este recibo ya fue usado para mint de GTKN.',
      network,
      reductionKWh,
      tokensMinted: 0,
      monthlySavingsSoles
    };
  }

  const record: GreenMintRecord = {
    id: `${receiptId}-${Date.now()}`,
    receiptId,
    network,
    reductionKWh,
    tokensMinted,
    monthlySavingsSoles,
    txHash,
    createdAt: new Date().toISOString()
  };

  writeLedger([record, ...current]);

  return {
    eligible: true,
    network,
    reductionKWh,
    tokensMinted,
    monthlySavingsSoles,
    txHash
  };
} 