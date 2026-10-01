import { Routes } from '@angular/router';
import { RecipeList } from './recipe-list/recipe-list';
import { RecipePage } from './recipe-page/recipe-page';

export const routes: Routes = [
  { path: '', component: RecipeList },
  { path: 'recipe/:id', component: RecipePage },
  { path: '**', redirectTo: '' }
];
