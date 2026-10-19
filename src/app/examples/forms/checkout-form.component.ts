import { Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResultComponent } from '../../shared/components/feedback';
import { QrCodeComponent } from '../../shared/components/data';
import { MaterialModule } from '../../shared/material.module';
import { NumberStepperComponent } from '../../shared/components/fields/number-stepper.component';
import { ExAppShellComponent } from '../app/ex-app-shell.component';

type Pay = 'orange' | 'mtn' | 'wave' | 'card';

/** /examples/forms/checkout — commande en une page : coordonnées, livraison, paiement (Mobile Money / carte), récapitulatif collant. */
@Component({
  selector: 'app-checkout-form',
  standalone: true,
  imports: [ResultComponent, QrCodeComponent, DecimalPipe, FormsModule, MaterialModule, NumberStepperComponent, ExAppShellComponent],
  templateUrl: './checkout-form.component.html',
  styleUrls: ['./checkout-form.component.scss'],
})
export class CheckoutFormComponent {
  readonly steps = ['Panier', 'Livraison & paiement', 'Confirmation'];
  readonly items = signal([
    { name: 'Casque sans fil Pro', variant: 'Noir', price: 60000, qty: 1, icon: 'headphones', hue: 210 },
    { name: 'Clavier mécanique', variant: 'FR · AZERTY', price: 105000, qty: 1, icon: 'keyboard', hue: 280 },
    { name: 'Routeur Wi-Fi 6', variant: 'Bi-bande', price: 75000, qty: 2, icon: 'router', hue: 140 },
  ]);
  readonly shippings = [
    { id: 'std', label: 'Standard', hint: 'Livré en 48 h à Abidjan', price: 2000, icon: 'local_shipping' },
    { id: 'exp', label: 'Express', hint: 'Livré demain avant 12 h', price: 5000, icon: 'bolt' },
    { id: 'pick', label: 'Retrait en point relais', hint: 'Plateau, Cocody, Marcory', price: 0, icon: 'storefront' },
  ];
  readonly pays: { id: Pay; label: string; hint: string; mark: string; color: string }[] = [
    { id: 'orange', label: 'Orange Money', hint: 'Confirmation par USSD', mark: 'OM', color: '#ff7900' },
    { id: 'mtn', label: 'MTN MoMo', hint: 'Confirmation par SMS', mark: 'MTN', color: '#ffcc00' },
    { id: 'wave', label: 'Wave', hint: 'Sans frais', mark: 'W', color: '#1dc3ff' },
    { id: 'card', label: 'Carte bancaire', hint: 'Visa, Mastercard', mark: '💳', color: '#334155' },
  ];

  shipping = 'std';
  readonly pay = signal<Pay>('orange');
  m = { email: 'jean.kouassi@example.com', phone: '07 07 12 34 56', name: 'Jean Kouassi', address: 'Rue des Jardins, Cocody Deux-Plateaux', city: 'Abidjan', notes: '',
    momo: '07 07 12 34 56', card: '', exp: '', cvc: '', sameBilling: true, save: true };
  promo = '';
  readonly discount = signal(0);
  readonly promoMsg = signal('');
  readonly summaryOpen = signal(false);
  readonly state = signal<'form' | 'waiting' | 'done'>('form');

  readonly subtotal = computed(() => this.items().reduce((s, i) => s + i.price * i.qty, 0));
  readonly count = computed(() => this.items().reduce((s, i) => s + i.qty, 0));
  payLabel(): string { return this.pays.find((p) => p.id === this.pay())?.label ?? ''; }
  shippingPrice(): number { return this.shippings.find((s) => s.id === this.shipping)?.price ?? 0; }
  total(): number { return this.subtotal() - this.discount() + this.shippingPrice(); }

  setQty(i: number, qty: number): void { this.items.update((l) => l.map((x, j) => (j === i ? { ...x, qty } : x)).filter((x) => x.qty > 0)); }
  remove(i: number): void { this.items.update((l) => l.filter((_, j) => j !== i)); }

  applyPromo(): void {
    if (this.promo.trim().toUpperCase() === 'AKWABA10') { this.discount.set(Math.round(this.subtotal() * 0.1)); this.promoMsg.set('ok'); }
    else { this.discount.set(0); this.promoMsg.set('ko'); }
  }

  /** Formatage à la saisie : 4242 4242 4242 4242 et MM / AA. */
  formatCard(v: string): void { this.m.card = v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '); }
  formatExp(v: string): void { const d = v.replace(/\D/g, '').slice(0, 4); this.m.exp = d.length > 2 ? d.slice(0, 2) + ' / ' + d.slice(2) : d; }

  placeOrder(): void {
    this.state.set('waiting');
    setTimeout(() => this.state.set('done'), this.pay() === 'card' ? 1200 : 2600);
  }
}
