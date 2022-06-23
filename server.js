const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config()
const { auth, requiresAuth } = require('express-openid-connect');
var ManagementClient = require('auth0').ManagementClient;

const port = process.env.PORT || 3000;

const config = {
  authRequired: false,
  auth0Logout: true,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_URL,
  secret: process.env.SECRET
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// Welcome page to simulate your application.
app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? res.redirect('/welcome') : res.redirect('/login'))
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});

app.get('/welcome', requiresAuth(), (req, res) => {
  res.redirect(mountJwtToken(process.env.GITBOOK_SIGN_KEY, process.env.GITBOOK_URL, req.query.location));
})

app.get('/teste', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.accessToken));
})

function mountJwtToken(key, space, location) {

  var auth0 = new ManagementClient({
    domain: 'https://dev-3f6nd7py.us.auth0.com',
    clientId: config.clientID,
    clientSecret: config.secret,
  });

  console.log("teste");
  console.log(auth0.getAccessToken());

  const token = jwt.sign({}, key, { expiresIn: '1h' });

  const uri = new URL(`${space}${location || ''}`);
  uri.searchParams.set('jwt_token', token);

  return uri.toString();
}