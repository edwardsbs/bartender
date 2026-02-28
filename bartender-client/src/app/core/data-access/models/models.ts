export type MeasurementType = 'volume' | 'count' | 'special';

export type Unit =
  | 'oz' | 'ml' | 'tsp' | 'tbsp' | 'cup'
  | 'dash' | 'drop'
  | 'count' | 'pinch'
  | ''; // allow blank when unknown

  export type Spirit =
  | 'whiskey' | 'vodka' | 'tequila' | 'gin' |'rum' | 'brandy' | 'liqueur' | 'juice' | 'sweetener' | 'mixer' 
  | ''; // allow blank when unknown

export interface IngredientLine {
  id: string;
  originalLine: string;

  amount: number | null;       // parsed numeric
  unit: Unit;                  // parsed unit
  item: string;                // canonical-ish name (later: ingredientId)
  notes?: string;              // “fresh”, “to taste”, “top with…”
  isOptional?: boolean;

  measurementType: MeasurementType;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;

  categories: string[];
  baseSpirit?: string;

  glass?: string;
  garnish?: string;
  ice?: string;

  yieldText?: string; // “1 drink”, “serves 6”, etc.

  imageUrl?: string;

  ingredients: IngredientLine[];
  steps: RecipeStep[];

  createdAt: string;
  updatedAt: string;

  youtubeUrl?: string; // original pasted URL
}

export interface InventoryItem {
  key: string;   // normalized ingredient key
  name: string;  // display name
  have: boolean;
  spirit: Spirit;
}

export interface RecipeStep {
  id: string;
  text: string;
  stepNumber?: number;
}


export type NewIngredientLineDto = Omit<IngredientLine, 'id'>

export type NewRecipeStepDto = Omit<RecipeStep, 'id, stepNumber'>


export type NewRecipeDto = Omit<Recipe, 'id, ingredients, steps, createdAt, updatedAt'>  & {
  ingredients: NewIngredientLineDto;
  steps: NewRecipeStepDto;
};