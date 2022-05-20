const Customer=require('../../models/customer/customer');
const ReferralCode=require('../../models/customer/referralCode');
const emailUtils=require('../../utils/emailer/emailUtils');
const generateOtp=require('../../utils/otpUtils/generateOtp');
const generateOtpExpiryTime=require('../../utils/otpUtils/generateOtpExpiryTime');
const generateId=require('../../utils/helpers/generateId');
const jwt=require('jsonwebtoken');
const appsConfig=require('../../constants/appConstants.json');
const bcrypt=require('bcryptjs');
const sendMobileOtp=require('../../utils/mobileSms/sendMobileOtp');
const otpExpiryTime = require('../../utils/otpUtils/generateOtpExpiryTime');
const { UserBindingContext } = require('twilio/lib/rest/chat/v2/service/user/userBinding');
const CustomerErrorLog=require('../../models/customer/customer');

/*---------------------------ReferralCode_Validation-------------------*/
exports.checkReferralCode=async(req,res)=>{
  
    try{
 
        if(!req.body.referralCode)
        {
            return res.status(400).send({status:400,Message:"Required referralCodes cannot be empty"})
        }

        const referral=await ReferralCode.findOne({referralCode:req.body.referralCode});
        if(!referral)
        {
           return res.status(400).send({status:400,Message:"Your entered referral code is invalid",isReferralValid:false})
        }
        else if (referral)
        {
            return res.status(200).send({status:200,Message:"Referral code validation success",isReferralValid:true})
        }
    }
    catch(error)
    {
        res.status(500).send({status:500,Message:error.message || "Something went wrong.Try again"})
    }

}


/*---------------------------Username_Validation-------------------*/
exports.checkUsername=async(req,res)=>{

    try{
  
        if(!req.body.username)
        {
            return res.status(400).send({status:400,Message:"Required userId cannot be empty"})
        }

        const checkUser=await Customer.findOne({username:req.body.username});

        if(checkUser)
        {
            return res.status(400).send({status:400,Message:"User name is already taken",isUsernameAvailable:false})
        }
        else if(!checkUser)
        {
            return res.status(200).send({status:200,Message:"User name is available",isUsernameAvailable:true})
        }
    }
    catch(error)
    {
        res.status(500).send({status:500,Message:error.message || "Something went wrong.Try again"})
    }
}


/*------------------Updating_Bank_Details-------------------*/
exports.checkAndUpdateBankNumber=async(req,res)=>{

    try{

        if(!req.body.userBankName || !req.body.userBankAccountNumber || !req.body.userBankAccountHolderName)
        {
            return res.status(400).send({status:400,Message:"Required bank fields cannot be empty"})
        }

        const checkBankNumber=await Customer.findOne({userBankAccountNumber:req.body.userBankAccountNumber});

        if(checkBankNumber && checkBankNumber.customerId != req.customerId)
        {
            return res.status(400).send({status:400,Message:"Your entered bank number is already taken"})
        }
        else if(!checkBankNumber || checkBankNumber.customerId == req.customerId)
        {
            const bankData=await Customer.findOneAndUpdate({customerId:req.customerId},{$set:{userBankAccountNumber:req.body.userBankAccountNumber,userBankName:req.body.userBankName,userBankAccountHolderName:req.body.userBankAccountHolderName,isBankDetailsUpdated:true,bankDetailsUpdatedAt:Date.now()}},{new:true,upsert:true});

             return res.status(200).send({status:200,Message:"Bank details updated successfully",Data:bankData})
        }
    }
    catch(error)
    {
        res.status(500).send({status:500,Message:error.message || "Something went wrong.Try again"})
    }
}



/*--------------Validating_Email_And_Sending_otp---------------*/
exports.checkEmailAndSendOtp=async(req,res)=>{

    try{
          
        if(!req.body.email)
        {
            return res.status(400).send({status:400,Message:"Required email fields cannot be empty"})
        }

        const checkEmail=await Customer.findOne({email:req.body.email})
        if(checkEmail)
        {
            return res.status(400).send({status:400,Message:"Your entered email is already taken",isEmailOtpSent:false});
        }

        else if(!checkEmail)
        {
            const emailOtp=await generateOtp(6);
            const emailOtpExpiryTime=await generateOtpExpiryTime(5);
            const subject="Registration of account";
            const text="Use the following OTP for verifying email and registration process"

            await emailUtils.sendEmailOtp(req.body.email,subject,text,emailOtp).then(async(success)=>{

               const emailData= await Customer.create({emailOtp:emailOtp,emailOtpExpiryTime:emailOtpExpiryTime});

               return res.status(200).send({status:200,Message:"Email otp sent successfully",_id:emailData._id,isEmailOtpSent:true})
            })
            .catch(err=>{

                return res.status(400).send({status:400,Message:err.message || "No email or recipients found",isEmailOtpSent:false})
            })
        }
    }
    catch(error)
    {
        res.status(500).send({status:500,Message:error.message || "Something went wrong.Try again"})
    }
}



/*--------------------Validating_Email_Otp_With_ExpiryTimes------------------*/
exports.verifyEmailOtpAndCreateUser=async(req,res)=>{

    try{
        
        if(!req.body._id || !req.body.email || !req.body.emailOtp || !req.body.username || !req.body.referralCode || !req.body.nickname || !req.body.password)
        {
            return res.status(400).send({status:400,Message:"Required fields are missing"})
        }

        const checkEmailOtp=await Customer.findOne({_id:req.body._id,emailOtp:req.body.emailOtp});
        if(!checkEmailOtp)
        {
            return res.status(400).send({status:400,Message:"Your entered emailOtp is invalid"})
        }

        else if(checkEmailOtp && Date.now()>checkEmailOtp.emailOtpExpiryTime)
        {
            return res.status(400).send({status:400,Message:"Your entered otp is expired"})
        }
        else if(checkEmailOtp && Date.now()<checkEmailOtp.emailOtpExpiryTime)
        {
            const customerId=await generateId("customerid",8);
            const customerData=await Customer.findOneAndUpdate({_id:req.body._id},
                                    
                            { customerId:customerId,
                             email:req.body.email,
                             username:req.body.username,
                             nickname:req.body.nickname,
                             referralCode:req.body.referralCode,
                             isEmailVerified:true,
                             password:await bcrypt.hash(req.body.password,8),
                             lastLoginTime:Date.now(),
                            },{new:true});
                            
               /*-------------TOKEN_GENERATION------------------*/             
            const token= jwt.sign({_id:customerData._id,customerId:customerData.customerId,role:customerData.role},appsConfig.JWT_SECRET_ACCESS_KEY);
            customerData.token=token;

            return res.status(200).send({status:200,Message:"Otp validated successfully",Data:customerData})
        }
    }
    catch(error)
    {
        res.status(500).send({status:500,Message:error.message || "Something went wrong.Try again"})
    }
}



/*----------------------CheckMobileNumber-------------------------*/
exports.checkMobileNumber=async(req,res)=>{
    try{
 
        if(!req.body.mobileNumber || !req.body.countryCode)
        {
            return res.status(400).send({status:400,Message:"Required mobileNumber,countryCode fields cannot be empty"})
        }

        const checkMobileNumber=await Customer.findOne({countryCode:req.body.countryCode,mobileNumber:req.body.mobileNumber});

         if(!checkMobileNumber)
        {
            const mobileOtp=await generateOtp(6);
            const mobileOtpExpiryTime=await otpExpiryTime(5);
            const message=`Your one-time-password is ${mobileOtp}.Otp is valid for 5 minutes only.From Betmaster`;

            await sendMobileOtp(message,req.body.countryCode,req.body.mobileNumber).then(async(data)=>{

                await Customer.findOneAndUpdate({customerId:req.customerId},{$set:{mobileOtp:mobileOtp,mobileOtpExpiryTime:mobileOtpExpiryTime}},{new:true});

                return res.status(200).send({status:200,Message:"Otp sent to mobileNumber",isMobileOtpSent:true})
            }).
            catch(err=>{

                return res.status(400).send({status:400,Message:err.message || "Recipients not found",isMobileOtpSent:false})
            })
        }  

        else if(checkMobileNumber && checkMobileNumber.customerId != req.customerId)
        {
            return res.status(400).send({status:400,Message:"Your entered mobilenumber is already taken",isMobileOtpSent:false})
        }
        else if(checkMobileNumber && checkMobileNumber.customerId == req.customerId)
        {
            return res.status(400).send({status:400,Message:"Your new mobile number cannot same as your old mobilenumber",isMobileOtpSent:false})
        }
          
    }
    catch(error)
    {
        res.status(500).send({status:500,Message:error.message || "something went wrong.Try again"})
    }
}


/*-----------------------------Verify_Mobile_Number----------------------------------*/
exports.verifyMobileOtp=async(req,res)=>{

    try{

        if(!req.body.mobileOtp || !req.body.mobileNumber || !req.body.countryCode)
        {
            return res.status(400).send({status:400,Message:"Required mobileOtp,mobileNumber fields cannot be empty"})
        }

        const payload={...req.body};

        console.log("VerifyMobileOtp API Payload",payload);

        const checkMobileOtp=await Customer.findOne({customerId:req.customerId,mobileOtp:req.body.mobileOtp});
        if(!checkMobileOtp)
        {
            //Creating Error log
            // await CustomerErrorLog.create({customerId:req.id,error:"Entered mobileotp is invalid"});
            return res.status(400).send({status:400,Message:"Your entered mobileOtp is invalid",isMobileOtpValid:false})
        }
        else if(checkMobileOtp && Date.now() > checkMobileOtp.mobileOtpExpiryTime)
        {
            //Creating Error log
            // await CustomerErrorLog.create({customerId:req.id,error:"Entered mobileotp is expired"});
            return res.status(400).send({status:400,Messae:"Your entered mobileOtp is expired",isMobileOtpValid:false});
        }
        else if(checkMobileOtp && Date.now() < checkMobileOtp.mobileOtpExpiryTime)
        {

            const mobileData=await Customer.findOneAndUpdate({customerId:req.customerId},{$set:{isMobileNumberVerified:true,mobileNumber:req.body.mobileNumber,countryCode:req.body.countryCode}},{new:true})
            return res.status(200).send({status:200,Message:"Your entered mobile otp is verified successfully",isMobileOtpValid:true,Data:mobileData})
        }
    }
    catch(error)
    {
        res.status(500).send({status:500,Message:error.message || "Something went wrong.Try again"})
    }
}

/*--------------------------------FORGOT_PASSWORD_API-----------------------------------*/
exports.forgotPassword=async(req,res)=>{

    try{

        if(!req.body.email)
        {
            return res.status(400).send({status:400,Message:"Required email fields cannot be empty"})
        }

        const checkEmail=await Customer.findOne({email:req.body.email});

        if(!checkEmail)
        {
            return res.status(400).send({status:400,Message:"Your entered email doesn't have any account",isEmailOtpSent:false})
        }

        else if (checkEmail)
        {
            const emailOtp=await generateOtp(6);
            const emailOtpExpiryTime=await generateOtpExpiryTime(5);
            const subject="Account recovery";
            const text="Use the following OTP for verifying email to change the password"

            await emailUtils.sendEmailOtp(req.body.email,subject,text,emailOtp).then(async(success)=>{

               await Customer.findOneAndUpdate({customerId:checkEmail.customerId},{$set:{emailOtp:emailOtp,emailOtpExpiryTime:emailOtpExpiryTime}});

               return res.status(200).send({status:200,Message:"Email otp sent successfully",customerId:checkEmail.customerId,isEmailOtpSent:true})
            })
            .catch(err=>{

                return res.status(400).send({status:400,Message:err.message || "No email or recipients found",isEmailOtpSent:false})
            })
        }
    }
    catch(error)
    {
        res.status(500).send({status:500,Message:error.message || "Something went wrong.Try again"})

    }
}

/*----------------Verify_Forgot_password_Email_Otp_API------------*/
exports.verifyForgotOtpAndUpdatePassword=async(req,res)=>{

    try{
     
        if(!req.body.customerId || !req.body.emailOtp || !req.body.password)
        {
            return res.status(400).send({status:400,Message:"Required emailotp,customerId fields cannot be empty"})
        }

        const checkOtp=await Customer.findOne({customerId:req.body.customerId,emailOtp:req.body.emailOtp});

        if(!checkOtp)
        {
            //Creating Error log
            // await CustomerErrorLog.create({customerId:req.id,error:"Entered emailotp is invalid"});
            return res.status(400).send({status:400,Message:"Your entered emailotp is invalid",isEmailOtpValid:false})
        }
        else if(checkOtp && Date.now() > checkOtp.emailOtpExpiryTime)
        {
            //Creating Error log
            // await CustomerErrorLog.create({customerId:req.id,error:"Entered emailotp is expired"});
            return res.status(400).send({status:400,Message:"Your entered emailotp is expired",isEmailOtpValid:false})
        }
        else if(checkOtp && Date.now() < checkOtp.emailOtpExpiryTime)
        {
            const password=await bcrypt.hash(req.body.password,8);
            await Customer.findOneAndUpdate({customerId:req.body.customerId},{$set:{password:password}});
            return res.status(200).send({status:200,Message:"Otp verified and password changed successfully",isEmailOtpValid:true});
        }
    }
    catch(error)
    {
        res.status(500).send({status:500,Message:error.message || "Something went wrong.Try again"})
    }
}


//For testing

exports.updateAll=async(req,res)=>{

    await Customer.updateMany({},{$set:{
    "note":"Note is not yet added"}},{upsert:true});

    res.status(200).send({status:200})
}
