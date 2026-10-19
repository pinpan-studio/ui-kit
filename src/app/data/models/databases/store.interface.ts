import {Franchise} from './franchise.interface';

export interface Store {
    _id?: string;
    nom: string;
    franchise: Franchise;
    adresse: any;
    ville?: string;
    commune?: string;
    quartier?: string;
    telephone?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
    rayon?: number;
    statut?: string;
    actif: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
