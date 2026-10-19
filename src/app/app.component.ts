import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatCardModule],
  template: `
    <div [class]="theme.mode()" style="display:flex; flex-direction:column; margin:0; width:100%; height:100%; min-width:100%; min-height:100%;">
      <mat-card style="display:flex; flex-direction:column; margin:0; width:100%; height:100%; min-width:100%; min-height:100%;">
        <router-outlet></router-outlet>
      </mat-card>
    </div>
  `,
  styles: [`:host { display: block; height: 100%; }`],
})
export class AppComponent {
  readonly theme = inject(ThemeService);
}
