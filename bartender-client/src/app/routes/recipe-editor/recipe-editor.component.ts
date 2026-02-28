import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NewRecipeDto, Recipe } from '../../core/data-access/models/models';
import { parseIngredientsBlock, parseStepsBlock } from '../../core/data-access/models/parser';
import { AppStore } from '../../core/data-access/store/store';
// import { appStore } from '../../core/data-access/store/store';

function uid(): string {
  return Math.random().toString(16).slice(2);
}
function nowIso(): string {
  return new Date().toISOString();
}

@Component({
  selector: 'recipe-editor',
  templateUrl: './recipe-editor.component.html',
  styleUrls: ['./recipe-editor.component.scss']
})
export class RecipeEditorComponent {

  name = signal('');
  description = signal('');
  categoriesText = signal('');
  baseSpirit = signal('');

  ingredientsText = signal('');
  stepsText = signal('');

  parsedIngredients = signal<any[]>([]);
  parsedSteps = signal<any[]>([]);

  imageUrl = signal('');
  youtubeUrl = signal('');

  appStore = inject(AppStore);

  private route = inject(ActivatedRoute);
  private store = inject(AppStore);

  editId = computed(() => this.route.snapshot.paramMap.get('id'));
  isEdit = computed(() => !!this.editId());

  originalRecipeId = signal<string | null>(null);

  constructor(private router: Router) {
    effect(() => {
    const id = this.editId();
    if (!id) return;

    const r = this.store.recipes().find(x => x.id === id);
    if (!r) return;

    this.originalRecipeId.set(r.id);
    this.name.set(r.name);
    this.description.set(r.description ?? '');
    this.categoriesText.set((r.categories ?? []).join(', '));
    this.baseSpirit.set(r.baseSpirit ?? '');
    this.imageUrl.set(r.imageUrl ?? '');
    this.youtubeUrl.set(r.youtubeUrl ?? '');

    // image fields (optional)
    // this.imageUrl.set(r.imageUrl ?? '');

    // Put the parsed arrays directly into editor state:
    this.parsedIngredients.set(r.ingredients.map(i => ({ ...i })));
    this.parsedSteps.set(r.steps.map(s => ({ ...s })));

    // Also reconstruct the paste text areas (optional but nice)
    this.ingredientsText.set(r.ingredients.map(i => i.originalLine).join('\n'));
    this.stepsText.set(r.steps.map(s => s.text).join('\n'));
  });
  }

  goBack() { this.router.navigateByUrl('/recipes'); }

  fillExample() {
    this.name.set('Whiskey Sour');
    this.description.set('A classic sour template. Simple, sharp, reliable.');
    this.categoriesText.set('Classic, Sour');
    this.baseSpirit.set('Whiskey');
    this.imageUrl.set('https://plus.unsplash.com/premium_photo-1671647122992-5de89811f4c8?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
    this.youtubeUrl.set('https://youtu.be/Og7wTN5gKd8?si=qWfJ2eTCDrbjPG_S');
    this.ingredientsText.set(
      `2 oz whiskey
      0.75 oz lemon juice (fresh)
      0.75 oz simple syrup
      Egg white (optional)
      2 dashes Angostura bitters (optional)`
    );
    this.stepsText.set(
      `Dry shake (no ice) if using egg white
      Shake with ice until cold
      Strain into glass
      Garnish and serve`
    );
  }

  preview() {
    const ings = parseIngredientsBlock(this.ingredientsText());
    const steps = parseStepsBlock(this.stepsText());
    this.parsedIngredients.set(ings);
    this.parsedSteps.set(steps);
  }

  setIng(index: number, key: string, val: any) {
    const next = [...this.parsedIngredients()];
    const row = { ...next[index] };

    if (key === 'amount') {
      const n = Number(val);
      row.amount = Number.isFinite(n) && val !== '' ? n : null;
    } else if (key === 'isOptional') {
      row.isOptional = !!val;
    } else {
      row[key] = val;
    }

    next[index] = row;
    this.parsedIngredients.set(next);
  }

  save() {
    // if (!this.parsedIngredients().length && this.ingredientsText().trim()) this.preview();
    // if (!this.parsedSteps().length && this.stepsText().trim()) this.preview();

    // Always parse
    this.preview();

    const id = this.originalRecipeId();
    
    const recipe: Recipe = {
      id: id?? uid(),
      name: this.name().trim(),
      description: this.description().trim() || undefined,
      categories: this.categoriesText()
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      baseSpirit: this.baseSpirit().trim() || undefined,
      ingredients: this.parsedIngredients(),
      steps: this.parsedSteps(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      imageUrl: this.imageUrl().trim() || undefined,
      youtubeUrl: this.youtubeUrl().trim() || undefined,
    };

    // ensure inventory has ingredients for toggling later
    for (const ing of recipe.ingredients) {
      if (ing.item) this.appStore.addInventoryIfMissing(ing.item);
    }

    
    
    this.appStore.upsertRecipe(recipe);
    
    


    // this.router.navigate(['/recipes', recipe.id]);
  }

}
