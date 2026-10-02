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
  private recipeId = 0;
  checked = signal<Set<number>>(new Set());
  doneSteps = signal<Set<number>>(new Set());

  recipe = signal<RecipeDetail | null>(null);
  loading = signal(true);
  error = signal(false);

  totalIngredients = computed(() => this.recipe()?.recipe_ingredients.length ?? 0);
  checkedCount = computed(() => {
  const ids = new Set(this.recipe()?.recipe_ingredients.map(i => i.id));
  return [...this.checked()].filter(id => ids.has(id)).length;
});

   isChecked(id: number): boolean {
    return this.checked().has(id);
  }

  isStepDone(index: number): boolean {
    return this.doneSteps().has(index);
  }

  toggle(id: number): void{
    const next = new Set(this.checked());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.checked.set(next);
    this.save();
  }

  toggleStep(index: number): void{
    const next = new Set(this.doneSteps());
    if (next.has(index)) next.delete(index);
    else next.add(index);
    this.doneSteps.set(next);
    this.saveSteps();
  }

  clearSteps(): void{
    this.doneSteps.set(new Set());
    this.saveSteps();
  }

  private saveSteps(): void {
    try{
      localStorage.setItem(this.stepsStorageKey(), JSON.stringify([...this.doneSteps()]));
    } catch {
    }
  }


  
  clearChecks(): void{
    this.checked.set(new Set());
    this.save();
  }

  private storeageKey(): string {
    return `whiskly:checked:${this.recipeId}`;
  }

  private stepsStorageKey(): string {
    return `whiskly:steps:${this.recipeId}`;
  }

  private load(): void {
    try{
      const ing = localStorage.getItem(this.storeageKey());
      if (ing) this.checked.set(new Set(JSON.parse(ing) as number[]));
      const steps = localStorage.getItem(this.stepsStorageKey());
      if (steps) this.doneSteps.set(new Set(JSON.parse(steps) as number[]));
    } catch {
    }
  }

  private save(): void {
    try{
      localStorage.setItem(this.storeageKey(), JSON.stringify([...this.checked()]));
    } catch {
    }
  }

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
    this.recipeId = Number(this.route.snapshot.paramMap.get('id'));
    this.service.getRecipe(this.recipeId)
      .then(r => {
        this.recipe.set(r);
        this.load();
      })
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