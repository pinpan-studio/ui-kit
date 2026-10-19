import { Article, ArticleBlock, CommentAuthor, CommentItem } from '../../shared/components/content/content.models';

/** Données éditoriales des exemples : articles de blog, commentaires, documentation. Contenu fictif. */

export const PEOPLE: CommentAuthor[] = [
  { name: 'Jean Kouassi', color: '#0ea5e9', role: 'Administrateur' },
  { name: 'Aya Koné', color: '#8b5cf6', role: 'Opérations' },
  { name: 'Marc Yao', color: '#10b981', role: 'Développeur' },
  { name: 'Grace Kouamé', color: '#f59e0b', role: 'Designer' },
  { name: 'Ibrahim Sanogo', color: '#ef4444', role: 'Produit' },
  { name: 'Nadia Touré', color: '#ec4899', role: 'Rédaction' },
];
export const ME = PEOPLE[0];
const [, AYA, MARC, GRACE, IBRAHIM, NADIA] = PEOPLE;

const LONG: ArticleBlock[] = [
  { type: 'lead', text: 'Un design system n’est pas une bibliothèque de boutons. C’est un **langage commun** entre designers, développeurs et métiers — et comme tout langage, il vit, s’use et se réforme.' },
  { type: 'p', dropcap: true, text: 'Il y a deux ans, notre application comptait quatorze nuances de bleu, neuf tailles de titres et autant de façons d’afficher une date. Chaque écran était cohérent avec lui-même, aucun ne l’était avec ses voisins. Les équipes livraient vite, mais chaque nouvelle page ajoutait un peu plus de dette visuelle.' },
  { type: 'p', text: 'Nous avons alors pris une décision simple : avant d’ajouter un composant, nous le cherchons dans le kit. S’il n’existe pas, nous le construisons **dans** le kit, documenté et testé, puis nous l’utilisons.' },
  { type: 'h2', text: 'Commencer par la typographie' },
  { type: 'p', text: 'La typographie porte 90 % de l’interface. Avant les couleurs, avant les composants, nous avons fixé une échelle : un ratio de 1,2 (tierce mineure), arrondi sur une grille de 2 px. Deux familles seulement : *Outfit* pour les titres, *Inter* pour le texte.' },
  { type: 'table', caption: 'Échelle typographique retenue (px).', head: ['Rôle', 'Taille', 'Interlignage', 'Graisse'], rows: [
    ['Display', '40', '1,15', '700'], ['Titre 1', '32', '1,2', '700'], ['Titre 2', '24', '1,25', '600'], ['Corps', '14 – 16', '1,55', '400'], ['Légende', '12', '1,4', '400'],
  ] },
  { type: 'callout', tone: 'info', title: 'La mesure compte', text: 'Une ligne de texte confortable fait entre **60 et 75 caractères**. Au-delà, l’œil peine à retrouver le début de la ligne suivante : nous plafonnons le corps de texte à `68ch`.' },
  { type: 'h3', text: 'Les règles de la typographie française' },
  { type: 'p', text: 'Le français a ses propres conventions : espace insécable avant les signes doubles, guillemets « chevrons », apostrophe typographique, séparateur de milliers en espace fine. Nous les appliquons automatiquement à la saisie.' },
  { type: 'list', items: ['Espace fine insécable avant `; ! ?` et espace insécable avant `:`', 'Guillemets « … » avec espaces insécables intérieures', 'Montants : 1 250 000 FCFA, heures : 14 h 05', 'Points de suspension en un seul caractère (…)'] },
  { type: 'pullquote', text: 'Un composant qui n’est pas documenté n’existe pas. Un composant documenté mais pas utilisé non plus.' },
  { type: 'h2', text: 'Des jetons plutôt que des valeurs' },
  { type: 'p', text: 'Chaque couleur est un **rôle**, jamais une valeur : `--primary-color`, `--text-secondary`, `--border-color`. Le mode sombre et les 41 thèmes de couleur deviennent alors un simple changement de jeu de jetons.' },
  { type: 'code', lang: 'scss', filename: 'styles/_tokens.scss', code: ':root {\n  --primary-color: var(--mat-sys-primary);\n  --text-primary: #1f2937;\n  --text-secondary: #4b5563;\n  --border-color: #e5e7eb;\n  --radius-card: 24px;\n}\n\n.card {\n  border: 1px solid var(--border-color);\n  border-radius: var(--radius-card);\n}' },
  { type: 'figure', icon: 'palette', hue: 185, wide: true, caption: 'Les rôles de couleur Material 3, déclinés en clair et en sombre pour chaque thème.' },
  { type: 'h2', text: 'Mesurer l’adoption' },
  { type: 'p', text: 'Un kit se juge à son usage. Chaque mois, nous comptons les composants maison encore présents dans le code et les écarts de style relevés en revue.' },
  { type: 'quote', text: 'Le jour où un nouvel arrivant a livré un écran complet sans écrire une ligne de CSS, nous avons su que le kit avait gagné.', cite: 'Grace Kouamé, lead design' },
  { type: 'callout', tone: 'success', title: 'Résultat après 18 mois', text: '84 % des écrans n’utilisent que des composants du kit, et le temps moyen de conception d’une page est passé de 5 à 2 jours.' },
  { type: 'divider' },
  { type: 'p', text: 'Il reste du chemin : l’accessibilité des graphiques, la densité des tableaux sur mobile, les formulaires très longs. Ce sera l’objet des prochains articles.' },
];

const short = (lead: string, h: string): ArticleBlock[] => [
  { type: 'lead', text: lead },
  { type: 'p', text: 'Cet article d’exemple illustre la mise en page éditoriale du kit : chapô, intertitres, listes, encadrés et citations, avec une mesure de ligne confortable.' },
  { type: 'h2', text: h },
  { type: 'p', text: 'Les données sont statiques. Ouvrez l’article principal pour voir l’ensemble des blocs disponibles et le fil de commentaires complet.' },
  { type: 'callout', tone: 'neutral', text: 'Astuce : tous les blocs acceptent le Markdown en ligne, **gras**, *italique*, `code` et [liens](#).' },
];

export const ARTICLES: Article[] = [
  { slug: 'design-system-langage-commun', title: 'Un design system, c’est d’abord un langage commun', dek: 'Ce que deux ans de composants partagés nous ont appris sur la typographie, les jetons et l’adoption.',
    category: 'Design', tags: ['design system', 'typographie', 'jetons'], author: { name: 'Grace Kouamé', role: 'Lead design', color: '#f59e0b', bio: 'Designer produit à Abidjan, Grace anime l’équipe design system et la communauté UI Kit.' },
    date: '2026-10-14', minutes: 8, hue: 185, icon: 'auto_stories', featured: true, blocks: LONG },
  { slug: 'formulaires-longs-sans-douleur', title: 'Des formulaires longs, sans douleur', dek: 'Découper, enregistrer en continu, valider au bon moment : nos règles pour les formulaires de plus de 20 champs.',
    category: 'UX', tags: ['formulaires', 'validation'], author: { name: 'Nadia Touré', role: 'Rédaction', color: '#ec4899' }, date: '2026-10-09', minutes: 6, hue: 280, icon: 'dynamic_form',
    blocks: short('Un formulaire long n’est pas un mauvais formulaire : c’est un formulaire mal découpé.', 'Une étape, une intention') },
  { slug: 'mobile-money-paiement', title: 'Intégrer le Mobile Money dans un tunnel de paiement', dek: 'Orange Money, MTN MoMo, Wave : concevoir un parcours clair quand la confirmation arrive par SMS.',
    category: 'Produit', tags: ['paiement', 'mobile'], author: { name: 'Ibrahim Sanogo', role: 'Produit', color: '#ef4444' }, date: '2026-10-02', minutes: 5, hue: 30, icon: 'phone_iphone',
    blocks: short('Le paiement mobile est la norme : le tunnel doit l’être aussi.', 'Attendre la confirmation') },
  { slug: 'mode-sombre-sans-regret', title: 'Le mode sombre, sans regret', dek: 'Contrastes, élévation, images : les pièges du thème sombre et comment les éviter.',
    category: 'Design', tags: ['thème', 'accessibilité'], author: { name: 'Marc Yao', role: 'Développeur', color: '#10b981' }, date: '2026-09-25', minutes: 4, hue: 230, icon: 'dark_mode',
    blocks: short('Inverser les couleurs ne suffit pas.', 'L’élévation par la lumière') },
  { slug: 'tableaux-sur-mobile', title: 'Que faire des tableaux sur mobile ?', dek: 'Cartes, colonnes prioritaires, défilement horizontal : comparaison de quatre stratégies.',
    category: 'UX', tags: ['responsive', 'tableaux'], author: { name: 'Aya Koné', role: 'Opérations', color: '#8b5cf6' }, date: '2026-09-18', minutes: 7, hue: 150, icon: 'table_rows',
    blocks: short('Un tableau de 8 colonnes ne tiendra jamais dans 393 px.', 'Choisir ce qui compte') },
  { slug: 'ecrire-pour-interface', title: 'Écrire pour l’interface', dek: 'Boutons, erreurs, états vides : le microtexte est une partie du design.',
    category: 'Rédaction', tags: ['UX writing'], author: { name: 'Nadia Touré', role: 'Rédaction', color: '#ec4899' }, date: '2026-09-11', minutes: 5, hue: 340, icon: 'edit_note',
    blocks: short('Un bon libellé de bouton dit ce qui va se passer.', 'Verbes d’action') },
];
export const BLOG_CATEGORIES = ['Tous', ...new Set(ARTICLES.map((a) => a.category))];

export const COMMENTS: CommentItem[] = [
  { id: 'k1', author: GRACE, byAuthor: true, pinned: true, at: 'il y a 2 j', likes: 24,
    text: 'Merci pour vos retours ! Le prochain article portera sur **la densité des tableaux sur mobile**. Dites-moi en réponse ce que vous aimeriez y voir.',
    reactions: [{ emoji: '🎉', count: 6 }, { emoji: '❤️', count: 3 }],
    replies: [
      { id: 'k1a', author: MARC, at: 'il y a 2 j', likes: 5, text: 'Les colonnes figées et le défilement horizontal, surtout avec la sélection multiple.' },
      { id: 'k1b', author: AYA, at: 'il y a 1 j', likes: 2, text: '@Marc-Yao +1, et les actions groupées : sur mobile on ne sait jamais où les mettre.' },
      { id: 'k1c', author: IBRAHIM, at: 'il y a 20 h', likes: 1, text: 'Et les filtres ! Une feuille du bas (*bottom sheet*) marche bien chez nous.' },
      { id: 'k1d', author: GRACE, byAuthor: true, at: 'il y a 18 h', likes: 3, text: 'Noté, merci à tous 🙏' },
    ] },
  { id: 'k2', author: MARC, at: 'il y a 1 j', likes: 12,
    text: 'Le passage sur les jetons est exactement ce qu’il nous manquait. Petite question : vous générez les palettes à la compilation ou à l’exécution ?\n\n```\nnode tools/generate-themes.mjs\n```',
    replies: [
      { id: 'k2a', author: GRACE, byAuthor: true, at: 'il y a 1 j', likes: 4, text: 'À la compilation pour les 41 thèmes prédéfinis, à l’exécution pour le **studio de thème** (couleur personnalisée).' },
    ] },
  { id: 'k3', author: NADIA, at: 'il y a 9 h', likes: 7, reactions: [{ emoji: '👍', count: 4 }],
    text: 'Bravo pour la partie typographie française. Les espaces fines avant `?` et `!` sont trop souvent oubliées.' },
  { id: 'k4', author: AYA, at: 'il y a 3 h', likes: 1, text: 'Est-ce que le kit est utilisable dans une application Flutter aussi ?' },
];

export const FEED_COMMENTS: CommentItem[][] = [
  [
    { id: 'f1', author: MARC, at: 'il y a 1 h', likes: 3, text: 'Super, on teste ça dès lundi sur l’entrepôt de Vridi.' },
    { id: 'f2', author: AYA, at: 'il y a 40 min', likes: 1, text: '@Marc-Yao je te prépare les accès.' },
  ],
  [{ id: 'f3', author: NADIA, at: 'il y a 3 h', likes: 2, text: 'Les nouvelles illustrations sont magnifiques 😍' }],
  [],
];

export interface DocNode { label: string; slug?: string; icon?: string; children?: DocNode[]; badge?: string; }
export const DOCS_NAV: DocNode[] = [
  { label: 'Prise en main', icon: 'rocket_launch', children: [{ label: 'Introduction', slug: 'introduction' }, { label: 'Installation', slug: 'installation', badge: 'v2' }, { label: 'Thèmes', slug: 'themes' }] },
  { label: 'Fondations', icon: 'foundation', children: [{ label: 'Typographie', slug: 'typographie' }, { label: 'Couleurs', slug: 'couleurs' }, { label: 'Espacements', slug: 'espacements' }] },
  { label: 'Composants', icon: 'widgets', children: [{ label: 'Boutons', slug: 'boutons' }, { label: 'Formulaires', slug: 'formulaires' }, { label: 'Commentaires', slug: 'commentaires', badge: 'Nouveau' }, { label: 'Article', slug: 'article', badge: 'Nouveau' }] },
  { label: 'Guides', icon: 'menu_book', children: [{ label: 'Accessibilité', slug: 'accessibilite' }, { label: 'Contribuer', slug: 'contribuer' }] },
];

export const DOC_PAGE: ArticleBlock[] = [
  { type: 'lead', text: '`<app-comment-thread>` affiche un fil de discussion complet : saisie, tri, réponses imbriquées, réactions, modification et suppression.' },
  { type: 'h2', text: 'Utilisation' },
  { type: 'code', lang: 'html', filename: 'article.component.html', code: '<app-comment-thread\n  [comments]="comments"\n  [me]="currentUser"\n  [mentionables]="team"\n  moderator\n  (changed)="save($event)" />' },
  { type: 'p', text: 'Le composant garde une copie locale de la liste : les interactions sont immédiates, et chaque modification est émise via `changed` pour que l’hôte la persiste.' },
  { type: 'h2', text: 'Propriétés' },
  { type: 'table', head: ['Entrée', 'Type', 'Défaut', 'Description'], rows: [
    ['`comments`', '`CommentItem[]`', '`[]`', 'Commentaires et réponses.'],
    ['`me`', '`CommentAuthor`', '`null`', 'Utilisateur courant (droits de modification).'],
    ['`mentionables`', '`CommentAuthor[]`', '`[]`', 'Personnes proposées après « @ ».'],
    ['`compact`', '`boolean`', '`false`', 'Variante resserrée, saisie en bas.'],
    ['`moderator`', '`boolean`', '`false`', 'Autorise l’épinglage.'],
    ['`visibleReplies`', '`number`', '`2`', 'Réponses visibles avant « Afficher plus ».'],
  ] },
  { type: 'h3', text: 'Saisie seule' },
  { type: 'p', text: '`<app-comment-composer>` peut être utilisé seul : barre de mise en forme Markdown, mentions, aperçu, compteur et envoi par ⌘/Ctrl + Entrée.' },
  { type: 'callout', tone: 'warning', title: 'Contenu utilisateur', text: 'Le texte est échappé avant le rendu Markdown : aucun HTML saisi n’est interprété.' },
  { type: 'h2', text: 'Accessibilité' },
  { type: 'list', items: ['Les boutons J’aime et réactions exposent `aria-pressed`.', 'Les mentions se naviguent au clavier (↑ ↓ Entrée Échap).', 'Chaque commentaire a une ancre `#comment-<id>` partageable.'] },
];
