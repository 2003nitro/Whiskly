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
}

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

  async getRecipes(): Promise<RecipeSummary[]> {
    const { data, error } = await this.supabase
      .from('recipes')
      .select('id, title, servings, yield_unit, total_minutes, tags')
      .order('title');
    if (error) throw error;
    return data ?? [];
  }
}