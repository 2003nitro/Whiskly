import { Component, inject, signal } from '@angular/core';
import { RecipeService, RecipeSummary } from '../recipe.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recipe-list',
  imports: [RouterLink],
  templateUrl: './recipe-list.html',
  styleUrl: './recipe-list.css',
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

  formatTime(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h} hr ${m} min` : `${h} hr`;
  }
}