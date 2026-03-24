const { withFaust } = require("@faustwp/core");

/**
 * @type {import('next').NextConfig}
 **/
module.exports = withFaust({
  images: {
    domains: ["faustexample.wpengine.com","cards.scryfall.io","proxycards-ai-next.s3.us-east-2.amazonaws.com"],
  },
  trailingSlash: true,
});
