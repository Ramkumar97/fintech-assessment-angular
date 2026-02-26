import { Routes } from '@angular/router';
import { loadRemote } from '@module-federation/enhanced/runtime';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  }, 
  {
    path: 'summary-panel',
    loadChildren: () =>
      loadRemote<typeof import('login/Routes')>('login/Routes').then(
        (m) => m!.remoteRoutes
      ),
  }
];

