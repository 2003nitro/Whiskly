import { Routes } from '@angular/router';
import { RecipeList } from './recipe-list/recipe-list';
import { RecipePage } from './recipe-page/recipe-page';
import { Home } from './home/home';

export const routes: Routes = [
  {path: '', component: Home},
  { path: 'category/:slug', component: RecipeList },
  { path: 'recipe/:id', component: RecipePage },
  { path: '**', redirectTo: '' }
];
