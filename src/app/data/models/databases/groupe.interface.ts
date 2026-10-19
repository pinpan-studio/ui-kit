import {Permission} from './permission.interface';

export interface Groupe  {
_id: any;

code: string;
libelle: string;
description: string;
permissions:Permission[];
}