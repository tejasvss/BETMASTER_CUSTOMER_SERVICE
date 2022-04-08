const Customer=require('../../models/customer/customer');
const ReferralCode=require('../../models/customer/referralCode');
const emailUtils=require('../../utils/emailer/emailUtils');
const generateOtp=require('../../utils/otpUtils/generateOtp');
const generateOtpExpiryTime=require('../../utils/otpUtils/generateOtpExpiryTime');
const generateId=require('../../utils/helpers/generateId');
const jwt=require('jsonwebtoken');
const appsConfig=require('../../constants/appConstants.json');
const bcrypt=require('bcryptjs')


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
            return res.status(400).send({status:400,Message:"User name is available",isUsernameAvailable:true})
        }
    }
    catch(error)
    {
        res.status(400).send({status:400,Message:error.message || "Something went wrong.Try again"})
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
            const bankData=await Customer.findOneAndUpdate({customerId:req.customerId},{$set:{customerStatusId:2,userBankAccountNumber:req.body.userBankAccountNumber,userBankName:req.body.userBankName,userBankAccountHolderName:req.body.userBankAccountHolderName,isBankDetailsUpdated:true}},{new:true});

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
            const subject="Registration of account"

            await emailUtils.sendEmailOtp(req.body.email,subject,emailOtp).then(async(success)=>{

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
                             customerStatusId:1
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
exports.checkMobileNumer=async(req,res)=>{
    try{
 
        if(!req.body.mobileNumber || !req.body.countryCode)
        {
            return res.status(400).send({status:400,Message:"Required mobileNumber,countryCode fields cannot be empty"})
        }

        const checkMobileNumber=await Customer.findOne({countryCode:req.body.countryCode,mobileNumber:req.body.mobileNumber});

        if(checkMobileNumber && checkMobileNumber.customerId != req.customerId)
        {
            return res.status(400).send({status:400,Message:"Your entered mobilenumber is already taken"})
        }
        else if(checkMobileNumber || checkMobileNumber.customerId == req.customerId)
        {
            return res.status(400).send({status:400,Message:"Your new mobile number cannot same as your old mobilenumber"})
        }
        else if(!checkMobileNumber)
        {
            return res.status(200).send({status:200,Message:"Otp sent to mobileNumber"})
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

        const checkMobileOtp=await Customer.findOne({customerId:req.customerId,mobileOtp:req.body.mobileOtp});
        if(!checkMobileOtp)
        {
            return res.status(400).send({status:400,Message:"Your entered mobileOtp is invalid",isMobileOtpValid:false})
        }
        else if(checkMobileOtp && Date.now() > checkMobileOtp.mobileOtpExpiryTime)
        {
            return res.status(400).send({status:400,Messae:"Your entered mobileOtp is expired",isMobileOtpValid:false});
        }
        else if(checkMobileOtp && Date.now() < checkMobileOtp.mobileOtpExpiryTime)
        {

            const mobileData=await Customer.findOneAndUpdate({customerId:req.customerId},{$set:{customerStatusId:3,isMobileVerified:true,mobileNumber:req.body.mobileNumber,countryCode:req.body.countryCode}},{new:true})
            return res.status(400).send({status:400,Message:"Your entered mobile otp is verified successfully",isMobileOtpValid:true})
        }
    }
    catch(error)
    {
        res.status(500).send({status:500,Message:error.message || "Something went wrong.Try again"})
    }
}