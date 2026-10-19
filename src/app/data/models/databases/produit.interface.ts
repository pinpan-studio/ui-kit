import {Valeur} from './valeur.interface';

export interface Produit {
    _id?: string;
    reference: string;
    nom: string;
    categorie: Valeur;
    description: string;
    photoUrl: any;
    createdAt?: Date;
    updatedAt?: Date;
}
