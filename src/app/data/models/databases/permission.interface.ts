export interface Permission  {
    _id: any;
    selected: boolean;
    code: string;
    name: string;
    description: string;
    parent: Permission;
    children: Permission[];
    expandable: boolean;
    level: number;
}