
var Coinvoy = require('./coinvoy.js').Coinvoy;



var coinvoy = new Coinvoy();

var amount        = 0.012;
var address       = "receiving address";
var returnAddress = "return address";
var currency      = "BTC";
var key           = "key returned from escrow payment";


var createPayment = function () {
	coinvoy.payment(amount, currency, address, function (payment) {
		console.log(payment);

		if (!payment.success) return;

		coinvoy.status(payment.id, function (response) {
			console.log(response);
		});
	});
};

var createEscrow = function () {
	coinvoy.payment(amount, currency, address, function (payment) {
		console.log(payment);

		if (!payment.success) return;

		coinvoy.invoice(payment.id, function (response) {
			console.log(response);
		});
	}, { escrow : true, returnAddress : returnAddress } );
};

var getDonation = function () {
	coinvoy.donation(address, function (donation) {
		console.log(donation);
	});
};



var getButton = function () {
	coinvoy.button(amount, currency, address, function (button) {
		console.log(button);
	});
};

var freeEscrow = function () {
    coinvoy.freeEscrow(key, function (result) {
        console.log(result);
    });
};


var cancelEscrow = function () {
    coinvoy.cancelEscrow(key, function (result) {
        console.log(result);
    });
};

createPayment();
// createEscrow();
// getDonation();
// getButton();
// freeEscrow();
// cancelEscrow();

