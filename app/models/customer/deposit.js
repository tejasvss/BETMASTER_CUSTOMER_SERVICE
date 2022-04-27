const mongoose=require('mongoose');

const customerDepositSchema=new mongoose.Schema({

    customerId:{
        type:String
    },
    depositAmount:{
        type:Number
    },
    depositTransactionType:{
        type:String
    },
    depositTransactionTypeImage:{
        type:String
    },
    depositId:{
        type:String,
        unqiue:true,
        sparse:true,
        index:true
    },
    depositTransactionStatus:{
        type:String,
        default:"pending"
    },
    depositTransactionNumber:{
        type:String,
        unique:true,
        sparse:true,
        index:true
    },
    customerDepositProof:{
        type:String
    },
    depositApprovedOrRejectedBy:{
        type:String
    },
    depositApprovedOrRejectedAt:{
        type:Date
    },
    depositorMobileNumber:{
        type:Number
    },
    depositorCountryCode:{
        type:Number
    },
    depositorBankAccountHolderName:{
        type:String
    },
    depositorBankAccountNumber:{
        type:String
    },
    depositorEmail:{
        type:String
    }
},{timestamps:true,versionKey:false});

const CustomerDeposits=new mongoose.model("customer_deposits",customerDepositSchema);

module.exports=CustomerDeposits;