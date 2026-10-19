import { Component, ElementRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ResultComponent } from '../../shared/components/feedback';
import { MaterialModule } from '../../shared/material.module';
import { TagInputComponent } from '../../shared/components/fields/tag-input.component';
import { CurrencyInputComponent } from '../../shared/components/fields/currency-input.component';
import { SignaturePadComponent } from '../../shared/components/fields/signature-pad.component';
import { ExAppShellComponent } from '../app/ex-app-shell.component';

interface Experience { title: string; company: string; from: string; to: string; current: boolean; }

/**
 * /examples/forms/application — formulaire long découpé en sections : navigation collante,
 * taux de complétion, expériences répétables, dépôt de fichiers, prétentions, signature, brouillon.
 */
@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [ResultComponent, FormsModule, MaterialModule, TagInputComponent, CurrencyInputComponent, SignaturePadComponent, ExAppShellComponent],
  templateUrl: './application-form.component.html',
  styleUrls: ['./application-form.component.scss'],
})
export class ApplicationFormComponent {
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly sections = [
    { id: 'identity', label: 'Identité', icon: 'badge' },
    { id: 'experience', label: 'Expérience', icon: 'work_history' },
    { id: 'documents', label: 'Documents', icon: 'folder' },
    { id: 'terms', label: 'Prétentions', icon: 'payments' },
    { id: 'sign', label: 'Signature', icon: 'draw' },
  ];
  readonly skillsList = ['Angular', 'TypeScript', 'Figma', 'Accessibilité', 'SQL', 'Gestion de projet', 'Flutter', 'Design system'];
  readonly contracts = ['CDI', 'CDD', 'Freelance', 'Stage'];

  m = {
    civ: 'M.', first: '', last: '', birth: null as Date | null, nationality: 'Ivoirienne', email: '', phone: '', city: 'Abidjan',
    skills: ['Angular', 'TypeScript'] as string[], level: 'Confirmé',
    experiences: [{ title: 'Développeur front-end', company: 'Digital Baobab', from: '2022', to: '', current: true }] as Experience[],
    files: [] as { name: string; size: string; kind: string }[], portfolio: '',
    salary: 850000, contract: 'CDI', start: null as Date | null, remote: true, relocation: false,
    signature: null as string | null, certify: false,
  };
  readonly drag = signal(false);
  readonly draftSaved = signal<string | null>(null);
  readonly submitted = signal(false);
  readonly tried = signal(false);

  /** Taux de complétion par section (affiché dans la navigation). */
  completion(id: string): number {
    const m = this.m;
    const parts: Record<string, boolean[]> = {
      identity: [!!m.first, !!m.last, !!m.birth, /@/.test(m.email), !!m.phone],
      experience: [m.experiences.length > 0 && !!m.experiences[0].title, m.skills.length >= 3],
      documents: [m.files.some((f) => f.kind === 'CV'), m.files.length > 1 || !!m.portfolio],
      terms: [m.salary > 0, !!m.contract, !!m.start],
      sign: [!!m.signature, m.certify],
    };
    const p = parts[id];
    return Math.round((p.filter(Boolean).length / p.length) * 100);
  }
  total(): number { return Math.round(this.sections.reduce((s, x) => s + this.completion(x.id), 0) / this.sections.length); }

  addExperience(): void { this.m.experiences = [...this.m.experiences, { title: '', company: '', from: '', to: '', current: false }]; }
  removeExperience(i: number): void { this.m.experiences = this.m.experiences.filter((_, j) => j !== i); }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.drag.set(false);
    this.addFiles(e.dataTransfer?.files ?? null);
  }
  addFiles(list: FileList | null): void {
    const files = [...(list ?? [])].map((f, i) => ({
      name: f.name, size: f.size > 1e6 ? (f.size / 1e6).toFixed(1) + ' Mo' : Math.max(1, Math.round(f.size / 1e3)) + ' Ko',
      kind: !this.m.files.some((x) => x.kind === 'CV') && i === 0 ? 'CV' : 'Autre',
    }));
    this.m.files = [...this.m.files, ...files];
  }
  /** Ajoute des fichiers d'exemple (démonstration sans fichier local). */
  sampleFiles(): void {
    this.m.files = [{ name: 'CV-Jean-Kouassi.pdf', size: '248 Ko', kind: 'CV' }, { name: 'Lettre-motivation.pdf', size: '96 Ko', kind: 'Lettre' }];
  }
  removeFile(i: number): void { this.m.files = this.m.files.filter((_, j) => j !== i); }

  scrollTo(id: string): void { this.host.nativeElement.querySelector('#sec-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

  saveDraft(): void { this.draftSaved.set(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })); }

  submit(): void {
    this.tried.set(true);
    const missing = this.sections.find((s) => this.completion(s.id) < 100 && s.id !== 'documents');
    if (missing && (!this.m.first || !this.m.last || !/@/.test(this.m.email) || !this.m.signature || !this.m.certify)) { this.scrollTo(missing.id); return; }
    this.submitted.set(true);
  }
}
