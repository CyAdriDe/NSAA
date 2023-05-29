const OpenIDStrategy = require('passport-auth0-openidconnect').Strategy

const oidcStrategy = new OpenIDStrategy({
  domain: 'dev-017jy36e7crwekzm.us.auth0.com',
  clientID: process.env.OIDC_CLIENTID,
  clientSecret: process.env.OIDC_CLIENTSECRET,
  callbackURL: "http://localhost:3000/auth/oidc/callback",
},
  function (issuer, audience, profile, cb) {
    const user = {
      username: 'walrus',
      description: 'the only user that deserves to contact the fortune teller'
    }
    return cb(null, user)

  }
)

module.exports = oidcStrategy
