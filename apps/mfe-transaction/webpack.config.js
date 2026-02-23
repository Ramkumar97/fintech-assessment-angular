const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  output: {
    uniqueName: 'mfeTransaction',
    publicPath: 'auto',
  },
  optimization: {
    runtimeChunk: false,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'mfeTransaction',
      filename: 'remoteEntry.js',
      exposes: {
        './TransactionList': './src/app/features/transaction-list/transaction-list.component',
      },
      remotes: {
        'shell': 'shell@http://localhost:4200/remoteEntry.js',
        'mfeCommon': 'mfeCommon@http://localhost:4203/remoteEntry.js',
      },
      shared: {
        '@angular/core': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        '@angular/common': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        '@angular/router': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        'rxjs': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
      },
    }),
  ],
};

