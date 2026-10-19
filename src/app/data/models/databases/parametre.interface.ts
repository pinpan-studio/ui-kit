import {Configuration} from './configuration.interface';

export interface Parametre  {
    _id: any;
    icone: string;
    code: string;
    libelle: string;
    description: string;
    type: string;
    value: any;
    source: string[];
    configuration: Configuration;
}
