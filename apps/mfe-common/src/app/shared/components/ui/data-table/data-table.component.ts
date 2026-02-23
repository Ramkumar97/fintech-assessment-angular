import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableHeader, SortEvent } from './data-table.types';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableComponent<T = any> {
  @Input() headers: TableHeader[] = [];
  @Input() data: T[] = [];
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 1;
  @Input() totalItems: number = 0;
  @Input() sortable: boolean = true;
  @Input() clickableRows: boolean = true;
  @Input() loading: boolean = false;
  @Input() emptyMessage: string = 'No data available';
  
  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<SortEvent>();
  @Output() rowClick = new EventEmitter<T>();
  
  // Internal state
  private sortedColumnSignal = signal<string | null>(null);
  private sortDirectionSignal = signal<'asc' | 'desc' | null>(null);
  
  sortedColumn = this.sortedColumnSignal.asReadonly();
  sortDirection = this.sortDirectionSignal.asReadonly();
  
  // Computed properties
  get paginatedData(): T[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.data.slice(start, end);
  }
  
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }
  
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  
  // Methods
  onSort(column: string): void {
    if (!this.sortable) return;
    
    const currentColumn = this.sortedColumnSignal();
    const currentDirection = this.sortDirectionSignal();
    
    if (currentColumn === column) {
      // Toggle direction: asc -> desc -> null
      if (currentDirection === 'asc') {
        this.sortDirectionSignal.set('desc');
        this.sortChange.emit({ column, direction: 'desc' });
      } else if (currentDirection === 'desc') {
        this.sortedColumnSignal.set(null);
        this.sortDirectionSignal.set(null);
        this.sortChange.emit({ column, direction: 'asc' }); // Reset
      }
    } else {
      // New column, start with asc
      this.sortedColumnSignal.set(column);
      this.sortDirectionSignal.set('asc');
      this.sortChange.emit({ column, direction: 'asc' });
    }
  }
  
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }
  
  onRowClick(row: T): void {
    if (this.clickableRows) {
      this.rowClick.emit(row);
    }
  }
  
  trackByFn(index: number, item: T): any {
    return (item as any)?.id ?? index;
  }
  
  getSortIcon(column: string): string {
    if (this.sortedColumnSignal() !== column) return '';
    return this.sortDirectionSignal() === 'asc' ? '↑' : '↓';
  }
}

