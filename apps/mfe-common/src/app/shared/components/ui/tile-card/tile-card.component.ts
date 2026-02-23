import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
import { TransactionBreakdown } from './tile-card.types';

@Component({
  selector: 'app-tile-card',
  standalone: true,
  imports: [CommonModule, DecimalPipe, CurrencyPipe],
  templateUrl: './tile-card.component.html',
  styleUrl: './tile-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TileCardComponent {
  @Input() title: string = '';
  @Input() totalTransactions: number = 0;
  @Input() totalAmount: number = 0;
  @Input() failureRate: number = 0;
  @Input() breakdown: TransactionBreakdown = {
    ach: { count: 0, volume: 0, percentage: 0 },
    card: { count: 0, volume: 0, percentage: 0 },
    wire: { count: 0, volume: 0, percentage: 0 }
  };
  @Input() loading: boolean = false;
  @Input() showBreakdown: boolean = true;
  @Input() currency: string = 'USD';
  
  @Output() cardClick = new EventEmitter<void>();
  
  // Computed properties
  formattedTotalAmount = computed(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency
    }).format(this.totalAmount);
  });
  
  formattedFailureRate = computed(() => {
    return `${this.failureRate.toFixed(2)}%`;
  });
  
  // Methods
  onCardClick(): void {
    if (this.cardClick.observers.length > 0) {
      this.cardClick.emit();
    }
  }
  
  getBreakdownColor(type: 'ach' | 'card' | 'wire'): string {
    const colors = {
      ach: '#0066cc',
      card: '#28a745',
      wire: '#ff9800'
    };
    return colors[type] || '#6c757d';
  }
}

