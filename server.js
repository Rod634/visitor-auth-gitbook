const express = require('express');
const jwtWeb = require('jsonwebtoken');
const app = express();
const { expressjwt: jwt } = require("express-jwt");
const jwks = require('jwks-rsa');

require('dotenv').config()
const { auth, requiresAuth } = require('express-openid-connect');

const port = process.env.PORT || 3000;


const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://dev-3f6nd7py.us.auth0.com/.well-known/jwks.json'
  }),
  audience: 'https://teste.com',
  issuer: 'https://dev-3f6nd7py.us.auth0.com/',
  algorithms: ['RS256']
});

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
app.use(jwtCheck);

// Welcome page to simulate your application.
app.get('/', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? res.redirect('/welcome') : res.redirect('/login'))
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});

app.get('/welcome', jwtCheck, (req, res) => {
    req.headers['Authorization'] = 'someValue'
    res.redirect(mountJwtToken(process.env.GITBOOK_SIGN_KEY, process.env.GITBOOK_URL, req.query.location));
})

app.get('/teste', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
})

function mountJwtToken(key, space, location){
    const token = jwtWeb.sign({}, key, { expiresIn: '1h' });

    const uri = new URL(`${space}${location || ''}`);
    uri.searchParams.set('jwt_token', token);

    return uri.toString();
}