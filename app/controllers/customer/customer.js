const Customer=require('../../models/customer/customer');


exports.checkReferralCode=async(req,res)=>{
  
    try{
 
        if(!req.body.referralCode)
        {
            return res.status(400).send({status:400,Message:"Required referralCodes cannot be empty"})
        }

        const referral=await Customer.findOne({referralCode:req.body.referralCode});
        if(!referralData)
        {
           return res.status(400).send({status:400,Message:"Your entered referral code is invalid",isReferralValid:false})
        }
        else if (referralData)
        {
            return res.status(200).send({status:200,Message:"Referral code validation success",isReferralValid:true})
        }
    }
    catch(error)
    {
        res.status(500).send({status:500,Message:error.message || "Something went wrong.Try again"})
    }

}


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
            const bankData=await Customer.findOneAndUpdate({_id:req.id},{$set:{userBankName:req.body.userBankName,userBankAccountHolderName:req.body.userBankAccountHolderName}},{new:true});

             return res.status(200).send({status:200,Message:"Bank details updated successfully"})
        }
    }
    catch(error)
    {
        res.status(500).send({status:500,Message:error.message || "Something went wrong.Try again"})
    }
}