var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ShowSchema = Schema({
	m_id: String,
	t_id: String,
	date: Date,
	time: String,
	other: String
	//pincode: Number,
});

module.exports = mongoose.model('Show', ShowSchema);