export interface Signup {
    nom?: string;
    prenoms?: string;
    phone?: string;
    mail?: string;
    pass?: string;
}

export interface Signin {
    phone?: string;
    mail?: string;
    pass: string;
}

export interface SigninToken {
    token: string;
}

export interface ResetPassword {
    phone?: string;
    mail?: string;
}

export interface VerifyAccount {
    _id: string;
    code: string;
}

export interface AccountAuth {
    fullname: string;
    phone: string;
    mail: string;
}

export interface UpdatePassword {
    phone: string;
    pass: string;
    newpass: string;
    cpass: string;
}

