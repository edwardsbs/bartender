import { Component, computed, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

type NavItem = { path: string; label: string; icon: string };

@Component({
  selector: 'shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
})
export class ShellComponent {

  constructor() { }

  private _nav = signal<NavItem[]>([
    { path: '/recipes', label: 'Recipes', icon: '📖' },
    { path: '/inventory', label: 'Inventory', icon: '🧺' },
    { path: '/makeable', label: 'Makeable', icon: '✨' },
    // later: Lists / Shopping
    // { path: '/lists', label: 'Lists', icon: '📝' },
  ]);

  nav = computed(() => this._nav());

}
