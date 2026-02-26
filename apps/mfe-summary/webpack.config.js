const { withModuleFederation } = require('@nx/angular/module-federation');
const config = require('./module-federation.config');
module.exports = withModuleFederation(config);

// const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

// module.exports = {
//   output: {
//     uniqueName: 'mfeSummary',
//     publicPath: 'auto',
//   },
//   optimization: {
//     runtimeChunk: false,
//   },
//   plugins: [
//     new ModuleFederationPlugin({
//       name: 'mfeSummary',
//       filename: 'remoteEntry.js',
//       exposes: {
//         './SummaryPanel': './src/app/features/summary-panel/summary-panel.component',
//       },
//       remotes: {
//         'shell': 'shell@http://localhost:4200/remoteEntry.js',
//         'mfeCommon': 'mfeCommon@http://localhost:4203/remoteEntry.js',
//       },
//       shared: {
//         '@angular/core': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
//         '@angular/common': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
//         '@angular/router': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
//         'rxjs': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
//       },
//     }),
//   ],
// };

