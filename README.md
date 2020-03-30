### Getting Started

This appplication fetches data from the Firestore and calls Quickbooks API to create estimates.


#### Setup

Clone the repository:
```
git clone https://kunalbadade@bitbucket.org/kunalbadade/modpools-csuf.git
```

Install NPM dependencies:
```
cd modpools-csuf
npm install
```

Launch your app:
```
firebase deploy
```
You only need to enter above command if you have made changes in the code. ALso, you will need to update the serviceAccount.json and config.json file.

Currently, you can run the firebase function with following command:
```
https://us-central1-thematic-runner-245505.cloudfunctions.net/createEstimate/
```
Your app should be running! You should see the welcome screen.  Please note - the app will not be fully functional until we finish configuring it.

### Configuring your app

Firestore configurations are located in routes/serviceaccount.json (Please do not modify this file). To get started with Firestore, visit https://firebase.google.com/docs/firestore/quickstart.

You will need to enter Quickbooks account client ID and secret in config.json. Please visit https://developer.intuit.com/app/developer/qbo/docs/get-started for more details.

We will need to update 3 items:

- `clientId`
- `clientSecret`
- `redirectUri`

All of these values must match **exactly** with what is listed in your app settings on [developer.intuit.com](https://developer.intuit.com).  If you haven't already created an app, you may do so there.  Please read on for important notes about client credentials, scopes, and redirect urls.

#### Client Credentials

Once you have created an app on Intuit's Developer Portal, you can find your credentials (Client ID and Client Secret) under the "Keys" section.  These are the values you'll have to copy into `config.json`.

#### Redirect URI

You'll have to set a Redirect URI in both `config.json` *and* the Developer Portal ("Keys" section).  With this app, the typical value would be `http://localhost:3000/callback`, unless you host this sample app in a different way (if you were testing HTTPS, for example).

**Note:** Using `localhost` and `http` will only work when developing, using the sandbox credentials.  Once you use production credentials, you'll need to host your app over `https`.

### Run your app!

After setting up both Developer Portal and your `config.json`, try launching your app again!

All flows should work.  The sample app supports the following flows:

**Connect To QuickBooks** - this flow requests non-OpenID scopes.  You will be able to make a QuickBooks API sample call (using the OAuth2 token) on the `/connected` landing page.

----------

#### Callback URL

`/routes/callback.js` contains code snippets that receive the authorization code, make the bearer token exchange, and validate the JWT ID token (if applicable).  It then redirects to the post-connection landing page, `/routes/connected.js`.  

#### Connected
`/routes/connected.js` will make an example OpenID user information call over OAuth2 (assuming the openid scopes were requested).  Once loaded, the page allows you to make AJAX API calls over OAuth2.

#### API Calls

`/routes/api_call.js` allows three different API calls to be made over OAuth2:

- **QBO Call** - make an example accounting API call (note: this endpoint comes from `config.json`.  The endpoint is different for sandbox versus non-sandbox.  Make sure your `config.json` contains the correct endpoint!)

View these code snippets to see how to correctly pass the access token or client credentials (depending on the API call).

#### JWT (ID Token)

`/tools/jwt.js` - For OpenID scopes, after exchanging the authorization code, you will receive a JWT (JSON Web Token) ID Token.  View this code snippet for an example of how to decode, and validate that the ID Token is secure.