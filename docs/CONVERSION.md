# Guide de conversion — projet d'origine → UI Kit statique

Ce guide s'applique à **toute** page / tout composant porté depuis `ressources/` vers `ui-kit/`.
But : un catalogue UI Angular **100 % statique**, visuellement identique à l'original, sans aucune logique métier ni appel backend.

## 1. Emplacements

| Origine (`ressources/src/app/…`) | Destination (`ui-kit/src/app/…`) |
|---|---|
| `components/main/modules/<module>/pages/**` | `pages/<module>/**` (même sous-arborescence) |
| `components/main/modules/<module>/components/**` | `pages/<module>/components/**` |
| `components/main/modules/<module>/interfaces/**` | `pages/<module>/models/**` (types uniquement) |
| `components/main/modules/<module>/utils/**` (affichage pur) | `pages/<module>/utils/**` |
| `components/main/modules/<module>/pages/<module>.component.*` (wrapper + sidenav du module) | `pages/<module>/<module>-shell.component.*` |
| `interfaces/**` (types globaux) | **déjà copiés** dans `data/models/**` |
| données | `data/static/<module>.data.ts` (ou plusieurs fichiers `data/static/<module>-*.data.ts`) |

Correspondance dossier d'origine → dossier UI Kit : `clients`→`client`, `products`→`produit`, `users`→`admin`, les autres gardent leur nom.

### Propriété des fichiers (sessions parallèles)
Une session ne modifie **que** :
- `src/app/pages/<ses modules>/**`
- `src/app/data/static/<ses modules>*.data.ts`
- tout autre dossier explicitement attribué dans sa mission.

**Interdit de modifier** : `src/app/shared/**`, `src/app/core/**`, `src/app/layouts/**` (sauf attribution explicite), `src/app/app.routes.ts`, `src/app/app.config.ts`, `src/styles*`, `angular.json`, `package.json`.
Besoin d'un changement partagé → le signaler dans le message final (ne pas le faire).

## 2. Ce qui est déjà fourni

- **Routage** : `app.routes.ts` monte déjà `pages/<module>/<module>.routes.ts` (export `default`, tableau `Routes`) sous `/main/<module>` (ou `/auth`, `/public`). Les URLs d'origine sont conservées, donc les `routerLink="/main/…"` des templates d'origine fonctionnent tels quels.
- **Galerie des pages** : `pages/<module>/<module>.pages.ts` (export `default` de type `PageGroup`, voir `core/models/page-entry.ts`) — à remplir avec **toutes** les routes, URLs concrètes (`/main/produit/produits/p-001`, pas `:id`) et variantes d'état.
- **Shell** : `layouts/app-shell` (ex-`MainComponent` : rail d'icônes, toolbar, drawer droit). Les pages ne l'injectent plus.
- **Composants partagés** (`shared/components/`, standalone, identiques à l'original) :
  `app-empty-state`, `app-status-badge`, `app-paginator`, `app-view-mode-toggle`, `app-skeleton`,
  `app-entity-autocomplete`, `app-filter-dropdown` (`FilterOption`), `app-searchable-select` (`SelectOption`),
  `CrudDialogComponent` (`CrudDialogConfig`), `ConfirmDialogComponent`, `app-file-upload` (local, sans upload),
  `app-overlay-spiner`, dialogs génériques (`dialogs/legacy-dialogs.component.ts`).
- **Utils** : `shared/utils/status-badge-color.util.ts`, `status-class.util.ts`, `display-helpers.util.ts`.
- **Directives** : `shared/directives/ui-directives.ts` → `UI_DIRECTIVES` (`matPadding`, `matPaddingSmall`, `matRounded`, `matSquare`, `overflowY`, `appAutofocus`).
- **Pipes** : `shared/pipes/highlight.pipe.ts` (`highlighter`), `in-time.pipe.ts` (`inTime`).
- **Material** : `shared/material.module.ts` → `MaterialModule` (tous les modules Material/CDK de l'original).
- **Services UI uniquement** :
  - `core/services/modal.service.ts` → `ModalService` : `alert`, `confirm`, `prompt` (saisie texte), `bottomConfirm`, `showPushMessage`, `showPriorityMessage`. `modal.showForm(...)` n'existe plus → utiliser `CrudDialogComponent`.
  - `core/services/module-drawer.service.ts` → `ModuleDrawerService` (remplace **tous** les `XxxDrawerService` : `toggle$` / `toggle()`).
  - `core/services/theme.service.ts` → `ThemeService` (clair/sombre).
- **Global** : `provideCharts(withDefaultRegisterables())` (ng2-charts `BaseChartDirective` utilisable directement, `chartjs-plugin-datalabels` installé), adaptateur de dates natif `fr-FR` (`MatDatepicker` OK), locale `fr` enregistrée (`| date:'…':'':'fr'` OK). Pas de `LOCALE_ID` global (comme l'original).
- **Styles** : `src/styles.scss` + `src/styles/*` identiques à l'original. Dans les SCSS, remplacer les imports relatifs `@import '../../../…/styles/breakpoints';` par **`@import 'styles/breakpoints';`** (idem `styles/list-page-base`, `styles/detail-page`, `styles/entity-list`, `styles/responsive`). Les partiels SCSS propres à un module (ex. `_taches-shared.scss`) se copient dans `pages/<module>/` et s'importent en relatif.
- **Assets** : `assets/logo*.png`, `assets/bg.jpg`, `assets/camion.png`, `assets/icons-files/*.png`, `assets/fonts/*` (chemins `assets/...` sans `../`).

## 3. Règles de conversion d'un composant

1. **Copier le `.html` et le `.scss` à l'identique.** Ne retoucher le template que si nécessaire (référence à une API supprimée, binding vers un service disparu, composant non installé). Le rendu doit rester visuellement le même.
2. **Réécrire le `.ts`** :
   - `standalone: true`, imports explicites (Material via `MaterialModule` ou modules individuels, composants partagés).
   - **Supprimer** : `HttpClient`, services métier / registry / repository, stores, sockets, guards, `environment`, `ngx-webstorage-service` (`StorageService`), `MainComponent`, `AuthentificationService`, `PermissionService`, `moment`.
   - **Données** : remplacer `this.service.list(...).subscribe(...)` par des tableaux statiques importés de `data/static/<module>.data.ts` (ou déclarés dans le composant). Pas de faux backend : **pas** de "MockService" qui renvoie des Observables avec délai.
   - **Interactions UI conservées** : recherche, filtres, tri, pagination **locaux** (filtrer le tableau statique en mémoire) ; ouverture/fermeture de modales et drawers ; onglets ; modes de vue ; validation de formulaire.
   - **Actions "métier"** (créer, modifier, supprimer, valider, envoyer…) : effet **local** uniquement (mettre à jour le tableau en mémoire et/ou `MatSnackBar` « … (démo statique) ») — jamais d'appel réseau. Les téléchargements/exports deviennent un snackbar.
   - **Chargement** : `loading = false` dès l'initialisation (ou signal initialisé à `false`). Aucune page ne doit rester bloquée sur un loader.
   - **Paramètres de route** (`:id`) : lire l'id (`ActivatedRoute`), chercher dans les données statiques, **repli sur le premier élément** si introuvable (toute URL doit afficher quelque chose).
   - `localStorage` autorisé **uniquement** pour des préférences d'UI (mode de vue…), toujours dans un `try/catch`.
3. **États / variantes** : pour les pages importantes (listes principales, détails principaux, dashboards), exposer des variantes via `data: { state: 'loading' | 'empty' | 'error' }` sur des routes dédiées, par ex. :
   ```ts
   { path: 'produits', component: ProduitListComponent },
   { path: 'produits-empty', component: ProduitListComponent, data: { state: 'empty' } },
   { path: 'produits-loading', component: ProduitListComponent, data: { state: 'loading' } },
   ```
   et dans le composant : `const state = inject(ActivatedRoute).snapshot.data['state'];` → données vides / `loading = true` / message d'erreur. N'ajouter une variante que si le template d'origine contient réellement l'état correspondant (skeleton, empty-state, bloc d'erreur…). Les référencer dans `variants` du `.pages.ts`.
4. **Dialogs / drawers du module** : les porter dans `pages/<module>/components/**` avec la même règle (html/scss identiques, ts statique). Les ouvrir depuis les pages comme dans l'original.
5. **Bibliothèques non installées** (`leaflet`, `@fullcalendar`, `ckeditor`, `ngx-quill`, `ng2-pdf-viewer`, `xlsx`, `pdfmake`, `moment`) : remplacer par un équivalent visuel statique simple (placeholder stylé, grille calendrier maison, `<textarea>`, …) et le mentionner dans le rapport final. `ngx-skeleton-loader`, `ngx-scrollbar`, `ng2-charts`, `chart.js` **sont** installés.

## 4. Données statiques

- Réalistes, cohérentes entre elles et en français (contexte Côte d'Ivoire : noms ivoiriens, entreprises d'Abidjan/Yamoussoukro/San-Pédro, montants en FCFA, téléphones `+225 …`, dates 2025-2026).
- Volumes suffisants pour tester la pagination (listes principales : **30 à 60** éléments), les filtres (plusieurs statuts/catégories), les graphiques (12 mois), les détails (sous-listes non vides).
- Identifiants lisibles et stables (`cli-001`, `p-001`, `mis-0042`…) pour que les URLs de la galerie soient prévisibles.
- Typer avec les interfaces existantes (`data/models/**` ou `pages/<module>/models/**`) quand c'est simple ; sinon `any` est acceptable.
- Pas de génération aléatoire à l'exécution (`Math.random`) : les écrans doivent être identiques à chaque chargement. Des helpers déterministes (boucles, modulo) sont OK.

## 5. Vérification (obligatoire avant de terminer)

1. Build : `cd ui-kit && npx ng build --configuration development --output-path <votre scratchpad>/build`.
   D'autres sessions travaillent en parallèle : **ignorer les erreurs situées hors de vos dossiers**, corriger toutes celles dans les vôtres. Ne jamais lancer `ng serve` sur le port 4300 (réservé) ; pour une vérification visuelle, utiliser un autre port (4301-4309).
2. `node tools/check-static.mjs src/app/pages/<module>` → doit afficher ✔.
3. Chaque route du module est dans `<module>.pages.ts`, avec une URL concrète.
4. (Recommandé) Ouvrir chaque route dans le navigateur et vérifier : rendu, absence d'erreur console, interactions (modales, onglets, filtres, pagination).

## 6. Rapport final de la session

- Liste des routes créées (URL concrètes) et variantes.
- Composants/dialogs portés.
- Éléments non portés ou remplacés (avec justification).
- Changements souhaités dans les dossiers partagés (le cas échéant).
