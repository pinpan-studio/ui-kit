export interface AuthInterface {
    /*_id: any;
    uuid: string;
    familyName: string;
    givenName: string;*/
    mail: string;
    pass: string;
    /*picture: string;
    verified: boolean;
    locale: string;*/
}

export interface VerificationInterface {
    uuid: string;
    code: string;
}