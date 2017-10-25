var request = require('request');
var checksum = require('../../model/checksum');
var config = require('../../config/config');
var index = require('../../index');
var session = require('express-session');
module.exports = function (app) {
app.use(session({ secret: 'secretBIT', cookie: { maxAge: 1200000 }}))
 app.get('/testtxn', function(req,res){
	var sess = req.session;
	
     url = 'http://35.154.28.117:3000/api/blocking/'+req.param("id");
    request(url, function(error, response, html){
		console.log(response.body);
		console.log(config);
		console.log('dddddddddddddddddddddddddddd');
		sess.bookingId=req.param("id");
		sess.seats=req.param("seat");
		var seats=req.param("seat");
		var noOfSeats=seats.split(',').length;
		var movieDetails=JSON.parse(response.body);
		movieDetails.noOfSeats=noOfSeats;
		movieDetails.bookingId=req.param("id");
		movieDetails.seats=seats;
		sess.movieDetails=movieDetails;
		res.render('testtxn.ejs',{'config' : config,'movieDetails':movieDetails});
	});
	

	
	
  });



  app.post('/testtxn',function(req, res) {
        console.log("POST Order start");

       var sess = req.session;
		var paramlist = req.body;
        var paramarray = new Array();
			var d = new Date();
			var n = Math.random()*100000000000000000;
			console.log('randommmmm---------------------------------------------------mmmmmmmmmmmmmmmm',n);
			
			//paramarray['MID']=config.MID;
			//paramarray['PAYTM_MERCHANT_KEY']=config.PAYTM_MERCHANT_KEY;
			//paramarray['WEBSITE']=config.WEBSITE;
			//paramarray['CHANNEL_ID']=config.CHANNEL_ID;
			//paramarray['INDUSTRY_TYPE_ID']=config.CHANNEL_ID;
			//paramarray['TXN_AMOUNT']=1.00;
        sess.name=paramlist.name;
        sess.mobile=paramlist.mobile;
        sess.email=paramlist.email;
		
        console.log('ppppppppppppppppppppppppppppppppppppppppppp');
		console.log(paramlist);
        for (name in paramlist)
        {
          if (name == 'PAYTM_MERCHANT_KEY') {
               var PAYTM_MERCHANT_KEY = paramlist[name] ; 
            }else if (!(name == 'name' ||name == 'mobile'||name == 'email')){
				paramarray[name] = paramlist[name] ;
            }
        }
		paramarray['CUST_ID']=n+'bbb';
		paramarray['ORDER_ID']=n+'';
        console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
        console.log(paramarray);
		
        console.log('rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');
       paramarray['CALLBACK_URL'] = 'http://35.154.28.117:3000/response';   // in case if you want to send callback
        
        checksum.genchecksum(paramarray, PAYTM_MERCHANT_KEY, function (err, result) 
        {
              console.log(result);
           res.render('pgredirect.ejs',{ 'restdata' : result });
});





 });
//vidisha
};
