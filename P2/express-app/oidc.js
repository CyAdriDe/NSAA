const OpenIDStrategy = require('passport-auth0-openidconnect').Strategy

const oidc = new OpenIDStrategy({
  domain: 'dev-017jy36e7crwekzm.us.auth0.com',
  clientID: '5UXcOEtthjlnYmriLVH3GPe6vpr1UOA7',
  clientSecret: 'p0KTA-k96JA4KSF1PydACIPm7gs06DmDxbxrgZUd9a4UQC9hHfvfw3YGfBxNq4Bx',
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

module.exports = oidc
