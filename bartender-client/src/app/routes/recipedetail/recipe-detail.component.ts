import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DisplayUnitMode, normalizeIngredientKey, formatAmount, isVolumeUnit, toOz, fromOz, shouldSuggestBigConversion } from '../../core/data-access/models/units';
import { getYouTubeEmbedUrl } from '../../core/data-access/services/youtube';
import { AppStore } from '../../core/data-access/store/store';
import { IngredientLine } from '../../core/data-access/models/models';

@Component({
  selector: 'recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.scss'],
  imports: [RouterLink]
})
export class RecipeDetailComponent {

  scale = signal(1);
  unitMode = signal<DisplayUnitMode>('oz');
  checked = signal(new Set<string>());
  showVideo = signal(true);

  private appStore = inject(AppStore);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);

  private id = computed(() => this.route.snapshot.paramMap.get('id') ?? '');

  recipe = computed(() => this.appStore.recipes().find(r => r.id === this.id()) ?? null);

  private haveSet = computed(() =>
    new Set(this.appStore.inventory().filter(i => i.have).map(i => i.key))
  );

  safeVideoUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.recipe()?.youtubeUrl;
    if (!url) return null;
    const embed = getYouTubeEmbedUrl(url);
    return embed ? this.sanitizer.bypassSecurityTrustResourceUrl(embed) : null;
  });

  inc() { this.scale.update(v => Math.min(64, v + 1)); }
  dec() { this.scale.update(v => Math.max(1, v - 1)); }

  toggleCheck(id: string) {
    const next = new Set(this.checked());
    next.has(id) ? next.delete(id) : next.add(id);
    this.checked.set(next);
  }

  haveIngredient(name: string): boolean {
    return this.haveSet().has(normalizeIngredientKey(name));
  }

  scaledText(ing: IngredientLine): string | null {
    if (ing.amount == null) return null;
    const scaled = ing.amount * this.scale();
    if (!ing.unit) return formatAmount(scaled);
    if (!isVolumeUnit(ing.unit)) return `${formatAmount(scaled)} ${ing.unit}`;
    const oz = toOz(scaled, ing.unit);
    if (oz == null) return `${formatAmount(scaled)} ${ing.unit}`;
    const out = fromOz(oz, this.unitMode());
    return `${formatAmount(out.amount)} ${out.unit}`;
  }

  suggestConvert(ing: IngredientLine): boolean {
    if (ing.amount == null || !isVolumeUnit(ing.unit)) return false;
    const oz = toOz(ing.amount * this.scale(), ing.unit);
    return oz != null && shouldSuggestBigConversion(oz) && this.unitMode() !== 'cups';
  }

}
