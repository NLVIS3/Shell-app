const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = {
  ...withModuleFederationPlugin({
    remotes: {
      'main-container':    'http://localhost:4201/remoteEntry.js',
      'ui-container':      'http://localhost:4202/remoteEntry.js',
      'backend-container': 'http://localhost:4203/remoteEntry.js',
    },
    shared: {
      ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
    },
  }),
  output: {
    publicPath: '/',
  },
};
