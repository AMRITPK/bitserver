var checksum = require('../../model/checksum');
var config = require('../../config/config');
var session = require('express-session');
var request = require('request');

var sh = require("shorthash");
module.exports = function (app) {
	app.use(session({ secret: 'secretBIT', cookie: { maxAge: 12000000 }}));
	
	app.post('/response', function(req,res){
   
   var paramlist = req.body;
   var temp={};
   for (index in paramlist){
	   temp[index]=paramlist[index];
   }
   console.log(temp)
   console.log(paramlist)
   console.log('-------------------------------------------------')
	var sess = req.session;		
	temp.bitbookingid=sess.bookingId;
	var sess_movieDetails={};
	for (index in sess.movieDetails){
		sess_movieDetails[index]=sess.movieDetails[index];
	}
	
	sess_movieDetails.dateString= sess_movieDetails.date;
	sess_movieDetails.seatNames= sess_movieDetails.seats;

	//sess_movieDetails.dateString= sess_movieDetails.date.toString().substring(0,10);
	sess_movieDetails.dateString= sess_movieDetails.date;
	//join(",");
	addPaytmData(temp);
		
   var ticketData={};
        var paramarray = new Array();
        if(checksum.verifychecksum(paramlist, config.PAYTM_MERCHANT_KEY))
        {  if(temp.STATUS == 'TXN_SUCCESS'){
				var postData={'txn_id' : temp.ORDERID, 'name':sess.name, 'mobile':sess.mobile, 'email': sess.email,'paytm':temp.STATUS};
				 url = 'http://35.154.28.117:3000/api/bookings/'+sess.bookingId+'/complete';
				request.post({					
					json: postData,
					url: url
				}, function(error, response, body){
				  if(response.statusCode==400){
					  	  console.log("false");
					res.render('response.ejs',{ 'restdata' : "true" ,'status':'Payment successful but Booking failed','paramlist' : temp,'ticketData':sess_movieDetails});
				 }else{
					 
					try{
						var bookingNumber=sess_movieDetails.bookingId;
						var amount=parseInt(sess_movieDetails.noOfSeats)*120;
						var seats=sess_movieDetails.seatNames;
						var date=sess_movieDetails.dateString.substring(0,10);//.substring(0,10)
						var time=sess_movieDetails.time.substring(0,7); 
						var theatre=sess_movieDetails.theatre;
						var movie=sess_movieDetails.movie;
						var str="BookInTown id: "+sh.unique(bookingNumber)+" ( "+amount+"/-)%nSeats: "+seats+"%nShow: "+date+", "+time+", "+theatre+", "+encodeURI(movie)+"";
						//BookInTown%20id:%2023451%20(%20115/-)%nSeats:%20a1,a2%nShow:%2011-11-16,%2011:30AM,%20paradise,%20Rock%20on
						console.log(str);
						sendsms(sess.mobile,str);
						if(sess.email != ''){
							emailer('Movie:'+sess.email,movie+" \n Theatre:"+sess_movieDetails.theatre+" \n Amount:"+amount+" \n Seats:"+seats+" \n Booking Id:"+sh.unique(sess_movieDetails.bookingId)+" \n Time:"+sess_movieDetails.time+" \n Date:"+date+" \n Number of seats: "+sess_movieDetails.noOfSeats+"\n"); 
						}
					}catch(err){
						console.log(err);
						console.log('error sending email');
					}												
					  console.log("true");
						res.render('response.ejs',{ 'restdata' : "true" ,'status':'success','paramlist' : temp,'ticketData':sess_movieDetails});
				 		  
				 }
				  
				});	
 
				
               
			  }else{
					console.log("false");
					res.render('response.ejs',{ 'restdata' : "false" ,'status':'Booking failure', 'paramlist' : temp,'ticketData':sess_movieDetails});
			  } 
        }else
        {
           console.log("false");
          res.render('response.ejs',{ 'restdata' : "false" ,'status':'Booking Details did not Match. Failure', 'paramlist' : temp,'ticketData':sess_movieDetails});
        };
//vidisha
  });
};




var addPaytmData = function(temp) {
	var mongoose = require("mongoose");

	//Database Section
	var username = process.env.DBUSER || "bookintown";
	var password = process.env.DBPASS || "bookintown!23";

	//mongoose.connect("mongodb://bookintown:bookintown!23@jello.modulusmongo.net:27017/ebu4vomE");
	mongoose.createConnection("mongodb://@localhost:27017/bookintown");


	//Models
	var Paytm = require('../../app/models/paytm');
	var paytm=new Paytm();
		paytm.mid=temp.MID
		paytm.orderid=temp.ORDERID
		paytm.txnamount=temp.TXNAMOUNT
		paytm.currency=temp.CURRENCY
		paytm.txnid=temp.TXNID
		paytm.banktxnid=temp.BANKTXNID
		paytm.status=temp.STATUS
		paytm.respcode=temp.RESPCODE
		paytm.respmsg=temp.RESPMSG
		paytm.txndate=temp.TXNDATE
		paytm.gatewayname=temp.GATEWAYNAME
		paytm.bankname=temp.BANKNAME
		paytm.paymentmode=temp.PAYMENTMODE
		paytm.bitbookingid=temp.BITBOOKINGID
		
		paytm.save(function(err) {
			console.log("In paytm save");
			if (err) {
				console.log("In paytm error");
			}else{
				console.log("In paytm successfuly saved");
			}
		});
		
	
}
var nodemailer = require('nodemailer');
function emailer(toemail,details){
	var nodemailer = require('nodemailer');
	
	var email='customerservice%40bookintown.com';
	var password='@Bookintown33';

	var mailsettings = 'smtp://' + email + ':' + password + '@us2.smtp.mailhostbox.com';
	var starter="Dear BIT Customer \nYour movie ticket is booked and confirmed using BookInTown!!!\n";
	var footer="Collect your movie ticket at the Theater e-ticket counter before 20 minutes of your show time, by showing this mail, msg received from BITAPP or screen shot of the booking confirmation.\nFor any technical assistance please write to customerservice@bookintown.com.\nOr call us at +91 8075220613.\nThanks for using BookInTown App!!! Have a pleasant day!!!\n"
    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport(mailsettings);

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: 'customerservice@bookintown.com', // sender address
        to: [toemail], // list of receivers
        subject: 'BookInTown Ticket', // Subject line
        text: starter+details+footer , // plaintext body
        
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
           console.log('email error: ' + error);
        }
       console.log('email sent: ' + info.response);

     
    });
	
}
function sendsms(number,message){
		
	       var user = "username=" + "amalpeetakandi@gmail.com";
               var hash = "&hash=" + "20544a009ea7101c3412f5df3179a3123cc7c41e";
               var sender = "&sender=" + "BITAPP";
			   var numbers = "&numbers=91" + number;
			   var message = "&message=" + message;
              
               var add=encodeURI(user + hash + sender+ numbers + message);


			var request = require('request');
			var url="http://api.textlocal.in/send/?"+add;
			console.log(url);
			request(url, function (error, response, body) {
			  if (!error && response.statusCode == 200) {
				console.log('sms response'+response.statusCode) // Show the HTML for the Google homepage.
				console.log(response) // Show the HTML for the Google homepage.
				//console.log(body) // Show the HTML for the Google homepage.
			  }else{
				  console.log('error sms');
			  }
			})	

	

}