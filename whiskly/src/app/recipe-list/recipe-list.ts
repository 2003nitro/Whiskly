import { Component, inject, signal } from '@angular/core';
import { RecipeService, RecipeSummary } from '../recipe.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CATEGORIES } from '../categories';

@Component({
  selector: 'app-recipe-list',
  imports: [RouterLink],
  templateUrl: './recipe-list.html',
  styleUrl: './recipe-list.css',
})
export class RecipeList {
  private service = inject(RecipeService);
  private route = inject(ActivatedRoute);

  recipes = signal<RecipeSummary[]>([]);
  loading = signal(true);
  error = signal(false);
  title = 'All Recipes';

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug') ?? 'all';
    this.title = CATEGORIES.find(c => c.slug === slug)?.label ?? 'Recipes';

    this.service.getRecipes(slug)
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