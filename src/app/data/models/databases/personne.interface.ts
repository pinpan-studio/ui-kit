import {Fichier} from './fichier.interface';

export interface Personne  {
    _id: any;
    
    nom: string;
    prenoms: string;
    mail: string;
    phone: string;
    photo: Fichier;
    
}
