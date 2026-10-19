/**
 * Jeux de données des écrans d'exemple (/examples/app/**) : clients, factures, messages, produits.
 * Valeurs fictives, montants en FCFA.
 */
export type ClientStatus = 'actif' | 'prospect' | 'suspendu' | 'inactif';

export interface ExClient {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  city: string;
  sector: string;
  status: ClientStatus;
  revenue: number;
  invoices: number;
  since: string;
  owner: string;
}

export const CLIENT_STATUS: Record<ClientStatus, { label: string; color: string }> = {
  actif: { label: 'Actif', color: 'success' },
  prospect: { label: 'Prospect', color: 'info' },
  suspendu: { label: 'Suspendu', color: 'warning' },
  inactif: { label: 'Inactif', color: 'neutral' },
};

const NAMES = [
  ['Sotra Logistique', 'Aya Koné', 'Transport'], ['Ivoire Agro SA', 'Moussa Traoré', 'Agro-industrie'], ['Banque Lagune', 'Fatou Diabaté', 'Finance'],
  ['Cacao Plus', 'Yao N’Guessan', 'Agro-industrie'], ['Clinique Riviera', 'Dr Awa Bamba', 'Santé'], ['Batim CI', 'Koffi Assi', 'BTP'],
  ['Orca Télécom', 'Mariam Ouattara', 'Télécoms'], ['Hôtel Assinie', 'Serge Kacou', 'Hôtellerie'], ['Pharma Sud', 'Inès Coulibaly', 'Santé'],
  ['Energie Nord', 'Ibrahim Sanogo', 'Énergie'], ['Café Akwaba', 'Rose Adjoua', 'Restauration'], ['Mines de Tongon', 'Alain Gnamien', 'Mines'],
  ['École Les Palmiers', 'Nadia Touré', 'Éducation'], ['AutoPro Yopougon', 'Didier Zadi', 'Automobile'], ['Textile Bouaké', 'Salif Konaté', 'Industrie'],
  ['Port Sec San Pedro', 'Linda Ehui', 'Transport'], ['Studio Lagune', 'Eric Brou', 'Médias'], ['Agence Kôrô', 'Mireille Yapi', 'Services'],
  ['FreshMarket', 'Hervé Tanoh', 'Distribution'], ['Assur’Ivoire', 'Kadi Fofana', 'Assurance'], ['Cimenterie Est', 'Paul Amani', 'Industrie'],
  ['Digital Baobab', 'Grace Kouamé', 'Numérique'], ['Radio Plateau', 'Jules Ahoua', 'Médias'], ['Ferme Bio Dabou', 'Clarisse Djè', 'Agro-industrie'],
];
const CITIES = ['Abidjan', 'Bouaké', 'San Pedro', 'Yamoussoukro', 'Korhogo', 'Daloa', 'Man', 'Grand-Bassam'];
const STATUSES: ClientStatus[] = ['actif', 'actif', 'prospect', 'actif', 'suspendu', 'actif', 'inactif', 'prospect'];
const OWNERS = ['Jean Kouassi', 'Aïcha Diallo', 'Marc Yao', 'Sarah Bamba'];

export const EX_CLIENTS: ExClient[] = NAMES.map(([name, contact, sector], i) => ({
  id: 'c-' + (101 + i),
  name, contact, sector,
  email: contact.toLowerCase().normalize('NFD').replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '.') + '@' + name.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '').slice(0, 12) + '.ci',
  phone: `+225 07 ${String(10 + ((i * 37) % 89)).padStart(2, '0')} ${String(10 + ((i * 53) % 89)).padStart(2, '0')} ${String(10 + ((i * 71) % 89)).padStart(2, '0')}`,
  city: CITIES[i % CITIES.length],
  status: STATUSES[i % STATUSES.length],
  revenue: Math.round((((i * 7919) % 97) + 8) * 1_250_000),
  invoices: ((i * 13) % 40) + 2,
  since: new Date(2019 + (i % 7), (i * 5) % 12, 1 + ((i * 11) % 27)).toISOString(),
  owner: OWNERS[i % OWNERS.length],
}));

export interface ExActivity { icon: string; tone: string; text: string; at: string; who: string; }
export const EX_ACTIVITY: ExActivity[] = [
  { icon: 'receipt_long', tone: 'primary', text: 'Facture FAC-2026-0412 émise · 4 250 000 FCFA', at: 'Il y a 12 min', who: 'Jean Kouassi' },
  { icon: 'payments', tone: 'success', text: 'Paiement reçu de Banque Lagune', at: 'Il y a 1 h', who: 'Système' },
  { icon: 'person_add', tone: 'info', text: 'Nouveau prospect : Digital Baobab', at: 'Il y a 3 h', who: 'Aïcha Diallo' },
  { icon: 'warning', tone: 'warning', text: 'Relance : Clinique Riviera, 2 factures en retard', at: 'Hier', who: 'Système' },
  { icon: 'description', tone: 'purple', text: 'Contrat signé avec Orca Télécom', at: 'Hier', who: 'Marc Yao' },
  { icon: 'block', tone: 'error', text: 'Compte suspendu : Pharma Sud', at: 'Il y a 2 j', who: 'Sarah Bamba' },
];

export interface ExInvoice { ref: string; date: string; amount: number; status: 'payée' | 'en attente' | 'en retard'; }
export const EX_INVOICES: ExInvoice[] = [
  { ref: 'FAC-2026-0412', date: '2026-10-14', amount: 4_250_000, status: 'en attente' },
  { ref: 'FAC-2026-0388', date: '2026-09-30', amount: 1_870_000, status: 'payée' },
  { ref: 'FAC-2026-0351', date: '2026-09-02', amount: 2_400_000, status: 'en retard' },
  { ref: 'FAC-2026-0310', date: '2026-08-05', amount: 960_000, status: 'payée' },
  { ref: 'FAC-2026-0277', date: '2026-07-11', amount: 3_150_000, status: 'payée' },
];

export interface ExMessage {
  id: string; from: string; email: string; subject: string; preview: string; body: string[];
  at: string; unread: boolean; starred: boolean; label?: { text: string; color: string }; attachments?: string[];
}
export const EX_MESSAGES: ExMessage[] = [
  { id: 'm1', from: 'Aya Koné', email: 'aya.kone@sotra.ci', subject: 'Livraison du lot 14 — créneau confirmé', at: '09:24', unread: true, starred: true,
    label: { text: 'Logistique', color: 'info' }, attachments: ['bon-livraison-14.pdf'],
    preview: 'Bonjour, nous confirmons le créneau de jeudi 8h pour la livraison du lot 14…',
    body: ['Bonjour Jean,', 'Nous confirmons le créneau de jeudi 8 h pour la livraison du lot 14 au dépôt de Vridi. Le camion arrivera avec 32 palettes.', 'Vous trouverez le bon de livraison en pièce jointe. Merci de prévoir deux agents pour le déchargement.', 'Bien cordialement,\nAya Koné — Sotra Logistique'] },
  { id: 'm2', from: 'Fatou Diabaté', email: 'f.diabate@banquelagune.ci', subject: 'Relevé de compte septembre', at: '08:02', unread: true, starred: false,
    label: { text: 'Finance', color: 'success' },
    preview: 'Veuillez trouver ci-joint le relevé de compte du mois de septembre…',
    body: ['Bonjour,', 'Veuillez trouver ci-joint le relevé de compte du mois de septembre. Le solde créditeur s’élève à 48 320 000 FCFA.', 'Cordialement,\nFatou Diabaté'] },
  { id: 'm3', from: 'Marc Yao', email: 'marc.yao@exemple.ci', subject: 'Re: Proposition Orca Télécom', at: 'Hier', unread: false, starred: true,
    preview: 'Le client a validé la proposition, je prépare le contrat pour signature…',
    body: ['Salut Jean,', 'Le client a validé la proposition à 12,4 M FCFA. Je prépare le contrat pour une signature lundi.', 'Marc'] },
  { id: 'm4', from: 'Support UI Kit', email: 'support@uikit.dev', subject: 'Votre ticket #4821 a été résolu', at: 'Hier', unread: false, starred: false,
    label: { text: 'Support', color: 'purple' },
    preview: 'Bonne nouvelle : le problème d’export PDF est corrigé dans la version 2.4…',
    body: ['Bonjour,', 'Bonne nouvelle : le problème d’export PDF est corrigé dans la version 2.4. Aucune action n’est requise de votre part.', 'L’équipe Support'] },
  { id: 'm5', from: 'Dr Awa Bamba', email: 'a.bamba@clinique-riviera.ci', subject: 'Échéancier de paiement', at: 'Lun.', unread: false, starred: false,
    label: { text: 'Relance', color: 'warning' },
    preview: 'Suite à votre relance, nous proposons un règlement en trois échéances…',
    body: ['Monsieur Kouassi,', 'Suite à votre relance, nous proposons un règlement en trois échéances mensuelles à compter du 1er novembre.', 'Dr Awa Bamba'] },
  { id: 'm6', from: 'Serge Kacou', email: 'serge@hotel-assinie.ci', subject: 'Réservation séminaire décembre', at: 'Dim.', unread: false, starred: false,
    preview: 'Nous avons bien noté votre demande pour 40 personnes du 12 au 14 décembre…',
    body: ['Bonjour,', 'Nous avons bien noté votre demande pour 40 personnes du 12 au 14 décembre. Un devis vous sera adressé sous 48 h.', 'Serge Kacou — Hôtel Assinie'] },
  { id: 'm7', from: 'Grace Kouamé', email: 'grace@digitalbaobab.ci', subject: 'Atelier design system', at: '12 oct.', unread: false, starred: false,
    preview: 'Merci pour l’atelier de mardi ! Voici le compte rendu et les prochaines étapes…',
    body: ['Merci pour l’atelier de mardi !', 'Voici le compte rendu et les prochaines étapes : audit des composants, jetons de couleur, documentation.', 'Grace'] },
];

export interface ExProduct { id: string; name: string; category: string; price: number; rating: number; stock: number; icon: string; hue: number; badge?: string; }
const PRODUCTS: [string, string, string, number][] = [
  ['Casque sans fil Pro', 'Audio', 'headphones', 210], ['Enceinte nomade', 'Audio', 'speaker', 190], ['Montre connectée S2', 'Objets connectés', 'watch', 260],
  ['Ordinateur portable 14"', 'Informatique', 'laptop_mac', 220], ['Écran 27" QHD', 'Informatique', 'monitor', 200], ['Clavier mécanique', 'Informatique', 'keyboard', 280],
  ['Smartphone X12', 'Téléphonie', 'smartphone', 170], ['Tablette 11"', 'Téléphonie', 'tablet', 160], ['Appareil photo hybride', 'Photo', 'photo_camera', 20],
  ['Drone compact', 'Photo', 'flight', 30], ['Console portable', 'Jeux', 'sports_esports', 300], ['Routeur Wi-Fi 6', 'Réseau', 'router', 140],
];
export const EX_PRODUCTS: ExProduct[] = PRODUCTS.map(([name, category, icon, hue], i) => ({
  id: 'p-' + (i + 1), name, category, icon, hue,
  price: (((i * 37) % 23) + 4) * 15_000,
  rating: 3.5 + ((i * 7) % 15) / 10,
  stock: (i * 17) % 9 === 0 ? 0 : (i * 17) % 40,
  badge: i % 5 === 0 ? 'Nouveau' : i % 4 === 1 ? '-20 %' : undefined,
}));
export const EX_CATEGORIES = [...new Set(EX_PRODUCTS.map((p) => p.category))];

export interface ExModule { id: string; label: string; icon: string; description: string; color: string; count?: string; badge?: number; }
export const EX_MODULES: ExModule[] = [
  { id: 'crm', label: 'Clients', icon: 'groups', description: 'Comptes, contacts et opportunités', color: '#0ea5e9', count: '1 248 comptes', badge: 3 },
  { id: 'billing', label: 'Facturation', icon: 'receipt_long', description: 'Devis, factures, encaissements', color: '#10b981', count: '86 factures ce mois' },
  { id: 'stock', label: 'Stocks', icon: 'inventory_2', description: 'Articles, entrepôts, mouvements', color: '#f59e0b', count: '4 entrepôts' },
  { id: 'planning', label: 'Planning', icon: 'calendar_month', description: 'Interventions et rendez-vous', color: '#8b5cf6', count: '14 aujourd’hui', badge: 2 },
  { id: 'fleet', label: 'Flotte', icon: 'local_shipping', description: 'Véhicules, trajets, balises', color: '#ef4444', count: '62 véhicules' },
  { id: 'hr', label: 'Ressources humaines', icon: 'badge', description: 'Employés, congés, paie', color: '#ec4899', count: '138 employés' },
  { id: 'docs', label: 'Documents', icon: 'folder_open', description: 'GED, modèles, signatures', color: '#64748b', count: '2,4 Go' },
  { id: 'reports', label: 'Rapports', icon: 'insights', description: 'Tableaux de bord et exports', color: '#06b6d4', count: '18 rapports' },
  { id: 'support', label: 'Support', icon: 'support_agent', description: 'Tickets et base de connaissances', color: '#f97316', count: '7 tickets ouverts', badge: 7 },
  { id: 'settings', label: 'Administration', icon: 'admin_panel_settings', description: 'Utilisateurs, rôles, intégrations', color: '#475569' },
];
