export interface Categorie  {
    _id: any;
    code: string;
    libelle: string;
    description: string;
    categorie: Categorie;
    illustration: string;
}
