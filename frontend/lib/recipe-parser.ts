import type { Recipe } from "../types/recipe";

export function normalizeRecipe(input: unknown): Recipe | null {
  if (typeof input === 'string') {
    const parsed = safeJsonParse(input);
    if (!parsed || typeof parsed !== 'object') {
      return parseRecipeFromText(input);
    }
    return normalizeRecipe(parsed);
  }

  if (!input || typeof input !== 'object') return null;

  const root = input as Record<string, unknown>;
  const source = (root.recipe && typeof root.recipe === 'object'
    ? root.recipe
    : root) as Record<string, unknown>;
  const ingredientsSource = Array.isArray(source.ingredients) ? source.ingredients : [];
  const stepsSource = Array.isArray(source.steps) ? source.steps : [];

  const ingredients = ingredientsSource
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      name: String(item.name ?? ''),
      amount: String(item.amount ?? ''),
    }))
    .filter((item) => item.name || item.amount);

  const steps = stepsSource
    .map((step) => String(step ?? '').trim())
    .filter(Boolean);

  return {
    dish_name: String(source.dish_name ?? source.title ?? source.name ?? ''),
    description: String(source.description ?? ''),
    cooking_time: String(source.cooking_time ?? ''),
    servings: String(source.servings ?? ''),
    ingredients,
    steps,
  };
}

function parseRecipeFromText(text: string): Recipe {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const findLine = (patterns: RegExp[]): string => {
    for (const line of lines) {
      if (patterns.some((pattern) => pattern.test(line))) {
        return line;
      }
    }
    return '';
  };

  const dishLine = findLine([/料理名|メニュー|dish|title/i]);
  const dishName = dishLine
    .replace(/^[【\[]?.{0,8}?[】\]]?[:：]?/u, '')
    .trim() || '提案レシピ';

  const stepLines = lines
    .filter((line) => /^\d+[\.)、\s]/.test(line) || /^[-・*]/.test(line))
    .map((line) => line.replace(/^\d+[\.)、\s]*/, '').replace(/^[-・*]\s*/, '').trim())
    .filter(Boolean);

  return {
    dish_name: dishName,
    description: '',
    cooking_time: '',
    servings: '',
    ingredients: [],
    steps: stepLines,
  };
}

function safeJsonParse(value: string): unknown {
  const trimmed = value.trim();

  const direct = tryParseJson(trimmed);
  if (direct !== null) return direct;

  const withoutFences = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '');
  const fenced = tryParseJson(withoutFences);
  if (fenced !== null) return fenced;

  const firstObj = withoutFences.match(/\{[\s\S]*\}/);
  if (firstObj) {
    const extracted = tryParseJson(firstObj[0]);
    if (extracted !== null) return extracted;
  }

  return null;
}

function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
