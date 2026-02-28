import { Component, computed, inject, signal } from '@angular/core';
import { AppStore } from '../../core/data-access/store/store';
// import { appStore } from '../../core/data-access/store/store';

@Component({
  selector: 'inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent {

 q = signal('');

 appStore = inject(AppStore)

  filtered = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.appStore.inventory()
      .filter(i => !q || i.name.toLowerCase().includes(q))
      .sort((a, b) => Number(b.have) - Number(a.have) || a.name.localeCompare(b.name));
  });

  toggle(key: string) { this.appStore.toggleInventory(key); }
}
