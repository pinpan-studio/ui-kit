import {Commande} from './commande.interface';
import {Diagnostic} from './diagnostic.interface';
import {StoreQuote} from './store-quote.interface';
import {Store} from './store.interface';

export interface SelectedQuote {
    _id?: string;
    commande: Commande;
    diagnostic: Diagnostic;
    quote: StoreQuote;
    store: Store;
    montant: number;
    statut: string;
    dateSelection?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
