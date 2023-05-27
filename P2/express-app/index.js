require("dotenv").config()
const express = require('express')
const logger = require('morgan')

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const jwtSecret = require('crypto').randomBytes(16) // 16*8=256 random bits
const fortune = require('fortune-teller')

//Database stuff
const db = require('./db');
const argon2 = require('argon2');
const bodyParser = require('body-parser');

//OAuth
const OAuth = require('./oauth');
//OIDC
const oidcStrategy = require('./oidc');
const session = require('express-session'); //Session for the OIDC
//Radius
const radiusStrategy = require('./radius');

const app = express()
const port = process.env.NODE_DOCKER_PORT || 3000

// Function added with use() for all routes and verbs
app.use(logger('dev'))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true })) // needed to retrieve html form fields (it's a requirement of the local strategy)

passport.use('oauth2', OAuth());
passport.use('oidc', oidcStrategy);
passport.use('radius-local', radiusStrategy)
// Session for the OIDC
app.use(session({
  secret: 'nsaa-passport',
  resave: false,
  saveUninitialized: true
}))


passport.use('hashed-passwords', 
	new LocalStrategy(
	{
		usernameField: 'username', // it MUST match the name of the input field for the username in the login HTML formulary
		passwordField: 'password', // it MUST match the name of the input field for the password in the login HTML formulary
		session: false
	},
	function (username, password, done) {
		// Query the database for the user's hashed password
		db.all('SELECT hashed_password FROM users WHERE username=?',username, (err, rows) => {
		    if (err) {
			console.log("Error when performing trade: ", err.message);
		    }
		    console.log("Username: ", username)
		    console.log("Password: ", password) 
		    console.log("Hashed password: ", rows[0].hashed_password);
		    const hashedPassword = rows[0].hashed_password;
		    // Verify the password using argon2.verify()
			argon2.verify(hashedPassword, password, { type: argon2.argon2d }).then(match => { //argon2i (strong) for argon2d (weak)
				console.log(match)
				if (match) {
					const user = {
						username: username,
						description: 'user description here'
					}
					return done(null, user);
				} else {
					return done(null, false);
					}
				})
		})
	})
)
		
		
passport.use('jwt',
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromExtractors([(req) => req.cookies.session]),
            secretOrKey: jwtSecret,
            issuer: 'localhost:3000',
            audience: 'localhost:3000',
            exam: "Soria"
        },
        function (jwt_payload, done) {
            if (jwt_payload.sub !== null) {
                const user = {
                    username: jwt_payload.sub,
                    description: 'the only user that deserves to contact the fortune teller'
                }
                return done(null, user)
            }
            return done(null, false)
        }
    )
)    

app.use(passport.initialize())  // we load the passport auth middleware to our express application. It should be loaded before any route.

app.post('/login', 
  passport.authenticate('hashed-passwords', { failureRedirect: '/login', session: false }), // we indicate that this endpoint must pass through our 'username-password' passport strategy, which we defined before
  (req, res) => { 
    // This is what ends up in our JWT
    const jwtClaims = {
      sub: req.user.username,
      iss: 'localhost:3000',
      aud: 'localhost:3000',
      exp: Math.floor(Date.now() / 1000) + 604800, // 1 week (7×24×60×60=604800s) from now
      role: 'user', // just to show a private JWT field
      exam: 'Soria'
    }

    const token = jwt.sign(jwtClaims, jwtSecret)

    res.cookie('session', token, {
            httpOnly: false,
            secure: false,
    })    
    // And let us log a link to the jwt.io debugger, for easy checking/verifying:
    console.log(`Token sent. Debug at https://jwt.io/?value=${token}`)
    console.log(`Token secret (for verifying the signature): ${jwtSecret.toString('base64')}`)
    
    res.redirect('/')
  }
)
var jsonParser = bodyParser.json();
 
app.post('/signup', async (req, res) => {
    try {
        const {username, password} = req.body;
	console.log(req.body);
        if (!username || !password) {
            res.status(400).json(`Missing ${!username ? "username" : 'password'}!`)
        }
        const hash = await argon2.hash(password); //Use argond (weak) argon2i (strong)
        var sql = "INSERT INTO users (username, hashed_password) VALUES (?,?)";
	var params = [username, hash];
	await db.all(sql, params, (err, rows) => {
	    if (err) {
		console.log("Error when adding trade: ", err.message);
	    }
	    console.log("inserted ", rows);
	});
    
        res.redirect('/login')
    } catch(e) {
        console.log(e); // Uncomment if needed for debug
        // If a SQLITE_CONSTRAINT has been violated aka. row with that email already exists. You can read more: https://www.sqlite.org/c3ref/c_abort.html
        if(e.errno === 19) {
            res.status(400).json('A user with that username already exists!');
        } else {
            res.status(400).json('Something broke!');
        }
    }
});

app.get('/',
    passport.authenticate('jwt', {failureRedirect: '/login', session: false}),
    (req, res) => {
        var r = fortune.fortune()
        res.send(r)
    }
)

app.get('/login',
  (req, res) => {
    res.sendFile('login.html', { root: __dirname })
})

app.get('/signup',
  (req, res) => {
    res.sendFile('signup.html', { root: __dirname })
})
  
app.get('/logout',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
        res.clearCookie('session')
        res.redirect('/')
        res.end()
})

app.get('/auth/github', passport.authenticate('oauth2', { session: false, scope: ['read:user'] }));

app.get('/auth/github/callback',
  passport.authenticate('oauth2', { failureRedirect: '/login', session: false }),
  function (req, res) {
    // This is what ends up in our JWT
    const jwtClaims = {
      sub: req.user.username,
      iss: 'localhost:3000',
      aud: 'localhost:3000',
      exp: Math.floor(Date.now() / 1000) + 604800, // 1 week (7×24×60×60=604800s) from now
      role: 'user', // just to show a private JWT field
      exam: 'Soria'
    }

    const token = jwt.sign(jwtClaims, jwtSecret)
    
    res.cookie('session', token, {httpOnly: true,
            secure: true}
    ) 
    res.redirect('/')
  });

app.get('/auth/oidc', passport.authenticate('oidc', { session: false }));

app.get('/auth/oidc/callback',
  passport.authenticate('oidc', { failureRedirect: '/login', session: false }),
  function (req, res) {
  
    const jwtClaims = {
      sub: req.user.username,
      iss: 'localhost:3000',
      aud: 'localhost:3000',
      exp: Math.floor(Date.now() / 1000) + 604800, // 1 week (7×24×60×60=604800s) from now
      role: 'user', // just to show a private JWT field
      exam: 'Soria'
    }
    const token = jwt.sign(jwtClaims, jwtSecret)

    res.cookie('session', token, { httpOnly: true, secure: true })
    res.redirect('/')
  });

app.post('/auth/radius/login',
  passport.authenticate('radius-local', { failureRedirect: '/login', session: false }),
  function (req, res) {
  
    const jwtClaims = {
      sub: req.user.username,
      iss: 'localhost:3000',
      aud: 'localhost:3000',
      exp: Math.floor(Date.now() / 1000) + 604800, // 1 week (7×24×60×60=604800s) from now
      role: 'user', // just to show a private JWT field
      exam: 'Soria'
    }
    const token = jwt.sign(jwtClaims, jwtSecret)

    res.cookie('session', token, { httpOnly: true, secure: true })
    res.redirect('/')
  });

// Function added with use() for a specific route
app.use(function(err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
