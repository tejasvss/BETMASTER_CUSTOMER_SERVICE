const mongoose=require('mongoose');
Schema = mongoose.Schema;

const reportsSchema=new mongoose.Schema({

    customerId:{
        type:Schema.Types.ObjectId,
        ref:'customers'   
     },
    reportId:{
        type:String,
        unqiue:true,
        index:true,
        sparse:true
    },
    complaint:{
        type:string
    },
    reply:{
        type:String
    },
    repliedBy:{
        type:Schema.Types.ObjectId,
    },
    reportStatus:{
        type:String,
        default:"Pending"
    },
    isEditable:{
        type:Boolean,
        default:false
    }
},{timestanps:true,versionKey:false});

const UserReports=new mongoose.model("customer_reports",reportsSchema);

module.exports=UserReports;