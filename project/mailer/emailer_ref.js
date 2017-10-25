#!/usr/bin/nodejs
//release_seats.js for BookInTown to release the blocked seats for incomplete transactions
var mongoose = require("mongoose");

//Database Section
var username = process.env.DBUSER || "bookintown";
var password = process.env.DBPASS || "bookintown!23";

//mongoose.connect("mongodb://bookintown:bookintown!23@jello.modulusmongo.net:27017/ebu4vomE");
mongoose.connect("mongodb://@localhost:27017/bookintown");


//Models
var SeatLayout = require('../app/models/seatlayout');
var Booking = require('../app/models/booking');
var Show = require('../app/models/show');

var findShows=function(){
			console.log(new Date().toString());
			//var test=new Date().setHours(new Date().getHours()+2);
			//console.log(test.toString());
			Show.find({ date: { $gte:new Date(), $lt:  new Date().setHours(new Date().getHours()+24) } },function(err, shows) {
			if (err) {
				console.log('some error')
				console.log(err)
			}
			console.log(shows);
			shows.forEach(function(currshhow){
				Booking.find({show_id:currshhow._id}, function(err1, bookings) {
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


						SeatLayout.findOne({s_id :currshhow._id}, function(err2, seats) {
							if (err2 || (seats == null)) {							
								console.log('no seats');
								console.log(err2);
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
						
						
					})					
									
					if (err1) {
						
						console.log(err1);
					}
					setTimeout(function(){
							console.log(newbookings);
					},3000);
					
				})//end booking find
			})//end shows	
		});
}
//release_seats();
findShows()