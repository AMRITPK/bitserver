var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var PaytmSchema = Schema({
	mid: String,
	orderid: String,
	txnamount: String,
	currency: String,
	txnid: String,
	banktxnid: String,
	status: String,
	respcode: String,
	respmsg: String,
	txndate: { type: Date, default: Date.now },
	gatewayname: String,
	bankname: String,
	paymentmode: String,
	bitbookingid:String
});

module.exports = mongoose.model('Paytm', PaytmSchema);