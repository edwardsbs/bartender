import { Component, computed, inject, signal } from '@angular/core';
import { normalizeIngredientKey } from '../../core/data-access/models/units';
// import { appStore } from '../../core/data-access/store/store';
import { RouterLink } from '@angular/router';
import { AppStore } from '../../core/data-access/store/store';

@Component({
  selector: 'recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss'],
  imports: [RouterLink]
})
export class RecipeListComponent {

  constructor() { }

  query = signal('');
  category = signal<string | null>(null);
  makeableOnly = signal(false);

  appStore = inject(AppStore)

  recipes = computed(() => this.appStore.recipes());
  inventoryHave = computed(() =>
    new Set(this.appStore.inventory().filter(i => i.have).map(i => i.key))
  );

  allCategoryChips = computed(() => {
    const set = new Set<string>();
    for (const r of this.recipes()) r.categories.forEach(c => set.add(c));
    return ['All', ...Array.from(set).sort()];
  });

  toggleCategory(c: string) {
    if (c === 'All') { this.category.set(null); return; }
    this.category.set(this.category() === c ? null : c);
  }

  isMakeable(r: any): boolean {
    const have = this.inventoryHave();
    const required = r.ingredients.filter((i: any) => !i.isOptional);
    return required.every((i: any) => have.has(normalizeIngredientKey(i.item)));
  }

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const cat = this.category();
    const makeable = this.makeableOnly();

    return this.recipes()
      .filter(r => !cat || r.categories.includes(cat))
      .filter(r => !q || r.name.toLowerCase().includes(q) || (r.baseSpirit ?? '').toLowerCase().includes(q))
      .filter(r => !makeable || this.isMakeable(r));
  });

}
