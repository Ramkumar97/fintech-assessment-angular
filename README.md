# FinTech Assessment - Angular Microfrontend Application

Real-Time Transaction Monitoring Dashboard built with Angular 20 and Module Federation.

## Architecture

This is a microfrontend application consisting of:

1. **Shell App** (Port 4200) - Host application with core services, stores, and routing
2. **mfe-summary** (Port 4201) - Summary Panel MFE displaying transaction breakdown
3. **mfe-transaction** (Port 4202) - Transaction Table MFE with real-time updates
4. **mfe-common** (Port 4203) - Common Components MFE with reusable UI components

## Features

- ✅ Module Federation setup with @angular-architects/module-federation
- ✅ Signal-based state management
- ✅ Real-time WebSocket simulation (50+ TPS)
- ✅ Reusable components (Data Table, Tile Card, Modal)
- ✅ HTTP Interceptors (Auth, Error, Retry, Logging)
- ✅ Theme service with CSS variables
- ✅ Idempotency layer for duplicate prevention
- ✅ Optimistic UI updates

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start all applications:

```bash
# Terminal 1 - Shell App
npm run start:shell

# Terminal 2 - Summary MFE
npm run start:mfe-summary

# Terminal 3 - Transaction MFE
npm run start:mfe-transaction

# Terminal 4 - Common Components MFE
npm run start:mfe-common
```

Or start individually:

```bash
npm run start:shell        # Port 4200
npm run start:mfe-summary  # Port 4201
npm run start:mfe-transaction # Port 4202
npm run start:mfe-common   # Port 4203
```

### Build

```bash
npm run build
```

## Project Structure

```
fintech-assessment-angular/
├── apps/
│   ├── shell/              # Host application
│   ├── mfe-summary/        # Summary Panel MFE
│   ├── mfe-transaction/    # Transaction Table MFE
│   └── mfe-common/         # Common Components MFE
├── libs/
│   └── shared/             # Shared types and utilities
└── contexts/               # Architecture documentation
```

## Key Components

### Shell App
- Core services (Auth, Theme, WebSocket)
- Transaction Store (Signal-based)
- Event Bus
- HTTP Interceptors
- Route Guards

### mfe-common
- DataTableComponent - Generic table with pagination and sorting
- TileCardComponent - Transaction breakdown display
- ModalComponent - Reusable modal wrapper

### mfe-summary
- SummaryPanelComponent - Real-time transaction summary

### mfe-transaction
- TransactionListComponent - Transaction table with real-time updates

## Module Federation

Components are exposed and consumed via Module Federation:

- Shell exposes: TransactionStore, GlobalStateBridge, EventBus, ThemeService, AuthService
- mfe-common exposes: DataTable, TileCard, Modal
- mfe-summary exposes: SummaryPanel
- mfe-transaction exposes: TransactionList

## State Management

Uses Signal-based store in Shell app:
- `transactions` signal - List of all transactions
- `summaryBreakdown` computed signal - Breakdown by type
- `failureRate` computed signal - Failure percentage

## Communication

- **Global State Bridge**: Shell exposes state via Module Federation
- **Event Bus**: RxJS Subject for real-time event notifications
- **CSS Variables**: Theme propagation via CSS custom properties

## Technologies

- Angular 20
- TypeScript 5.6
- Module Federation (@angular-architects/module-federation)
- Signals (Angular Signals)
- RxJS
- Webpack 5

## Documentation

See `contexts/` folder for detailed architecture documentation:
- `technical-architecture.md` - Complete technical architecture
- `business-context.md` - Business requirements
- `implementation-plan-reusable-components.md` - Component implementation plan

## License

MIT
