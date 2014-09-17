
var Coinvoy = require('./coinvoy.js').Coinvoy;



var coinvoy = new Coinvoy();

var amount = 0.85;
var address = "your cryptocurrency address";
var currency = "BTC";

createInvoice();
// getDonation();
// getButton();

var createInvoice = function () {
	coinvoy.invoice(amount, address, currency, function (invoice) {
		console.log(invoice);

		if (!invoice.success) return;

		coinvoy.getInvoice(invoice.id, function (response) {
			console.log(response);
		});
	});
};

var getDonation = function () {
	coinvoy.donation(address, function (donation) {
		console.log(donation);
	});
};



var getButton = function () {
	coinvoy.button(amount, address, currency, function (button) {
		console.log(button);

		if (!button.success) return;

		coinvoy.invoiceFromHash(button.hash, 'BTC', function (result) {
			
			console.log(result);
		});

	});
};