
import {Utilisateur} from './utilisateur.interface';

export interface Adresse  {
_id: any;

    utilisateur?: Utilisateur;

    etat: string;
    nom: string;
    codePostal: string;
    etage?: string;
    porte?: string;
    line?: string;
    complementaire?: string;
    longitude: number;
    latitude: number;
    details: any;
}
