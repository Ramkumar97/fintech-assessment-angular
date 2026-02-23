# Technical Architecture

## Frontend Stack

- Angular 20 (Stable)
- Standalone Components (No NgModules)
- Signal-based State Management
- OnPush Change Detection (Mandatory)
- Angular CDK (Virtual Scroll)
- Web Workers
- Simulated WebSocket (50+ TPS)
- ZardUI Component Library (https://zardui.com/)
- Module Federation: @angular-architects/module-federation

---

# Component Strategy

## UI Component System

We use ZardUI as the base design system.

Rules:
- All UI elements must use ZardUI components
- Custom wrappers allowed inside shared layer
- No direct DOM styling inside feature components
- Theme tokens must be centralized

---

# Micro-Frontend Architecture

## Module Federation Implementation

The system uses **@angular-architects/module-federation** to implement a true Federated MFE environment.

### Package Details
- **Package:** `@angular-architects/module-federation`
- **Version:** Latest compatible with Angular 20
- **Approach:** Webpack 5 Module Federation
- **Standalone Components:** Fully supported (no NgModules required)

### Configuration
- Each MFE will have its own `webpack.config.js` or `module-federation.config.ts`
- Shell app acts as the host application
- Remote MFEs expose their components/routes via Module Federation
- Shared dependencies are configured to avoid duplication

## Application Structure

### Applications:

1. Shell App
   - Layout
   - Routing
   - Authentication
   - Global theme provider
   - Global state bridge

2. Summary Panel MFE
   - Independent standalone app
   - Consumes shared event bus
   - No direct coupling with Transaction Table

3. Transaction Table MFE
   - Independent standalone app
   - Uses global state bridge
   - Handles optimistic updates

4. Common Components MFE
   - Dedicated micro-frontend
   - Exposes:
     - Shared UI wrappers (ZardUI-based)
     - Shared pipes
     - Utility components
     - Shared layout primitives
   - No business logic

Each MFE must:
- Be independently deployable
- Avoid cross-imports
- Communicate only via shared contract
- Expose components/routes via Module Federation remote configuration
- Load remote MFEs dynamically in the Shell app

### Module Federation Setup
- **Shell App (Host):**
  - Configures remotes for: mfe-summary, mfe-transaction, mfe-common
  - Exposes: Global state bridge, Theme service, Auth context
  - Shares common dependencies (Angular, RxJS, etc.)

- **Remote MFEs:**
  - Each remote exposes its standalone components/routes
  - Consumes shared dependencies from Shell
  - Accesses Shell-provided services via dependency injection or global state bridge

---

# Shared Communication Strategy

## Recommended Implementation: Global State Bridge + Event Bus (Hybrid)

### Architecture Overview

```
Shell App (Host)
├── TransactionStore (Signal-based, exposed via Module Federation)
├── WebSocketService (50+ TPS simulation)
├── GlobalStateBridge (exposed service)
└── EventBus (RxJS Subject for real-time events)
    │
    ├──→ Summary Panel MFE (reads summaryBreakdown signal)
    ├──→ Transaction Table MFE (reads transactions signal, writes optimistic updates)
    └──→ Common Components MFE (read-only access)
```

### Communication Patterns

#### 1. Global State Bridge (Primary - Signal-based)

**Location:** Shell App exposes `TransactionStore` and `GlobalStateBridge` via Module Federation

**Purpose:** 
- Single source of truth for transaction data
- Reactive state management using Signals
- Supports computed values (summaryBreakdown, failureRate)

**Implementation:**

```typescript
// Shell App: apps/shell/src/app/core/store/transaction.store.ts
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
    return this.calculateFailureRate(txs);
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
}
```

**Module Federation Exposure (Shell):**

```typescript
// Shell webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      exposes: {
        './TransactionStore': './src/app/core/store/transaction.store',
        './GlobalStateBridge': './src/app/core/bridge/global-state-bridge',
        './EventBus': './src/app/core/bridge/event-bus'
      },
      // ...
    })
  ]
};
```

**Remote MFE Consumption:**

```typescript
// mfe-summary: Load TransactionStore from Shell
import { loadRemoteModule } from '@angular-architects/module-federation';

@Component({ /* ... */ })
export class SummaryPanelComponent {
  private transactionStore?: TransactionStore;
  
  async ngOnInit() {
    // Dynamically load TransactionStore from Shell
    const module = await loadRemoteModule({
      type: 'module',
      remoteEntry: 'http://localhost:4200/remoteEntry.js',
      exposedModule: './TransactionStore'
    });
    
    this.transactionStore = module.TransactionStore;
    
    // Subscribe to computed signal
    effect(() => {
      const breakdown = this.transactionStore?.summaryBreakdown();
      // Update UI
    });
  }
}
```

#### 2. Event Bus (Secondary - RxJS Subject)

**Purpose:**
- Real-time event notifications
- Decoupled communication between MFEs
- WebSocket event distribution

**Implementation:**

```typescript
// Shell App: apps/shell/src/app/core/bridge/event-bus.ts
@Injectable({ providedIn: 'root' })
export class EventBus {
  // Transaction events
  private transactionAdded$ = new Subject<Transaction>();
  private transactionUpdated$ = new Subject<{ id: string; status: TransactionStatus }>();
  private transactionReconciled$ = new Subject<string>();
  
  // Public observables
  readonly onTransactionAdded = this.transactionAdded$.asObservable();
  readonly onTransactionUpdated = this.transactionUpdated$.asObservable();
  readonly onTransactionReconciled = this.transactionReconciled$.asObservable();
  
  // Emit methods
  emitTransactionAdded(tx: Transaction): void {
    this.transactionAdded$.next(tx);
  }
  
  emitTransactionUpdated(id: string, status: TransactionStatus): void {
    this.transactionUpdated$.next({ id, status });
  }
}
```

**Usage in Remote MFEs:**

```typescript
// mfe-transaction: Subscribe to events
import { loadRemoteModule } from '@angular-architects/module-federation';

@Component({ /* ... */ })
export class TransactionTableComponent {
  private eventBus?: EventBus;
  private destroy$ = new Subject<void>();
  
  async ngOnInit() {
    const module = await loadRemoteModule({
      type: 'module',
      remoteEntry: 'http://localhost:4200/remoteEntry.js',
      exposedModule: './EventBus'
    });
    
    this.eventBus = module.EventBus;
    
    // Subscribe to real-time updates
    this.eventBus.onTransactionAdded
      .pipe(takeUntil(this.destroy$))
      .subscribe(tx => {
        // Handle new transaction
      });
  }
}
```

#### 3. WebSocket Integration Flow

```
WebSocketService (Shell)
    ↓ (50+ TPS)
TransactionStore.addTransaction()
    ↓ (Idempotency check)
EventBus.emitTransactionAdded()
    ↓
All subscribed MFEs receive update
    ↓
Summary Panel: Reads summaryBreakdown signal
Transaction Table: Reads transactions signal
```

**WebSocket Service (Shell):**

```typescript
// Shell App: apps/shell/src/app/core/services/websocket.service.ts
@Injectable({ providedIn: 'root' })
export class WebSocketService {
  constructor(
    private store: TransactionStore,
    private eventBus: EventBus
  ) {}
  
  connect(): void {
    // Simulate 50+ TPS
    setInterval(() => {
      const tx = this.generateMockTransaction();
      
      // Add to store (idempotency handled)
      const added = this.store.addTransaction(tx);
      
      if (added) {
        // Emit event for real-time updates
        this.eventBus.emitTransactionAdded(tx);
      }
    }, 20); // ~50 TPS
  }
}
```

#### 4. Optimistic Updates Pattern

**Transaction Table MFE:**

```typescript
// mfe-transaction: Handle optimistic updates
export class TransactionTableComponent {
  private store?: TransactionStore;
  
  onUserAction(transactionId: string): void {
    // 1. Optimistic update
    this.store?.reconcileTransaction(transactionId, 'pending');
    
    // 2. Simulate API call
    setTimeout(() => {
      // 3. Reconciliation after 3 seconds
      const success = Math.random() > 0.1; // 90% success rate
      this.store?.reconcileTransaction(
        transactionId,
        success ? 'completed' : 'failed'
      );
    }, 3000);
  }
}
```

### Communication Rules

1. **No Direct Imports Between MFEs**
   - ❌ `import { Something } from '../mfe-summary'`
   - ✅ Load via Module Federation from Shell

2. **State Management**
   - All state mutations happen in Shell's TransactionStore
   - Remote MFEs read state via exposed signals
   - Optimistic updates go through Store actions

3. **Event Flow**
   - WebSocket → Store → EventBus → MFEs
   - User actions → Store → EventBus → Other MFEs

4. **Idempotency**
   - Enforced at Store level (Shell)
   - All MFEs benefit automatically
   - No duplicate processing

5. **Performance**
   - Signals provide efficient reactivity
   - Computed values cached automatically
   - OnPush change detection works seamlessly

### Data Flow Diagrams

#### Real-Time Transaction Flow

```
WebSocketService (Shell)
    │
    ├─→ TransactionStore.addTransaction()
    │       │
    │       ├─→ Idempotency Check
    │       │   ├─→ Duplicate? → Reject
    │       │   └─→ New? → Add to store
    │       │
    │       └─→ EventBus.emitTransactionAdded()
    │               │
    │               ├─→ Summary Panel MFE
    │               │   └─→ Reads summaryBreakdown signal
    │               │
    │               └─→ Transaction Table MFE
    │                   └─→ Reads transactions signal
```

#### User Action Flow

```
User clicks row (Transaction Table MFE)
    │
    ├─→ Optimistic update: store.reconcileTransaction(id, 'pending')
    │       │
    │       └─→ EventBus.emitTransactionUpdated()
    │               │
    │               └─→ Summary Panel MFE (updates failure rate)
    │
    └─→ After 3s: store.reconcileTransaction(id, 'completed')
            │
            └─→ EventBus.emitTransactionReconciled()
                    │
                    └─→ All MFEs update
```

### Module Federation Configuration

**Shell App (Host):**
```typescript
// webpack.config.js
exposes: {
  './TransactionStore': './src/app/core/store/transaction.store',
  './GlobalStateBridge': './src/app/core/bridge/global-state-bridge',
  './EventBus': './src/app/core/bridge/event-bus',
  './ThemeService': './src/app/core/services/theme.service',
  './AuthService': './src/app/core/services/auth.service'
}
```

**Remote MFEs:**
```typescript
// webpack.config.js (each remote)
remotes: {
  'shell': 'shell@http://localhost:4200/remoteEntry.js'
}
```

### Type Safety

**Shared Types (via Module Federation or shared library):**

```typescript
// libs/shared/src/lib/types/transaction.types.ts
export interface Transaction {
  id: string;
  amount: number;
  date: Date;
  type: 'ACH' | 'Card' | 'Wire';
  status: 'pending' | 'completed' | 'failed';
  description: string;
}

export interface SummaryBreakdown {
  ach: { count: number; volume: number };
  card: { count: number; volume: number };
  wire: { count: number; volume: number };
  failureRate: number;
}
```

### Best Practices

1. **Always use Store for state mutations**
   - Never mutate state directly in MFEs
   - Use Store actions (addTransaction, reconcileTransaction)

2. **Subscribe to signals, not events (when possible)**
   - Signals are more efficient for state reads
   - Events are for notifications/triggers

3. **Handle async Module Federation loading**
   - Use `loadRemoteModule` with proper error handling
   - Provide fallback UI during loading

4. **Cleanup subscriptions**
   - Use `takeUntil` pattern for RxJS subscriptions
   - Signals auto-cleanup (no manual unsubscribe needed)

5. **Type safety across boundaries**
   - Share TypeScript interfaces via shared library
   - Or export types from Shell via Module Federation

---

# Theming Strategy (Enterprise Approach)

## Recommended Implementation: Hybrid CSS Variables + Signal Service

### Why This Approach?

For Module Federation, the **best practice** is a **hybrid approach** combining:
1. **CSS Custom Properties (CSS Variables)** - For automatic propagation across all MFEs
2. **Theme Service with Signals** - For programmatic access and reactivity
3. **Shared Theme Configuration** - Exposed via Module Federation

### Architecture Overview

```
Shell App (Host)
├── ThemeService (exposed via Module Federation)
├── Theme Signal (reactive state)
└── CSS Variables (applied to <html> or <body>)
    └── Automatically inherited by all remote MFEs
```

### Implementation Strategy

#### 1. CSS Custom Properties (Primary Mechanism)

**Location:** Shell App applies CSS variables to root element (`<html>` or `<body>`)

**Advantages:**
- ✅ Automatically cascades to all remote MFEs (no JavaScript needed)
- ✅ Zero coupling between MFEs
- ✅ Instant propagation (no async loading delays)
- ✅ Works with ZardUI theme system
- ✅ No Module Federation configuration needed for theme tokens

**Implementation:**
```typescript
// Shell App: theme.service.ts
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeSignal = signal<Theme>('light');
  
  applyTheme(theme: Theme) {
    const tokens = this.getThemeTokens(theme);
    const root = document.documentElement;
    
    // Apply CSS variables to root
    Object.entries(tokens).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    
    this.themeSignal.set(theme);
  }
}
```

**CSS Variables Structure:**
```css
:root {
  /* Colors */
  --color-primary: #0066cc;
  --color-secondary: #6c757d;
  --color-background: #ffffff;
  --color-surface: #f8f9fa;
  --color-text: #212529;
  --color-text-secondary: #6c757d;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-family-base: 'Inter', sans-serif;
  --font-size-base: 1rem;
  --font-weight-normal: 400;
  --font-weight-bold: 600;
  
  /* ZardUI overrides */
  --zard-primary: var(--color-primary);
  --zard-background: var(--color-background);
}
```

#### 2. Theme Service (Exposed via Module Federation)

**Shell App Configuration:**
- Expose `ThemeService` as a remote module
- Provide theme state via Signal
- Handle theme switching logic

**Remote MFEs:**
- Consume `ThemeService` from Shell (optional, for programmatic access)
- Use CSS variables directly in components (primary method)

**Module Federation Config (Shell):**
```typescript
// webpack.config.js (Shell)
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: { /* ... */ },
      exposes: {
        './ThemeService': './src/app/core/services/theme.service',
        './ThemeTokens': './src/app/core/tokens/theme.tokens'
      },
      shared: { /* ... */ }
    })
  ]
};
```

#### 3. ZardUI Integration

**Strategy:**
- Extend ZardUI theme using CSS variables
- Override ZardUI tokens with custom CSS variables
- Ensure ZardUI components inherit from root CSS variables

**Implementation:**
```typescript
// Shell App: zardui-theme.config.ts
import { provideZardUI } from '@zardui/angular';

export const zardUIThemeConfig = {
  // Map CSS variables to ZardUI tokens
  primary: 'var(--color-primary)',
  background: 'var(--color-background)',
  // ... other tokens
};
```

### Theme Propagation Flow

```
User Toggles Theme
    ↓
Shell ThemeService.applyTheme()
    ↓
CSS Variables Updated on <html>
    ↓
All Remote MFEs Automatically Inherit
    ↓
ZardUI Components Update via CSS Variables
    ↓
Theme Signal Emits (for programmatic listeners)
```

### Rules & Best Practices

1. **No Hard-coded Colors**
   - Always use CSS variables: `color: var(--color-primary)`
   - Never: `color: #0066cc`

2. **Centralized Token Definition**
   - All design tokens defined in Shell App
   - Single source of truth: `apps/shell/src/app/core/tokens/theme.tokens.ts`

3. **Remote MFE Usage**
   - Components use CSS variables directly
   - Optional: Inject ThemeService for programmatic access
   - Never define their own theme tokens

4. **Theme Switching**
   - Only Shell App handles theme switching
   - Changes propagate automatically via CSS variables
   - No reload required

5. **Light/Dark Mode**
   - Theme tokens defined for both modes
   - CSS variables switch based on selected theme
   - ZardUI components adapt automatically

### File Structure

```
apps/
  shell/
    src/
      app/
        core/
          services/
            theme.service.ts          # Theme management service
          tokens/
            theme.tokens.ts           # Design token definitions
            light.tokens.ts           # Light theme values
            dark.tokens.ts            # Dark theme values
          styles/
            theme.css                 # CSS variable definitions
        components/
          theme-toggle/              # Theme switcher component
          
  mfe-summary/
    src/
      app/
        styles/
          variables.css              # References Shell CSS variables (no definitions)
          
  mfe-transaction/
    src/
      app/
        styles/
          variables.css              # References Shell CSS variables
```

### Alternative: Shared Library Approach

If you prefer a shared library (not recommended for Module Federation):

**Option:** Create a shared theme library exposed via Module Federation
- More complex setup
- Requires explicit imports in each MFE
- Slower propagation
- Not recommended for this use case

### Recommended Choice

**Use: CSS Variables + Theme Service (Hybrid)**

This approach provides:
- ✅ Zero coupling between MFEs
- ✅ Instant theme propagation
- ✅ Works seamlessly with Module Federation
- ✅ Compatible with ZardUI
- ✅ Programmatic access when needed
- ✅ Simple implementation

---

# Authentication & Authorization

## Authentication

Handled in Shell App.

Components:

- AuthService
- TokenInterceptor
- SessionService

Responsibilities:

- Login / Logout
- Token storage (secure)
- Token refresh handling
- Session timeout detection

---

## Authorization

### Role-Based Access Control (RBAC)

Each route must define:

- Required roles
- Required permissions

Implemented via:

- AuthGuard
- RoleGuard
- PermissionGuard

Guards must:

- Prevent unauthorized navigation
- Handle token expiry gracefully
- Redirect to login when needed

MFEs must not implement their own authentication logic.
They rely on Shell-provided authentication context.

---

# Real-Time Streaming Architecture

## WebSocket Simulation

- Emits 50+ TPS
- Batched state updates
- Duplicate filtering via Idempotency layer
- Heavy aggregation offloaded to Web Worker

---

# Store Architecture

Signal-based Store:

- transactions signal
- computed summaryBreakdown
- computed failureRate
- addTransaction()
- reconcileTransaction()

Must:

- Prevent duplicates
- Support optimistic updates
- Allow rollback without full refresh

---

# Observability & Dev Mode Tools

- Developer Audit Sidebar
- Logs:
  - State mutations
  - API latency
  - Retry attempts
  - Reconciliation events
  - Idempotency rejections

Visible only in development mode.

---

# Folder Structure

## Complete Project Structure

```
fintech-assessment-angular/
├── apps/
│   ├── shell/                          # Host Application
│   │   └── src/
│   │       └── app/
│   │           ├── core/               # Core functionality (singleton services)
│   │           │   ├── services/
│   │           │   │   ├── auth.service.ts
│   │           │   │   ├── theme.service.ts
│   │           │   │   ├── websocket.service.ts
│   │           │   │   └── session.service.ts
│   │           │   ├── store/
│   │           │   │   └── transaction.store.ts
│   │           │   ├── bridge/
│   │           │   │   ├── global-state-bridge.ts
│   │           │   │   └── event-bus.ts
│   │           │   ├── interceptors/
│   │           │   │   ├── auth.interceptor.ts
│   │           │   │   ├── error.interceptor.ts
│   │           │   │   ├── retry.interceptor.ts
│   │           │   │   └── logging.interceptor.ts
│   │           │   ├── guards/
│   │           │   │   ├── auth.guard.ts
│   │           │   │   ├── role.guard.ts
│   │           │   │   └── permission.guard.ts
│   │           │   ├── tokens/
│   │           │   │   ├── theme.tokens.ts
│   │           │   │   ├── light.tokens.ts
│   │           │   │   └── dark.tokens.ts
│   │           │   └── models/
│   │           │       └── user.model.ts
│   │           ├── shared/             # Shared across Shell features
│   │           │   ├── components/
│   │           │   │   ├── layout/
│   │           │   │   │   ├── header/
│   │           │   │   │   ├── sidebar/
│   │           │   │   │   └── footer/
│   │           │   │   └── theme-toggle/
│   │           │   ├── pipes/
│   │           │   ├── directives/
│   │           │   └── utils/
│   │           ├── features/           # Feature modules
│   │           │   └── dashboard/
│   │           │       ├── dashboard.component.ts
│   │           │       └── dashboard.routes.ts
│   │           ├── app.component.ts
│   │           ├── app.config.ts      # App configuration (providers, interceptors)
│   │           └── app.routes.ts
│   │
│   ├── mfe-summary/                    # Summary Panel MFE
│   │   └── src/
│   │       └── app/
│   │           ├── core/               # MFE-specific core
│   │           │   └── services/
│   │           │       └── summary.service.ts
│   │           ├── shared/             # MFE-specific shared
│   │           │   └── components/
│   │           │       └── summary-card/
│   │           ├── features/
│   │           │   └── summary-panel/
│   │           │       ├── summary-panel.component.ts
│   │           │       └── summary-panel.routes.ts
│   │           ├── app.component.ts
│   │           ├── app.config.ts
│   │           └── app.routes.ts
│   │
│   ├── mfe-transaction/                # Transaction Table MFE
│   │   └── src/
│   │       └── app/
│   │           ├── core/
│   │           │   └── services/
│   │           │       └── transaction-api.service.ts
│   │           ├── shared/
│   │           │   └── components/
│   │           │       ├── transaction-table/
│   │           │       └── transaction-filter/
│   │           ├── features/
│   │           │   └── transaction-list/
│   │           │       ├── transaction-list.component.ts
│   │           │       ├── transaction-detail-drawer/
│   │           │       └── transaction-list.routes.ts
│   │           ├── app.component.ts
│   │           ├── app.config.ts
│   │           └── app.routes.ts
│   │
│   └── mfe-common/                     # Common Components MFE
│       └── src/
│           └── app/
│               ├── shared/
│               │   └── components/
│               │       ├── ui/        # ZardUI wrappers
│               │       │   ├── button/
│               │       │   ├── card/
│               │       │   ├── table/
│               │       │   └── badge/
│               │       ├── pipes/
│               │       │   ├── currency.pipe.ts
│               │       │   ├── date.pipe.ts
│               │       │   └── status.pipe.ts
│               │       └── directives/
│               ├── app.component.ts
│               ├── app.config.ts
│               └── app.routes.ts
│
├── libs/                               # Shared Libraries
│   ├── core/                           # Core library (if needed)
│   │   └── src/
│   │       └── lib/
│   │           └── types/
│   │               └── transaction.types.ts
│   └── shared/                         # Shared utilities
│       └── src/
│           └── lib/
│               ├── utils/
│               └── constants/
│
├── workers/                            # Web Workers
│   └── breakdown.worker.ts
│
└── tools/                              # Build tools, scripts
    └── webpack/
        └── module-federation.config.ts
```

## Folder Structure Principles

### Core Layer
**Purpose:** Singleton services, stores, interceptors, guards - app-wide functionality

**Rules:**
- ✅ Services that are used app-wide
- ✅ State management (stores)
- ✅ HTTP interceptors
- ✅ Route guards
- ✅ Authentication/Authorization logic
- ❌ No UI components
- ❌ No feature-specific logic

**Example Structure:**
```
core/
├── services/          # Business logic services
├── store/            # State management
├── interceptors/      # HTTP interceptors
├── guards/           # Route guards
├── models/           # Data models
└── utils/            # Core utilities
```

### Shared Layer
**Purpose:** Reusable components, pipes, directives used across features

**Rules:**
- ✅ Reusable UI components
- ✅ Shared pipes and directives
- ✅ Common utilities
- ✅ Layout components
- ❌ No business logic
- ❌ No API calls (use services from core)

**Example Structure:**
```
shared/
├── components/       # Reusable components
├── pipes/           # Shared pipes
├── directives/      # Shared directives
└── utils/          # Shared utilities
```

### Features Layer
**Purpose:** Feature-specific functionality, components, routes

**Rules:**
- ✅ Feature-specific components
- ✅ Feature routes
- ✅ Feature-specific services (if not app-wide)
- ✅ Feature models (if not shared)
- ❌ No direct imports from other features
- ❌ Communicate via Core/Shared only

**Example Structure:**
```
features/
└── transaction-list/
    ├── transaction-list.component.ts
    ├── transaction-list.routes.ts
    ├── components/      # Feature-specific sub-components
    └── services/        # Feature-specific services (if needed)
```

---

# API Interceptor Strategy

## Overview

API interceptors handle cross-cutting concerns for HTTP requests:
- Authentication (token injection)
- Error handling
- Retry logic with exponential backoff
- Request/Response logging
- Circuit breaker pattern

## Interceptor Architecture

### Interceptor Chain Order

```
Request Flow:
1. AuthInterceptor (adds token)
2. LoggingInterceptor (logs request)
3. RetryInterceptor (handles retries)
   ↓
HTTP Request
   ↓
Response Flow:
4. ErrorInterceptor (handles errors)
5. LoggingInterceptor (logs response)
```

## Implementation

### 1. Auth Interceptor (Token Management)

**Location:** `apps/shell/src/app/core/interceptors/auth.interceptor.ts`

**Purpose:**
- Inject authentication token into requests
- Handle token refresh
- Redirect to login on 401

**Implementation:**

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Skip auth for login/register endpoints
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }
  
  // Get token from service
  const token = authService.getToken();
  
  if (token) {
    // Clone request and add Authorization header
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return next(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized
        if (error.status === 401) {
          // Try to refresh token
          if (authService.canRefreshToken()) {
            return authService.refreshToken().pipe(
              switchMap((newToken: string) => {
                // Retry with new token
                const retryReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`
                  }
                });
                return next(retryReq);
              }),
              catchError(() => {
                // Refresh failed, redirect to login
                authService.logout();
                router.navigate(['/login']);
                return throwError(() => error);
              })
            );
          } else {
            // No refresh possible, logout
            authService.logout();
            router.navigate(['/login']);
          }
        }
        return throwError(() => error);
      })
    );
  }
  
  return next(req);
};
```

### 2. Error Interceptor (Global Error Handling)

**Location:** `apps/shell/src/app/core/interceptors/error.interceptor.ts`

**Purpose:**
- Handle HTTP errors globally
- Transform error responses
- Show user-friendly error messages
- Log errors for debugging

**Implementation:**

```typescript
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';
      
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || 'Bad Request';
            break;
          case 401:
            errorMessage = 'Unauthorized. Please login again.';
            break;
          case 403:
            errorMessage = 'You do not have permission to perform this action.';
            break;
          case 404:
            errorMessage = 'Resource not found.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          case 503:
            errorMessage = 'Service unavailable. Please try again later.';
            break;
          default:
            errorMessage = error.error?.message || `Error: ${error.status} ${error.statusText}`;
        }
      }
      
      // Show notification (if notification service exists)
      if (notificationService) {
        notificationService.showError(errorMessage);
      }
      
      // Log error for debugging
      console.error('HTTP Error:', {
        url: req.url,
        method: req.method,
        status: error.status,
        error: error.error
      });
      
      return throwError(() => error);
    })
  );
};
```

### 3. Retry Interceptor (Resilience)

**Location:** `apps/shell/src/app/core/interceptors/retry.interceptor.ts`

**Purpose:**
- Retry failed requests with exponential backoff
- Implement circuit breaker pattern
- Handle network errors gracefully

**Implementation:**

```typescript
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { retry, catchError, delay, retryWhen, take, concatMap, throwError } from 'rxjs';

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second
  
  // Skip retry for certain endpoints
  if (req.url.includes('/auth/') || req.method === 'POST' && req.url.includes('/transactions')) {
    return next(req);
  }
  
  return next(req).pipe(
    retryWhen(errors =>
      errors.pipe(
        concatMap((error: HttpErrorResponse, index: number) => {
          // Don't retry on 4xx errors (except 408, 429)
          if (error.status >= 400 && error.status < 500 && 
              error.status !== 408 && error.status !== 429) {
            return throwError(() => error);
          }
          
          // Don't retry if max retries reached
          if (index >= maxRetries) {
            return throwError(() => error);
          }
          
          // Exponential backoff: 1s, 2s, 4s
          const delayTime = baseDelay * Math.pow(2, index);
          
          console.log(`Retrying request to ${req.url} (attempt ${index + 1}/${maxRetries}) after ${delayTime}ms`);
          
          return delay(delayTime);
        }),
        take(maxRetries + 1)
      )
    )
  );
};
```

### 4. Logging Interceptor (Observability)

**Location:** `apps/shell/src/app/core/interceptors/logging.interceptor.ts`

**Purpose:**
- Log all HTTP requests/responses
- Track API latency
- Development mode only (or configurable)

**Implementation:**

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { isDevMode } from '@angular/core';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();
  
  // Only log in development mode
  if (!isDevMode()) {
    return next(req);
  }
  
  console.log(`[HTTP Request] ${req.method} ${req.url}`, {
    headers: req.headers.keys(),
    body: req.body
  });
  
  return next(req).pipe(
    tap({
      next: (response) => {
        const duration = Date.now() - startTime;
        console.log(`[HTTP Response] ${req.method} ${req.url}`, {
          status: response.status,
          duration: `${duration}ms`
        });
      },
      error: (error) => {
        const duration = Date.now() - startTime;
        console.error(`[HTTP Error] ${req.method} ${req.url}`, {
          status: error.status,
          duration: `${duration}ms`,
          error: error.error
        });
      }
    })
  );
};
```

### 5. Circuit Breaker Interceptor (Advanced Resilience)

**Location:** `apps/shell/src/app/core/interceptors/circuit-breaker.interceptor.ts`

**Purpose:**
- Prevent cascading failures
- Open circuit after repeated failures
- Auto-recovery after timeout

**Implementation:**

```typescript
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError, timer } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface CircuitState {
  failures: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

const circuitBreakers = new Map<string, CircuitState>();
const FAILURE_THRESHOLD = 5;
const TIMEOUT = 60000; // 60 seconds

export const circuitBreakerInterceptor: HttpInterceptorFn = (req, next) => {
  const circuitKey = `${req.method}:${req.url}`;
  const circuit = circuitBreakers.get(circuitKey) || {
    failures: 0,
    lastFailureTime: 0,
    state: 'CLOSED' as const
  };
  
  // Check if circuit is open
  if (circuit.state === 'OPEN') {
    const timeSinceLastFailure = Date.now() - circuit.lastFailureTime;
    
    if (timeSinceLastFailure > TIMEOUT) {
      // Try half-open
      circuit.state = 'HALF_OPEN';
    } else {
      // Circuit is open, reject immediately
      return throwError(() => new Error('Circuit breaker is OPEN'));
    }
  }
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only count server errors (5xx) and timeouts
      if (error.status >= 500 || error.status === 0) {
        circuit.failures++;
        circuit.lastFailureTime = Date.now();
        
        if (circuit.failures >= FAILURE_THRESHOLD) {
          circuit.state = 'OPEN';
          console.warn(`Circuit breaker OPEN for ${circuitKey}`);
        }
      } else {
        // Success or client error, reset failures
        circuit.failures = 0;
        circuit.state = 'CLOSED';
      }
      
      circuitBreakers.set(circuitKey, circuit);
      return throwError(() => error);
    })
  );
};
```

## Interceptor Registration

### Shell App Configuration

**Location:** `apps/shell/src/app/app.config.ts`

```typescript
import { ApplicationConfig, provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { retryInterceptor } from './core/interceptors/retry.interceptor';
import { loggingInterceptor } from './core/interceptors/logging.interceptor';
import { circuitBreakerInterceptor } from './core/interceptors/circuit-breaker.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        authInterceptor,        // 1. Add auth token
        loggingInterceptor,     // 2. Log requests
        circuitBreakerInterceptor, // 3. Circuit breaker
        retryInterceptor,       // 4. Retry logic
        errorInterceptor        // 5. Error handling
      ])
    ),
    // ... other providers
  ]
};
```

### Remote MFE Configuration

**Important:** Remote MFEs should use the same interceptors or load them from Shell via Module Federation.

**Option 1: Duplicate Interceptors (Simple)**
- Copy interceptors to each MFE
- Each MFE configures its own HTTP client

**Option 2: Shared Interceptors (Recommended)**
- Expose interceptors from Shell via Module Federation
- Remote MFEs load and use Shell interceptors

**Example (Remote MFE):**

```typescript
// mfe-transaction/src/app/app.config.ts
import { ApplicationConfig, provideHttpClient, withInterceptors } from '@angular/common/http';
import { loadRemoteModule } from '@angular-architects/module-federation';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        // Load interceptors from Shell
        async () => {
          const module = await loadRemoteModule({
            type: 'module',
            remoteEntry: 'http://localhost:4200/remoteEntry.js',
            exposedModule: './Interceptors'
          });
          return [
            module.authInterceptor,
            module.errorInterceptor,
            module.retryInterceptor
          ];
        }
      ])
    )
  ]
};
```

## Best Practices

1. **Interceptor Order Matters**
   - Auth → Logging → Circuit Breaker → Retry → Error
   - Register in correct order

2. **Skip Interceptors When Needed**
   - Use request context to skip interceptors
   - Example: Skip retry for POST requests

3. **Error Handling**
   - Always use `throwError(() => error)` (functional form)
   - Don't mutate original error objects

4. **Performance**
   - Keep interceptors lightweight
   - Use async operations carefully
   - Consider lazy loading for heavy interceptors

5. **Testing**
   - Test interceptors in isolation
   - Mock HTTP client for testing
   - Verify interceptor chain order

6. **Module Federation Considerations**
   - Share interceptors via Module Federation
   - Or duplicate in each MFE (simpler but less DRY)
   - Ensure consistent behavior across MFEs
