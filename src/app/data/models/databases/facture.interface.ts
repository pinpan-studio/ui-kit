import {Adresse} from './adresse.interface';
import {Commande} from './commande.interface';
import {Professionnel} from './professionnel.interface';
import {Utilisateur} from './utilisateur.interface';
import {Valeur} from './valeur.interface';

export interface Facture  {
    _id: any;
    numero: string;
    type: Valeur;
    commande: Commande;
    client: Utilisateur;
    technicien: Professionnel;
    adresse: Adresse;
    montantHT: number;
    montantTTC: number;
    tva: number;
    totalDebours: number;
    total: number;
    commentaie: string;
    status: string;
}
