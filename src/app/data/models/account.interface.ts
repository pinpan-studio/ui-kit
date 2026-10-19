export interface Account {
    _id: string;
    nom: string;
    prenoms: string;
    phone: string;
    mail: string;
    pass: string;
}

export interface updatetPassword {
    mail: string;
    pass: string;
    newpass: string;
    cpass: string;

}