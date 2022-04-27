const mongoose=require('mongoose');
Schema = mongoose.Schema;

const reportsSchema=new mongoose.Schema({

    customerId:{
        type:String,
        ref:'customers'   
     },
    reportId:{
        type:String,
        unqiue:true,
        index:true,
        sparse:true
    },
    complaint:{
        type:String
    },
    reply:{
        type:String
    },
    repliedBy:{
        type:Schema.Types.ObjectId,
        ref:"Admins"
    },
    repliedAt:{
        type:Date
    },
    reportStatus:{
        type:String,
        default:"Pending"
    },
    isEditable:{
        type:Boolean,
        default:true
    },
    isReplied:{
        type:Boolean,
        default:false
    }
},{timestanps:true,versionKey:false});

const CustomerReports=new mongoose.model("customer_reports",reportsSchema);

module.exports=CustomerReports;