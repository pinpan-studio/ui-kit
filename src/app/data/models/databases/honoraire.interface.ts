import {Facture} from './facture.interface';
import {Commande} from './commande.interface';
import {Professionnel} from './professionnel.interface';

export type HonoraireStatus = 'CALCULE' | 'VALIDE' | 'PAYE' | 'ANNULE';

export interface RetenueAppliquee {
    code: string;
    libelle: string;
    type: string;
    valeur: number;
    montant: number;
}

export interface Honoraire  {
    _id: any;
    numero: string;
    commande: Commande;
    professionnel: Professionnel;
    facture: Facture;
    date: Date;

    /* FACTURE */
    montantHT: number;
    tva: number;
    montantTTC: number;
    montantDebours: number;

    /* COMMISSION */
    tauxCommission: number;
    commission: number;

    /* FISCALITE */
    tauxTva: number;
    montantTva: number;
    taxeBnc: number;
    retenues: RetenueAppliquee[];

    /* HONORAIRE */
    tauxHonoraire: number;
    montantHonoraire: number;
    montantNetHonoraire: number;
    commentaie: string;
    status: HonoraireStatus;
}
