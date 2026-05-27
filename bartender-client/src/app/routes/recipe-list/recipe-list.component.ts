import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { normalizeIngredientKey } from '../../core/data-access/models/units';
import { AppStore } from '../../core/data-access/store/store';
import { Recipe } from '../../core/data-access/models/models';

@Component({
  selector: 'recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss'],
  imports: [RouterLink]
})
export class RecipeListComponent {

  query = signal('');
  category = signal<string | null>(null);
  makeableOnly = signal(false);

  private appStore = inject(AppStore);

  recipes = computed(() => this.appStore.recipes());

  private inventoryHave = computed(() =>
    new Set(this.appStore.inventory().filter(i => i.have).map(i => i.key))
  );

  allCategoryChips = computed(() => {
    const cats = new Set<string>();
    for (const r of this.recipes()) r.categories.forEach(c => cats.add(c));
    return ['All', ...Array.from(cats).sort()];
  });

  /** Pre-computed set of makeable recipe IDs for O(1) template lookups */
  makeableIds = computed(() => {
    const have = this.inventoryHave();
    return new Set(
      this.recipes()
        .filter((r: Recipe) =>
          r.ingredients
            .filter(i => !i.isOptional)
            .every(i => have.has(normalizeIngredientKey(i.item)))
        )
        .map(r => r.id)
    );
  });

  isMakeable(id: string): boolean {
    return this.makeableIds().has(id);
  }

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const cat = this.category();
    const makeable = this.makeableOnly();
    const makeableIds = this.makeableIds();

    return this.recipes()
      .filter(r => !cat || r.categories.includes(cat))
      .filter(r => !q || r.name.toLowerCase().includes(q) || (r.baseSpirit ?? '').toLowerCase().includes(q))
      .filter(r => !makeable || makeableIds.has(r.id));
  });

  toggleCategory(c: string) {
    this.category.set(c === 'All' || this.category() === c ? null : c);
  }

}
