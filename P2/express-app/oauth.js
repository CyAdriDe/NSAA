const OAuth2Strategy = require('passport-oauth2').Strategy

const OAuth2 = () => new OAuth2Strategy({
  authorizationURL: 'https://github.com/login/oauth/authorize',
  tokenURL: 'https://github.com/login/oauth/access_token',
  clientID: process.env.OAUTH_CLIENT_ID,//"dfeda11951aca85d8348",
  clientSecret: process.env.OAUTH_CLIENT_SECRET,//"0d3bd1819b4a0e7eccdd7565712430b1ea2e2aa8",
  callbackURL: "http://localhost:3000/auth/github/callback",
  session: false
},
  async function (accessToken, refreshToken, profile, done) {
    const user = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${accessToken}`
      }
    }).then(res => res.json())
    console.log(user);
    const userApp = {
      username: user.login,
      description: 'the only user that deserves to contact the fortune teller'
    }
    console.log(userApp);
    return done(null, userApp)

  }
)

module.exports = OAuth2
