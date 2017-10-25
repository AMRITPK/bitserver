var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var BookingSchema = Schema({
	name: String,
	mobile: String,
	email: String,
	u_id: String,
	fb_id: String,
	txn_id: String,
	created_time: { type: Date, default: Date.now },
	updated_time: { type: Date, default: Date.now },
	seats: [],
	show_id: String,
	status: String, //Allowed Values -> "BLOCKED", "BOOKED", "INVALID"
	other: String,
	paytm: String
});

module.exports = mongoose.model('Booking', BookingSchema);