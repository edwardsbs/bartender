import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { normalizeIngredientKey } from '../../core/data-access/models/units';
import { AppStore } from '../../core/data-access/store/store';
// import { appStore } from '../../core/data-access/store/store';

@Component({
  selector: 'makeable',
  templateUrl: './makeable.component.html',
  styleUrls: ['./makeable.component.scss'],
  imports: [RouterLink]
})
export class MakeableComponent {

  strict = signal(true);

  appStore = inject(AppStore)

  have = computed(() => new Set(this.appStore.inventory().filter(i => i.have).map(i => i.key)));

  ranked = computed(() => {
    const have = this.have();

    const scored = this.appStore.recipes().map(r => {
      const required = r.ingredients.filter(i => !i.isOptional);
      const missing = required
        .map(i => i.item)
        .filter(name => !have.has(normalizeIngredientKey(name)));

      return { ...r, missing };
    });

    if (this.strict()) return scored.filter(r => r.missing.length === 0);

    // near-miss: fewest missing first
    return scored
      .filter(r => r.missing.length <= 5)
      .sort((a, b) => a.missing.length - b.missing.length || a.name.localeCompare(b.name));
  });


}
