import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Transaction Monitoring Dashboard</h1>
      </header>
      <main class="dashboard-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    .dashboard-header {
      padding: var(--spacing-md);
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-text-secondary);
    }
    .dashboard-main {
      flex: 1;
      overflow: auto;
    }
  `]
})
export class DashboardComponent {
}

