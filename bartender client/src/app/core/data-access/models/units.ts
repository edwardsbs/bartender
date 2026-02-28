import { Unit } from './models';

export type DisplayUnitMode = 'oz' | 'ml' | 'cups';

export function normalizeIngredientKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// volume conversions (US)
const OZ_TO_ML = 29.5735295625;
const CUP_TO_OZ = 8;

export function isVolumeUnit(u: Unit): boolean {
  return u === 'oz' || u === 'ml' || u === 'tsp' || u === 'tbsp' || u === 'cup';
}

export function toOz(amount: number, unit: Unit): number | null {
  if (!Number.isFinite(amount)) return null;

  switch (unit) {
    case 'oz': return amount;
    case 'ml': return amount / OZ_TO_ML;
    case 'tsp': return amount / 6;      // 1 oz = 6 tsp
    case 'tbsp': return amount / 2;     // 1 oz = 2 tbsp
    case 'cup': return amount * CUP_TO_OZ;
    default: return null;
  }
}

export function fromOz(oz: number, target: DisplayUnitMode): { amount: number; unit: Unit } {
  switch (target) {
    case 'oz': return { amount: oz, unit: 'oz' };
    case 'ml': return { amount: oz * OZ_TO_ML, unit: 'ml' };
    case 'cups': return { amount: oz / CUP_TO_OZ, unit: 'cup' };
  }
}

export function formatAmount(n: number): string {
  // simple formatting now; later: rational + bartender rounding rules
  const abs = Math.abs(n);
  if (abs >= 10) return n.toFixed(1).replace(/\.0$/, '');
  if (abs >= 1) return n.toFixed(2).replace(/0$/, '').replace(/\.$/, '');
  return n.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}

export function shouldSuggestBigConversion(ozAmount: number): boolean {
  return ozAmount >= 8; // 1 cup threshold
}