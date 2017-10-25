 'use strict';

var PAYTM_STAG_URL = 'https://pguat.paytm.com';
var PAYTM_PROD_URL = 'https://secure.paytm.in';

var PAYTM_ENVIORMENT = 'PROD';   // PROD FOR PRODUCTION
//var PAYTM_ENVIORMENT = 'TEST';  
//var WEBSITE = 'Spacetechwap';
var WEBSITE ='';
 var PAYTM_MERCHANT_KEY ='';
var CHANNEL_ID =  'WEB';
var INDUSTRY_TYPE_ID = 'Retail109';
var PAYTM_FINAL_URL = '';
var MID ='';
if (PAYTM_ENVIORMENT== 'TEST') {
 WEBSITE = 'Spacetechweb';
 MID = 'SpaceT95533492083263';
 PAYTM_FINAL_URL = PAYTM_STAG_URL + '/oltp-web/processTransaction',
 PAYTM_MERCHANT_KEY = '!0p%byig8urEZ0LE';

}else{ 
  PAYTM_MERCHANT_KEY = 'T4u2WaWtoRrsCEEW';
  WEBSITE = 'TechSpacetechweb';
  MID = 'Spacet85183500948045';
  PAYTM_FINAL_URL = PAYTM_PROD_URL + '/oltp-web/processTransaction'
}

module.exports = {

    MID: MID,
    PAYTM_MERCHANT_KEY :PAYTM_MERCHANT_KEY,
    PAYTM_FINAL_URL :PAYTM_FINAL_URL,
    WEBSITE: WEBSITE,
    CHANNEL_ID: CHANNEL_ID,
    INDUSTRY_TYPE_ID: INDUSTRY_TYPE_ID

};
