const nodemailer=require('nodemailer');
const emailConfig=require('../../constants/emailConstants.json');


exports.sendEmailOtp=async(email,subject,emailOtp)=>{
console.log("Inemail",emailOtp);
   
   var transporter = nodemailer.createTransport({
       host: emailConfig.host,
       port: emailConfig.port,
       secure: true, // true for 465, false for other ports
       auth: {
         user: emailConfig.username, // your domain email address
         pass: emailConfig.password // your password
       }
     });
   
   
   var mailOptions = {
     from: emailConfig.senderEmail,
     to: email,
     subject: subject,
     html:`<html>
     <body>
     
     <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
       <div style="margin:50px auto;width:70%;padding:20px 0">
         <div style="border-bottom:1px solid #eee">
           <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">
           <img src="https://betmaster-pictures.s3.ap-northeast-2.amazonaws.com/Logo.png" style="width:8rem" alt="logo"/>
           </a>
         </div>
         <p style="font-size:1.1em">Hi,</p>
         <p>Thank you for choosing BetMaster. Use the following OTP to complete new email updation procedure. OTP is valid for 5 minutes</p>
         <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${emailOtp}</h2>
         <p style="font-size:0.9em;">Regards,<br />BETMASTER Team</p>
         <hr style="border:none;border-top:1px solid #eee" />
         <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
         
         </div>
       </div>
     </div>
     
     </body>
     </html>`
   };
   
   //Function to sending Emails 
    await transporter.sendMail(mailOptions);
     
}
 