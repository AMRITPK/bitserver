var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var MovieSchema = Schema({
	name: String,
	language: String,
	genre: String,
	poster: String,
	cast: String,
	highlight: String,
	description: String,
	other: String,
	status: String,//past, present, future
	trailer: String 
});

module.exports = mongoose.model('Movie', MovieSchema);