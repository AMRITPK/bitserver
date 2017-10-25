#!/usr/bin/nodejs
//release_seats.js for BookInTown to release the blocked seats for incomplete transactions


var mongoose = require("mongoose");

//Database Section
var username = process.env.DBUSER || "bookintown";
var password = process.env.DBPASS || "bookintown!23";

//mongoose.connect("mongodb://bookintown:bookintown!23@jello.modulusmongo.net:27017/ebu4vomE");
mongoose.connect("mongodb://@localhost:27017/bookintown");


//Models
var SeatLayout = require('./app/models/seatlayout');
var Booking = require('./app/models/booking');

var release_seats = function() {
	var date_to_release = new Date();
	date_to_release.setMinutes(date_to_release.getMinutes() - 15);
	console.log(date_to_release);
	Booking.find({
		$and: [
			{ status : "BLOCKED" },
			{ created_time: {$lte: date_to_release} }
		]
	}, function(err, bookings) {
		if (err) {
			console.log(err);
			process.exit(1);
		} else if (bookings.length == 0) {
			console.log("No invalid bookings found!");
			process.exit(0);
		}
		else {
			console.log("No of Blocked bookings to release " + bookings.length);
			bookings.forEach(function(booking) {
				booking.updated_time = Date();
				booking.status = "INVALID";
				SeatLayout.findOne({s_id: {$regex: booking.show_id}}, function(err, seats) {
					if (err) {
						console.log(err);
						process.exit(1);
					} else {
						seats.layout.forEach(function(obj) {
							if (booking.seats.indexOf(obj.id) != -1) {
								obj.available = 1;
							}
						});
						seats.save(function(err) {
							if (err) {
								console.log(err);
								process.exit(1);
							} else {
								booking.save(function(err) {
									if (err) {
										console.log(err);
										process.exit(1);
									} else {
										console.log("Release Successful");
										process.exit(0);
									}
								});

							}
						});
					}
				});				
			});
		}
	});
}

release_seats();