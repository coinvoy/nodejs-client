//------------------------------
//---- NODE CLIENT FOR API -----
//------------------------------

var crypto      = require('crypto');
var https       = require('https');
var querystring = require('querystring');


var Coinvoy = function () {
    // magic numbers
    this._MINAMOUNT = 0.0005;
};

//----------------------------------------------------------------
// Create new payment
// Required : amount    # Billed amount
// Required : currency  # Billed currency
// Required : address   # Receiving address
// Required : callback  # callback function
// Optional : options   # Payment options : orderID,
//                                           secret, 
//                                           callback,
//                                           company,
//                                           motto,
//                                           logoURL,
//                                           addressLine1,
//                                           addressLine2,
//                                           email,
//                                           item,
//                                           description,
//                                           returnAddress,
//                                           escrow 
// Returns   : JSON object
//----------------------------------------------------------------
Coinvoy.prototype.payment = function (amount, currency, address, callback, options) {

    if (parseFloat(amount) < this._MINAMOUNT) {
        callback(this._error('Amount cannot be less than ' + this._MINAMOUNT));
        return;
    }

    if (typeof options === "undefined") options = {};
    
    if ( (typeof options['escrow'] === "undefined" || options['escrow'] == false) 
         && !this._validAddress(address)) {
        callback(this._error('Invalid address'));
        return;        
    } 

    var params = this._createParameterObject({amount : amount, address : address, currency : currency}, options);

    this._apiRequest('/api/payment', params, function (response) {
        callback(response);
    });
};

//----------------------------------------------------------------
// Create new payment template to use in client side
// Required : amount        # Billed amount
// Required : currency      # Billed currency
// Required : address       # Receiving address
// Required : callback      # callback function
// Optional : options       # Button options: orderID,
//                                         secret, 
//                                         callback,
//                                         company,
//                                         motto,
//                                         logoURL,
//                                         addressLine1,
//                                         addressLine2,
//                                         email,
//                                         item,
//                                         description,
//                                         returnAddress,
//                                         buttonText,
//                                         escrow 
// Returns   : JSON object
//----------------------------------------------------------------
Coinvoy.prototype.button = function (amount, currency, address, callback, options) {

    if (parseFloat(amount) < this._MINAMOUNT) {
        callback(this._error('Amount cannot be less than ' + this._MINAMOUNT));
        return;
    }
    
    if (typeof options === "undefined") options = {};
    
    if ( (typeof options['escrow'] === "undefined" || options['escrow'] == false) 
         && !this._validAddress(address)) {
        callback(this._error('Invalid address'));
        return;
    }

    var params = this._createParameterObject({amount : amount, address : address, currency : currency}, options);

    this._apiRequest('/api/button', params, function (response) {
        callback(response);
    });
};

//----------------------------------------------------------------
// Create new donation template to use in client side
// Required : address   # Receiving address
// Required : callback  # Callback function
// Optional : options   # Donation options: orderID,
//                                           secret,
//                                           callback,
//                                           company,
//                                           motto,
//                                           logoURL,
//                                           addressLine1,
//                                           addressLine2,
//                                           email,
//                                           item,
//                                           description,
//                                           buttonText
// Returns   : JSON object
//----------------------------------------------------------------
Coinvoy.prototype.donation = function (address, callback, options) {
    if (!this._validAddress(address)) {
        callback(this._error('Invalid address'));
        return;
    }

    if (typeof options === "undefined") options = {};

    var params = this._createParameterObject({address : address}, options);

    this._apiRequest('/api/donation', params, function (response) {
        callback(response);
    });
};

//----------------------------------------------
// Completes the escrow process and forwards coins to their last destination
// Required : key      # key returned from /api/payment
// Required : callback # Callback function
// Optional : options  # freeEscrow options: address
// Returns  : JSON object
//----------------------------------------------
Coinvoy.prototype.freeEscrow = function (key, callback, options) {

    if (typeof options === "undefined") options = {};
    
    if (typeof options['address'] != "undefined" && !this._validAddress(options['address'])) {
        callback(this._error('Invalid address'));
        return;
    }

    var params = this._createParameterObject({key : key}, options);

    this._apiRequest('/api/freeEscrow', params, function (response) {
        callback(response);
    });
};

//----------------------------------------------
// Cancels the escrow process and returns coins to owner
// Required : key      # key returned from /api/payment
// Required : callback # Callback function
// Optional : options  # freeEscrow options: returnAddress
// Returns  : JSON object
//----------------------------------------------
Coinvoy.prototype.cancelEscrow = function (key, callback, options) {

    if (typeof options === "undefined") options = {};
    
    if (typeof options['returnAddress'] != "undefined" && !this._validAddress(options['returnAddress'])) {
        callback(this._error('Invalid return address'));
        return;
    }

    var params = this._createParameterObject({key : key}, options);

    this._apiRequest('/api/cancelEscrow', params, function (response) {
        callback(response);
    });
};

//---------------------------------------------------
// Required : invoiceID
// Reqired  : callback # callback function
// Returns  : JSON object
//---------------------------------------------------
Coinvoy.prototype.status = function (invoiceID, callback) {
    this._apiRequest('/api/status', { invoiceID : invoiceID }, function (response) {
        callback(response);
    });
};

//---------------------------------------------------
// Required : invoiceID
// Required : callback
// Returns  : JSON object
//---------------------------------------------------
Coinvoy.prototype.invoice = function (invoiceID, callback) {
    this._apiRequest('/api/invoice', { invoiceID : invoiceID }, function (response) {
        callback(response);
    });
};

//----------------------------------------------
// Validates received payment notification (IPN)
// Required : hash      # provided by IPN call
// Required : orderID   # provided by IPN call
// Required : invoiceID # provided by IPN call
// Required : secret    # secret used while creating payment
// Returns  : true/false
//----------------------------------------------
Coinvoy.prototype.validateNotification = function (hash, orderID, invoiceID, secret) {
    var hmac = crypto.createHmac('sha256', secret);

    hmac.update(orderID + ':' + invoiceID);

    return hmac.digest('hex').toLowerCase() == hash.toLowerCase();
};


Coinvoy.prototype._apiRequest = function (path, params, callback) {
    var postData = JSON.stringify(params);

    var options = {
        host   : 'coinvoy.net',
        path   : path,
        method : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length
      }
    };

    var req = http.request(options, function (response) {
        var content = '';

        response.on('data', function (chunk) {
            content += chunk;
        });
        response.on('end', function () {
            var result;

            try {
                result = JSON.parse(content);
            } catch (err) {
                result = content;
            }

            callback(result);
        });
    });
    req.write(postData);

    req.end();
    
};

Coinvoy.prototype._error = function (message) {
    return { success : false, message : message };
};

Coinvoy.prototype._createParameterObject = function () {
    var params = {};

    for (var i=0; i<arguments.length; i++) {
        for (var key in arguments[i]) params[key] = arguments[i][key];    
    }
    
    return params;
};

Coinvoy.prototype._validAddress = function (address) {
    if (address.length < 26 || address.length > 35)
        return false;
        
    if (address.charAt(0) != '1' && address.charAt(0) != '3')
        return false
        
    return true
    
};

module.exports.Coinvoy = Coinvoy;
