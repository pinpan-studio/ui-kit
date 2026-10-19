export interface Dossier  {
    _id: any;
    
    libelle: string;
    icone:string;
    parent: Dossier;
    children: Dossier[];
    expandable: boolean;
    level: number;
}