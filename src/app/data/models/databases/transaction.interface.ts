import {Categorie} from './categorie.interface';
import {Facture} from './facture.interface';
import {Utilisateur} from './utilisateur.interface';

export interface Transaction  {
    _id: any;
    numero: string;
    utilisateur: Utilisateur;
    facture: Facture;
    date: Date;
    observation: string;
    montant: number;
    confirme: Boolean;
    typeTransaction?: string;
}