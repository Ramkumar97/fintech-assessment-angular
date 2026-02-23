# Implementation Plan: Reusable Components in Shared Component MFE

## Overview

This document outlines the implementation plan for creating three reusable components in the **Common Components MFE (mfe-common)**:

1. **Data Table Component** - Generic table with pagination, sorting, and row click support
2. **Tile Card Component** - Displays real-time breakdown of ACH vs Card vs Wire transactions
3. **Modal Component** - ZardUI-based modal wrapper with flexible configuration

---

## Component 1: Data Table Component

### Location
`apps/mfe-common/src/app/shared/components/ui/data-table/`

### Files to Create
```
data-table/
├── data-table.component.ts
├── data-table.component.html
├── data-table.component.scss
├── data-table.component.spec.ts
└── data-table.types.ts
```

### Component Interface

**Inputs:**
```typescript
@Input() headers: TableHeader[] = [];
@Input() data: any[] = [];
@Input() pageSize: number = 10;
@Input() currentPage: number = 1;
@Input() totalItems: number = 0;
@Input() sortable: boolean = true;
@Input() clickableRows: boolean = true;
@Input() loading: boolean = false;
@Input() emptyMessage: string = 'No data available';
```

**Outputs:**
```typescript
@Output() pageChange = new EventEmitter<number>();
@Output() sortChange = new EventEmitter<SortEvent>();
@Output() rowClick = new EventEmitter<any>();
```

### Type Definitions

**File:** `data-table.types.ts`

```typescript
export interface TableHeader {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface SortEvent {
  column: string;
  direction: 'asc' | 'desc';
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
```

### Implementation Requirements

1. **Generic Type Support**
   - Use TypeScript generics: `DataTableComponent<T>`
   - Support any data type

2. **Sorting**
   - Click column header to sort
   - Visual indicators (arrows) for sort direction
   - Toggle: none → asc → desc → none
   - Emit `sortChange` event with column and direction

3. **Pagination**
   - Display page numbers
   - Previous/Next buttons
   - Page size selector (optional)
   - Show "X of Y" items information
   - Emit `pageChange` event

4. **Row Click**
   - Optional row click functionality
   - Emit `rowClick` event with row data
   - Visual feedback on hover

5. **Loading State**
   - Show skeleton/spinner when `loading = true`
   - Disable interactions during loading

6. **Empty State**
   - Display message when `data.length === 0`
   - Customizable empty message

7. **ZardUI Integration**
   - Use ZardUI Table components
   - Use ZardUI Button for pagination
   - Use ZardUI Spinner for loading state

8. **Performance**
   - OnPush change detection
   - TrackBy function for ngFor
   - Virtual scroll support (optional, for large datasets)

### Component Structure

```typescript
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    // ZardUI imports
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableComponent<T = any> {
  // Inputs and Outputs as defined above
  
  // Internal state
  sortedColumn: string | null = null;
  sortDirection: 'asc' | 'desc' | null = null;
  
  // Computed properties
  get paginatedData(): T[] {
    // Return data for current page
  }
  
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }
  
  // Methods
  onSort(column: string): void {
    // Handle sorting logic
  }
  
  onPageChange(page: number): void {
    // Emit page change event
  }
  
  onRowClick(row: T): void {
    // Emit row click event
  }
  
  trackByFn(index: number, item: T): any {
    // TrackBy function for performance
  }
}
```

---

## Component 2: Tile Card Component

### Location
`apps/mfe-common/src/app/shared/components/ui/tile-card/`

### Files to Create
```
tile-card/
├── tile-card.component.ts
├── tile-card.component.html
├── tile-card.component.scss
├── tile-card.component.spec.ts
└── tile-card.types.ts
```

### Component Interface

**Inputs:**
```typescript
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
```

**Outputs:**
```typescript
@Output() cardClick = new EventEmitter<void>(); // Optional click handler
```

### Type Definitions

**File:** `tile-card.types.ts`

```typescript
export interface TransactionTypeBreakdown {
  count: number;
  volume: number;
  percentage: number;
}

export interface TransactionBreakdown {
  ach: TransactionTypeBreakdown;
  card: TransactionTypeBreakdown;
  wire: TransactionTypeBreakdown;
}
```

### Implementation Requirements

1. **Display Metrics**
   - Total transactions count (formatted with commas)
   - Total amount (formatted as currency)
   - Failure rate (formatted as percentage)
   - Breakdown by type (ACH, Card, Wire)

2. **Breakdown Visualization**
   - Show percentage distribution
   - Use progress bars or pie chart segments
   - Color coding:
     - ACH: Blue
     - Card: Green
     - Wire: Orange

3. **Real-time Updates**
   - Support signal-based updates
   - Animated number transitions
   - Smooth percentage updates

4. **Formatting**
   - Use shared `CurrencyPipe` for amounts
   - Use shared `PercentagePipe` for percentages
   - Format large numbers with commas

5. **Visual Design**
   - Use ZardUI Card component
   - Status color indicators
   - Responsive layout
   - Hover effects (if clickable)

6. **Loading State**
   - Show skeleton/spinner when `loading = true`
   - Disable interactions during loading

7. **Accessibility**
   - ARIA labels for metrics
   - Screen reader friendly
   - Keyboard navigation support

### Component Structure

```typescript
@Component({
  selector: 'app-tile-card',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DecimalPipe,
    // ZardUI imports
  ],
  templateUrl: './tile-card.component.html',
  styleUrl: './tile-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TileCardComponent {
  // Inputs and Outputs as defined above
  
  // Computed properties
  get formattedTotalAmount(): string {
    // Format currency
  }
  
  get formattedFailureRate(): string {
    // Format percentage
  }
  
  // Methods
  onCardClick(): void {
    if (this.cardClick.observers.length > 0) {
      this.cardClick.emit();
    }
  }
  
  getBreakdownColor(type: 'ach' | 'card' | 'wire'): string {
    // Return color for each type
  }
}
```

---

## Component 3: Modal Component

### Location
`apps/mfe-common/src/app/shared/components/ui/modal/`

### Files to Create
```
modal/
├── modal.component.ts
├── modal.component.html
├── modal.component.scss
├── modal.component.spec.ts
├── modal.service.ts
└── modal.types.ts
```

### Component Interface

**Inputs:**
```typescript
@Input() isOpen: boolean = false;
@Input() title: string = '';
@Input() size: 'small' | 'medium' | 'large' | 'fullscreen' = 'medium';
@Input() closeOnBackdropClick: boolean = true;
@Input() showCloseButton: boolean = true;
@Input() footerActions: ModalAction[] = [];
@Input() closable: boolean = true;
```

**Outputs:**
```typescript
@Output() close = new EventEmitter<void>();
@Output() actionClick = new EventEmitter<string>();
@Output() opened = new EventEmitter<void>();
@Output() closed = new EventEmitter<void>();
```

### Type Definitions

**File:** `modal.types.ts`

```typescript
export interface ModalAction {
  label: string;
  action: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
}
```

### Implementation Requirements

1. **ZardUI Integration**
   - Use ZardUI Dialog/Modal component
   - If ZardUI doesn't provide modal, use Angular CDK Overlay

2. **Size Variants**
   - Small: ~400px width
   - Medium: ~600px width (default)
   - Large: ~900px width
   - Fullscreen: 100% width and height

3. **Content Projection**
   - Header slot: `<ng-content select="[slot=header]">`
   - Body slot: `<ng-content select="[slot=body]">` or default
   - Footer slot: `<ng-content select="[slot=footer]">`

4. **Close Behavior**
   - Close button in header
   - Backdrop click to close (if enabled)
   - Escape key to close
   - Programmatic close via service

5. **Footer Actions**
   - Render action buttons from `footerActions` array
   - Emit `actionClick` with action identifier
   - Support different button variants

6. **Animation**
   - Fade in/out animation
   - Slide in from top (optional)
   - Smooth transitions

7. **Focus Management**
   - Trap focus inside modal when open
   - Return focus to trigger element on close
   - Auto-focus first input (if any)

8. **Accessibility**
   - ARIA labels and roles
   - Keyboard navigation
   - Screen reader support
   - Focus trap

### Component Structure

```typescript
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [
    CommonModule,
    // ZardUI imports or CDK Overlay
  ],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    // Modal animations
  ]
})
export class ModalComponent {
  // Inputs and Outputs as defined above
  
  // Methods
  closeModal(): void {
    if (this.closable) {
      this.isOpen = false;
      this.close.emit();
      this.closed.emit();
    }
  }
  
  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdropClick && event.target === event.currentTarget) {
      this.closeModal();
    }
  }
  
  onActionClick(action: string): void {
    this.actionClick.emit(action);
  }
  
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.isOpen && this.closable) {
      this.closeModal();
    }
  }
}
```

### Modal Service (Optional)

**File:** `modal.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class ModalService {
  private modalSubject = new Subject<ModalConfig>();
  
  open(config: ModalConfig): Observable<any> {
    // Programmatically open modal
  }
  
  close(): void {
    // Programmatically close modal
  }
}
```

---

## Module Federation Configuration

### Webpack Configuration

**File:** `apps/mfe-common/webpack.config.js`

```typescript
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'mfeCommon',
      filename: 'remoteEntry.js',
      exposes: {
        './DataTable': './src/app/shared/components/ui/data-table/data-table.component',
        './TileCard': './src/app/shared/components/ui/tile-card/tile-card.component',
        './Modal': './src/app/shared/components/ui/modal/modal.component',
        './CommonComponents': './src/app/shared/components/index.ts'
      },
      shared: {
        '@angular/core': { singleton: true, strictVersion: true },
        '@angular/common': { singleton: true, strictVersion: true },
        '@angular/common/http': { singleton: true, strictVersion: true },
        // ... other shared dependencies
      }
    })
  ]
};
```

### Barrel Export

**File:** `apps/mfe-common/src/app/shared/components/index.ts`

```typescript
export * from './ui/data-table/data-table.component';
export * from './ui/data-table/data-table.types';
export * from './ui/tile-card/tile-card.component';
export * from './ui/tile-card/tile-card.types';
export * from './ui/modal/modal.component';
export * from './ui/modal/modal.types';
export * from './ui/modal/modal.service';
```

---

## Shared Pipes

### Location
`apps/mfe-common/src/app/shared/pipes/`

### Pipes to Use/Create

1. **Currency Pipe** (if not using Angular's)
   - `currency.pipe.ts`
   - Format: `$1,234.56` or `USD 1,234.56`

2. **Percentage Pipe** (if not using Angular's)
   - `percentage.pipe.ts`
   - Format: `12.34%`

3. **Date Pipe** (Angular's built-in or custom)
   - Format dates consistently

---

## Implementation Steps

### Step 1: Setup Project Structure
1. Create folder structure in `apps/mfe-common/src/app/shared/components/ui/`
2. Ensure ZardUI is installed and configured
3. Set up standalone component configuration

### Step 2: Create Type Definitions
1. Create `data-table.types.ts`
2. Create `tile-card.types.ts`
3. Create `modal.types.ts`
4. Export from barrel file

### Step 3: Implement Data Table Component
1. Create component files
2. Implement sorting logic
3. Implement pagination logic
4. Add row click handler
5. Add loading and empty states
6. Integrate ZardUI components
7. Write unit tests

### Step 4: Implement Tile Card Component
1. Create component files
2. Design card layout
3. Implement breakdown visualization
4. Add formatting pipes
5. Add real-time update support
6. Integrate ZardUI components
7. Write unit tests

### Step 5: Implement Modal Component
1. Create component files
2. Wrap ZardUI modal or use CDK Overlay
3. Implement content projection
4. Add size variants
5. Handle keyboard and backdrop events
6. Add animations
7. Implement focus management
8. Write unit tests

### Step 6: Module Federation Setup
1. Configure webpack to expose components
2. Create barrel export file
3. Test component loading from other MFEs
4. Verify shared dependencies

### Step 7: Documentation and Testing
1. Add JSDoc comments to all components
2. Create usage examples
3. Write comprehensive unit tests
4. Test integration with other MFEs

---

## Usage Examples

### Data Table Component

**In mfe-transaction:**
```typescript
import { loadRemoteModule } from '@angular-architects/module-federation';

@Component({
  template: `
    <app-data-table
      [headers]="tableHeaders"
      [data]="transactions"
      [pageSize]="10"
      [currentPage]="currentPage"
      [totalItems]="totalTransactions"
      [loading]="loading"
      (rowClick)="onRowClick($event)"
      (pageChange)="onPageChange($event)"
      (sortChange)="onSortChange($event)"
    />
  `
})
export class TransactionListComponent {
  tableHeaders: TableHeader[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, align: 'right' },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'status', label: 'Status', sortable: false },
    { key: 'date', label: 'Date', sortable: true }
  ];
  
  onRowClick(row: Transaction): void {
    // Open detail drawer
  }
}
```

### Tile Card Component

**In mfe-summary:**
```typescript
@Component({
  template: `
    <app-tile-card
      title="Transaction Summary"
      [totalTransactions]="summary.totalTransactions"
      [totalAmount]="summary.totalAmount"
      [failureRate]="summary.failureRate"
      [breakdown]="summary.breakdown"
      [loading]="loading"
      (cardClick)="onCardClick()"
    />
  `
})
export class SummaryPanelComponent {
  summary = signal<SummaryBreakdown>({
    totalTransactions: 0,
    totalAmount: 0,
    failureRate: 0,
    breakdown: {
      ach: { count: 0, volume: 0, percentage: 0 },
      card: { count: 0, volume: 0, percentage: 0 },
      wire: { count: 0, volume: 0, percentage: 0 }
    }
  });
}
```

### Modal Component

**Usage:**
```typescript
@Component({
  template: `
    <app-modal
      [isOpen]="isModalOpen"
      title="Transaction Details"
      size="large"
      [footerActions]="modalActions"
      (close)="closeModal()"
      (actionClick)="onActionClick($event)"
    >
      <div slot="body">
        <!-- Modal content -->
      </div>
    </app-modal>
  `
})
export class TransactionDetailComponent {
  isModalOpen = signal(false);
  modalActions: ModalAction[] = [
    { label: 'Cancel', action: 'cancel', variant: 'secondary' },
    { label: 'Save', action: 'save', variant: 'primary' }
  ];
  
  onActionClick(action: string): void {
    if (action === 'save') {
      // Save logic
    }
    this.closeModal();
  }
}
```

---

## Design Considerations

### Performance
- Use OnPush change detection for all components
- Implement trackBy functions for ngFor loops
- Consider virtual scrolling for large tables
- Lazy load modal content if needed

### Accessibility
- Add ARIA labels and roles
- Implement keyboard navigation
- Ensure focus management
- Test with screen readers
- Provide alternative text for visual elements

### Styling
- Use CSS variables from Shell theme
- No hard-coded colors
- Responsive design (mobile-first)
- Follow ZardUI design system
- Consistent spacing and typography

### Type Safety
- Use TypeScript generics for DataTable
- Define interfaces for all inputs/outputs
- Strict TypeScript configuration
- No `any` types (except generic constraints)

### Testing
- Unit tests for each component
- Test all inputs and outputs
- Test user interactions
- Test edge cases (empty data, loading states)
- Test accessibility features

---

## Dependencies

### Required Packages
- `@angular/core` (Angular 20)
- `@angular/common`
- `@zardui/angular` (ZardUI components)
- `@angular/cdk` (for modal overlay if needed)

### Optional Packages
- `@angular/animations` (for modal animations)

---

## File Structure Summary

```
apps/mfe-common/
└── src/
    └── app/
        └── shared/
            ├── components/
            │   ├── ui/
            │   │   ├── data-table/
            │   │   │   ├── data-table.component.ts
            │   │   │   ├── data-table.component.html
            │   │   │   ├── data-table.component.scss
            │   │   │   ├── data-table.component.spec.ts
            │   │   │   └── data-table.types.ts
            │   │   ├── tile-card/
            │   │   │   ├── tile-card.component.ts
            │   │   │   ├── tile-card.component.html
            │   │   │   ├── tile-card.component.scss
            │   │   │   ├── tile-card.component.spec.ts
            │   │   │   └── tile-card.types.ts
            │   │   └── modal/
            │   │       ├── modal.component.ts
            │   │       ├── modal.component.html
            │   │       ├── modal.component.scss
            │   │       ├── modal.component.spec.ts
            │   │       ├── modal.service.ts
            │   │       └── modal.types.ts
            │   └── index.ts (barrel export)
            └── pipes/
                ├── currency.pipe.ts
                ├── percentage.pipe.ts
                └── date.pipe.ts
```

---

## Next Steps

1. Review and approve this implementation plan
2. Set up project structure
3. Install required dependencies
4. Begin implementation following the steps above
5. Test components in isolation
6. Test integration with other MFEs
7. Document usage and examples

