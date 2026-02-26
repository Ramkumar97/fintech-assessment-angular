import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
    name: 'shell',
    // remotes: {
    //     'mfeSummary': 'mfeSummary@http://localhost:4201/remoteEntry.js',
    //     'mfeTransaction': 'mfeTransaction@http://localhost:4202/remoteEntry.js',
    //     'mfeCommon': 'mfeCommon@http://localhost:4203/remoteEntry.js',
    // },
    exposes: {
        './TransactionStore': './src/app/core/store/transaction.store',
        './GlobalStateBridge': './src/app/core/bridge/global-state-bridge',
        './EventBus': './src/app/core/bridge/event-bus',
        './ThemeService': './src/app/core/services/theme.service',
        './AuthService': './src/app/core/services/auth.service',
    }
};

export default config;