var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var SeatLayoutSchema = Schema({
	s_id: String,
	layout: [{
		col: Number,
		row: Number,
		name: String,
		available: Number //-1->X, 0->Booked, 1->Avalilable
	}]
});

module.exports = mongoose.model('SeatLayout', SeatLayoutSchema);