import { Component, afterNextRender, computed, input, output, signal, viewChild } from '@angular/core';
import { MatTree } from '@angular/material/tree';
import { MaterialModule } from '../../../shared/material.module';
import type { HzTreeNode } from '../../../data/static/harnais.data';

/**
 * Arborescence (mat-tree, API childrenAccessor) : dossiers, organisation, permissions…
 * En mode `selectable`, cases tri-état et bouton de validation ; sert aussi d'inspecteur JSON.
 */
@Component({
  selector: 'app-hz-tree',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './tree-widget.component.html',
  styleUrls: ['./tree-widget.component.scss'],
})
export class HzTreeComponent {
  readonly nodes = input.required<HzTreeNode[]>();
  readonly selectable = input(false);
  readonly submitLabel = input('Valider la sélection');
  /** Réponse déjà envoyée : l'arbre passe en lecture seule. */
  readonly answered = input<string | undefined>(undefined);
  /** Rendu inspecteur de données (clé : valeur en police mono). */
  readonly mono = input(false);
  readonly submitted = output<string[]>();

  private tree = viewChild<MatTree<HzTreeNode>>('tree');
  readonly picked = signal<Set<HzTreeNode>>(new Set());

  constructor() {
    // Inspecteur : le premier niveau est ouvert d'emblée.
    afterNextRender(() => { if (this.mono() && this.nodes()[0]) this.tree()?.expand(this.nodes()[0]); });
  }

  readonly childrenAccessor = (n: HzTreeNode) => n.children ?? [];
  readonly hasChild = (_: number, n: HzTreeNode) => !!n.children?.length;

  readonly total = computed(() => this.nodes().flatMap((n) => leaves(n)).length);
  readonly count = computed(() => this.picked().size);

  expandAll(): void { this.tree()?.expandAll(); }
  collapseAll(): void { this.tree()?.collapseAll(); }

  checked = (n: HzTreeNode) => leaves(n).every((l) => this.picked().has(l));
  partial = (n: HzTreeNode) => { const l = leaves(n); const k = l.filter((x) => this.picked().has(x)).length; return k > 0 && k < l.length; };

  toggle(n: HzTreeNode): void {
    const on = !this.checked(n);
    this.picked.update((set) => {
      const next = new Set(set);
      for (const l of leaves(n)) on ? next.add(l) : next.delete(l);
      return next;
    });
  }

  submit(): void { this.submitted.emit([...this.picked()].map((n) => n.label)); }
}

function leaves(n: HzTreeNode): HzTreeNode[] {
  return n.children?.length ? n.children.flatMap(leaves) : [n];
}

/** Convertit n'importe quelle donnée JSON en nœuds d'arbre (inspecteur). */
export function jsonToNodes(data: unknown, key = 'racine', path = 'r'): HzTreeNode[] {
  if (data !== null && typeof data === 'object') {
    const entries = Array.isArray(data) ? data.map((v, i) => [String(i), v] as const) : Object.entries(data as Record<string, unknown>);
    return [{
      id: path, label: key,
      icon: Array.isArray(data) ? 'data_array' : 'data_object',
      meta: Array.isArray(data) ? `[${entries.length}]` : `{${entries.length}}`,
      children: entries.flatMap(([k, v]) => jsonToNodes(v, k, `${path}.${k}`)),
    }];
  }
  const kind = data === null ? 'null' : typeof data;
  const value = typeof data === 'string' ? `"${data}"` : String(data);
  return [{ id: path, label: `${key}: ${value}`, icon: kind === 'number' ? 'tag' : kind === 'boolean' ? 'toggle_on' : 'text_fields', meta: kind }];
}
