const mongoose=require('mongoose');
Schema = mongoose.Schema;
const Admin=require('../superadmin/superadminModel');

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
        type:mongoose.Schema.Types.ObjectId,
        ref:"Admin"
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
},{timestamps:true,versionKey:false,strict:false});

const CustomerReports=new mongoose.model("customer_reports",reportsSchema);

module.exports=CustomerReports;