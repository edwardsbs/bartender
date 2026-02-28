import { IngredientLine, Unit } from './models';

const UNIT_MAP: Record<string, Unit> = {
  oz: 'oz', ounce: 'oz', ounces: 'oz',
  ml: 'ml',
  tsp: 'tsp', teaspoon: 'tsp', teaspoons: 'tsp',
  tbsp: 'tbsp', tablespoon: 'tbsp', tablespoons: 'tbsp',
  cup: 'cup', cups: 'cup',
  dash: 'dash', dashes: 'dash',
  drop: 'drop', drops: 'drop',
  pinch: 'pinch',
};

function uid(): string {
  return Math.random().toString(16).slice(2);
}

function parseNumber(token: string): number | null {
  // supports: 1, 1.5, .75, 1/2, 1 1/2
  token = token.trim();
  if (!token) return null;

  if (/^\d+\/\d+$/.test(token)) {
    const [a, b] = token.split('/').map(Number);
    if (b === 0) return null;
    return a / b;
  }

  if (/^\d+(\.\d+)?$/.test(token) || /^\.\d+$/.test(token)) {
    return Number(token);
  }

  return null;
}

export function parseIngredientsBlock(text: string): IngredientLine[] {
  const lines = text
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);

  return lines.map((line) => parseIngredientLine(line));
}

export function parseIngredientLine(line: string): IngredientLine {
  const originalLine = line;

  // naive token split
  const tokens = line.split(/\s+/);

  // try amount patterns
  let amount: number | null = null;
  let unit: Unit = '';
  let startIndex = 0;

  // try "1 1/2"
  if (tokens.length >= 2) {
    const n1 = parseNumber(tokens[0]);
    const n2 = parseNumber(tokens[1]);
    if (n1 !== null && n2 !== null && tokens[1].includes('/')) {
      amount = n1 + n2;
      startIndex = 2;
    }
  }

  // try single number or fraction
  if (amount === null) {
    const n = parseNumber(tokens[0]);
    if (n !== null) {
      amount = n;
      startIndex = 1;
    }
  }

  // try unit
  if (startIndex < tokens.length) {
    const u = UNIT_MAP[tokens[startIndex]?.toLowerCase() ?? ''];
    if (u) {
      unit = u;
      startIndex += 1;
    }
  }

  // remainder is item + notes
  const remainder = tokens.slice(startIndex).join(' ').trim();

  // small heuristics for optional / special / “top with”
  const lower = originalLine.toLowerCase();
  const isOptional = /\boptional\b/.test(lower) || lower.startsWith('garnish') || lower.includes('for garnish') || lower.includes('optional');
  const isSpecial = lower.startsWith('top with') || lower.startsWith('fill with') || lower.startsWith('splash');

  // item extraction: remove parenthetical notes into notes
  let item = remainder;
  let notes = '';
  const paren = remainder.match(/\((.*?)\)/);
  if (paren) {
    notes = paren[1];
    item = remainder.replace(paren[0], '').trim();
  }

  const measurementType =
    unit === 'count' || unit === '' && amount !== null && /egg|mint|leaf|leaves/i.test(item)
      ? 'count'
      : isSpecial || unit === 'dash' || unit === 'drop' || unit === 'pinch'
        ? 'special'
        : 'volume';

  return {
    id: uid(),
    originalLine,
    amount,
    unit,
    item: item || originalLine,
    notes: notes || (isSpecial ? 'to taste' : undefined),
    isOptional,
    measurementType,
  };
}

export function parseStepsBlock(text: string): { id: string; text: string }[] {
  const lines = text
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);

  // strip leading "1)" "1." "- " etc
  return lines.map((l) => ({
    id: uid(),
    text: l.replace(/^(\d+[\).\s]+|\-\s+|\*\s+)/, '').trim(),
  }));
}