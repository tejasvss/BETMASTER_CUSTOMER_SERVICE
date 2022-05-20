const mongoose=require('mongoose');

const customerWithdrawlSchema=new mongoose.Schema({

    customerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"customers"
    },
    withdrawlAmount:{
        type:Number
    },
    withdrawlTransactionType:{
        type:String
    },
    withdrawlTransactionTypeImage:{
        type:String
    },
    withdrawlTransactionTime:{
        type:String,
        default:"2-3 working days"
    },
    withdrawlId:{
        type:String,
        unqiue:true,
        sparse:true,
        index:true
    },
    withdrawlTransactionStatus:{
        type:String,
        default:"pending"
    },
    withdrawlTransactionNumber:{
        type:String,
        default:"-"
    },
    withdrawlImageProof:{
        type:String
    },
    withdrawlApprovedOrRejectedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"admins"
    },
    withdrawlApprovedOrRejectedAt:{
        type:Date
    },
    withdrawlMobileNumber:{
        type:Number
    },
    withdrawlCountryCode:{
        type:Number
    },
    withdrawlRequestorBankAccountHolderName:{
        type:String
    },
    withdrawlRequestorBankAccountNumber:{
        type:String
    },
    withdrawlRequestorEmail:{
        type:String
    },
    withdrawlRequestorBankSwiftcode:{
        type:String
    },
    withdrawlRequestorBankName:{
        type:String
    }
},{timestamps:true,versionKey:false});

const CustomerWithdrawls=new mongoose.model("customer_withdrawls",customerWithdrawlSchema);

module.exports=CustomerWithdrawls;