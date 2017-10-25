var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var TheatreSchema = Schema({
	name: String,
	address: String,
	other: String,
	pin:String
});

module.exports = mongoose.model('Theatre', TheatreSchema);