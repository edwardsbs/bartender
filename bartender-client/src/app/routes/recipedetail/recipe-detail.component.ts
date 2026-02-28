import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DisplayUnitMode, normalizeIngredientKey, formatAmount, isVolumeUnit, toOz, fromOz, shouldSuggestBigConversion } from '../../core/data-access/models/units';
// import { appStore } from '../../core/data-access/store/store';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { getYouTubeEmbedUrl } from '../../core/data-access/services/youtube';
import { AppStore } from '../../core/data-access/store/store';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.scss'],
  imports: [CommonModule, RouterLink]
})
export class RecipeDetailComponent implements OnInit {

  scale = signal(1);
  unitMode = signal<DisplayUnitMode>('oz');
  checked = signal(new Set<string>());

  appStore = inject(AppStore)

  navOpen = signal(false); // default collapsed for small screens

  private id = computed(() => this.route.snapshot.paramMap.get('id') ?? '');
  recipe = computed(() => this.appStore.recipes().find(r => r.id === this.id()) ?? null);

  haveSet = computed(() => new Set(this.appStore.inventory().filter(i => i.have).map(i => i.key)));

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    if (window.matchMedia('(min-width: 1100px)').matches) {
      this.navOpen.set(true);
    }
  }

  inc() { this.scale.update(v => Math.min(64, v + 1)); }
  dec() { this.scale.update(v => Math.max(1, v - 1)); }

  toggleCheck(id: string) {
    const next = new Set(this.checked());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.checked.set(next);
  }

  haveIngredient(name: string): boolean {
    return this.haveSet().has(normalizeIngredientKey(name));
  }

  scaledText(ing: any): string | null {
    if (ing.amount == null) return null;

    const scaled = ing.amount * this.scale();
    if (!ing.unit) return formatAmount(scaled);

    // only convert volume units
    if (!isVolumeUnit(ing.unit)) return `${formatAmount(scaled)} ${ing.unit}`;

    const oz = toOz(scaled, ing.unit);
    if (oz == null) return `${formatAmount(scaled)} ${ing.unit}`;

    const out = fromOz(oz, this.unitMode());
    return `${formatAmount(out.amount)} ${out.unit}`;
  }

  suggestConvert(ing: any): boolean {
    if (ing.amount == null || !isVolumeUnit(ing.unit)) return false;
    const oz = toOz(ing.amount * this.scale(), ing.unit);
    return oz != null && shouldSuggestBigConversion(oz) && this.unitMode() !== 'cups';
  }

  safeVideoUrl = computed<SafeResourceUrl | null>(() => {
    const r = this.recipe();
    if (!r?.youtubeUrl) return null;

    const embed = getYouTubeEmbedUrl(r.youtubeUrl);
    if (!embed) return null;

    return this.sanitizer.bypassSecurityTrustResourceUrl(embed);
  });

  showVideo = signal(true);

}
