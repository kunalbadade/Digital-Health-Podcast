var tools = require('../tools/tools.js')
var config = require('../config.json')
var request = require('request')
var express = require('express')
var router = express.Router()
var admin = require('firebase-admin')
var serviceAccount = require('./serviceaccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
/** /api_call **/
router.get('/', function (req, res) {
  var token = tools.getToken(req.session)
  if (!token) return res.json({ error: 'Not authorized' })
  if (!req.session.realmId) return res.json({
    error: 'No realm ID.  QBO calls only work if the accounting scope was passed!'
  })

  // Set up API call (with OAuth2 accessToken)
  var url = config.api_uri + req.session.realmId + '/companyinfo/' + req.session.realmId
  console.log('Bearer ' + token.accessToken);
  var requestObj = {
    url: url,
    headers: {
      'Authorization': 'Bearer ' + token.accessToken,
      'Accept': 'application/json'
    }
  }

  // Make API call
  request(requestObj, function (err, response) {
    // Check if 401 response was returned - refresh tokens if so!
    tools.checkForUnauthorized(req, requestObj, err, response).then(function ({ err, response }) {
      if (err || response.statusCode != 200) {
        return res.json({ error: err, statusCode: response.statusCode })
      }

      // API Call was a success!
      res.json(JSON.parse(response.body))
    }, function (err) {
      console.log(err)
      return res.json(err)
    })
  })
})

router.get('/firedata', function (req, res) {
  var alldata = [];
  var names = [];
  var emails = [];
  var array_of_alldata = [];


  admin.firestore().collection('estimates').get()
    .then(function (querysnapshot) {
      querysnapshot.forEach(function (doc) {
        alldata.push(doc.id);
        var name = doc.data().first_name + " " + doc.data().last_name
        names.push(name)
        var email = doc.data().email
        emails.push(email)
      })
    }).then(function () {
      array_of_alldata.push(alldata)
      array_of_alldata.push(names)
      array_of_alldata.push(emails)
      res.json(array_of_alldata);
    })
});

//Route to create new estimate in Quickbooks
router.get('/create', function (req, res) {
  var queryparam = req.query.doc;
  var token = tools.getToken(req.session);
  if (!token) return res.json({ error: 'Not authorized' });
  if (!req.session.realmId) return res.json({
    error: 'No realm ID.  QBO calls only work if the accounting scope was passed!'
  })

  var pro1 = fetchFromFirestore(queryparam);
  pro1
    .then(function(data){
        return createCustomer(data, req.session.realmId, token);
    })
    .then(function(data) {
        return createEstimate(data.newCustomer, data.customer_id, req.session.realmId, token);
    })
    .then(function(data){
        res.send(data);
    })
    .catch(function(error) {
        console.log('Error' );
        res.send(error);
    });
});

//fetch estimates from firestore
var fetchFromFirestore = function(docId){
    return new Promise(function(resolve, reject) {
        admin.firestore().collection('estimates').doc(docId).get()
        .then(snapshot => {
            var data = snapshot.data()
            var jsonObj = JSON.parse(JSON.stringify(data));
            resolve(jsonObj);
        })
    });
}

//Create customer
var createCustomer = function(newCustomer, realmId, token) {
    const family_name = newCustomer.last_name;
    const given_name = newCustomer.first_name;
    var currency_ref = {};
    currency_ref.value = newCustomer.currency;
    currency_ref.name = newCustomer.currency === 'USD' ? 'US Dollar' : 'Canadian Dollar';
    var now = new Date();
    return new Promise((resolve, reject) => {
        var options = {
            method: 'POST',
            url: config.api_uri + realmId + '/customer?minorversion=38',
            headers: {
              'Authorization': 'Bearer ' + token.accessToken,
              'Accept': 'application/json'
            },
            json: {
                "FamilyName": family_name,
                "GivenName": given_name + now.getTime(),
                "CurrencyRef": currency_ref
            }
          };
        
        request(options, function (err, response, body) {
            if(body.hasOwnProperty('Fault'))
                reject(err);
            const data = {
                'newCustomer' : newCustomer,
                'customer_id' : body.Customer.Id
            };
            resolve(data);
        });
    }); 
}

//Create estimate in quickbooks
var createEstimate = function(data, customer_id, realmId, token) {
        const ESTIMATE_API = config.api_uri + realmId + '/estimate?minorversion=38';
        const jsonObj = JSON.parse(JSON.stringify(data));
        var new_estimate = { "Line": [] }

        for (item in jsonObj.cart) {
            var item_description = JSON.stringify(jsonObj.cart[item].option_group_name);
            var qty = 1;

            if(jsonObj.currency.toString() === 'USD'){
                var unit_price = jsonObj.cart[item].price_usd;
            }else{
                var unit_price = jsonObj.cart[item].price_cad;
            }
            var calculated_amount = Number(unit_price);
            var item_ref = jsonObj.cart[item].option_name;
            new_estimate.Line.push({
                    "Description": item_description + ' ' + item_ref,
                    "DetailType": "SalesItemLineDetail",
                    "SalesItemLineDetail": {
                        "UnitPrice": parseInt(unit_price),
                        "Qty": 1
                    },
                    "Amount": calculated_amount
                });
            new_estimate.Line.push({ "DetailType": "SubTotalLineDetail", "Amount": calculated_amount });
        
            //set customer reference
            new_estimate['CustomerRef'] = { "value": customer_id };
        
            var currency = jsonObj.currency;
            if(currency.toString() === 'CAD'){
                new_estimate['CurrencyRef'] = {
                    'value' : 'CAD',
                    'name' : 'Canadian Dollar'
                };
                new_estimate['TotalAmt'] = jsonObj.cart_total_cad;
            }else{
                new_estimate['CurrencyRef'] = {
                    'value' : 'USD',
                    'name' : 'United States Dollar'
                }
                new_estimate['TotalAmt'] = jsonObj.cart_total_usd;
            }
      }

      return new Promise(function(resolve, reject) {
        var createRequestObj = {
            url: ESTIMATE_API,
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + token.accessToken,
              'Accept': 'application/json'
            },
            json: new_estimate
          };
    
          request(createRequestObj, function (err, response, body) {
            resolve(body);
          });
      });
}
module.exports = router;