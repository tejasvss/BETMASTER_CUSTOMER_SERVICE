const ReferralCode=require('../../models/customer/referralCode');

/*---------SAMPLE_REFERRALCODES_API-------------*/

exports.createReferral=async(req,res)=>{

    const referralData=await ReferralCode.create({referralCode:req.body.referralCode});
    return res.status(200).send({status:200,Message:"Referral code generated successfully",Data:referralData})
}


