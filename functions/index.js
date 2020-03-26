const path = require('path')
const config = require('./config.json')
const functions = require('firebase-functions')
const express = require('express')
const session = require('express-session')
const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({secret: 'secret', resave: 'false', saveUninitialized: 'false'}))

// Initial view - loads Connect To QuickBooks Button
app.get('/', function (req, res) {
    res.render('home', config)
  })

// Sign In With Connect To QuickBooks
// These calls will redirect to Intuit's authorization flow
app.use('/connect_to_quickbooks', require('./routes/connect_to_quickbooks.js'))

// Callback - called via redirect_uri after authorization
app.use('/callback', require('./routes/callback.js'))

// Connected - call OpenID and render connected view
app.use('/connected', require('./routes/connected.js'))

// Call an example API over OAuth2
 app.use('/api_call', require('./routes/api_call.js'))

//Test Home
app.get('/home',(request, response) => {
    response.status(200).send('Hello! This is working!!')
})

exports.createEstimate = functions.https.onRequest(app)
