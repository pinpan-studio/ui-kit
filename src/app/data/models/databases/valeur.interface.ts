import {Liste} from './liste.interface';

export interface Valeur  {
    _id: any;
    code: string;
    libelle: string;
    description: string;
    liste: Liste;
    locked?: boolean;
    parent?: any;
}
