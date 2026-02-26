import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
    name: 'mfeSummary',
    exposes: {
         './SummaryPanel': './src/app/features/summary-panel/summary-panel.component'
    }
    // remotes: {
    //     'shell': 'shell@http://localhost:4200/remoteEntry.js',
    //     'mfeCommon': 'mfeCommon@http://localhost:4203/remoteEntry.js'
    // },
    // shared: {
    //     '@angular/core': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    //     '@angular/common': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    //     '@angular/router': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    //     'rxjs': { singleton: true, strictVersion: true, requiredVersion: 'auto' }
    // }
};

export default config;