import { Routes } from '@angular/router';
import { Trendify } from './components/trendify/trendify';
import { Wishlist } from './components/wishlist/wishlist';

export const routes: Routes = [
  { path: 'trendify', component: Trendify },
  { path: 'wishlist', component: Wishlist },
  {
    path: 'movie/:id',
    loadComponent: () =>
      import('./movie-details/movie-details').then(
        (m) => m.MovieDetailsComponent
      ),
  },
  { path: '', redirectTo: '/trendify', pathMatch: 'full' },
];
