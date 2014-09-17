Coinvoy API - NodeJS Client Library
================================

NodeJS client library for Coinvoy API


##About Coinvoy

Coinvoy is an online payment processor with an integrated exchange feature for established cryptocurrencies, namely Bitcoin, Litecoin and Dogecoin. It's objective is to provide an easiest yet the most secure way to accept cryptocurrencies.

##Get started


Place coinvoy.js in your directory and import it.

```
var Coinvoy = require('./coinvoy.js').Coinvoy;

var coinvoy = new Coinvoy();

//Create invoice
var amount   = 0.85;
var currency = "BTC";
var address  = "your cryptocurrency address";

coinvoy.invoice(amount, currency, address, function (invoice) {
	if (!invoice.success) {
		console.log('Unable to create invoice (' + invoice.error + ')');
		return;
	}

	console.log(invoice); 

	# invoice.id      - always find your invoice at https://coinvoy.net/invoice/{id}
	# invoice.key     - you need this key if this is an escrow
	# invoice.url     - shortcut for the payment box https://coinvoy.net/payment/{id}
	# invoice.address - show it to user, it is the payment address
	# invoice.html    - easiest way to display a payment box, just echo it
	
});

```

###List of all commands:
- invoice(amount, currency, address, callback, options)               - creates live invoice
- button(amount, currency, address, callback, options)                - prepares a button template
- donation(address, callback, options)                                - prepares a donation template
- invoiceFromHash(hash, payWith, callback)                            - creates live invoice from template hash
- validateNotification(invoiceId, hash, orderID, address, callback)   - checks if incoming payment notification is valid.
- freeEscrow(key, callback)                                           - finalize an escrow with its unique key. This action sends funds to receiver
- getStatus(invoiceId)                                                - current status of invoice [new,approved,confirmed,completed,cancelled]
- getInvoice(invoiceId)                                               - get latest invoice object

Your feedback and suggestions are very much welcome. Please write to support@coinvoy.net for any contact. 

Coinvoy

