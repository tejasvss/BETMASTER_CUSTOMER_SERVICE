const mongoose=require('mongoose');
Schema = mongoose.Schema;

const referralSchema=new mongoose.Schema({

   referralCode:{
       type:String,
       unique:true,
       index:true,
       sparse:true
   }
},{timestanps:true,versionKey:false});

const ReferralCode=new mongoose.model("referralcodes",referralSchema);

module.exports=ReferralCode;