# UI Kit — Référentiel statique

Catalogue UI Angular **100 % statique** extrait de l'application `ressources/` (lookas-web).
Aucune logique métier, aucun appel backend, aucune API : toutes les pages fonctionnent avec des données statiques.

## Démarrer

```bash
npm install
npm start            # http://localhost:4300
npm run build        # build de production (dist/ui-kit)
npm run check:static # vérifie l'absence de HttpClient / fetch / WebSocket / API dans src/app
```

Prérequis : Node 20+ (testé avec Node 22). Aucune infrastructure externe : polices (Inter, Outfit, Roboto) et icônes Material sont embarquées via npm.

## Navigation

| URL | Contenu |
|---|---|
| `/ui-showcase` | Vue globale : couleurs, typographie, espacements, icônes, accès à tout le catalogue |
| `/components` | Galeries de composants : `forms`, `buttons`, `navigation`, `data`, `feedback`, `planning`, `maps`, `material`, `layout` |
| `/layouts` | Gabarits d'écran complets (shell, module, détail, auth, public, drawer, dialogs) |
| `/showcases` | Aperçus en iframe dans un cadre d'appareil (PC + navigateur, iPad, iPhone) : modules (Main, Harnais), authentification (11 variantes, dont Google / Apple / Microsoft / Facebook / GitHub / LinkedIn), formulaires (6), contenu éditorial (4 : article + commentaires, blog, documentation, fil d'équipe), dispositions d'application (8) |
| `/showcases/:id` | Visionneuse : bascule ordinateur / tablette / mobile (`?device=`), rotation (`?landscape=1`), zoom, recharger, ouvrir dans un onglet ; raccourcis 1 / 2 / 3, R, ← → |
| `/examples/**` | Écrans d'exemple autonomes affichés par les showcases (`/examples/auth/:variant`, `/examples/forms/*`, `/examples/app/*`) |
| `/pages` | Toutes les pages de l'application, par module, avec leurs variantes d'état |
| `/main/**` | Application statique (mêmes URLs que l'original) |
| `/auth/**` | Écrans d'authentification (sans authentification réelle) |
| `/public/**` | Pages publiques (proforma, dossier) |

La sidebar du catalogue liste toutes les pages (recherche intégrée) ; dans l'application, l'icône « widgets » de la barre d'outils ramène au catalogue.

## Architecture

```
src/
├── app/
│   ├── core/
│   │   ├── models/          page-entry.ts (type du registre), page-registry.ts (agrégation)
│   │   ├── services/        theme (mode + couleur), modal (dialogs UI), module-drawer — aucun service métier
│   │   └── theme/           theme-palettes.ts (généré), custom-theme.ts (moteur du studio de thème)
│   ├── shared/
│   │   ├── components/      empty-state, status-badge, paginator, view-mode-toggle, skeleton,
│   │   │                    entity-autocomplete, filter-dropdown, searchable-select, crud-dialog,
│   │   │                    confirm-dialog, file-upload (local), overlay-spinner, dialogs génériques
│   │   ├── directives/      matPadding, matRounded, overflowY…
│   │   ├── pipes/           highlighter, inTime
│   │   ├── utils/           couleurs/classes de statut, helpers d'affichage
│   │   └── material.module.ts
│   ├── layouts/
│   │   ├── app-shell/       shell applicatif (rail, toolbar, drawer droit + panneaux)
│   │   └── kit-layout/      layout du catalogue
│   ├── pages/<module>/      pages converties : <module>.routes.ts, <module>.pages.ts (registre galerie),
│   │                        <module>-shell (sous-navigation), composants et dialogs du module
│   ├── showcase/            /ui-showcase, /components/*, /pages, /layouts
│   ├── data/
│   │   ├── models/          interfaces d'entités (types uniquement)
│   │   └── static/          jeux de données statiques par module
│   ├── app.config.ts        providers (router, animations, charts, dates fr-FR) — pas de HttpClient
│   └── app.routes.ts
├── assets/                  logos, fonds, icônes de fichiers, polices TT Wellingtons
├── styles/                  partiels SCSS du design system (breakpoints, entity-list, detail-page…)
├── themes/_palettes.scss    palettes tonales M3 des thèmes de couleur (généré)
└── styles.scss              mat.theme() M3 (clair / sombre × couleurs) + jetons CSS globaux
```

## Thèmes

41 thèmes de couleur Material 3 (Cyan par défaut, Material, puis rouges, oranges, jaunes, verts,
bleus, violets, roses et neutres — liste complète dans `tools/generate-themes.mjs`), chacun en mode
**clair**, **sombre** ou **système** (suit `prefers-color-scheme`). Le choix est mémorisé (localStorage).

- Sélecteur : bouton « palette » des barres d'outils (`<app-theme-picker>`), section « Thèmes » de
  `/ui-showcase` (`<app-theme-settings>`), palette ⌘K.
- Code : `ThemeService.setMode('light' | 'dark' | 'system')`, `ThemeService.setPalette('red')`.
  Le service pose `light`/`dark` et `theme-<id>` sur `<body>` et le conteneur d'overlays.
- Fonctionnement : `mat.theme()` émet les rôles système `--mat-sys-*` en `light-dark(clair, sombre)` ;
  `color-scheme` (classe `.light`/`.dark`) choisit le ton, `.theme-<id>` la palette. Les jetons du kit
  (`--primary-color`, `--bg`, `--card-bg`, `--text-*`…) dérivent de ces rôles.
- Pour une couleur toujours lisible, utiliser les rôles M3 par paires : `--mat-sys-primary` /
  `--mat-sys-on-primary`, `--mat-sys-primary-container` / `--mat-sys-on-primary-container`, etc.

**Studio de thème** (`/theme-studio`, lien dans le sélecteur et la sidebar) : couleur rapide (pastilles,
sélecteur, hexadécimal, hasard), **style M3** (Fidélité, Tonal spot, Vibrant, Expressif, Contenu,
Arc-en-ciel, Salade de fruits, Neutre, **Noir & blanc**), **contraste** (standard / moyen / élevé) et
couleurs imposées par rôle (secondary, tertiary, neutral, neutral variant, error). Aperçu d'une app en
clair et en sombre, **nuanciers** (tons 0 → 100 de chaque palette), rôles avec ratio de contraste,
export CSS / JSON. « Appliquer » active le thème `theme-custom` sur tout le kit (mémorisé) ; il reste
accessible via la pastille « Personnalisé » du sélecteur. Moteur : `src/app/core/theme/custom-theme.ts`
(`@material/material-color-utilities`, `DynamicScheme`).

**Ajouter ou modifier un thème** : éditer la liste `THEMES` de `tools/generate-themes.mjs` (une couleur
source par thème ; l'ordre du sélecteur est calculé par teinte), puis `node tools/generate-themes.mjs`. Le script calcule les palettes tonales avec
l'algorithme Material 3 (HCT, celui de `ng generate @angular/material:theme-color`) et régénère
`src/themes/_palettes.scss`, `src/app/core/theme/theme-palettes.ts` **et** le fichier Dart du kit Flutter :
les deux kits gardent exactement les mêmes couleurs.

## Réutiliser un élément dans un nouveau projet

1. Trouver le composant ou la page dans le catalogue (`/components/*` ou `/pages`).
2. Le bouton « `</>` » des démos affiche un extrait prêt à copier.
3. Copier le composant depuis `src/app/shared/components/` ou `src/app/pages/<module>/`, avec `src/styles.scss`, `src/styles/` et `src/themes/` pour conserver le rendu.
4. Remplacer les données statiques (`src/app/data/static/*`) par vos propres sources.

## Cartes (Leaflet)

`shared/components/map` fournit `app-map` : Leaflet 1.9 + `leaflet.markercluster`, `leaflet-draw` et `@geoman-io/leaflet-geoman-free`, chargés à la demande.
Fonds de carte gratuits sans clé d'API (Esri Canvas gris clair / gris foncé, Esri Rues, Topographique et Satellite, OpenStreetMap) :
seules les **tuiles** sont téléchargées depuis ces serveurs publics, aucune API n'est appelée. Non retenus : CARTO (clé désormais exigée),
OpenTopoMap et OSM France (trop lents, tuiles manquantes).

## Planning générique

`shared/components/planning` : kanban, Gantt, grille de notes, vue groupée, calendrier et agenda sur un modèle neutre `PlanningItem`
(aucun champ métier). Recherche, filtres déclaratifs (`PlanningFilter`) et bascule « En retard » sont des entrées optionnelles communes
à toutes les vues. Les composants `pages/taches/components/*` restent utilisés par les pages du module Tâches.

## Conventions

Voir [docs/CONVERSION.md](docs/CONVERSION.md) : règles de conversion, emplacement des fichiers, données statiques, variantes d'état (`data: { state: 'loading' | 'empty' | 'error' }`).

## Écarts assumés vis-à-vis de l'original

- **Supprimés** (backend uniquement) : HttpClient/intercepteurs, sockets, Firebase, Sentry, stockage de session, guards de permissions, services et stores métier.
- **Remplacés par un rendu statique** : FullCalendar, éditeur CKEditor/Quill, visionneuse PDF, exports XLSX/PDF (snackbar de démonstration).
- **Moment.js** remplacé par l'adaptateur de dates natif (`fr-FR`).
- Composants génériques pilotés par métadonnées backend (`list-page`, `form-layout`, `details-page`, `file-browser`…) : non portés tels quels ; leurs écrans utilisateurs ont été reconstruits statiquement.
