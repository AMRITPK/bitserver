var NOT_PRESENT=-2;
var BLOCKED=-1;
var BOOKED=0;
var AVAILABLE=1;
var mongoose = require("mongoose");
mongoose.connect("mongodb://@localhost:27017/bookintown");
var username = process.env.DBUSER || "bookintown";
var password = process.env.DBPASS || "bookintown!23";

//mongoose.connect("mongodb://bookintown:bookintown!23@jello.modulusmongo.net:27017/ebu4vomE");



//Models
var Movie = require('./app/models/movie');
var Theatre = require('./app/models/theatre');
var Show = require('./app/models/show');
var SeatLayout = require('./app/models/seatlayout');
var Booking = require('./app/models/booking');

function completeBooking(req, res) {
		console.log("POST Booking complete called..");
		var seats_to_block = req.body.seats; //Array of Seat Names

		Booking.findOne({_id: req.params.book_id}, function(err, booking) {
			if (err) {
				res.status(400);
				res.send(err);
			}

			if (req.body.txn_id != null) {
				booking.txn_id = req.body.txn_id;
			}
			if (req.body.other != null) {
				booking.other = req.body.other;
			}
			booking.updated_time = Date();

			SeatLayout.findOne({s_id: {$regex: booking.show_id}}, function(err, seats) {
				if (err) {
					res.status(400);
					res.send(err);
				} else {
					seats.layout.forEach(function(obj) {
						if (booking.seats.indexOf(obj.id) != BLOCKED) {
							obj.available = 0;
						}
					});
					seats.save(function(err) {
						if (err) {
							res.status(400);
							res.send(err);					
						} else {
							booking.save(function(err) {
								if (err) {
									res.status(400);
									res.send(err);					
								}
							});
							res.json({message : "Booking completed!"});
						}
					});
				}
			});
		});
	}