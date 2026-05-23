import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
    title: 'Dashboard — FinTrack',
  },
  {
    path: 'lancamentos',
    loadComponent: () =>
      import('./pages/lancamentos/lancamentos.page').then((m) => m.LancamentosPage),
    title: 'Lançamentos — FinTrack',
  },
  {
    path: 'metas',
    loadComponent: () =>
      import('./pages/metas/metas.page').then((m) => m.MetasPage),
    title: 'Metas — FinTrack',
  },
  {
    path: 'investimentos',
    loadComponent: () =>
      import('./pages/investimentos/investimentos.page').then((m) => m.InvestimentosPage),
    title: 'Investimentos — FinTrack',
  },
  { path: '**', redirectTo: 'dashboard' },
];
