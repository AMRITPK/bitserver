var NOT_PRESENT=-2;
var BLOCKED=-1;
var BOOKED=0;
var AVAILABLE=1;
var mongoose = require("mongoose")
var express = require("express")
  , redirect = require("express-redirect");
 
var app = express();
redirect(app); 
var router = express.Router();
var bodyParser = require('body-parser');


var server = require('http').createServer(app);
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
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true
}));

server.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Example app listening at http://%s:%s', host, port);
});

var router1 = express.Router();
var router2 = express.Router();
//Router Middleware, Put Authentication Here
router1.use(function(req, res, next) {
	console.log("In router Middleware");
	next();
})

router1.get("/", function(req, res) {
	console.log("Got the request");
	res.json({ message: "Default api call..."});
});


//Add Movie, Get All movies
router1.route("/movies")
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
		movie.trailer = req.body.trailer;

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
		Movie.find({}, null, {sort: {status: -1}}, function(err, movies) {
			if (err) {
				res.status(400);
				res.send(err);
			}
			res.json(movies);
		});
	});


//Add Theatre, Get All theatres
router1.route("/theatres")
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
//version
router1.route("/version")
	.post(function(req, res) {
		
		console.log(req.body.version);		
		res.json({allowed: "success",message:"Welcome User"});
		
	})
	

//Add Show, Get All shows
router1.route("/shows")
	.post(function(req, res) {
		var show = new Show();
		show.m_id = req.body.m_id;
		show.t_id = req.body.t_id;
		show.other = req.body.other;
		show.date = req.body.date;
		show.date.setHours(req.body.time.split(":")[0]);
		show.date.setMinutes(req.body.time.split(":")[1]);		
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
router1.route("/movies/:movie_id/shows")
	.get(function(req, res) {
		console.log("GET Movie shows called..");
		console.log(new Date());
		Show.find({m_id: {$regex: req.params.movie_id}, date: {$gte: new Date().setHours(new Date().getHours()+2)}}, function(err, shows) {
			if (err) {
				res.status(400);
				res.send(err);
				console.log(err);
			}
			res.json(shows);
		});
	});

router1.route("/movies/:movie_id/all_shows")
        .get(function(req, res) {
                console.log("GET Movie shows called..");
                console.log(new Date());
                Show.find({m_id: {$regex: req.params.movie_id} }, function(err, shows) {
                        if (err) {
                                res.status(400);
                                res.send(err);
                                console.log(err);
                        }
                        res.json(shows);
                });
        });


//Add Seat Layout and Get SeatLayout for Show selected
router1.route("/shows/:show_id/layout")
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
router1.route("/test1/")
	.post(function(req, res) {
		
				var booking = new Booking();
				booking.name = req.body.name;
				booking.paytm = req.body.paytm;
				
				booking.status = "BLOCKED";
				
				booking.other = req.body.other;
				booking.save(function(err) {
					if (err ) {
						res.status(400);
						res.send(err);					
					} else {
						res.json(booking);
					}
				});				
		
	});
//Block Seats for Show+Seat selected
router1.route("/shows/:show_id/block")
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
				booking.status = "BLOCKED";
				booking.email = req.body.email;
				booking.seats = req.body.seats;
				booking.show_id = req.params.show_id;
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
router1.route("/blocking/:blocking_id")
    .get(function(req, res) {
        console.log("GET full details shows called..aa");
        Booking.findOne({_id: req.params.blocking_id}, function(err, booking) {
				var seats=booking.seats;
				var seatNames=[];
			/*	for (item in seats){
					console.log(item,'iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii');
					SeatLayout.findOne({_id: {$regex: seats[item]}}, function(err, seats) {
						seatNames.push(seats.name);
					});
					
				}
			*/
				Show.findOne({_id: booking.show_id}, function(err, shows) {
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
							temp.seatNames=seatNames;
							res.json(temp);
							
						});    
						
					});
			});
		
	  });
    });
router1.route("/show/:show_id")
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

cors = require('cors')	
	
router2.route("/showTicketDetails")
	.post(function(req, res) {
	//res.header('Access-Control-Allow-Origin', '52.66.47.82');
	
    //res.header('Access-Control-Allow-Methods', 'GET,PUT,POST');
    //res.header('Access-Control-Allow-Headers', 'Content-Type');
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
		if (req.body.show_id != null) {
			checker = {show_id : req.body.show_id};
		}
		console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',checker);
		Booking.find(checker/*, $orderby : {updated_time : -1}*/, function(err, bookings) {
			var newbookings=[];
			
			bookings.forEach(function(bookobj){
				var temp={};
				temp.other=bookobj.other
				temp.show_id=bookobj.show_id
				temp.email=bookobj.email
				temp.status=bookobj.status
				temp.txn_id=bookobj.txn_id
				temp.u_id=bookobj.u_id
				temp.fb_id=bookobj.fb_id
				temp.mobile=bookobj.mobile
				temp.name=bookobj.name
				temp._id=bookobj._id
				temp.seats=bookobj.seats
				temp.updated_time=bookobj.updated_time
				temp.created_time=bookobj.created_time
				temp.seatNames=[];
				if(req.body.show_id){
				//if(bookobj.show_id){
					SeatLayout.findOne({s_id :req.body.show_id}, function(err, seats) {
						if (err || (seats == null)) {
						res.status(400);
						res.send(err);
						console.log(err);
						}
											
						seats.layout.forEach(function(obj) {	
							if(bookobj.seats.indexOf(obj.id) != -1){
								temp.seatNames.push(obj.name);
									
							}
							
							//seat_layout[obj.row].push({col: "col" + obj.col, name: obj.name, available: obj.available, id: obj.id});
						},newbookings.push(temp))
						;
						//console.log(temp);

					});						
				}
				
				
			})
	
				
			
							
			if (err) {
				res.status(400);
				res.send(err);
				console.log(err);
			}
			setTimeout(function(){
					res.send(newbookings);
			},3000);
			
		});		
		

	});	
router1.route("/bookings")
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
		Booking.find(checker/*, $orderby : {updated_time : -1}*/, function(err, bookings) {
			if (err) {
				res.status(400);
				res.send(err);
				console.log(err);
			}
			res.send(bookings);
		});
	});

router1.route("/bookings/:book_id")
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
router1.route("/bookings/:book_id/complete")
	.post(completeBooking);

function completeBooking(req, res) {
		console.log("POST Booking complete called.11111111111111111111111.");
		//var seats_to_block = req.body.seats; //Array of Seat Names

		Booking.findOne({_id: req.params.book_id}, function(err, booking) {
			if (err) {
				res.status(400);
				res.send(err);
			}
			console.log(booking.show_id,'asdf');
			if (req.body.txn_id != null) {
				booking.txn_id = req.body.txn_id;
			}
			if (req.body.other != null) {
				booking.other = req.body.other;
			}
			if (req.body.name != null) {
				booking.name = req.body.name;
			}
			if (req.body.mobile != null) {
				booking.mobile = req.body.mobile;
			}
			if (req.body.email != null) {
				booking.email = req.body.email;
			}						
			booking.updated_time = Date();
			if(booking.status != 'BLOCKED'){
				res.status(400);
				res.send('Not in blocked state');
			}
			booking.status = "BOOKED";
			SeatLayout.findOne({s_id: {$regex: booking.show_id}}, function(err, seats) {
				console.log('aaaaaaaa',err);
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
						console.log('wwwwwwwww');
						if (err) {
							console.log('errorrrrrrrrr');
							res.status(400);
							res.send(err);					
						} else {
							booking.save(function(err) {
								console.log('vvvvvv');
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

	
require('./routes/admin/testtxn')(app);
require('./routes/admin/pgredirect')(app);
require('./routes/admin/response')(app);
app.use("/api", cors(),router1);
app.use("/api_cors/", cors(), router2);
app.use("/", router);
app.use("/public",express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

