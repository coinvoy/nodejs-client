Coinvoy API - NodeJS Client Library
===================================

NodeJS client library for Coinvoy API


##About Coinvoy

Coinvoy is an online payment processor. It's objective is to provide an easiest yet the most secure way to accept cryptocurrencies.

##Get started


Place coinvoy.js in your directory and import it.

```
var Coinvoy = require('./coinvoy.js').Coinvoy;

var coinvoy = new Coinvoy();

//Create invoice
var amount   = 0.85;
var currency = "BTC";
var address  = "your cryptocurrency address";

coinvoy.payment(amount, currency, address, function (payment) {
	console.log(invoice); 

	// payment.id      - always find your invoice at https://coinvoy.net/invoice/{id}
	// payment.key     - you need this key if this is an escrow
	// payment.url     - shortcut for the payment box https://coinvoy.net/payment/{id}
	// payment.address - show it to user, it is the payment address
	// payment.html    - easiest way to display a payment box, just echo it
	
});

```

###List of all commands:
- payment(amount, currency, address, callback, options)               - creates payment
- button(amount, currency, address, callback, options)                - prepares a button template
- donation(address, callback, options)                                - prepares a donation template
- validateNotification(hash, orderID, invoiceID, secret)              - checks if incoming payment notification is valid.
- freeEscrow(key, callback, options)                                  - finalize an escrow with its unique key. This action sends funds to receiver
- cancelEscrow(key, callback, options)                                - cancel an escrow with its unique key. This action sends funds to owner
- status(invoiceId, callback)                                         - current status of invoice [new,approved,confirmed,completed,cancelled]
- invoice(invoiceId, callback)                                        - get latest invoice object

Your feedback and suggestions are very much welcome. Please write to support@coinvoy.net for any contact. 

Coinvoy

