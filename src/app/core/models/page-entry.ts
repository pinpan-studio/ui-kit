/**
 * Registre des pages du catalogue (/pages).
 * Chaque module expose un `PageGroup` dans `pages/<module>/<module>.pages.ts`.
 */
export interface PageEntry {
  /** Libellé affiché dans la galerie. */
  label: string;
  /** URL absolue de la version statique (ex. '/main/client/clients/1'). */
  path: string;
  /** Icône Material. */
  icon?: string;
  /** Courte description (type de page, contenu). */
  description?: string;
  /** Type de page : liste, détail, formulaire, dashboard, etc. */
  kind?: 'dashboard' | 'list' | 'detail' | 'form' | 'wizard' | 'calendar' | 'kanban' | 'settings' | 'auth' | 'public' | 'other';
  /** Variantes d'état disponibles (URL de chaque variante). */
  variants?: { label: string; path: string }[];
}

export interface PageGroup {
  /** Identifiant du module (ex. 'client'). */
  id: string;
  label: string;
  icon: string;
  /** Résumé du module. */
  description?: string;
  pages: PageEntry[];
}
