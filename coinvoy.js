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
// Create new invoice to receive a payment
// Required : amount		# Billed amount
// Required : currency		# Billed currency - "BTC","LTC" or "DOGE"
// Required : address       # Receiving address
// Required : callback      # Callback function
// All parameters below can be provided in options object
// Optional : escrow        # Boolean - defaults to false
// Optional : payWith		# Payment Currency - "BTC", "LTC" or "DOGE" - defaults to "BTC"
// Optional : orderID       # Unique order id
// Optional : provider   	
// Optional : email         # Notification email
// Optional : description   # Description of item
// Optional : minconf       # Minimum number of confirmations
// Optional : callback      # IPN URL
//----------------------------------------------------------------
Coinvoy.prototype.invoice = function (amount, address, currency, callback, options) {

	if (typeof amount === "undefined") {
		callback({ success : false, error : 'Missing parameter \'amount\''});
		return;
	}

	if (typeof address === "undefined") {
		callback({ success : false, error : 'Missing parameter \'address\''});
		return;	
	}

	if (typeof currency === "undefined") {
		callback({ success : false, error : 'Missing parameter \'currency\''});
		return;	
	}

	if (parseFloat(amount) < this._MINAMOUNT) {
		callback({ success : false, error : 'Amount cannot be less than ' + this._MINAMOUNT});
		return;
	}

	if (typeof options === "undefined") options = {};

	var params = this._createParameterObject({amount : amount, address : address, currency : currency}, options);

	this._apiRequest('/api/newInvoice', params, function (response) {
		if (!response.success) {
			callback({ success : false, error : 'An error occured while creating invoice: ' + response.message });
			return;
		}

		callback(response);
	});
};

//----------------------------------------------------------------
// Create new donation template to use in client side
// Required : address       # Receiving address
// Required : callback      # Callback function
// All parameters below can be provided in options object
// Optional : description	# Description displayed in payment
// Optional : orderID		# Donation request ID
// Optional : buttonText    # Button text for default donation button
// Optional : provider      
// Optional : email         # Notification email
// Optional : description
// Optional : callback      # IPN URL
//----------------------------------------------------------------
Coinvoy.prototype.donation = function (address, callback, options) {
	if (typeof address === "undefined") {
		callback({ success : false, error : 'Missing parameter \'address\''});
		return;	
	}

	if (typeof options === "undefined") options = {};

	var params = this._createParameterObject({address : address}, options);

	this._apiRequest('/api/getDonation', params, function (response) {
		if (!response.success) {
			callback({ success : false, error : 'An error occured while getting donation: ' + response.message });
			return;
		}

		callback(response);
	});
};

//----------------------------------------------------------------
// Create new invoice template to use in client side
// Required : amount		# Billed amount
// Required : address
// Required : currency		# Billed currency - "BTC","LTC" or "DOGE"
// Required : callback      # Callback function
// All parameters below can be provided in options object
// Optional : payWith		# Payment Currency - "BTC", "LTC" or "DOGE"
// Optional : escrow
// Optional : orderID
// Optional : provider
// Optional : email
// Optional : buttonText
// Optional : minconf 
//----------------------------------------------------------------
Coinvoy.prototype.button = function (amount, address, currency, callback, options) {
	if (typeof amount === "undefined") {
		callback({ success : false, error : 'Missing parameter \'amount\''});
		return;
	}

	if (typeof currency === "undefined") {
		callback({ success : false, error : 'Missing parameter \'currency\''});
		return;
	}

	if (parseFloat(amount) < this._MINAMOUNT) {
		callback({ success : false, error : 'Amount cannot be less than ' + this._MINAMOUNT});
		return;
	}

	if (typeof address === "undefined") {
		callback({ success : false, error : 'Missing parameter \'address\''});
		return;
	}

	if (typeof options === "undefined") options = {};

	var params = this._createParameterObject({amount : amount, address : address, currency : currency}, options);

	this._apiRequest('/api/getButton', params, function (response) {
		if (!response.success) {
			callback({ success : false, error : 'An error occured while getting button info: ' + response.message });
			return;
		}

		callback(response);
	});
};


//----------------------------------------------
// Creates a live invoice from hash
// Required : hash
// Required : payWith
// Required : amount
// Required : callback      # Callback function
//----------------------------------------------
Coinvoy.prototype.invoiceFromHash = function (hash, payWith, callback) {

	if (typeof payWith === "undefined") {
		callback({ success : false, error : 'Missing parameter \'payWith\'.'});
		return;
	}

	if (typeof hash === "undefined") {
		callback({ success : false, error : 'Missing parameter \'hash\'.'});
		return;
	}

	var params = {
		hash    : hash,
		payWith : payWith
	};

	this._apiRequest('/api/invoiceHash', params, function (response) {
		if (!response.success) {
			callback({ success : false, error : 'An error occured while getting invoice from hash: ' + response.message });
			return;
		}

		callback(response);
	});
};

//----------------------------------------------
// Completes the escrow process and forwards coins to their last destination
// Required : key
// Required : callback      # Callback function
//----------------------------------------------
Coinvoy.prototype.freeEscrow = function (key, callback) {
	if (typeof key === undefined) {
		callback({ success : false, error : 'Missing parameter \'key\''});
		return;
	}

	var params = {
		key : key
	};

	this._apiRequest('/api/freeEscrow', params, function (response) {
		if (!response.success) {
			callback({ success : false, error : 'An error occured while releasing escrow: ' + response.message });
			return;
		}

		callback(response);
	});
};

//----------------------------------------------
// Validates received payment notification (IPN)
// Required : invoiceId
// Required : hash
// Required : orderID
// Required : address 
// Required : callback      # Callback function
//----------------------------------------------
Coinvoy.prototype.validateNotification = function (invoiceId, hash, orderID, address, callback) {
	if (typeof invoiceId === undefined) {
		callback({ success : false, error : 'Missing parameter \'key\''});
		return;
	}

	if (typeof hash === undefined) {
		callback({ success : false, error : 'Missing parameter \'hash\''});
		return;
	}

	if (typeof orderID === undefined) {
		callback({ success : false, error : 'Missing parameter \'orderID\''});
		return;
	}

	if (typeof address === undefined) {
		callback({ success : false, error : 'Missing parameter \'address\''});
		return;
	}

	var hmac = crypto.createHmac('sha256', address);

	hmac.update(orderID + ':' + invoiceId);

	if (hmac.digest('hex').toLowerCase() == hash.toLowerCase()) {
		callback({ success : true });
	} else {
		callback({ success : false, error : 'Invalid hash'});
	}
	
};

//---------------------------------------------------
// Get Invoice Status:
//		"new"			-> Invoice has just been created and is waiting for payment
//		"approved"		-> Transaction is analyzed and approved as valid by our server
//		"confirmed"		-> Transaction is confirmed by the network
//		"completed"		-> Payment is forwarded to your address and the invoice is completed
//		"cancelled"		-> Payment is not received
//		"error"			-> An error occured during the process
//		"insufficient"	-> User paid insufficient amount, waiting for complimentary payment
//
// Required : invoiceId
// Required : callback      # Callback function
//---------------------------------------------------
Coinvoy.prototype.getStatus = function (invoiceId, callback) {
	if (typeof invoiceId !== "string" || invoiceId == '') {
		callback({ success : false, error : 'Please supply an invoice id'});
		return;
	}

	this._apiRequest('/api/status', { invoiceId : invoiceId }, function (response) {
		callback(response);
	});
};

//---------------------------------------
// Get Invoice by ID
// Required : invoiceId
// Required : callback      # Callback function
//---------------------------------------
Coinvoy.prototype.getInvoice = function (invoiceId, callback) {
	if (typeof invoiceId !== "string" || invoiceId == '') {
		callback({ success : false, error : 'Please supply an invoice id'});
		return;
	}

	this._apiRequest('/api/invoice', { invoiceId : invoiceId }, function (response) {
		callback(response);
	});
};


Coinvoy.prototype._apiRequest = function (path, params, callback) {
	var postData = querystring.stringify(params);

	console.log(postData);

	var options = {
		host   : 'coinvoy.net',
		path   : path,
		method : 'POST',
		headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': postData.length
      }
	};

	var req = https.request(options, function (response) {
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

Coinvoy.prototype._createParameterObject = function () {
	var params = {};

	for (var i=0; i<arguments.length; i++) {
		for (var key in arguments[i]) params[key] = arguments[i][key];	
	}
	
	return params;
};

module.exports.Coinvoy = Coinvoy;