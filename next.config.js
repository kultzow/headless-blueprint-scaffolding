const { withFaust } = require("@faustwp/core");
const path = require("path");

/**
 * @type {import('next').NextConfig}
 **/
module.exports = withFaust({
  images: {
    domains: ["faustexample.wpengine.com","cards.scryfall.io","proxycards-ai-next.s3.us-east-2.amazonaws.com"],
  },
  trailingSlash: true,
  serverExternalPackages: ['puppeteer'],
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Strip "node:" prefix so bare-name fallbacks below can take effect
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, '');
        })
      );
      // Redirect fs/promises (and node:fs/promises) to the same mock
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^fs\/promises$/,
          path.resolve(__dirname, 'lib/fs-browser-mock.js')
        )
      );
      config.resolve.alias = {
        ...config.resolve.alias,
        'import-fresh': path.resolve(__dirname, 'lib/import-fresh-mock.js'),
        'typescript': path.resolve(__dirname, 'lib/import-fresh-mock.js'),
        'puppeteer': path.resolve(__dirname, 'lib/import-fresh-mock.js'),
        'opentype.js': path.resolve(__dirname, 'lib/import-fresh-mock.js'),
      };
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: path.resolve(__dirname, 'lib/fs-browser-mock.js'),
        'fs/promises': path.resolve(__dirname, 'lib/fs-browser-mock.js'),
        net: false,
        tls: false,
        dns: false,
        dgram: false,
        child_process: false,
        module: false,
        readline: false,
        os: false,
        path: false,
        stream: false,
        crypto: false,
        http: false,
        https: false,
        http2: false,
        zlib: false,
        util: false,
        url: false,
        assert: false,
        buffer: false,
        events: false,
        querystring: false,
        string_decoder: false,
        constants: false,
        vm: false,
        punycode: false,
      };
    }
    return config;
  },
});
