const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config()
const { auth, requiresAuth } = require('express-openid-connect');
const AuthenticationClient = require('auth0').AuthenticationClient;
const axios = require("axios").default

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
  res.send(JSON.stringify(req.oidc.user));
})

function mountJwtToken(key, space, location) {

  // var auth0 = new AuthenticationClient({
  //   domain: 'https://dev-3f6nd7py.us.auth0.com',
  //   clientId: config.clientID,
  // });

  // console.log("teste");
  // console.log(auth0);

  var options = {
    method: 'POST',
    url: 'https://dev-3f6nd7py.us.auth0.com/oauth/token',
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    data: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: config.clientID,
      client_secret: config.client_secret,
      audience: 'https://teste.com'
    })
  };
  
  axios.request(options).then(function (response) {
    console.log(response.data);
  }).catch(function (error) {
    console.error(error);
  });


  const token = jwt.sign({}, key, { expiresIn: '1h' });

  const uri = new URL(`${space}${location || ''}`);
  uri.searchParams.set('jwt_token', token);

  return uri.toString();
}
