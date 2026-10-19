/** Rail de navigation principal du shell /main. */
export interface MenuItem {
  _id: string;
  libelle: string;
  icon: string;
  expandable: boolean;
  $object?: { type: string; o: any };
  children: MenuItem[];
}

export const MAIN_MENU: MenuItem[] = [];
