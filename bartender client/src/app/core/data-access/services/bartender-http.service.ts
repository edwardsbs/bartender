import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { IngredientLine, InventoryItem, Recipe, RecipeStep } from '../models/models';
import { Observable } from 'rxjs';

type OmitKeys<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

@Injectable({
  providedIn: 'root'
})
export class BartenderHttpService {

  apiPath = environment.apiUrl + "";

  constructor(private http: HttpClient) { }

  // Recipes
  getRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.apiPath}/Recipe/recipes`)
  }

  getRecipe(id: string) {
    return this.http.get<Recipe>(`${this.apiPath}/Recipe/recipe/${id}`)
  }

  addRecipe(recipe: Recipe) {

    //remove id fields so the api will be happy
    const ingredients: OmitKeys<IngredientLine, "id">[] = recipe.ingredients.map(({ id, ...rest }) => rest);
    const steps: OmitKeys<RecipeStep, "id">[] = recipe.steps.map(({ id, ...rest }) => rest);

    return this.http.post<Recipe>(`${this.apiPath}/Recipe/add-recipe`,
      {
        name: recipe.name,
        description: recipe.description,
        categories: recipe.categories,
        baseSpirit: recipe.baseSpirit,
        ingredients: ingredients,
        steps: steps,
        imageUrl: recipe.imageUrl,
        youtubeUrl: recipe.youtubeUrl,        
      }
    )
  }

  editRecipe(recipe: Recipe) {
    return this.http.put<Recipe>(`${this.apiPath}/Recipe/edit-recipe/${recipe.id}`,
      // { dto: 
        { 
          id: this.isGuid(recipe.id) ? recipe.id : null,
          name: recipe.name,
          description: recipe.description,
          categories: recipe.categories,
          baseSpirit: recipe.baseSpirit,
          ingredients:  recipe.ingredients.map(i => ({
            id: this.isGuid(i.id) ? i.id : null,
            originalLine: i.originalLine,
            amount: i.amount,
            unit: i.unit,
            item: i.item,
            notes: i.notes,
            isOptional: !!i.isOptional,
            measurementType: i.measurementType
          })),
          steps: recipe.steps.map(s => ({
            id: this.isGuid(s.id) ? s.id : null,
            stepNumber: s.stepNumber?? recipe.steps.indexOf(s),
            text: s.text,
          })),
          imageUrl: recipe.imageUrl,
          youtubeUrl: recipe.youtubeUrl,        
      // }
    })
  }

  deleteRecipe(id: string) {
    return this.http.delete(`${this.apiPath}/Recipe/delete-recipe/${id}`)
  }


  // Inventory
  getInventory(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.apiPath}/Inventory/inventory`)
  }

  getInventoryItem(id: string) {
    return this.http.get<InventoryItem>(`${this.apiPath}/Inventory/${id}`)
  }

  addInventoryItem(item: InventoryItem) {
    return this.http.post<InventoryItem>(`${this.apiPath}/Inventory`,
      {
        item
      }
    )
  }

  editInventoryItem(id: string, item: InventoryItem) {
    return this.http.post<InventoryItem>(`${this.apiPath}/Inventory/edit-inventory/${id}`,
      {
        item
      }
    )
  }


  isGuid(v: any): v is string {
  return typeof v === 'string' &&
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(v);
}

}
