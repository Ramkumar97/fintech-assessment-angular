import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Transaction, TransactionStatus } from '@shared-components';

@Injectable({ providedIn: 'root' })
export class EventBus {
  // Transaction events
  private transactionAdded$ = new Subject<Transaction>();
  private transactionUpdated$ = new Subject<{ id: string; status: TransactionStatus }>();
  private transactionReconciled$ = new Subject<string>();
  
  // Public observables
  readonly onTransactionAdded: Observable<Transaction> = this.transactionAdded$.asObservable();
  readonly onTransactionUpdated: Observable<{ id: string; status: TransactionStatus }> = this.transactionUpdated$.asObservable();
  readonly onTransactionReconciled: Observable<string> = this.transactionReconciled$.asObservable();
  
  // Emit methods
  emitTransactionAdded(tx: Transaction): void {
    this.transactionAdded$.next(tx);
  }
  
  emitTransactionUpdated(id: string, status: TransactionStatus): void {
    this.transactionUpdated$.next({ id, status });
  }
  
  emitTransactionReconciled(id: string): void {
    this.transactionReconciled$.next(id);
  }
}

