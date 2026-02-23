import { Injectable, computed, signal } from '@angular/core';
import { Transaction, TransactionBreakdown, SummaryBreakdown, TransactionStatus } from '../../../../libs/shared/src/lib/types/transaction.types';

@Injectable({ providedIn: 'root' })
export class TransactionStore {
  // Core state
  private readonly _transactions = signal<Transaction[]>([]);
  private readonly _processedIds = signal<Set<string>>(new Set());
  
  // Public read-only signals
  readonly transactions = this._transactions.asReadonly();
  
  // Computed signals
  readonly summaryBreakdown = computed(() => {
    const txs = this._transactions();
    return this.calculateBreakdown(txs);
  });
  
  readonly failureRate = computed(() => {
    const txs = this._transactions();
    if (txs.length === 0) return 0;
    const failed = txs.filter(tx => tx.status === 'failed').length;
    return (failed / txs.length) * 100;
  });
  
  // Actions
  addTransaction(tx: Transaction): boolean {
    // Idempotency check
    if (this._processedIds().has(tx.id)) {
      return false; // Duplicate rejected
    }
    
    // Add to processed set
    this._processedIds.update(ids => new Set([...ids, tx.id]));
    
    // Update transactions
    this._transactions.update(txs => [...txs, tx]);
    
    return true;
  }
  
  reconcileTransaction(id: string, status: TransactionStatus): void {
    this._transactions.update(txs =>
      txs.map(tx => tx.id === id ? { ...tx, status } : tx)
    );
  }
  
  private calculateBreakdown(txs: Transaction[]): SummaryBreakdown {
    const breakdown: TransactionBreakdown = {
      ach: { count: 0, volume: 0, percentage: 0 },
      card: { count: 0, volume: 0, percentage: 0 },
      wire: { count: 0, volume: 0, percentage: 0 }
    };
    
    let totalAmount = 0;
    
    txs.forEach(tx => {
      const typeBreakdown = breakdown[tx.type.toLowerCase() as keyof TransactionBreakdown];
      if (typeBreakdown) {
        typeBreakdown.count++;
        typeBreakdown.volume += tx.amount;
        totalAmount += tx.amount;
      }
    });
    
    // Calculate percentages
    const totalCount = txs.length;
    if (totalCount > 0) {
      breakdown.ach.percentage = (breakdown.ach.count / totalCount) * 100;
      breakdown.card.percentage = (breakdown.card.count / totalCount) * 100;
      breakdown.wire.percentage = (breakdown.wire.count / totalCount) * 100;
    }
    
    const failed = txs.filter(tx => tx.status === 'failed').length;
    const failureRate = totalCount > 0 ? (failed / totalCount) * 100 : 0;
    
    return {
      totalTransactions: totalCount,
      totalAmount,
      failureRate,
      breakdown
    };
  }
}

