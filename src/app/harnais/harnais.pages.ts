import { PageGroup } from '../core/models/page-entry';

const harnais: PageGroup = {
  id: 'harnais',
  label: 'Harnais',
  icon: 'auto_awesome',
  description: 'Interface conversationnelle façon assistant IA : historique, fil avec réflexion et outils, saisie riche, panneau d’artefacts.',
  pages: [
    { label: 'Accueil', path: '/harnais', icon: 'auto_awesome', kind: 'other', description: 'Salutation, saisie centrée et suggestions.' },
    {
      label: 'Conversation', path: '/harnais/c-sidecar', icon: 'forum', kind: 'detail',
      description: 'Fil complet : pièce jointe, réflexion, étapes d’outils, code, artefact.',
      variants: [{ label: 'Document', path: '/harnais/c-palette' }, { label: 'Code court', path: '/harnais/c-csv' }],
    },
  ],
};

export default harnais;
