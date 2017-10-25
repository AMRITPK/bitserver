#!/usr/bin/nodejs
//release_seats.js for BookInTown to release the blocked seats for incomplete transactions
var mongoose = require("mongoose");

//Database Section
//var username = process.env.DBUSER || "bookintown";
//var password = process.env.DBPASS || "bookintown!23";

//mongoose.connect("mongodb://bookintown:bookintown!23@jello.modulusmongo.net:27017/ebu4vomE");
mongoose.connect("mongodb://@localhost:27017/bookintown");


//Models
var Theatre = require('../app/models/theatre');
var SeatLayout = require('../app/models/seatlayout');
var Booking = require('../app/models/booking');
var Show = require('../app/models/show');
var Movie = require('../app/models/movie');
var fs = require('fs')
var email = 'amritpk@yahoo.com'
//var toemails='amritpk@gmail.com,asdf@asdf.com';
var toemails='amritpk@gmail.com';
var passwordfile = '/home/ubuntu/deployment/exp/Paytm_Web_Sample_Kit_NodeJs_Express_Project/project/mailer/yahoopwdfile.key'
var password = fs. readFileSync(passwordfile, 'utf8');
var encrpassword='12345678'
var filename =undefined;
var noofusers=0;
var bunyan = require("bunyan");
var crypto = require("crypto");
var fullimageurl = 'http://'
async = require("async");
var secret = fs.readFileSync('/home/ubuntu/deployment/exp/Paytm_Web_Sample_Kit_NodeJs_Express_Project/project/mailer/mailencrsecret.key')
var schedule = require('node-schedule');
var nodemailer = require('nodemailer');
var Excel = require('exceljs');
var mongodb = require('mongodb');
var mongodb = require('async');
var log = bunyan.createLogger({
    name: "mailer::app",
    streams: [{
        type: 'rotating-file',
        path: '/home/ubuntu/deployment/exp/Paytm_Web_Sample_Kit_NodeJs_Express_Project/project/mailer/mailer.log',
        period: '1d', // daily rotation
        count: 3 // keep 3 back copies
    }]
});
function emailer_null() {    

    var mailsettings = 'smtps://' + email + ':' + password + '@smtp.mail.yahoo.com';
    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport(mailsettings);

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: email, // sender address
        to: toemails.split(','), // list of receivers
        subject: 'Attached is the booking status', // Subject line
        text: 'Attached is the booking status . Total NO. of booking= 0 '
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            return log.debug(error);
        }
        console.log('Message sent: ' + info.response);

     
    });
}

function emailer() {    

    var mailsettings = 'smtps://' + email + ':' + password + '@smtp.mail.yahoo.com';
    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport(mailsettings);

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: email, // sender address
        to: toemails.split(','), // list of receivers
        subject: 'Attached is the booking status', // Subject line
        text: 'Attached is the booking status . Total NO. of booking= '+noofusers, // plaintext body
        attachments: [{
            'filename': filename,
            'path': filename
        }]
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
		setTimeout(function(){
			fs.unlink(filename);
			//fs.unlink(filename+'.zip');
		},5000);
     
    });
}

function generateexcel(userslist) {
    
    var options1 = {
        filename: filename,
        useStyles: true,
        useSharedStrings: true
    };
    workbookOutput = new Excel.stream.xlsx.WorkbookWriter(options1);
    worksheet = workbookOutput.addWorksheet('Summary');


    worksheet.columns = [ {
            header: 'name',
            key: 'name',
            width: 20
        },{
            header: 'mobile',
            key: 'mobile',
            width: 10
        }, {
            header: 'email',
            key: 'email',
            width: 20
        }, {
            header: 'seatNames',
            key: 'seatNames',
            width: 50
        }, {
            header: 'status',
            key: 'status',
            width: 20
        }, {
            header: 'Movie_Name',
            key: 'showMovie',
            width: 50
        }, {
            header: 'Thetre_Name',
            key: 'showTheatre',
            width: 50
        }, {
            header: 'Show_Time',
            key: 'showTime',
            width: 50
        }, {
            header: 'show_Date',
            key: 'showDate',
            width: 50
        }, {
            header: 'show_id',
            key: 'show_id',
            width: 50
        }, {
            header: 'txn_id',
            key: 'txn_id',
            width: 50
        },  {
            header: 'updated_time',
            key: 'updated_time',
            width: 50
        }
    ];

    async.eachSeries(userslist, function(item, callback) {
		var itemnew=item;
		item.seatNames=item.seatNames.join(", ")
        worksheet.addRow(item);
        callback();

    }, function done() {

        worksheet.commit();
        workbookOutput.commit();
        console.log("file created with rows" + userslist.length);
		noofusers= userslist.length;
		setTimeout(function(){
			//zipper();
			emailer();
		},300);        

    });
}

/*
function zipper(){
var Zip = require('node-7z'); // Name the class as you want! 
var myTask = new Zip();
myTask.add(filename+'.zip',filename, { p: encrpassword }).done(function(suc,err){
	console.log('comperessng done!');
	emailer();
	
})
 


}
*/

function emails() {
				console.log(new Date().toString());
			//var test=new Date().setHours(new Date().getHours()+2);
			//console.log(test.toString());

			
			Show.find({ date: { $gte:new Date(), $lte:  new Date().setMinutes(new Date().getMinutes()+900) } },function(err, shows) {
			if (err) {
				console.log('some error')
				console.log(err)
			}
			
			shows.forEach(function(currshow){
				console.log(currshow);
			var showDetails={};
                Movie.findOne({_id: currshow.m_id}, function(err,movie) {
					if (err) {
			//			res.status(400);
			//			res.send(err);
						console.log(err);
					}
                    
                    Theatre.findOne({_id: currshow.t_id}, function(err,theatre) {
						if (err) {
			//			res.status(400);
			//			res.send(err);
						console.log(err);
						}
                        
                        showDetails._id=currshow._id;
                        showDetails.movie=movie.name;
                        showDetails.theatre=theatre.name;
                        showDetails.time=currshow.time;
                        showDetails.date=currshow.date;
							Booking.find({show_id:currshow._id}, function(err1, bookings) {
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
								temp.showMovie=showDetails.movie;
								temp.showTheatre=showDetails.theatre;
								temp.showTime=showDetails.time;
								temp.showDate=showDetails.date;
								

								SeatLayout.findOne({s_id :currshow._id}, function(err2, seats) {
								if (err2 || (seats == null)) {							
								console.log('no seats');
								console.log(err2);
								}
			
									console.log("before asy",seats.layout.length);
									async.eachSeries(seats.layout, function iteratee(obj, callback) {
										if(bookobj.seats.indexOf(obj.id) != -1){
											temp.seatNames.push(obj.name);
											console.log(obj.name);
											async.setImmediate(function() {
												callback();
											});
										}else{
											callback();
										}
									},function done(){
											newbookings.push(temp)
											console.log(newbookings)
											if(!newbookings || newbookings.length == 0){
											emailer_null()
											}else{
											generateexcel(newbookings)
											}
									});			
																	

								});						


								})					

								if (err1) {

								console.log(err1);
								}
							

							})//end booking find                    
                    }); 
				});		

			})//end shows	
		});
	

}



 //5 8 * * 6  8:05 all saturday
 //23 4 * * 5  8:05 all saturday
//var j = schedule.scheduleJob('0 6 * * 6', function(){
//var j = schedule.scheduleJob('0 */30 * * * *', function(){	
	console.log('scheduler triggered');
	filename = new Date().getDay()+"_"+(parseInt(new Date().getMonth())+1)+"_"+new Date().getYear()+" .xlsx";
	emails();
	
//});

