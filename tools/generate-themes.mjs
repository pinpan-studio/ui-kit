#!/usr/bin/env node
/**
 * Génère les palettes tonales Material 3 de tous les thèmes de couleur du kit,
 * à partir d'une couleur source (seed) par thème, pour Angular ET Flutter :
 *
 *   ui-kit/src/themes/_palettes.scss                 (consommé par mat.theme())
 *   ui-kit/src/app/core/theme/theme-palettes.ts      (sélecteur de thème : libellés, pastilles)
 *   ui-kit-flutter/lib/theme/theme_palettes.dart     (ColorScheme M3 côté Flutter)
 *
 * Algorithme : celui de `ng generate @angular/material:theme-color` (material-color-utilities,
 * espace HCT) — primaire = chroma de la source, secondaire = chroma réduit, tertiaire = couleur
 * analogue (TemperatureCache), neutres teintés par la source. Les deux kits partagent donc
 * exactement les mêmes tons.
 *
 * Usage : node tools/generate-themes.mjs   (depuis ui-kit/, après npm install)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import Module from 'node:module';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const flutterRoot = path.resolve(root, '../ui-kit-flutter');

/**
 * Catalogue des thèmes. `palette` = palette prédéfinie d'Angular Material (thème historique,
 * conservé à l'identique) ; sinon `seed` = couleur source passée à l'algorithme M3.
 * `pinned` place le thème en tête du sélecteur ; les autres sont triés automatiquement par
 * teinte (cercle chromatique), puis les thèmes quasi neutres en fin de liste.
 */
const THEMES = [
  { id: 'cyan', label: 'Cyan', palette: 'cyan', tertiaryPalette: 'orange', seed: '#006A6A', default: true, pinned: true },
  { id: 'baseline', label: 'Material', seed: '#6750A4', pinned: true },
  // Rouges, roses
  { id: 'red', label: 'Rouge', seed: '#E53935' },
  { id: 'bordeaux', label: 'Bordeaux', seed: '#7B1E3A' },
  { id: 'pink', label: 'Rose', seed: '#D81B60' },
  { id: 'powder', label: 'Rose poudré', seed: '#E8A0B4' },
  { id: 'fuchsia', label: 'Fuchsia', seed: '#E040FB' },
  // Violets
  { id: 'plum', label: 'Prune', seed: '#5E2750' },
  { id: 'purple', label: 'Violet', seed: '#8E24AA' },
  { id: 'lavender', label: 'Lavande', seed: '#9575CD' },
  { id: 'lilac', label: 'Lilas', seed: '#C8A2C8' },
  // Bleus
  { id: 'indigo', label: 'Indigo', seed: '#3949AB' },
  { id: 'navy', label: 'Bleu nuit', seed: '#1A237E' },
  { id: 'sapphire', label: 'Saphir', seed: '#0F52BA' },
  { id: 'blue', label: 'Bleu', seed: '#1E88E5' },
  { id: 'steel', label: 'Bleu acier', seed: '#4682B4' },
  { id: 'sky', label: 'Ciel', seed: '#039BE5' },
  { id: 'ocean', label: 'Océan', seed: '#006994' },
  // Turquoises, verts
  { id: 'turquoise', label: 'Turquoise', seed: '#40E0D0' },
  { id: 'teal', label: 'Sarcelle', seed: '#00897B' },
  { id: 'mint', label: 'Menthe', seed: '#3EB489' },
  { id: 'green', label: 'Vert', seed: '#43A047' },
  { id: 'forest', label: 'Forêt', seed: '#1B5E20' },
  { id: 'sage', label: 'Sauge', seed: '#87A96B' },
  { id: 'lime', label: 'Anis', seed: '#7CB342' },
  { id: 'chartreuse', label: 'Chartreuse', seed: '#C0CA33' },
  { id: 'olive', label: 'Olive', seed: '#808000' },
  // Jaunes, oranges
  { id: 'yellow', label: 'Jaune', seed: '#FDD835' },
  { id: 'mustard', label: 'Moutarde', seed: '#C7A317' },
  { id: 'amber', label: 'Ambre', seed: '#FFB300' },
  { id: 'orange', label: 'Orange', seed: '#FB8C00' },
  { id: 'peach', label: 'Pêche', seed: '#FFAB91' },
  { id: 'coral', label: 'Corail', seed: '#F4511E' },
  { id: 'salmon', label: 'Saumon', seed: '#FA8072' },
  { id: 'terracotta', label: 'Terracotta', seed: '#C1502E' },
  { id: 'copper', label: 'Cuivre', seed: '#B87333' },
  // Bruns, neutres
  { id: 'brown', label: 'Brun', seed: '#6D4C41' },
  { id: 'sand', label: 'Sable', seed: '#C2B280' },
  { id: 'taupe', label: 'Taupe', seed: '#8B7D6B' },
  { id: 'slate', label: 'Ardoise', seed: '#546E7A' },
  { id: 'graphite', label: 'Graphite', seed: '#616161' },
];

/** Chroma HCT en dessous duquel un thème est considéré comme neutre (placé en fin de liste). */
const NEUTRAL_CHROMA = 16;
/** Teinte HCT de départ du cercle (rouge) : rouge → orange → jaune → vert → bleu → violet → rose. */
const HUE_START = 20;

const KEYS = ['primary', 'secondary', 'tertiary', 'neutral', 'neutral-variant', 'error'];

// ─── Générateur M3 embarqué dans le schematic theme-color d'Angular Material ───
function loadM3Api() {
  const file = path.join(root, 'node_modules/@angular/material/schematics/ng-generate/theme-color/index_bundled.js');
  const src = readFileSync(file, 'utf8') +
    '\n;module.exports.__m3 = { getColorPalettes, getHctFromHex, hexFromArgb, HUE_TONES, NEUTRAL_HUE_TONES };';
  const mod = { exports: {} };
  vm.runInThisContext(Module.wrap(src), { filename: file })(mod.exports, createRequire(file), mod, file, path.dirname(file));
  const api = mod.exports.__m3;
  if (!api?.getColorPalettes) throw new Error('API M3 introuvable dans le schematic theme-color (version Angular Material ?)');
  return api;
}

// ─── Palettes prédéfinies (mat.$<nom>-palette) lues dans les sources SCSS ───
function readPrebuilt(name) {
  const scss = readFileSync(path.join(root, 'node_modules/@angular/material/core/theming/_palettes.scss'), 'utf8');
  const parseTones = (block) => Object.fromEntries(
    [...block.matchAll(/^\s*(\d+):\s*(#[0-9a-fA-F]{6})/gm)].map((m) => [Number(m[1]), m[2].toLowerCase()]));
  const errorBlock = scss.match(/error:\s*\(([\s\S]*?)\)/)[1];
  const start = scss.indexOf(`$${name}-palette:`);
  if (start < 0) throw new Error(`Palette prédéfinie inconnue : ${name}`);
  const body = scss.slice(start, scss.indexOf('));', start));
  const sub = (key) => parseTones(body.match(new RegExp(`\\n\\s*${key}:\\s*\\(([\\s\\S]*?)\\)`))[1]);
  const top = parseTones(body.slice(0, body.search(/\n\s*secondary:/)));
  return { primary: top, secondary: sub('secondary'), neutral: sub('neutral'), 'neutral-variant': sub('neutral-variant'), error: parseTones(errorBlock) };
}

function buildPalettes(api) {
  return THEMES.map((t) => {
    let palettes;
    if (t.palette) {
      const p = readPrebuilt(t.palette);
      palettes = { ...p, tertiary: readPrebuilt(t.tertiaryPalette ?? t.palette).primary };
    } else {
      const raw = api.getColorPalettes(t.seed);
      const tones = (pal, key) => Object.fromEntries(
        (key === 'neutral' ? api.NEUTRAL_HUE_TONES : api.HUE_TONES).map((n) => [n, api.hexFromArgb(pal.tone(n))]));
      palettes = {
        primary: tones(raw.primary), secondary: tones(raw.secondary), tertiary: tones(raw.tertiary),
        neutral: tones(raw.neutral, 'neutral'), 'neutral-variant': tones(raw.neutralVariant), error: tones(raw.error),
      };
    }
    return { ...t, palettes };
  });
}

/** Ordre du sélecteur : thèmes épinglés, puis cercle chromatique, puis neutres (du plus foncé au plus clair). */
function sortThemes(api, themes) {
  const ids = new Set();
  for (const t of themes) {
    if (ids.has(t.id)) throw new Error(`Identifiant de thème en double : ${t.id}`);
    ids.add(t.id);
  }
  const hct = (t) => api.getHctFromHex(t.seed);
  const pinned = themes.filter((t) => t.pinned);
  const rest = themes.filter((t) => !t.pinned);
  const chromatic = rest.filter((t) => hct(t).chroma >= NEUTRAL_CHROMA)
    .sort((a, b) => (hct(a).hue - HUE_START + 360) % 360 - (hct(b).hue - HUE_START + 360) % 360);
  const neutral = rest.filter((t) => hct(t).chroma < NEUTRAL_CHROMA).sort((a, b) => hct(a).tone - hct(b).tone);
  return [...pinned, ...chromatic, ...neutral];
}

const sortTones = (tones) => Object.entries(tones).sort((a, b) => Number(a[0]) - Number(b[0]));
const HEADER = 'GÉNÉRÉ par ui-kit/tools/generate-themes.mjs — ne pas modifier à la main.';

function toScss(themes) {
  const map = (tones, indent) => sortTones(tones).map(([k, v]) => `${indent}${k}: ${v},`).join('\n');
  const entries = themes.map((t) => {
    const blocks = KEYS.map((k) => `    ${k}: (\n${map(t.palettes[k], '      ')}\n    ),`).join('\n');
    return `  '${t.id}': (\n${blocks}\n  ),`;
  }).join('\n');
  return `// ${HEADER}
// Palettes tonales Material 3 (tons 0 → 100) de chaque thème de couleur.
@use 'sass:map';

$_palettes: (
${entries}
);

/// Identifiant du thème par défaut.
$default: '${themes.find((t) => t.default).id}';

/// Identifiants de tous les thèmes, dans l'ordre du sélecteur.
$ids: map.keys($_palettes);

/// Configuration \`color\` attendue par \`mat.theme()\` (primary + tertiary, type color-scheme).
@function color-config($id) {
  $p: map.get($_palettes, $id);
  $rest: (
    secondary: map.get($p, secondary),
    neutral: map.get($p, neutral),
    neutral-variant: map.get($p, neutral-variant),
    error: map.get($p, error),
  );
  @return (
    primary: map.merge(map.get($p, primary), $rest),
    tertiary: map.merge(map.get($p, tertiary), $rest),
    theme-type: color-scheme,
  );
}
`;
}

function toTs(themes) {
  const pick = (t, key, tone) => t.palettes[key][tone];
  const items = themes.map((t) => `  {
    id: '${t.id}',
    label: '${t.label}',
    seed: '${t.seed.toLowerCase()}',
    light: { primary: '${pick(t, 'primary', 40)}', secondary: '${pick(t, 'secondary', 40)}', tertiary: '${pick(t, 'tertiary', 40)}', container: '${pick(t, 'primary', 90)}' },
    dark: { primary: '${pick(t, 'primary', 80)}', secondary: '${pick(t, 'secondary', 80)}', tertiary: '${pick(t, 'tertiary', 80)}', container: '${pick(t, 'primary', 30)}' },
  },`).join('\n');
  return `// ${HEADER}

/** Couleurs représentatives d'un thème pour un mode (rôles M3 primary / secondary / tertiary / primary-container). */
export interface ThemeSwatch {
  primary: string;
  secondary: string;
  tertiary: string;
  container: string;
}

/** Thème de couleur : la classe CSS \`theme-<id>\` applique ses palettes M3 (voir src/themes/_palettes.scss). */
export interface ThemePalette {
  id: string;
  label: string;
  /** Couleur source à partir de laquelle les palettes tonales M3 ont été calculées. */
  seed: string;
  light: ThemeSwatch;
  dark: ThemeSwatch;
}

export const THEME_PALETTES: readonly ThemePalette[] = [
${items}
];

export type ThemePaletteId = (typeof THEME_PALETTES)[number]['id'];

export const DEFAULT_THEME_PALETTE = '${themes.find((t) => t.default).id}';
`;
}

function toDart(themes) {
  const hex = (v) => `Color(0xFF${v.slice(1).toUpperCase()})`;
  const tones = (t, key) => sortTones(t.palettes[key]).map(([k, v]) => `${k}: ${hex(v)}`).join(', ');
  const camel = (k) => k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const items = themes.map((t) => `  KitPalette(
    id: '${t.id}',
    label: '${t.label}',
    seed: ${hex(t.seed)},
${KEYS.map((k) => `    ${camel(k)}: TonalTones({${tones(t, k)}}),`).join('\n')}
  ),`).join('\n');
  return `// ${HEADER}

import 'package:flutter/painting.dart';

import 'kit_palette.dart';

/// Thèmes de couleur du kit — mêmes palettes tonales M3 que le UI Kit Angular.
const List<KitPalette> kitPalettes = [
${items}
];

/// Identifiant du thème par défaut.
const String kDefaultPaletteId = '${themes.find((t) => t.default).id}';
`;
}

const api = loadM3Api();
const themes = sortThemes(api, buildPalettes(api));

const outputs = [
  [path.join(root, 'src/themes/_palettes.scss'), toScss(themes)],
  [path.join(root, 'src/app/core/theme/theme-palettes.ts'), toTs(themes)],
  [path.join(flutterRoot, 'lib/theme/theme_palettes.dart'), toDart(themes)],
];
for (const [file, content] of outputs) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
  console.log('✓', path.relative(path.resolve(root, '..'), file));
}
console.log(`${themes.length} thèmes générés.`);
