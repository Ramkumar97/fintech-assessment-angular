const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  output: {
    uniqueName: 'mfeCommon',
    publicPath: 'auto',
  },
  optimization: {
    runtimeChunk: false,
  },
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
        '@angular/core': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        '@angular/common': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        '@angular/router': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        'rxjs': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
      },
    }),
  ],
};

