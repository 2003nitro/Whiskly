import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RecipeDetail, RecipeIngredient, RecipeService } from '../recipe.service';

@Component({
  selector: 'app-recipe-page',
  imports: [RouterLink],
  templateUrl: './recipe-page.html',
  styleUrl: './recipe-page.css',
})
export class RecipePage {
  private service = inject(RecipeService);
  private route = inject(ActivatedRoute);

  recipe = signal<RecipeDetail | null>(null);
  loading = signal(true);
  error = signal(false);

  // ingredients grouped by section (Streusel, Cookies, Glaze...) in their saved order
  sections = computed(() => {
    const r = this.recipe();
    if (!r) return [];
    const sorted = [...r.recipe_ingredients].sort((a, b) => a.sort_order - b.sort_order);
    const groups: { name: string | null; items: RecipeIngredient[] }[] = [];
    for (const item of sorted) {
      let group = groups.find(g => g.name === item.section);
      if (!group) {
        group = { name: item.section, items: [] };
        groups.push(group);
      }
      group.items.push(item);
    }
    return groups;
  });

  // splits the instructions text into lines; ALL-CAPS lines become headings
  instructionLines = computed(() => {
    const text = this.recipe()?.instructions ?? '';
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => ({ text: line, heading: /^[A-Z ]+$/.test(line) }));
  });

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.service.getRecipe(id)
      .then(r => this.recipe.set(r))
      .catch(() => this.error.set(true))
      .finally(() => this.loading.set(false));
  }

  formatTime(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h} hr ${m} min` : `${h} hr`;
  }

  // 0.75 -> "3/4", 2.5 -> "2 1/2"; falls back to a rounded decimal
  formatQty(n: number): string {
    const fractions: [number, string][] = [
      [0, ''], [1 / 8, '1/8'], [1 / 4, '1/4'], [1 / 3, '1/3'], [3 / 8, '3/8'],
      [1 / 2, '1/2'], [5 / 8, '5/8'], [2 / 3, '2/3'], [3 / 4, '3/4'], [7 / 8, '7/8'], [1, ''],
    ];
    const whole = Math.floor(n);
    const frac = n - whole;
    let best = fractions[0];
    for (const f of fractions) {
      if (Math.abs(f[0] - frac) < Math.abs(best[0] - frac)) best = f;
    }
    if (Math.abs(best[0] - frac) > 0.04) return String(Math.round(n * 100) / 100);
    if (best[0] === 1) return String(whole + 1);
    if (!best[1]) return String(whole);
    return whole ? `${whole} ${best[1]}` : best[1];
  }
}