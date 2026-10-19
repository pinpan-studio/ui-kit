/** Extraits de code affichés dans la galerie Typographie (bouton « </> »). */
export const TYPO_SNIPPETS = {
  families: `
/* Variables (styles/_typography.scss) */
font-family: var(--font-heading);   /* Outfit — titres */
font-family: var(--font-body);      /* Inter — texte */
font-family: var(--font-mono);      /* Space Mono — codes */

<span class="text-overline">Facture</span>
<h3 class="text-h3">Abonnement Premium</h3>
<p class="text-body">…</p>
<span class="text-mono">FAC-2026-0981</span>`,
  scale: `
<h1 class="text-page-title">Registre des clients</h1>
<h2 class="text-h4">Coordonnées</h2>          <!-- sémantique h2, apparence h4 -->
<label class="text-label">Raison sociale</label>
<span class="text-caption">Mis à jour il y a 3 min</span>

.mon-titre { font-size: var(--fs-h3); line-height: var(--lh-heading); }`,
  numbers: `
<td class="text-tabular">{{ montant | number:'1.0-0':'fr-FR' }} FCFA</td>

new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(1250000);
// « 1 250 000 F CFA »`,
  inline: `
<strong>important</strong> · <em>emphase</em> · <mark>trouvé</mark>
<code>CI-4521-AB</code> · <kbd>Ctrl</kbd> + <kbd>K</kbd>
<abbr title="Global Positioning System">GPS</abbr> · 1<sup>er</sup> · <del>45 000 F</del>`,
  french: `
import { frenchTypography } from 'shared/utils/french-typography.util';

frenchTypography('Prix : 1250000 FCFA... "Actif" ?');
// → « Prix : 1 250 000 FCFA… « Actif » ? » avec espaces insécables`,
  fluid: `
.hero-title {
  /* min 24 px, croît avec la largeur du conteneur, max 44 px */
  font-size: clamp(24px, 3.2cqi + 12px, 44px);
}
.hero { container-type: inline-size; }   /* cqi = 1 % de la largeur du conteneur */
/* ou, relatif à la fenêtre : clamp(24px, 2.5vw + 12px, 44px) */`,
};
