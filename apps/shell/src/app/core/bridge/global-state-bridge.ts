import { Injectable, inject } from '@angular/core';
import { TransactionStore } from '../store/transaction.store';
import { EventBus } from './event-bus';

@Injectable({ providedIn: 'root' })
export class GlobalStateBridge {
  private transactionStore = inject(TransactionStore);
  private eventBus = inject(EventBus);
  
  // Expose store methods
  get transactions() {
    return this.transactionStore.transactions;
  }
  
  get summaryBreakdown() {
    return this.transactionStore.summaryBreakdown;
  }
  
  get failureRate() {
    return this.transactionStore.failureRate;
  }
  
  addTransaction(tx: any): boolean {
    return this.transactionStore.addTransaction(tx);
  }
  
  reconcileTransaction(id: string, status: any): void {
    this.transactionStore.reconcileTransaction(id, status);
  }
  
  // Expose event bus
  get onTransactionAdded() {
    return this.eventBus.onTransactionAdded;
  }
  
  get onTransactionUpdated() {
    return this.eventBus.onTransactionUpdated;
  }
  
  get onTransactionReconciled() {
    return this.eventBus.onTransactionReconciled;
  }
}

