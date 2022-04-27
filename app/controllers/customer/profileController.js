const Customer=require('../../models/customer/customer');
const ReferralCode=require('../../models/customer/referralCode');
const emailUtils=require('../../utils/emailer/emailUtils');
const generateOtp=require('../../utils/otpUtils/generateOtp');
const generateOtpExpiryTime=require('../../utils/otpUtils/generateOtpExpiryTime');
const generateId=require('../../utils/helpers/generateId');
const jwt=require('jsonwebtoken');
const appsConfig=require('../../constants/appConstants.json');
const bcrypt=require('bcryptjs');
const { response } = require('express');


/*----------------------Customer_Login------------------------*/
exports.customerLogin=async(req,res)=>{

    try{
         
        if(!req.body.usernameOrEmail || !req.body.password)
        {
            return res.status(400).send({status:400,Message:"Required input fields cannot be empty"})
        }

        const checkUser=await Customer.findOne({$or:[{email:req.body.usernameOrEmail},{username:req.body.usernameOrEmail}]});
        if(!checkUser)
        {
            return res.status(400).send({status:400,Message:"Your entered email or username is not found"})
        }
        else if(checkUser)
        {
            const checkPassword=await bcrypt.compare(req.body.password,checkUser.password);

            if(!checkPassword)
            {
                return res.status(400).send({status:400,Message:"Your entered password is incorrect"})
            }

            else if(checkPassword && checkUser.customerStatusId == 4)
            {
                return res.status(400).send({status:400,Message:"Your account is blocked.Please contact support team"})
            }
            else if(checkPassword && checkPassword.customerStatusId !=4)
            {
                const token= jwt.sign({_id:checkUser._id,customerId:checkUser.customerId,role:checkUser.role},appsConfig.JWT_SECRET_ACCESS_KEY);
                checkUser.lastLogintime=Date.now();
                checkUser.isLoggedIn=true;
                await checkUser.save();
                checkUser.token=token;

                /*--------------TOKEN_GENERATION------------------------*/
                return res.status(200).send({status:200,Message:"Login success",Data:checkUser})
            }
        }
    }
    catch(error)
    {
        res.status(400).send({status:400,Message:error.message || "Something went wrong.Try again"})
    }
}



/*------------------------------GET_CUSTOMER_PROFILE--------------------*/
exports.getCustomerProfile=async(req,res)=>{

    try{
         
        const customerData=await Customer.findOne({customerId:req.customerId});

        return res.status(200).send({status:200,Message:"Fetched customerData successfully",Data:customerData})
    }
    catch(error)
    {
        res.status(500).send({status:500,Message:error.message || "Something went wrong.Try again"})
    }
}


/*-------------------------LOGOUT_MODULE------------------------------*/
exports.customerLogout=async(req,res)=>{

    try{

        await Customer.findOneAndUpdate({customerId:req.customerId},{$set:{isLoggedIn:false},$unset:{token:req.user.token}},{new:true});

        return res.status(200).send({status:200,Message:"Logout successfully"})
    }
    catch(error)
    {
        res.status(500).send({status:500,Message:error.message || "Something went wrong.Try again"})
    }
}


/*----------------------Change_email_Api------------------------*/
exports.changeEmail=async(req,res)=>{

    try{

        if(!req.body.email)
        {
            return res.status(400).send({status:400,Message:"Required email fields cannot be empty"})
        }

        const checkEmail=await Customer.findOne({email:req.body.email});
        if(checkEmail && checkEmail.customerId == req.customerId)
        {
            return res.status(400).send({status:400,Message:"Your new email cannot be same as your old email"})
        }
        else if(checkEmail && checkEmail.customerId != req.customerId)
        {
            return res.status(400).send({status:400,Message:"Your entered email is already taken",isEmailOtpSent:false})
        }
        else if(!checkEmail)
        {
            const emailOtp=await generateOtp(6);
            const emailOtpExpiryTime=await generateOtpExpiryTime(5);
            const subject="Request for changing new email";
            const text="Use the following OTP for verifying email to update new email"

            await emailUtils.sendEmailOtp(req.body.email,subject,text,emailOtp).then(async(success)=>{

               await Customer.findOneAndUpdate({customerId:req.customerId},{$set:{emailOtp:emailOtp,emailOtpExpiryTime:emailOtpExpiryTime}});

               return res.status(200).send({status:200,Message:"Email otp sent successfully",isEmailOtpSent:true})
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

/*-----------------------Verify_Email_Otp--------------------------*/
exports.verifyEmailOtp=async(req,res)=>{

    try{
    
        if(!req.body.email || !req.body.emailOtp)
        {
            return res.status(400).send({status:400,Message:"Required email and emailOtp fields cannot be empty"})
        }

        const checkEmailOtp=await Customer.findOne({emailOtp:req.body.emailOtp,customerId:req.customerId});
        if(!checkEmailOtp)
        {
            return res.status(400).send({status:400,Message:"Your entered email otp is invalid",isOtpValid:false})
        }
        else if(checkEmailOtp && Date.now() > checkEmailOtp.emailOtpExpiryTime)
        {
            return res.status(400).send({status:400,Message:"Your entered email otp is expired",isOtpValid:false})
        }
        else if(checkEmailOtp && Date.now() < checkEmailOtp.emailOtpExpiryTime)
        {
            const emailData=await Customer.findOneAndUpdate({customerId:req.customerId},{$set:{email:req.body.email}},{new:true});

            return res.status(200).send({status:200,Message:"Otp verified and email updated successfully",Data:emailData})
        }
    }
    catch(error)
    {
        res.status(500).send({status:500,Message:error.message || "Something went wrong.Try again"})
    }
}