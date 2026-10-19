/**
 * Données statiques de "session" : utilisateur affiché dans le shell, organisation,
 * notifications. Aucune authentification réelle — ces valeurs sont simplement affichées.
 */
export interface StaticUser {
  _id: string;
  fullname: string;
  nom: string;
  prenoms: string;
  mail: string;
  phone: string;
  avatar?: string | null;
  role: string;
  actif: boolean;
}

export const CURRENT_USER: StaticUser = {
  _id: 'u-001',
  fullname: 'Jean Kouassi',
  nom: 'Kouassi',
  prenoms: 'Jean',
  mail: 'jean.kouassi@example.com',
  phone: '+225 07 07 12 34 56',
  avatar: null,
  role: 'Administrateur',
  actif: true,
};

export const ORGANISATION = {
  _id: 'org-001',
  nom: 'SC Storage',
  sigle: 'SCS',
  ville: 'Abidjan',
  pays: "Côte d'Ivoire",
};

export interface StaticNotification {
  _id: string;
  type: string;
  objet: string;
  contenu: string;
  lu: boolean;
  envoyeLe: string;
  destinataire: { _id: string };
}

export const NOTIFICATIONS: StaticNotification[] = [
  { _id: 'n-1', type: 'Requête', objet: 'Nouvelle requête client', contenu: 'Transports Yao SARL a ouvert une requête « Balise hors ligne » (REQ-2024-0412).', lu: false, envoyeLe: '2026-10-13T08:42:00', destinataire: { _id: 'u-001' } },
  { _id: 'n-2', type: 'Mission', objet: 'Mission terminée', contenu: 'La mission MIS-0098 (installation 4 véhicules) a été clôturée par Koffi N’Guessan.', lu: false, envoyeLe: '2026-10-13T07:15:00', destinataire: { _id: 'u-001' } },
  { _id: 'n-3', type: 'Facturation', objet: 'Rôle de facturation généré', contenu: 'Le rôle d’octobre 2026 a été généré : 312 factures pour 48 750 000 FCFA.', lu: false, envoyeLe: '2026-10-12T18:05:00', destinataire: { _id: 'u-001' } },
  { _id: 'n-4', type: 'Tâche', objet: 'Tâche en retard', contenu: '« Relancer Bolloré Logistics pour le renouvellement » est en retard de 2 jours.', lu: true, envoyeLe: '2026-10-11T09:30:00', destinataire: { _id: 'u-001' } },
  { _id: 'n-5', type: 'Synchronisation', objet: 'Synchronisation terminée', contenu: 'La synchronisation Wialon a importé 1 284 équipements (3 anomalies).', lu: true, envoyeLe: '2026-10-10T22:10:00', destinataire: { _id: 'u-001' } },
];

/** Nombre de tâches "du jour" affiché en badge dans la barre d'outils. */
export const TODAY_TASKS_COUNT = 7;
