const twilio = require('twilio');
const appsConfig=require('../../constants/appConstants.json');
const accountSid =appsConfig.TWILIO_ACCOUNT_SID ;
const authToken = appsConfig.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

 
const sendMobileOtp= async(message,countryCode,mobileNumber)=>{

// let status;

 await client.messages
  .create({
    body:  message,
    from: appsConfig.TWILIO_NUMBER,
    to: `+${countryCode}${mobileNumber}`})
  // }).then((data)=>{
    
  //              if(data.length != 0){
  //               status = 200;
  //              }
  //           })
  // .catch(err=>{
  //               status= err.status;
  //               console.log(err)
  //             })

  //             if(status == 200){
  //               return status;
  //             }
  //             else{
  //               return status;
  //             }
  
} 

module.exports=sendMobileOtp;

