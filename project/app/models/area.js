var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var AreaSchema = Schema({
	pincode: Number,
	town: String,
	state: String
});

module.exports = mongoose.model('Area', AreaSchema);