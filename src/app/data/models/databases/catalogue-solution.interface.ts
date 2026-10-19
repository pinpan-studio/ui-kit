export interface CatalogueSolution {
  _id?: any;
  code: string;
  nom: string;
  description?: string;
  prix_unitaire: number;
  is_active?: boolean;
}

export interface ObjetDevis {
  _id?: any;
  libelle: string;
  is_active?: boolean;
}
