/**
 * Registre des showcases (/showcases) : chaque entrée est un écran autonome du kit,
 * présenté en iframe dans un cadre d'appareil (ordinateur, tablette, téléphone).
 */
export type DeviceKind = 'desktop' | 'tablet' | 'phone';

export interface Showcase {
  id: string;
  group: string;
  label: string;
  icon: string;
  /** URL chargée dans l'iframe (route autonome, hors layout du catalogue). */
  path: string;
  description: string;
  /** Appareil affiché à l'ouverture. */
  device?: DeviceKind;
  tags?: string[];
}

export interface ShowcaseGroup { id: string; label: string; icon: string; description: string; }

export const SHOWCASE_GROUPS: ShowcaseGroup[] = [
  { id: 'modules', label: 'Modules', icon: 'apps', description: 'Les sous-modules du kit, tels qu’ils s’affichent dans l’application.' },
  { id: 'auth', label: 'Authentification', icon: 'lock', description: 'Connexion, inscription, récupération et vérification, sous plusieurs dispositions de formulaire.' },
  { id: 'forms', label: 'Formulaires', icon: 'dynamic_form', description: 'Formulaires complets : contact, commande, assistant, questionnaire, réservation, candidature.' },
  { id: 'content', label: 'Contenu éditorial', icon: 'auto_stories', description: 'Typographie de lecture et discussions : blog, article, documentation, fil d’équipe avec commentaires.' },
  { id: 'layouts', label: 'Dispositions d’application', icon: 'space_dashboard', description: 'Gabarits complets : navigation, modules, listes de données, détail, tableaux de bord.' },
];

export const SHOWCASES: Showcase[] = [
  // ─── Modules ────────────────────────────────────────────────
  { id: 'main', group: 'modules', label: 'Main', icon: 'space_dashboard', path: '/main', tags: ['shell', 'rail', 'drawer'],
    description: 'Shell applicatif : rail de modules, barre d’outils, drawer droit (compte, notifications).' },
  { id: 'harnais', group: 'modules', label: 'Harnais · accueil', icon: 'auto_awesome', path: '/harnais', tags: ['IA', 'chat'],
    description: 'Assistant conversationnel : salutation, saisie centrée et suggestions.' },
  { id: 'harnais-conversation', group: 'modules', label: 'Harnais · conversation', icon: 'forum', path: '/harnais/c-sidecar', tags: ['IA', 'artefact'],
    description: 'Fil complet avec réflexion, outils, code et panneau d’artefacts.' },

  // ─── Authentification ───────────────────────────────────────
  { id: 'auth-centered', group: 'auth', label: 'Connexion · centrée', icon: 'login', path: '/examples/auth/centered', tags: ['carte', 'fond dégradé'],
    description: 'Carte au centre d’un fond décoratif ; 6 fournisseurs en icônes rondes (Google, Apple, Microsoft…).' },
  { id: 'auth-split-right', group: 'auth', label: 'Connexion · formulaire à droite', icon: 'vertical_split', path: '/examples/auth/split-right', tags: ['split', 'visuel'],
    description: 'Visuel de marque à gauche, formulaire à droite ; Google et Microsoft en grille. Le visuel disparaît sur mobile.' },
  { id: 'auth-split-left', group: 'auth', label: 'Connexion · formulaire à gauche', icon: 'vertical_split', path: '/examples/auth/split-left', tags: ['split', 'témoignage'],
    description: 'Formulaire à gauche, témoignage à droite ; « Continuer avec Google / Apple / Microsoft » avant l’e-mail.' },
  { id: 'auth-image', group: 'auth', label: 'Connexion · sur image', icon: 'image', path: '/examples/auth/image', tags: ['verre dépoli', 'photo'],
    description: 'Verre dépoli sur photo plein écran ; boutons Google et Apple aux couleurs des marques.' },
  { id: 'auth-minimal', group: 'auth', label: 'Connexion · minimale', icon: 'crop_square', path: '/examples/auth/minimal', tags: ['sans carte', 'SSO'],
    description: 'Page épurée, sans carte : Google, Microsoft et GitHub en premier, e-mail ensuite.' },
  { id: 'auth-social', group: 'auth', label: 'Connexion sociale', icon: 'groups', path: '/examples/auth/social', tags: ['Google', 'Apple', 'Facebook', 'GitHub', 'LinkedIn'],
    description: 'Uniquement des fournisseurs d’identité, boutons aux couleurs des marques ; e-mail en option.' },
  { id: 'auth-accounts', group: 'auth', label: 'Choix du compte Google', icon: 'switch_account', path: '/examples/auth/accounts', tags: ['Google', 'OAuth'],
    description: 'Sélecteur de compte après « Continuer avec Google » : comptes mémorisés, autre compte.' },
  { id: 'auth-register', group: 'auth', label: 'Inscription en étapes', icon: 'person_add', path: '/examples/auth/register', tags: ['stepper', 'mot de passe'],
    description: 'Inscription avec Google ou LinkedIn, ou en 3 étapes avec jauge de robustesse du mot de passe.' },
  { id: 'auth-forgot', group: 'auth', label: 'Mot de passe oublié', icon: 'key', path: '/examples/auth/forgot', tags: ['récupération'],
    description: 'Demande de lien de réinitialisation, puis confirmation d’envoi.' },
  { id: 'auth-otp', group: 'auth', label: 'Vérification en 2 étapes', icon: 'pin', path: '/examples/auth/otp', tags: ['OTP', '2FA'],
    description: 'Saisie d’un code à 6 chiffres reçu par SMS, avec renvoi temporisé.' },
  { id: 'auth-lock', group: 'auth', label: 'Session verrouillée', icon: 'lock_clock', path: '/examples/auth/lock', tags: ['avatar', 'déverrouillage'],
    description: 'Écran de verrouillage : avatar de l’utilisateur et mot de passe seul.' },

  // ─── Formulaires ────────────────────────────────────────────
  { id: 'form-contact', group: 'forms', label: 'Contact', icon: 'contact_mail', path: '/examples/forms/contact', tags: ['validation', 'FAQ', 'pièce jointe'],
    description: 'Coordonnées et FAQ à gauche, formulaire validé à la soumission (erreurs en ligne, compteur, consentement).' },
  { id: 'form-checkout', group: 'forms', label: 'Commande & paiement', icon: 'shopping_cart_checkout', path: '/examples/forms/checkout', tags: ['Mobile Money', 'carte', 'récapitulatif'],
    description: 'Tunnel en une page : livraison en cartes, Orange Money / MTN / Wave / carte, code promo, récapitulatif collant.' },
  { id: 'form-onboarding', group: 'forms', label: 'Assistant d’accueil', icon: 'rocket_launch', path: '/examples/forms/onboarding', tags: ['wizard', 'plein écran', 'invitations'],
    description: 'Étapes verticales, une intention par écran : profil, organisation, modules, invitations par e-mail.' },
  { id: 'form-survey', group: 'forms', label: 'Questionnaire', icon: 'quiz', path: '/examples/forms/survey', tags: ['NPS', 'notation', 'clavier'],
    description: 'Une question par écran : NPS, notes en étoiles, choix uniques et multiples, réponse libre, navigation au clavier.' },
  { id: 'form-booking', group: 'forms', label: 'Réservation', icon: 'event_available', path: '/examples/forms/booking', tags: ['calendrier', 'créneaux'],
    description: 'Prestation, calendrier, créneaux (complets barrés), participants et récapitulatif.' },
  { id: 'form-application', group: 'forms', label: 'Candidature', icon: 'assignment_ind', path: '/examples/forms/application', tags: ['formulaire long', 'signature', 'upload'],
    description: 'Formulaire long à sections : complétion par section, postes répétables, dépôt de fichiers, salaire en lettres, signature.' },

  // ─── Contenu éditorial ──────────────────────────────────────
  { id: 'content-article', group: 'content', label: 'Article & commentaires', icon: 'article', path: '/examples/app/blog/design-system-langage-commun', tags: ['typographie', 'commentaires', 'sommaire'],
    description: 'Lecture longue : progression, sommaire suivi, réglages taille / police, exergue, code, tableau ; fil de commentaires complet.' },
  { id: 'content-blog', group: 'content', label: 'Blog magazine', icon: 'auto_stories', path: '/examples/app/blog', tags: ['à la une', 'newsletter'],
    description: 'Article à la une, catégories, grille de cartes, newsletter, les plus lus.' },
  { id: 'content-docs', group: 'content', label: 'Documentation', icon: 'menu_book', path: '/examples/app/docs', tags: ['3 colonnes', 'avis'],
    description: 'Arborescence recherchable, page technique, sommaire de page, « Cette page vous a aidé ? », pages précédente / suivante.' },
  { id: 'content-feed', group: 'content', label: 'Fil d’équipe', icon: 'dynamic_feed', path: '/examples/app/feed', tags: ['publications', 'sondage', 'commentaires'],
    description: 'Tous types de médias : photos, album, vidéo, YouTube, note vocale, podcast, PDF, pièces jointes, lien, lieu, sondage ; pièces jointes depuis l’ordinateur ou le sélecteur de fichiers.' },

  // ─── Dispositions d'application ─────────────────────────────
  { id: 'app-dashboard', group: 'layouts', label: 'Tableau de bord', icon: 'dashboard', path: '/examples/app/dashboard', tags: ['sidenav', 'KPI', 'graphiques'],
    description: 'Sidenav du catalogue, alerte, indicateurs animés et tendances, graphiques, classement, objectifs, table de suivi.' },
  { id: 'app-list', group: 'layouts', label: 'Liste de données', icon: 'table_rows', path: '/examples/app/clients', tags: ['table', 'filtres', 'pagination'],
    description: 'Onglets de statut, filtres déroulants, table avancée (colonnes, densité, sélection et actions groupées, export, ligne dépliable) ou cartes paginées.' },
  { id: 'app-detail', group: 'layouts', label: 'Fiche détail', icon: 'article', path: '/examples/app/clients/c-104', tags: ['onglets', 'KPI', 'timeline'],
    description: 'En-tête d’entité, indicateurs, onglets (aperçu, factures, historique d’audit, notes) et colonne latérale (contact copiable, informations).' },
  { id: 'app-inbox', group: 'layouts', label: 'Maître / détail', icon: 'mark_email_unread', path: '/examples/app/inbox', tags: ['split', 'messagerie'],
    description: 'Dossiers, liste avec menu contextuel, lecture et réponse ; raccourcis J / K / E / S ; une seule colonne à la fois sur mobile.' },
  { id: 'app-catalog', group: 'layouts', label: 'Catalogue en grille', icon: 'grid_view', path: '/examples/app/catalog', tags: ['cartes', 'facettes'],
    description: 'Facettes (catégories, prix avec histogramme, note, stock), filtres actifs en puces, grille produits notée, panier relié au tunnel de commande.' },
  { id: 'app-kanban', group: 'layouts', label: 'Tableau kanban', icon: 'view_kanban', path: '/examples/app/board', tags: ['kanban', 'gantt', 'calendrier'],
    description: 'Un projet en quatre vues : kanban, chronologie (Gantt), calendrier et liste par responsable.' },
  { id: 'app-modules', group: 'layouts', label: 'Lanceur de modules', icon: 'apps', path: '/examples/app/modules', tags: ['accueil', 'tuiles'],
    description: 'Accueil : recherche, raccourcis, chiffres du jour, tuiles de modules, récents et activité.' },
  { id: 'app-files', group: 'layouts', label: 'Gestionnaire de fichiers', icon: 'folder_open', path: '/examples/app/files', tags: ['grille / liste', 'aperçu', 'sélecteur en modale'],
    description: 'Emplacements, jauge de stockage, navigation par dossiers, sélection multiple, glisser-déposer, menu contextuel, détails, aperçu plein écran et sélecteur de fichiers en modale.' },
  { id: 'app-files-columns', group: 'layouts', label: 'Fichiers en colonnes', icon: 'view_week', path: '/examples/app/files/columns', tags: ['Finder', 'aperçu', 'clavier'],
    description: 'Autre disposition du gestionnaire : une colonne par niveau de dossier, panneau d’aperçu (image, vidéo, audio, PDF, texte), navigation au clavier et barre d’état.' },
  { id: 'app-monitoring', group: 'layouts', label: 'Supervision', icon: 'monitor_heart', path: '/examples/app/monitoring', tags: ['temps réel', 'incidents', 'journaux'],
    description: 'Console de monitoring : santé globale, services et disponibilité 90 jours, serveurs, métriques en direct, flotte GPS, incidents, alertes et journaux.' },
  { id: 'app-chat', group: 'layouts', label: 'Messagerie instantanée', icon: 'chat', path: '/examples/app/chat', tags: ['plein écran', 'temps réel', 'pièces jointes'],
    description: 'Conversations, groupes et canaux ; bulles groupées, réponses, réactions, photos, fichiers, notes vocales, accusés de lecture, « en train d’écrire » ; panneau de détails.' },
  { id: 'app-chat-panel', group: 'layouts', label: 'Messagerie en panneau latéral', icon: 'right_panel_open', path: '/examples/app/dashboard?chat=c-aya', tags: ['sidenav droite', 'accessible partout'],
    description: 'La même messagerie dans une sidenav droite ouverte depuis la barre d’outils de n’importe quel écran : liste, conversation, passage en plein écran.' },
  { id: 'app-file-picker', group: 'layouts', label: 'Sélecteur de fichiers (modale)', icon: 'file_open', path: '/examples/app/files?picker=1', tags: ['modale', 'sélection multiple', 'import'],
    description: 'Emplacements, grille ou liste, cases à cocher, Maj + clic, filtre de types, import depuis l’ordinateur et récapitulatif de la sélection.' },
  { id: 'app-settings', group: 'layouts', label: 'Paramètres', icon: 'settings', path: '/examples/app/settings', tags: ['sous-navigation', 'formulaires'],
    description: 'Sous-navigation, réglages « libellé / contrôle », mot de passe, clés d’API, thème réel, zone sensible confirmée.' },
];

export const showcaseById = (id: string | null | undefined): Showcase | undefined => SHOWCASES.find((s) => s.id === id);
