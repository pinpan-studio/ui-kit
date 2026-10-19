import { Routes } from '@angular/router';

/**
 * /examples/** — écrans d'exemple autonomes (hors layout du catalogue), présentés en iframe dans /showcases.
 * Données statiques uniquement.
 */
export default [
  { path: '', pathMatch: 'full', redirectTo: 'app/dashboard' },
  { path: 'auth', pathMatch: 'full', redirectTo: 'auth/centered' },
  { path: 'auth/:variant', title: 'Connexion', loadComponent: () => import('./auth/auth-example.component').then((m) => m.AuthExampleComponent) },
  { path: 'app', pathMatch: 'full', redirectTo: 'app/dashboard' },
  { path: 'app/dashboard', title: 'Tableau de bord', loadComponent: () => import('./app/dashboard-example.component').then((m) => m.DashboardExampleComponent) },
  { path: 'app/clients', title: 'Clients', loadComponent: () => import('./app/clients-example.component').then((m) => m.ClientsExampleComponent) },
  { path: 'app/clients/:id', title: 'Fiche client', loadComponent: () => import('./app/client-detail-example.component').then((m) => m.ClientDetailExampleComponent) },
  { path: 'app/inbox', title: 'Messagerie', loadComponent: () => import('./app/inbox-example.component').then((m) => m.InboxExampleComponent) },
  { path: 'app/catalog', title: 'Catalogue', loadComponent: () => import('./app/catalog-example.component').then((m) => m.CatalogExampleComponent) },
  { path: 'app/board', title: 'Planning', loadComponent: () => import('./app/board-example.component').then((m) => m.BoardExampleComponent) },
  { path: 'app/modules', title: 'Modules', loadComponent: () => import('./app/modules-example.component').then((m) => m.ModulesExampleComponent) },
  { path: 'app/blog', title: 'Blog', loadComponent: () => import('./app/blog-example.component').then((m) => m.BlogExampleComponent) },
  { path: 'app/blog/:slug', title: 'Article', loadComponent: () => import('./app/article-example.component').then((m) => m.ArticleExampleComponent) },
  { path: 'app/docs', title: 'Documentation', loadComponent: () => import('./app/docs-example.component').then((m) => m.DocsExampleComponent) },
  { path: 'app/files', title: 'Fichiers', loadComponent: () => import('./app/files-example.component').then((m) => m.FilesExampleComponent) },
  { path: 'app/files/columns', title: 'Fichiers — colonnes', loadComponent: () => import('./app/files-columns-example.component').then((m) => m.FilesColumnsExampleComponent) },
  { path: 'app/monitoring', title: 'Supervision', loadComponent: () => import('./app/monitoring-example.component').then((m) => m.MonitoringExampleComponent) },
  { path: 'app/chat', title: 'Messagerie instantanée', loadComponent: () => import('./app/chat-example.component').then((m) => m.ChatExampleComponent) },
  { path: 'app/feed', title: 'Fil d’équipe', loadComponent: () => import('./app/feed-example.component').then((m) => m.FeedExampleComponent) },
  { path: 'forms', pathMatch: 'full', redirectTo: 'forms/contact' },
  { path: 'forms/contact', title: 'Contact', loadComponent: () => import('./forms/contact-form.component').then((m) => m.ContactFormComponent) },
  { path: 'forms/checkout', title: 'Commande', loadComponent: () => import('./forms/checkout-form.component').then((m) => m.CheckoutFormComponent) },
  { path: 'forms/onboarding', title: 'Bienvenue', loadComponent: () => import('./forms/onboarding-form.component').then((m) => m.OnboardingFormComponent) },
  { path: 'forms/survey', title: 'Questionnaire', loadComponent: () => import('./forms/survey-form.component').then((m) => m.SurveyFormComponent) },
  { path: 'forms/booking', title: 'Réservation', loadComponent: () => import('./forms/booking-form.component').then((m) => m.BookingFormComponent) },
  { path: 'forms/application', title: 'Candidature', loadComponent: () => import('./forms/application-form.component').then((m) => m.ApplicationFormComponent) },
  { path: 'app/settings', title: 'Paramètres', loadComponent: () => import('./app/settings-example.component').then((m) => m.SettingsExampleComponent) },
] satisfies Routes;
