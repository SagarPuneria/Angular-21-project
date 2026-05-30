import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Eagerly loaded routes
  { path: 'home', component: Home },
  { path: 'about', component: About },

  // Courses — with child routes (lazy loaded parent + children).
  // Courses - explicitly lazy loaded, since Courses component has children components
  {
    path: 'courses',
    loadComponent: () => import('./pages/courses/courses').then(m => m.Courses),
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        loadComponent: () =>
          import('./pages/courses/overview/course-overview').then(m => m.CourseOverview),
      },
      {
        path: 'details',
        loadComponent: () =>
          import('./pages/courses/details/course-details').then(m => m.CourseDetails),
      },
    ],
  },

  // Products list — lazy loaded
  {
    path: 'products',
    loadComponent: () => import('./pages/product-list/product-list').then(m => m.ProductList),
  },

  // Product detail — route param :id bound automatically via withComponentInputBinding()
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then(m => m.ProductDetail),
  },

  // Reactive forms + shared data demo routes
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.Register),
  },
  {
    path: 'form-array',
    loadComponent: () => import('./pages/form-array/form-array').then(m => m.FormArrayExample),
  },
  {
    path: 'summary',
    loadComponent: () => import('./pages/summary/summary').then(m => m.Summary),
  },
  {
    path: 'controls-demo',
    loadComponent: () =>
      import('./pages/controls-demo/controls-demo').then(m => m.ControlsDemo),
  },

  // Enroll — explicitly lazy loaded (separate JS chunk, fetched only on navigation)
  {
    path: 'enroll',
    loadComponent: () => import('./pages/enroll/enroll').then(m => m.Enroll),
  },

  // Dashboard — protected by authGuard (canActivate)
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
  },

  // Login — public route
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
  },

  // Wildcard — redirect any unknown URL back to home
  { path: '**', redirectTo: 'home' },
];
