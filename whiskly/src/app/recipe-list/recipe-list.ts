import { Component, inject, signal } from '@angular/core';
import { RecipeService, RecipeSummary } from '../recipe.service';

@Component({
  selector: 'app-recipe-list',
  template: `
    @if (loading()) { <p>Loading recipes...</p> }
    @if (error()) { <p>Couldn't load recipes.</p> }
    <ul>
      @for (r of recipes(); track r.id) {
        <li>
          <strong>{{ r.title }}</strong>
          <span> · makes {{ r.servings }} {{ r.yield_unit }} · {{ r.total_minutes }} min</span>
        </li>
      }
    </ul>
  `,
})
export class RecipeList {
  private service = inject(RecipeService);
  recipes = signal<RecipeSummary[]>([]);
  loading = signal(true);
  error = signal(false);

  constructor() {
    this.service.getRecipes()
      .then(r => this.recipes.set(r))
      .catch(() => this.error.set(true))
      .finally(() => this.loading.set(false));
  }
}