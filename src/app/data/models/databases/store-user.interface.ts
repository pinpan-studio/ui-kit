import {Store} from './store.interface';
import {Utilisateur} from './utilisateur.interface';

export interface StoreUser {
    _id?: string;
    utilisateur: Utilisateur;
    store: Store;
    role: string; // 'MANAGER' | 'COMMERCIAL' | 'GESTIONNAIRE' | 'ADMINISTRATEUR'
    actif: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
