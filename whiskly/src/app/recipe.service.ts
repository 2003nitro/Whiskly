import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

export interface RecipeSummary {
  id: number;
  title: string;
  servings: number | null;
  yield_unit: string | null;
  total_minutes: number | null;
  tags: string[];
  rating: number | null;
}

export interface RecipeIngredient {
  id: number;
  quantity: number;
  unit: string | null;
  grams: number | null;
  note: string | null;
  section: string | null;
  sort_order: number;
  ingredients: { name: string };
}

export interface RecipeDetail extends RecipeSummary {
  instructions: string | null;
  prep_minutes: number | null;
  cook_minutes: number | null;
  source_url: string | null;
  recipe_ingredients: RecipeIngredient[];
}

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

  // all recipes, for the list page
  async getRecipes(): Promise<RecipeSummary[]> {
    const { data, error } = await this.supabase
      .from('recipes')
      .select('id, title, servings, yield_unit, total_minutes, tags, rating')
      .order('title');
    if (error) throw error;
    return data ?? [];
  }

  // one recipe with its ingredients, for the recipe page
  async getRecipe(id: number): Promise<RecipeDetail | null> {
    const { data, error } = await this.supabase
      .from('recipes')
      .select(`
        id, title, servings, yield_unit, total_minutes, prep_minutes, cook_minutes,
        tags, source_url, instructions,
        recipe_ingredients (
          id, quantity, unit, grams, note, section, sort_order,
          ingredients ( name )
        )
      `)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as unknown as RecipeDetail | null;
  }
}