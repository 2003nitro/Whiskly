import { Component, inject, signal, computed} from '@angular/core';
import { RecipeService, RecipeSummary } from '../recipe.service';
import { PreferencesService } from '../preferences.service';
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


  prefs = inject(PreferencesService);
  hasPhoto = computed(() => this.recipes().some(r => !!r.image_path));

  photo(r: RecipeSummary): string | null {
    return this.service.photoUrl(r.image_path);
  }

  onTogglePhotos(event: Event): void {
    this.prefs.setShowPhotos((event.target as HTMLInputElement).checked);
  }

  hideBroken(event: Event): void {
    (event.target as HTMLInputElement).style.display = 'none';
  }

  formatTime(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h} hr ${m} min` : `${h} hr`;
  }
}
