import { Component, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-summary-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="summary-panel">
      <h2>Transaction Summary</h2>
      <div *ngIf="loading" class="loading">Loading...</div>
      <div *ngIf="!loading && summary" class="summary-content">
        <div class="summary-metrics">
          <div class="metric">
            <span class="label">Total Transactions</span>
            <span class="value">{{ summary.totalTransactions | number }}</span>
          </div>
          <div class="metric">
            <span class="label">Total Amount</span>
            <span class="value">{{ summary.totalAmount | currency }}</span>
          </div>
          <div class="metric">
            <span class="label">Failure Rate</span>
            <span class="value" [class.danger]="summary.failureRate > 5">
              {{ summary.failureRate | number:'1.2-2' }}%
            </span>
          </div>
        </div>
        <div class="breakdown">
          <h3>Breakdown by Type</h3>
          <div class="breakdown-item" *ngFor="let type of ['ach', 'card', 'wire']">
            <span class="type">{{ type | uppercase }}</span>
            <span class="count">{{ summary.breakdown[type].count | number }}</span>
            <span class="volume">{{ summary.breakdown[type].volume | currency }}</span>
            <span class="percentage">{{ summary.breakdown[type].percentage | number:'1.2-2' }}%</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .summary-panel {
      padding: var(--spacing-lg, 1.5rem);
      background: var(--color-background, #ffffff);
    }
    .summary-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-md, 1rem);
      margin-bottom: var(--spacing-lg, 1.5rem);
    }
    .metric {
      display: flex;
      flex-direction: column;
      padding: var(--spacing-md, 1rem);
      background: var(--color-surface, #f8f9fa);
      border-radius: 4px;
    }
    .label {
      font-size: 0.875rem;
      color: var(--color-text-secondary, #6c757d);
    }
    .value {
      font-size: 1.5rem;
      font-weight: var(--font-weight-bold, 600);
      color: var(--color-text, #212529);
    }
    .value.danger {
      color: var(--color-danger, #dc3545);
    }
    .breakdown {
      margin-top: var(--spacing-lg, 1.5rem);
    }
    .breakdown-item {
      display: grid;
      grid-template-columns: 100px 1fr 1fr 1fr;
      gap: var(--spacing-md, 1rem);
      padding: var(--spacing-sm, 0.5rem);
      border-bottom: 1px solid var(--color-surface, #f8f9fa);
    }
  `]
})
export class SummaryPanelComponent implements OnInit {
  loading = true;
  summary: any = null;
  
  async ngOnInit() {
    try {
      // Load GlobalStateBridge from Shell using Nx Module Federation
      // const module = await import('shell/GlobalStateBridge');
      
      // const stateBridge = module.GlobalStateBridge;
      
      // // Subscribe to summary breakdown signal
      // effect(() => {
      //   const breakdown = stateBridge.summaryBreakdown();
      //   if (breakdown) {
      //     this.summary = breakdown;
      //     this.loading = false;
      //   }
      // });
    } catch (error) {
      console.error('Error loading GlobalStateBridge:', error);
      this.loading = false;
    }
  }
}

