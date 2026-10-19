import {Adresse} from './adresse.interface';
import {Prestation} from './prestation.interface';
import {Professionnel} from './professionnel.interface';
import {Utilisateur} from './utilisateur.interface';

export interface Commande {
    _id: any;
    numero: string;
    prestation: Prestation;
    client: Utilisateur;
    technicien: Professionnel;
    adresse: Adresse;


    totalHT: number;
    tva: number;
    totalTTC: number;
    totalDebours: number;
    montant: number;

    date: Date;
    commentaie: string;
    status: string;
}
