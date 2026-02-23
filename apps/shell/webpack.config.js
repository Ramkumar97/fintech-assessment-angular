const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  output: {
    uniqueName: 'shell',
    publicPath: 'auto',
  },
  optimization: {
    runtimeChunk: false,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      filename: 'remoteEntry.js',
      remotes: {
        'mfeSummary': 'mfeSummary@http://localhost:4201/remoteEntry.js',
        'mfeTransaction': 'mfeTransaction@http://localhost:4202/remoteEntry.js',
        'mfeCommon': 'mfeCommon@http://localhost:4203/remoteEntry.js',
      },
      exposes: {
        './TransactionStore': './src/app/core/store/transaction.store',
        './GlobalStateBridge': './src/app/core/bridge/global-state-bridge',
        './EventBus': './src/app/core/bridge/event-bus',
        './ThemeService': './src/app/core/services/theme.service',
        './AuthService': './src/app/core/services/auth.service',
      },
      shared: {
        '@angular/core': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        '@angular/common': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        '@angular/common/http': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        '@angular/router': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        '@angular/platform-browser': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        'rxjs': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
      },
    }),
  ],
};

