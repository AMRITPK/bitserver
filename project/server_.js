//Server.js for BookInTown
var NOT_PRESENT=-2;
var BLOCKED=-1;
var BOOKED=0;
var AVAILABLE=1;

//Requires
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");


//Initialize
var app = express();
//var port = process.env.PORT || 4000;
var port = 4000;
var router = express.Router();


//Body Parser Section
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//Database Section
var username = process.env.DBUSER || "bookintown";
var password = process.env.DBPASS || "bookintown!23";

//mongoose.connect("mongodb://bookintown:bookintown!23@jello.modulusmongo.net:27017/ebu4vomE");
mongoose.connect("mongodb://@localhost:27017/bookintown");


//Models
var Movie = require('./app/models/movie');
var Theatre = require('./app/models/theatre');
var Show = require('./app/models/show');
var SeatLayout = require('./app/models/seatlayout');
var Booking = require('./app/models/booking');


//Router Section

//Router Middleware, Put Authentication Here
router.use(function(req, res, next) {
	console.log("In router Middleware");
	next();
})

router.get("/", function(req, res) {
	console.log("Got the request");
	res.json({ message: "Default api call..."});
});


//Add Movie, Get All movies
router.route("/movies")
	.post(function(req, res) {
		console.log("POST Movies called..");
		var movie = new Movie();
		movie.name = req.body.name;
		movie.language = req.body.language;
		movie.genre = req.body.genre;
		movie.poster = req.body.poster;
		movie.cast = req.body.cast;
		movie.highlight = req.body.highlight;
		movie.description = req.body.description;
		movie.status = req.body.status.toLowerCase();
		movie.others = req.body.others;

		movie.save(function(err) {
			if (err) {
				res.status(400);
				res.send(err);
			}
			res.json({message: "Movie added!"});
		});
	})
	.get(function(req, res) {
		console.log("GET Movies called..");
		Movie.find(function(err, movies) {
			if (err) {
				res.status(400);
				res.send(err);
			}
			res.json(movies);
		});
	});


//Add Theatre, Get All theatres
router.route("/theatres")
	.post(function(req, res) {
		console.log("POST Theatre called..");
		var theatre = new Theatre();
		theatre.name = req.body.name;
		theatre.address = req.body.address;
		theatre.pin = req.body.pin;
		theatre.other = req.body.other;
		console.log(JSON.stringify(theatre));
		theatre.save(function(err) {
			console.log("In theatre save");
			if (err) {
				res.status(400);
				res.send(err);
			}
			res.json({message: "Theatre added!"});
		});
	})
	.get(function(req, res) {
		console.log("GET Theatre called..");
		Theatre.find(function(err, theatres) {
			if (err) {
				res.status(400);
				res.send(err);
			}
			res.json(theatres);
		});
	});


//Add Show, Get All shows
router.route("/shows")
	.post(function(req, res) {
		var show = new Show();
		show.m_id = req.body.m_id;
		show.t_id = req.body.t_id;
		show.other = req.body.other;
		show.date = req.body.date;
		show.time = req.body.time;
		
		show.save(function(err) {
			if (err) {
				res.status(400);
				res.send(err);
			}
			res.json({message: "Show added!"});
		});
	})
	.get(function(req, res) {
		Show.find(function(err, shows) {
			if (err) {
				res.status(400);
				res.send(err);
			}
			res.json(shows);
		});
	});


//Get Shows for movie selected
router.route("/movies/:movie_id/shows")
	.get(function(req, res) {
		console.log("GET Movie shows called..");
		console.log(new Date());
		Show.find({m_id: {$regex: req.params.movie_id}, date: {$gte: new Date().setHours(0,0,0,0)}}, function(err, shows) {
			if (err) {
				res.status(400);
				res.send(err);
				console.log(err);
			}
			res.json(shows);
		});
	});


//Add Seat Layout and Get SeatLayout for Show selected
router.route("/shows/:show_id/layout")
	.get(function(req, res) {
		console.log("GET Show Seat layout called..");
		SeatLayout.findOne({s_id: {$regex: req.params.show_id}}, function(err, seats) {
			if (err || (seats == null)) {
				res.status(400);
				res.send(err);
				console.log(err);
			}
			var seat_layout = [];
			var tmp_layout = [];
			var max_row_count = 0;

			seats.layout.forEach(function(obj) {
				if (Number(obj.row) > max_row_count) {
					max_row_count = Number(obj.row);
				}
				tmp_layout.push([]);
			});
			seat_layout = tmp_layout.slice(0, max_row_count + 1);
			seats.layout.forEach(function(obj) {
				seat_layout[obj.row].push({col: "col" + obj.col, name: obj.name, available: obj.available, id: obj.id});
			});
			res.json(seat_layout);
		});
	})
	.post(function(req, res) {
		var layout = new SeatLayout();
		layout.s_id = req.params.show_id;
		layout.layout = req.body.layout;
		layout.save(function(err) {
			if (err) {
				res.status(400);
				res.send(err);
			}
			res.json({message: "Show Seat Layout added!"});
		});
	});	



//Block Seats for Show+Seat selected
router.route("/shows/:show_id/block")
	.post(function(req, res) {
		console.log("POST Seat block called..",req.params.show_id);
		var seats_to_block = req.body.seats; //Array of Seat Names
	
		SeatLayout.findOne({s_id: {$regex: req.params.show_id}}, function(err, seats) {
			if (err) {
				res.status(400);
				res.send(err);

			}


			

			var available_seats = seats.layout.filter(function(elem) {
				return (elem.available == AVAILABLE) && seats_to_block.indexOf(elem.id) != -1;
			});

			if (available_seats.length != seats_to_block.length) {
			//if (false) {
				res.status(400);
				res.send(seats);
			} else {
				seats.layout.forEach(function(obj) {
					if (seats_to_block.indexOf(obj.id) != BLOCKED) {
						obj.available = BLOCKED;
					}
				});
				var any_err = false;
				seats.save(function(err) {
					if (err) {
						any_err = true;					
					}
				});
				var booking = new Booking();
				booking.name = req.body.name;
				booking.mobile = req.body.mobile;
				booking.fb_id = req.body.fb_id;
				booking.u_id = req.body.u_id;
				booking.txn_id = req.body.txn_id;
				booking.email = req.body.email;
				booking.seats = req.body.seats;
				booking.show_id = req.params.show_id;
				booking.status = "BLOCKED";
				booking.other = req.body.other;
				booking.save(function(err) {
					if (err || any_err) {
						res.status(400);
						res.send(err);					
					} else {
						res.json(booking);
					}
				});				
			}
		});
	});

router.route("/show/:show_id")
    .get(function(req, res) {
        console.log("GET full details shows called..aa");
        Show.findOne({_id: req.params.show_id}, function(err, shows) {
            if (err) {
                res.status(400);
                res.send(err);
                console.log(err);
            }
            var temp={};//shows[0];//
            	console.log(shows);
                Movie.findOne({_id: shows.m_id}, function(err,movie) {
					if (err) {
						res.status(400);
						res.send(err);
						console.log(err);
					}
                    
                    Theatre.findOne({_id: shows.t_id}, function(err,theatre) {
						if (err) {
						res.status(400);
						res.send(err);
						console.log(err);
						}
                        
                        temp._id=shows._id;
                        temp.movie=movie.name;
                        temp.theatre=theatre.name;
                        temp.time=shows.time;
                        temp.date=shows.date;
                        res.json(temp);
                        
                    });    
                    
                });
        });
    });

router.route("/bookings")
	.post(function(req, res) {
		console.log("Get Booking details called..");
		var checker = {};
		if (req.body.email != null) {
			checker = {email : req.body.email};
		}
		if (req.body.phone != null) {
			checker = {phone : req.body.phone};
		}
		if (req.body.u_id != null) {
			checker = {u_id : req.body.u_id};
		}
		if (req.body.fb_id != null) {
			checker = {fb_id : req.body.fb_id};
		}
		Booking.find({$query: checker, $orderby : {updated_time : -1}}, function(err, bookings) {
			if (err) {
				res.status(400);
				res.send(err);
				console.log(err);
			}
			res.send(bookings);
		});
	});

router.route("/bookings/:book_id")
	.get(function(req, res) {
		console.log("Get Booking details called..");
		Booking.findOne({_id: req.params.book_id}, function(err, bookings) {
			if (err) {
				res.status(400);
				res.send(err);
				console.log(err);
			}
			res.send(bookings);
		});
	});

//Complete the booking
router.route("/bookings/:book_id/complete")
	.post(function(req, res) {
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
			booking.status = "BOOKED";

			SeatLayout.findOne({s_id: {$regex: booking.show_id}}, function(err, seats) {
				if (err) {
					res.status(400);
					res.send(err);
				} else {
					seats.layout.forEach(function(obj) {
						if (booking.seats.indexOf(obj.id) != -1) {
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
	});

app.use("/api", router);
app.listen(port);