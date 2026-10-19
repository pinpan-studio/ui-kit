/** Extraits de code des sections avancées de la galerie Data display. */
export const DATA_ADV_SNIPPETS = {
  table: `
columns: DataColumn<Client>[] = [
  { key: 'code', label: 'Code', width: 110, sticky: 'start', type: 'mono', required: true },
  { key: 'raison_sociale', label: 'Raison sociale', width: 230, sticky: 'start', editable: 'text' },
  { key: 'ville', label: 'Ville', editable: 'select', options: villes },
  { key: 'vehicules', label: 'Véhicules', type: 'number', editable: 'number', total: true },
  { key: 'ca_mensuel', label: 'CA', type: 'currency', total: true },
  { key: 'email', label: 'Email', hidden: true },
  { key: 'statut', label: 'Statut', sticky: 'end', type: 'badge', tone: (r) => r.statut === 'ACTIF' ? 'success' : 'error' },
];

<app-data-table [rows]="clients" [columns]="columns" rowKey="_id" title="Clients"
  selectable [bulkActions]="[{ id: 'delete', label: 'Supprimer', icon: 'delete', tone: 'error' }]"
  [pageSize]="10" (bulkAction)="onBulk($event)" (cellEdit)="save($event)">
  <ng-template #expanded let-row>Détail de {{ row.raison_sociale }}</ng-template>
</app-data-table>`,
  dl: `
items: DescriptionItem[] = [
  { label: 'Code client', value: 'CLI-1040', type: 'mono', copy: true },
  { label: 'Statut', value: 'Actif', type: 'badge', tone: 'success' },
  { label: 'Email', value: 'jean@yao.ci', type: 'email' },
  { label: 'Adresse', value: 'Lot 412\\nAbidjan', type: 'multiline', span: 'full' },
];

<app-description-list [items]="items" [columns]="3" />
<app-description-list [items]="items" [columns]="1" layout="horizontal" bordered />`,
  counter: `
<strong><app-stat-counter [value]="ca" format="compact" suffix=" FCFA" [decimals]="1" /></strong>
<app-stat-counter [value]="dispo" format="percent" [decimals]="1" [duration]="1200" />
<app-trend [value]="9.2" label="vs sept." />
<app-trend [value]="-18" inverse />   <!-- une baisse est positive -->`,
  diff: `
<app-text-diff [before]="v1" [after]="v2" title="contrat.txt" mode="split" [context]="2" />

import { diffLines } from 'shared/utils/diff.util';   // utilisable sans le composant`,
  audit: `
entries: AuditEntry[] = [{
  id: 'a1', at: '2026-10-15T09:12:00', action: 'update', target: 'Client CLI-1040',
  user: { name: 'Aminata Diallo', color: '#8b5cf6' },
  changes: [{ field: 'telephone', label: 'Téléphone', before: '+225 07…', after: '+225 05…' }],
}];

<app-audit-log [entries]="entries" />`,
  qr: `
<app-qr-code #qr value="https://suivi.example.com/v/CI-4521-AB" [size]="168" ecc="M" icon="local_shipping" />
<button (click)="qr.toPng(1024).then(download)">PNG</button>   <!-- ou qr.toSvg() -->

<app-barcode value="358240051111110" [height]="44" />`,
};
