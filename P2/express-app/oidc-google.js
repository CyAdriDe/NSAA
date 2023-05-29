const Issuer = require('openid-client');

async function initializeOIDCClient() {
  const oidcIssuer = await Issuer.discover(process.env.OIDC_PROVIDER);

  const oidcClient = new oidcIssuer.Client({
    client_id: process.env.OIDC_CLIENT_ID,
    client_secret: process.env.OIDC_CLIENT_SECRET,
    redirect_uris: [process.env.OIDC_CALLBACK_URL],
    response_types: ['code']
  });

  return oidcClient;
}

module.exports = initializeOIDCClient();

