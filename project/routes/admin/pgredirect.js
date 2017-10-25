var checksum = require('../../model/checksum');
var config = require('../../config/config');
module.exports = function (app) {
	
	app.post('/pgredirect', function(req,res){
		   console.log("in pgdirect");
		res.render('pgredirect.ejs',{'config' : config});
	});
};
//vidisha