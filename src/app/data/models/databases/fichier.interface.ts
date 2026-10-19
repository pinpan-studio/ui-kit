export interface Fichier  {
    _id: any;
    uuid: string;
    nom: string;
    taille: number;
    type: string;
    dateCreation: string;
    dateDerniereModification: string;
    url: string;
    relativePath?: string;
}