import { Component, OnInit, effect } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { DataTableComponent, type TableHeader } from 'mfe-common/DataTable';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, DataTableComponent],
  template: `
    <div class="transaction-list">
      <h2>Transactions</h2>
      @if(loading) {
         <div class="loading">Loading...</div>
      }
      @else if(!loading){ 
        <div class="table-container">
          <app-data-table
            [headers]="tableHeaders"
            [data]="transactions"
            [pageSize]="pageSize"
            [currentPage]="currentPage"
            [totalItems]="totalItems"
            [loading]="loading"
            (rowClick)="onRowClick($event)"
            (pageChange)="onPageChange($event)"
            (sortChange)="onSortChange($event)"
        />
      </div>
      }
    </div>
  `,
  styles: [`
    .transaction-list {
      padding: var(--spacing-lg, 1.5rem);
    }
    .table-container {
      margin-top: var(--spacing-md, 1rem);
    }
  `]
})
export class TransactionListComponent implements OnInit {
  loading = true;
  transactions: any[] = [];
  tableHeaders: TableHeader[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, align: 'right' },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'date', label: 'Date', sortable: true }
  ];
  pageSize = 10;
  currentPage = 1;
  totalItems = 0;
  
  async ngOnInit() {
    try {
      // Load GlobalStateBridge from Shell using Nx Module Federation
      const module = await import('shell/GlobalStateBridge');
      
      const stateBridge = module.GlobalStateBridge;
      
      // Subscribe to transactions signal
      effect(() => {
        const txs = stateBridge.transactions();
        if (txs) {
          this.transactions = txs;
          this.totalItems = txs.length;
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Error loading modules:', error);
      this.loading = false;
    }
  }
  
  onRowClick(row: any): void {
    console.log('Row clicked:', row);
    // Open detail drawer
  }
  
  onPageChange(page: number): void {
    this.currentPage = page;
  }
  
  onSortChange(event: any): void {
    console.log('Sort changed:', event);
    // Handle sorting
  }
}

