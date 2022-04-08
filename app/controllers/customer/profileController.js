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

        await Customer.findOneAndUpdate({customerId:req.customerId},{$unset:{token:req.user.token}},{new:true});

        return res.status(200).send({status:200,Message:"Logout successfully",isLoggedOut:true})

    }
    catch(error)
    {
        res.status(500).send({status:500,Message:error.message || "Something went wrong.Try again",isLoggedOut:false})
    }
}