import { Routes } from '@angular/router';
import { ShellComponent } from './routes/shell/shell.component';
import { RecipeListComponent } from './routes/recipe-list/recipe-list.component';
import { InventoryComponent } from './routes/inventory/inventory.component';
import { MakeableComponent } from './routes/makeable/makeable.component';
import { RecipeEditorComponent } from './routes/recipe-editor/recipe-editor.component';
import { RecipeDetailComponent } from './routes/recipedetail/recipe-detail.component';

export const routes: Routes = [
    {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'recipes' },
      { path: 'recipes', component: RecipeListComponent },
      { path: 'recipes/new', component: RecipeEditorComponent },
      { path: 'recipes/:id/edit', component: RecipeEditorComponent },
      { path: 'recipes/:id', component: RecipeDetailComponent },
      { path: 'inventory', component: InventoryComponent },
      { path: 'makeable', component: MakeableComponent },
    ],
  },
];
