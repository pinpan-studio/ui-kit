import {Configuration} from './configuration.interface';
import {Pays} from './pays.interface';

export interface Ville  {
    _id: any;
    code: string;
    libelle: string;
    pays: Pays;
}
