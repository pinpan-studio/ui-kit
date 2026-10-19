import { Component, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../shared/material.module';
import { DOC_COMPONENTS } from '../../shared/doc.components';
import {
  AuditEntry, BarcodeComponent, BulkAction, CellEditEvent, DataColumn, DataTableComponent, DescriptionItem, DescriptionListComponent,
  QrCodeComponent, StatCounterComponent, TextDiffComponent, AuditLogComponent, TrendComponent,
} from '../../../shared/components/data';
import { DEMO_CLIENTS, DemoClient, STATUT_COLOR } from '../../../data/static/showcase.data';
import { DATA_ADV_SNIPPETS } from './data-advanced.snippets';

/** Sections « avancées » de la galerie Data display (table avancée, liste descriptive, diff, audit, QR, compteurs). */
@Component({
  selector: 'app-data-advanced',
  standalone: true,
  imports: [
    MaterialModule, ...DOC_COMPONENTS, DataTableComponent, DescriptionListComponent, StatCounterComponent, TrendComponent,
    QrCodeComponent, BarcodeComponent, TextDiffComponent, AuditLogComponent,
  ],
  templateUrl: './data-advanced.component.html',
  styleUrls: ['./data-advanced.component.scss'],
})
export class DataAdvancedComponent {
  private snack = inject(MatSnackBar);
  readonly code = DATA_ADV_SNIPPETS;

  // ── Table avancée ────────────────────────────────────
  rows = signal<(DemoClient & { sante: number })[]>(DEMO_CLIENTS.map((c, i) => ({ ...c, sante: (i * 37) % 101 })));
  private tone = (c: DemoClient) => ({ ACTIF: 'success', SUSPENDU: 'warning', INACTIF: 'info', RESILIE: 'error' } as Record<string, string>)[c.statut] ?? 'primary';
  readonly columns: DataColumn<DemoClient & { sante: number }>[] = [
    { key: 'code', label: 'Code', width: 110, sticky: 'start', type: 'mono', required: true },
    { key: 'raison_sociale', label: 'Raison sociale', width: 230, sticky: 'start', editable: 'text', required: true },
    { key: 'contact', label: 'Contact', width: 170 },
    { key: 'ville', label: 'Ville', width: 140, editable: 'select', options: ['Abidjan', 'Yamoussoukro', 'Bouaké', 'San-Pédro', 'Daloa', 'Korhogo', 'Man', 'Gagnoa'].map((v) => ({ value: v, label: v })) },
    { key: 'secteur', label: 'Secteur', width: 140 },
    { key: 'vehicules', label: 'Véhicules', width: 110, type: 'number', editable: 'number', total: true },
    { key: 'ca_mensuel', label: 'CA mensuel', width: 150, type: 'currency', total: true },
    { key: 'sante', label: 'Taux de remontée', width: 170, type: 'progress' },
    { key: 'email', label: 'Email', width: 260, hidden: true },
    { key: 'telephone', label: 'Téléphone', width: 170, hidden: true },
    { key: 'created_at', label: 'Client depuis', width: 130, type: 'date' },
    { key: 'statut', label: 'Statut', width: 120, sticky: 'end', type: 'badge', tone: (r) => this.tone(r),
      editable: 'select', options: [{ value: 'ACTIF', label: 'Actif' }, { value: 'SUSPENDU', label: 'Suspendu' }, { value: 'INACTIF', label: 'Inactif' }, { value: 'RESILIE', label: 'Résilié' }] },
  ];
  readonly bulk: BulkAction[] = [
    { id: 'export', label: 'Exporter', icon: 'download' },
    { id: 'mail', label: 'Envoyer un email', icon: 'mail' },
    { id: 'suspend', label: 'Suspendre', icon: 'pause_circle' },
    { id: 'delete', label: 'Supprimer', icon: 'delete', tone: 'error' },
  ];
  readonly statutColor = STATUT_COLOR;
  onBulk(e: { action: string; rows: DemoClient[] }): void {
    if (e.action === 'delete') {
      const ids = new Set(e.rows.map((r) => r._id));
      const before = this.rows();
      this.rows.set(before.filter((r) => !ids.has(r._id)));
      this.snack.open(`${ids.size} client(s) supprimé(s)`, 'Annuler', { duration: 5000 }).onAction().subscribe(() => this.rows.set(before));
      return;
    }
    this.snack.open(`Action « ${this.bulk.find((b) => b.id === e.action)?.label} » sur ${e.rows.length} client(s) — démo statique`, 'Fermer', { duration: 2500 });
  }
  onEdit(e: CellEditEvent): void {
    this.snack.open(`${e.row.code} · ${e.key} : « ${e.previous ?? '—'} » → « ${e.value ?? '—'} »`, 'Fermer', { duration: 2500 });
  }

  // ── Liste descriptive ────────────────────────────────
  readonly infos: DescriptionItem[] = [
    { label: 'Raison sociale', value: 'Transports Yao & Fils', icon: 'business' },
    { label: 'Code client', value: 'CLI-1040', type: 'mono', copy: true },
    { label: 'Statut', value: 'Actif', type: 'badge', tone: 'success' },
    { label: 'Contact', value: 'Jean Kouassi', icon: 'person' },
    { label: 'Email', value: 'jean.kouassi@transports-yao.ci', type: 'email', copy: true },
    { label: 'Téléphone', value: '+225 07 10 20 30 40', type: 'phone' },
    { label: 'RCCM', value: 'CI-ABJ-2019-B-12345', type: 'mono', copy: true, hint: 'Registre du commerce' },
    { label: 'Site web', value: 'transports-yao.ci', type: 'link', href: 'https://example.com' },
    { label: 'Gestionnaire', value: null },
    { label: 'Adresse', value: 'Zone industrielle de Yopougon\nLot 412, BP 1234 Abidjan 01', type: 'multiline', span: 'full' },
  ];
  readonly contrat: DescriptionItem[] = [
    { label: 'Offre', value: 'Premium — Flotte' }, { label: 'Début', value: '01/03/2026' }, { label: 'Échéance', value: '28/02/2027' },
    { label: 'Montant mensuel', value: '1 250 000 FCFA' }, { label: 'Paiement', value: 'Virement, à 30 jours' }, { label: 'Renouvellement', value: 'Tacite', type: 'badge', tone: 'info' },
  ];

  // ── Diff ─────────────────────────────────────────────
  readonly v1 = `Article 4 — Conditions financières
Les prestations sont facturées mensuellement, terme à échoir.
Le règlement intervient à trente (30) jours date de facture.
Tout retard entraîne une pénalité de 1 % par mois.
Les prix sont révisables chaque année au 1er janvier.

Article 5 — Résiliation
Chaque partie peut résilier avec un préavis de trois (3) mois.
La résiliation est notifiée par lettre recommandée.`;
  readonly v2 = `Article 4 — Conditions financières
Les prestations sont facturées mensuellement, terme à échoir.
Le règlement intervient à quarante-cinq (45) jours date de facture, par virement ou mobile money.
Tout retard entraîne une pénalité de 1,5 % par mois.
Les prix sont révisables chaque année au 1er janvier.

Article 5 — Résiliation
Chaque partie peut résilier avec un préavis de deux (2) mois.
La résiliation est notifiée par lettre recommandée ou par email avec accusé de réception.
Aucune indemnité n'est due en cas de résiliation à l'échéance.`;
  readonly cfg1 = `{
  "intervalle_gps": 30,
  "vitesse_max": 90,
  "coupe_moteur": false,
  "alertes": ["sortie_zone", "batterie_faible"]
}`;
  readonly cfg2 = `{
  "intervalle_gps": 15,
  "vitesse_max": 90,
  "coupe_moteur": true,
  "alertes": ["sortie_zone", "batterie_faible", "exces_vitesse"]
}`;

  // ── Audit ────────────────────────────────────────────
  private ago(h: number): Date { return new Date(Date.now() - h * 3600_000); }
  readonly audit: AuditEntry[] = [
    { id: 'a1', at: this.ago(0.3), user: { name: 'Aminata Diallo', color: '#8b5cf6' }, action: 'update', target: 'Client CLI-1040',
      changes: [{ field: 'telephone', label: 'Téléphone', before: '+225 07 10 20 30 40', after: '+225 05 44 21 18 90' }, { field: 'vehicules', label: 'Véhicules', before: 12, after: 14 }],
      meta: 'Chrome · macOS · 41.202.x.x' },
    { id: 'a2', at: this.ago(1.2), user: { name: 'Koffi N’Guessan', color: '#0ea5e9' }, action: 'comment', target: 'Ticket #4521',
      comment: 'Balise remplacée, la remontée GPS est de nouveau normale. Client prévenu par téléphone.' },
    { id: 'a3', at: this.ago(3), user: { name: 'Aminata Diallo', color: '#8b5cf6' }, action: 'status', target: 'Contrat CTR-2026-0412',
      changes: [{ field: 'statut', label: 'Statut', before: 'Brouillon', after: 'Signé' }, { field: 'signe_le', label: 'Signé le', before: null, after: '15/10/2026' }] },
    { id: 'a4', at: this.ago(26), user: { name: 'Serge Kouamé', color: '#f59e0b' }, action: 'create', target: 'Véhicule CI-8843-UV',
      changes: [{ field: 'marque', label: 'Marque', after: 'Nissan Navara' }, { field: 'groupe', label: 'Groupe', after: 'Livraisons Nord' }] },
    { id: 'a5', at: this.ago(28), user: { name: 'Serge Kouamé', color: '#f59e0b' }, action: 'export', target: 'Rapport de trajets (septembre)', meta: 'XLSX · 2 480 lignes' },
    { id: 'a6', at: this.ago(52), user: { name: 'Jean Kouassi', color: '#10b981' }, action: 'delete', target: 'Zone « Dépôt provisoire »' },
    { id: 'a7', at: this.ago(55), user: { name: 'Jean Kouassi', color: '#10b981' }, action: 'login', meta: 'Application mobile · Android' },
  ];

  // ── QR / compteurs ───────────────────────────────────
  qrText = signal('https://suivi.example.com/v/CI-4521-AB');
  readonly wifi = 'WIFI:T:WPA;S:Atelier-Lookas;P:balise2026;;';
  readonly vcard = 'BEGIN:VCARD\nVERSION:3.0\nFN:Jean Kouassi\nORG:Transports Yao & Fils\nTEL:+2250710203040\nEMAIL:jean.kouassi@transports-yao.ci\nEND:VCARD';
  async download(qr: QrCodeComponent): Promise<void> {
    const a = document.createElement('a');
    a.href = await qr.toPng(1024);
    a.download = 'qr-code.png';
    a.click();
  }

  kpi = signal({ ca: 55_800_000, vehicules: 1_248, dispo: 97.4, alertes: 23 });
  refresh(): void {
    const k = this.kpi();
    const j = (v: number, p: number) => Math.round(v * (1 + (Math.random() - 0.5) * p));
    this.kpi.set({ ca: j(k.ca, 0.2), vehicules: j(k.vehicules, 0.1), dispo: Math.min(100, +(k.dispo + (Math.random() - 0.5) * 3).toFixed(1)), alertes: Math.max(0, j(k.alertes, 0.6)) });
  }
}
