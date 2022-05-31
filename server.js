const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config()
const { auth, requiresAuth } = require('express-openid-connect');

const port = process.env.PORT || 3000;
const gitbookSignKey =  process.env.GITBOOK_SIGN_KEY;
const gitbookSpaceURL = process.env.GITBOOK_URL;

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
    res.send(req.oidc.isAuthenticated() ? res.redirect('/auth/confirm') : 'Logged out')
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});

// Redirect to the documentation with the JWT token signed when auth has been "completed".
// The user session on your application should be checked here to validate that the user can access the documentation.
// 
// ==> This endpoint is the fallback URL to configure on GitBook side.
//    GitBook will redirect the visitor to this url when authentication is needed.
app.get('/auth/confirm', requiresAuth(), (req, res) => {
    const token = jwt.sign({}, gitbookSignKey, { expiresIn: '1h' });

    const uri = new URL(`${gitbookSpaceURL}${req.query.location || ''}`);
    uri.searchParams.set('jwt_token', token)

    res.redirect(uri.toString());
});