export interface Message  {
    _id: any;
    type: string;
    contenu: string;
    lu: Boolean;
    emeteur: any;
    destinataire: any;
    envoyeLe: Date;
}

