import {Commande} from './commande.interface';
import {Professionnel} from './professionnel.interface';

/** Miroir de `backend/src/modules/database/diagnostic/diagnostic.enum.ts`. */
export type DiagnosticUrgency = 'FAIBLE' | 'MOYEN' | 'URGENT' | 'CRITIQUE';
export type DiagnosticDurationUnit = 'MINUTES' | 'HEURES' | 'JOURS';
export type DiagnosticDifficulty = 'FACILE' | 'MOYEN' | 'DIFFICILE' | 'TRES_DIFFICILE';
export type DiagnosticActionPriority = 'BASSE' | 'NORMALE' | 'HAUTE' | 'CRITIQUE';

// Statut fusionné (ex-module Material Need) : couvre la rédaction du diagnostic technique
// ET le cycle de vie du marché des besoins matériels (WaitingQuote -> ... -> Validated).
export enum DiagnosticStatus {
    Draft = 'Draft',
    Submitted = 'Submitted',
    WaitingQuote = 'WaitingQuote',
    QuoteCreated = 'QuoteCreated',
    Validated = 'Validated',
    Rejected = 'Rejected',
    // Rejet automatique par l'Agent IA de validation de diagnostic, distinct de `Rejected`
    // (rejet admin d'un besoin déjà engagé sur le marché Store).
    RejectedByAi = 'RejectedByAi',
    Cancelled = 'Cancelled',
}

export interface DiagnosticItem {
    designation: string;
    quantite: number;
    materialId?: any;
    description?: string;
    unite?: string;
    estimatedPrice?: number;
    observations?: string;
}

export interface DiagnosticStatusHistoryEntry {
    status: DiagnosticStatus;
    previousStatus?: DiagnosticStatus;
    date: Date | string;
    action?: string;
    notes?: string;
    utilisateur?: any;
}

export interface DiagnosticIncoherenceIA {
    type: string;
    itemDesignation?: string;
    gravite: string;
    description: string;
}

export interface DiagnosticRecommandationIA {
    description: string;
    priorite?: string;
}

/** Miroir de `DiagnosticAnalyseIA` (backend/src/modules/database/diagnostic/diagnostic.schema.ts) —
 *  rapport de l'Agent IA de validation de diagnostic, persisté après chaque analyse. */
export interface DiagnosticAnalyseIA {
    statut: 'VALIDE' | 'REFUSE';
    scoreConfiance: number;
    resume: string;
    justification?: string;
    contreRapport?: string;
    incoherences: DiagnosticIncoherenceIA[];
    materielsProblematiques: string[];
    elementsManquants: string[];
    recommandations: DiagnosticRecommandationIA[];
    date: Date | string;
}

/** Miroir de `backend/src/modules/database/diagnostic/diagnostic.schema.ts` (fusionné avec l'ex-Material Need). */
export interface Diagnostic {
    _id?: any;
    commande: Commande;
    technicien?: Professionnel;

    // Informations générales
    diagnosticType?: string;
    urgency: DiagnosticUrgency;
    siteCondition?: string;
    probableCause?: string;
    problemDescription?: string;
    technicalAnalysis?: string;

    // Estimation des travaux
    estimatedDuration?: number;
    estimatedDurationUnit?: DiagnosticDurationUnit;
    difficulty?: DiagnosticDifficulty;
    estimatedWorkers?: number;
    plannedInterventionDate?: Date | string;
    diagnosticDate: Date | string;
    comments?: string;

    // Recommandations
    recommendations?: string;
    actionPriority?: DiagnosticActionPriority;

    // Médias
    photos: string[];
    documents: string[];
    voiceNotes: string[];

    // --- Champs absorbés de l'ex-module Material Need (marché des besoins matériels) ---
    numero?: string;
    titre?: string;
    description?: string;
    adresseChantier?: string;
    latitude?: number;
    longitude?: number;
    urgence: string; // 'FAIBLE' | 'MOYEN' | 'URGENT' | 'CRITIQUE' — distinct de `urgency` (technique)
    priorite?: string; // 'FAIBLE' | 'NORMALE' | 'HAUTE' | 'CRITIQUE'
    utilisateur?: any;
    commentaire?: string;
    submittedAt?: Date | string;
    totalAmount?: number;
    statusHistory?: DiagnosticStatusHistoryEntry[];
    dateAnnulation?: Date | string;
    motifAnnulation?: string;
    items: DiagnosticItem[];
    selectedQuote?: any; // StoreQuote peuplé une fois le diagnostic Validated
    derniereAnalyseIA?: DiagnosticAnalyseIA;

    status: DiagnosticStatus;

    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface DiagnosticStatusUiConfig {
    label: string;
    pillClass: string; // classe locale .statut-* définie dans needs-list.component.scss / need-detail.component.scss
    icon: string;
}

export const DIAGNOSTIC_STATUS_CONFIG: Record<DiagnosticStatus, DiagnosticStatusUiConfig> = {
    [DiagnosticStatus.Draft]:        { label: 'Brouillon',        pillClass: 'statut-grey',   icon: 'edit_note' },
    [DiagnosticStatus.Submitted]:    { label: 'Soumis',           pillClass: 'statut-blue',   icon: 'send' },
    [DiagnosticStatus.WaitingQuote]: { label: 'En attente devis', pillClass: 'statut-orange', icon: 'hourglass_top' },
    [DiagnosticStatus.QuoteCreated]: { label: 'Devis reçu',       pillClass: 'statut-teal',   icon: 'request_quote' },
    [DiagnosticStatus.Validated]:    { label: 'Validé',           pillClass: 'statut-green',  icon: 'check_circle' },
    [DiagnosticStatus.Rejected]:     { label: 'Rejeté',           pillClass: 'statut-red',    icon: 'block' },
    [DiagnosticStatus.RejectedByAi]: { label: 'Rejeté par l\'IA', pillClass: 'statut-red',    icon: 'smart_toy' },
    [DiagnosticStatus.Cancelled]:    { label: 'Annulé',           pillClass: 'statut-red',    icon: 'cancel' },
};

export function getDiagnosticStatusConfig(statut?: string): DiagnosticStatusUiConfig {
    return DIAGNOSTIC_STATUS_CONFIG[statut as DiagnosticStatus]
        || { label: statut || '—', pillClass: 'statut-grey', icon: 'help_outline' };
}

// Miroir UI-only de DIAGNOSTIC_TRANSITIONS (backend/src/modules/database/diagnostic/diagnostic.enum.ts).
// Le backend reste la source de vérité et revalide systématiquement ; ceci ne sert qu'à piloter l'affichage des actions.
export const DIAGNOSTIC_TRANSITIONS: Record<DiagnosticStatus, DiagnosticStatus[]> = {
    [DiagnosticStatus.Draft]: [DiagnosticStatus.Submitted, DiagnosticStatus.Cancelled],
    [DiagnosticStatus.Submitted]: [DiagnosticStatus.WaitingQuote, DiagnosticStatus.Cancelled],
    [DiagnosticStatus.WaitingQuote]: [DiagnosticStatus.Cancelled],
    [DiagnosticStatus.QuoteCreated]: [DiagnosticStatus.Rejected, DiagnosticStatus.Cancelled],
    [DiagnosticStatus.Validated]: [],
    [DiagnosticStatus.Rejected]: [DiagnosticStatus.Draft],
    [DiagnosticStatus.RejectedByAi]: [DiagnosticStatus.Draft],
    [DiagnosticStatus.Cancelled]: [],
};
