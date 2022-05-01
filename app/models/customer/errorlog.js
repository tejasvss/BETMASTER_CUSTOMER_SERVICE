const mongoose=require('mongoose');
Schema = mongoose.Schema;

const errorLogSchema=new mongoose.Schema({

    error:{
        type:String
    },
    customerId:{
        type:Schema.Types.ObjectId,
        ref:"Customer"
     },
    device:{
        type:String
    },
    ip:{
        type:String
    },
    username:{
        type:String
    },
    nickname:{
        type:String
    }
},{timestamps:true,versionKey:false});

const CustomerErrorLog=new mongoose.model("customer_error_logs",errorLogSchema);

module.exports=CustomerErrorLog;