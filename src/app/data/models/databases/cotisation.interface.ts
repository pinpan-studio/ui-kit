export interface Cotisation {
    _id: any;
    code: string;
    libelle: string;
    description: string;
    type: 'pourcentage' | 'montant';
    valeur: number;
    actif: boolean;
    ordre: number;
}
