export interface CurrencyFormatOptions {
  decimals?: number;
}

export function formatCurrency(value: number, options: CurrencyFormatOptions = {}): string {
  const decimals = options.decimals ?? 2;
  if (Number.isNaN(value) || !Number.isFinite(value)) return 'S/. 0.00';
  return `S/. ${value.toFixed(decimals)}`;
}
