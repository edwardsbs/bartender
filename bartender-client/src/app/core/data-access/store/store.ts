import { computed, Inject, inject, Injectable, signal } from '@angular/core';
import { InventoryItem, Recipe } from '../models/models';
import { normalizeIngredientKey } from '../models/units';
import { BartenderHttpService } from '../services/bartender-http.service';
import { Router } from '@angular/router';

function uid(): string {
  return Math.random().toString(16).slice(2);
}

function nowIso(): string {
  return new Date().toISOString();
}

type OmitKeys<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

const seedRecipes: Recipe[] = [
  {
    id: uid(),
    name: 'Old Fashioned',
    description: 'Dangerously easy.',
    categories: ['Classic'],
    baseSpirit: 'Whiskey',
    glass: 'Rocks',
    garnish: 'Orange Peel',
    ice: 'Stir with ice',
    yieldText: '1 drink',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1671647122992-5de89811f4c8?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    youtubeUrl: 'https://youtu.be/Xhpx-vbzRpQ?si=Y5zPS4WR2_eg6pdN',
    ingredients: [
      { id: uid(), originalLine: '2 oz whiskey', amount: 2, unit: 'oz', item: 'whiskey', measurementType: 'volume' },
      { id: uid(), originalLine: '0.25 oz simple syrup (optional)', amount: 0.25, unit: 'oz', item: 'simple syrup', isOptional: true, measurementType: 'volume' },
      { id: uid(), originalLine: 'Bitters', amount: null, unit: 'dash', item: 'bitters', isOptional: true, measurementType: 'special' },
    ],
    steps: [
      { id: uid(), text: 'Stir with ice until very cold.' },
      { id: uid(), text: 'Strain into chilled glass with single large clear ice cube' },
      { id: uid(), text: 'Garnish and serve.' },
    ],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: uid(),
    name: 'Classic Margarita',
    description: 'Bright, tart, and dangerously easy.',
    categories: ['Sour', 'Classic'],
    baseSpirit: 'Tequila',
    glass: 'Coupe (or rocks)',
    garnish: 'Lime wheel',
    ice: 'Shaken with ice',
    yieldText: '1 drink',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=60',
    youtubeUrl: 'https://youtu.be/vLMiQozMcUo?si=O3KtgfywNkfmnyks',
    ingredients: [
      { id: uid(), originalLine: '2 oz tequila', amount: 2, unit: 'oz', item: 'tequila', measurementType: 'volume' },
      { id: uid(), originalLine: '1 oz lime juice (fresh)', amount: 1, unit: 'oz', item: 'lime juice', notes: 'fresh', measurementType: 'volume' },
      { id: uid(), originalLine: '0.75 oz triple sec', amount: 0.75, unit: 'oz', item: 'triple sec', measurementType: 'volume' },
      { id: uid(), originalLine: '0.25 oz agave syrup (optional)', amount: 0.25, unit: 'oz', item: 'agave syrup', isOptional: true, measurementType: 'volume' },
      { id: uid(), originalLine: 'Salt rim (optional)', amount: null, unit: '', item: 'salt', isOptional: true, measurementType: 'special' },
    ],
    steps: [
      { id: uid(), text: 'Shake with ice until very cold.' },
      { id: uid(), text: 'Strain into chilled glass (salt rim optional).' },
      { id: uid(), text: 'Garnish and serve.' },
    ],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: uid(),
    name: 'Gin & Tonic',
    description: 'Highball simplicity. Humans needed centuries for this.',
    categories: ['Highball'],
    baseSpirit: 'Gin',
    glass: 'Highball',
    garnish: 'Lime wedge',
    ice: 'Lots of ice',
    yieldText: '1 drink',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1668771899398-1cdd763f745e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    youtubeUrl: 'https://youtu.be/Og7wTN5gKd8?si=qWfJ2eTCDrbjPG_S',
    ingredients: [
      { id: uid(), originalLine: '2 oz gin', amount: 2, unit: 'oz', item: 'gin', measurementType: 'volume' },
      { id: uid(), originalLine: '4 oz tonic water', amount: 4, unit: 'oz', item: 'tonic water', measurementType: 'volume' },
      { id: uid(), originalLine: 'Lime wedge (optional)', amount: null, unit: '', item: 'lime', isOptional: true, measurementType: 'count' },
    ],
    steps: [
      { id: uid(), text: 'Fill glass with ice.' },
      { id: uid(), text: 'Add gin, top with tonic.' },
      { id: uid(), text: 'Garnish and stir gently.' },
    ],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

const seedInventory: InventoryItem[] = [
  { key: normalizeIngredientKey('rye whiskey'), name: 'Rye Whiskey', spirit: 'whiskey', have: true },
  { key: normalizeIngredientKey('bourbon'), name: 'Bourbon', spirit: 'whiskey', have: true },
  { key: normalizeIngredientKey('tequila'), name: 'Tequila', spirit: 'tequila', have: true },
  { key: normalizeIngredientKey('lime juice'), name: 'Lime juice', spirit: 'juice', have: true },
  { key: normalizeIngredientKey('triple sec'), name: 'Triple sec', spirit: 'liqueur', have: true },
  { key: normalizeIngredientKey('gin'), name: 'Gin', spirit: 'gin', have: true },
  { key: normalizeIngredientKey('tonic water'), name: 'Tonic water', spirit: 'mixer', have: true },
  { key: normalizeIngredientKey('simple syrup'), name: 'Simple syrup', spirit: 'sweetener', have: true },
  { key: normalizeIngredientKey('agave syrup'), name: 'Agave syrup', spirit: 'sweetener', have: false },
];

@Injectable({ providedIn: 'root' })
export class AppStore {
  recipes = signal<Recipe[]>([]);
  inventory = signal<InventoryItem[]>(seedInventory);

  http = inject(BartenderHttpService);
  router = inject(Router)
  // http: BartenderHttpService | undefined;
  constructor() {
    // this.http = inject(BartenderHttpService);
    this.http.getRecipes().subscribe({
      next: (res) => this.recipes.set(res)
    })
  }

  recipeById = (id: string) => computed(() => this.recipes().find(r => r.id === id) ?? null);

  upsertRecipe(recipe: Recipe) {
    const list = this.recipes();
    const idx = list.findIndex(r => r.id === recipe.id);
    const recipeList = [...list];
    if (idx >= 0) {
      this.http!.editRecipe(recipe).subscribe({
        next:(res) => {
          recipeList[idx] = { ...res, updatedAt: nowIso() }
          this.router.navigate(['/recipes', recipe.id]);
        }
      })       
    }
    else {
      this.http!.addRecipe(recipe).subscribe({
        next:(res) => {
          recipeList.unshift({ ...res, createdAt: nowIso(), updatedAt: nowIso() }); 
          this.router.navigate(['/recipes', recipe.id]);
        }
      })
    }
    this.recipes.set(recipeList);
  }

  toggleInventory(key: string) {
    const next = this.inventory().map(i => i.key === key ? ({ ...i, have: !i.have }) : i);
    this.inventory.set(next);
  }

  addInventoryIfMissing(name: string) {
    const key = normalizeIngredientKey(name);
    if (this.inventory().some(i => i.key === key)) return;
    this.inventory.set([{ key, name, spirit: '', have: false }, ...this.inventory()]);
  }


}


// export const appStore = new AppStore();