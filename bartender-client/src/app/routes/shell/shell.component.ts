import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

type NavItem = { path: string; label: string; icon: string };

@Component({
  selector: 'shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
})
export class ShellComponent {

  navOpen = signal(true);

   // optional: auto-collapse on recipe detail pages
  // constructor(router: Router) {
  //   router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
  //     const url = router.url;
  //     const isRecipeDetail = /^\/recipes\/[^/]+$/.test(url);          // /recipes/:id
  //     const isRecipeDetailEdit = /^\/recipes\/[^/]+\/edit$/.test(url); // /recipes/:id/edit

  //     // collapse on detail/edit, keep on list pages
  //     if (isRecipeDetail || isRecipeDetailEdit) this.navOpen.set(false);
  //   });
  // }

  private _nav = signal<NavItem[]>([
    { path: '/recipes', label: 'Recipes', icon: '📖' },
    { path: '/inventory', label: 'Inventory', icon: '🧺' },
    { path: '/makeable', label: 'Makeable', icon: '✨' },
    // later: Lists / Shopping
    // { path: '/lists', label: 'Lists', icon: '📝' },
  ]);

  nav = computed(() => this._nav());

  toggleNav() {
    this.navOpen.set(!this.navOpen());
  }

}
