import { Injectable, inject } from '@angular/core';
import { TransactionStore } from '../store/transaction.store';
import { EventBus } from '../bridge/event-bus';
import { Transaction, TransactionType, TransactionStatus } from '../../../../libs/shared/src/lib/types/transaction.types';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private store = inject(TransactionStore);
  private eventBus = inject(EventBus);
  private intervalId: any = null;
  private isConnected = false;
  
  connect(): void {
    if (this.isConnected) {
      return;
    }
    
    this.isConnected = true;
    
    // Simulate 50+ TPS (transactions per second)
    // 50 TPS = 1 transaction every 20ms
    this.intervalId = setInterval(() => {
      const tx = this.generateMockTransaction();
      
      // Add to store (idempotency handled)
      const added = this.store.addTransaction(tx);
      
      if (added) {
        // Emit event for real-time updates
        this.eventBus.emitTransactionAdded(tx);
      }
    }, 20); // ~50 TPS
  }
  
  disconnect(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isConnected = false;
    }
  }
  
  private generateMockTransaction(): Transaction {
    const types: TransactionType[] = ['ACH', 'Card', 'Wire'];
    const statuses: TransactionStatus[] = ['pending', 'completed', 'failed'];
    
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const amount = Math.random() * 10000 + 100; // $100 to $10,100
    const id = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id,
      amount: Math.round(amount * 100) / 100,
      date: new Date(),
      type,
      status,
      description: `${type} transaction ${id.substring(0, 8)}`,
      idempotencyKey: id
    };
  }
}

