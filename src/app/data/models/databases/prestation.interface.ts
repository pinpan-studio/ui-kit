import {Categorie} from './categorie.interface';
import {Valeur} from './valeur.interface';

export interface Formulaire
{
    id: number,
    titre: string,
    description: string,

    nom: string,
    type: Valeur,
    valeur: any,
    sources: [],
    form: any,
    requis: boolean
}

export interface Article
{
    libelle: Valeur,
    description: boolean,
    pu: string,
    quantite: string,
}

export interface Facturation
{
    methode: Valeur,
    tarifDistance: boolean,
    articles: Article[],
    fournitures: Article[],
    tauxHoraire?: number,
    tauxJournalier?: number,
}

export interface Prestation  {
    _id: any;
    libelle: string;
    description: string;
    categorie: Categorie;
    actif: boolean;
    illustration: string;
    miniature : string;
    formulaire: Formulaire[];
    references: string[];
    competences: Valeur[];
    facturation: Facturation
}