const CustomerReports = require('../../models/customer/reports');
const CustomeReports=require('../../models/customer/reports');
const generateId=require('../../utils/helpers/generateId');
const paginationUtility=require('../../utils/appUtils/paginationUtility');




/*-------------------------Create_Report---------------------------*/
exports.createReport=async(req,res)=>{

    try{
     
        if(!req.body.complaint )
        {
            return res.status(400).send({status:400,Message:"Required complaint fields cannot be empty"})
        }

        const reportId=await generateId("reportid",6);

        const reportData=await CustomerReports.create({complaint:req.body.complaint,reportId:reportId,customerId:req.customerId});

        return res.status(200).send({status:200,Message:"Report submitted successfully",Data:reportData})

    }
    catch(error)
    {
        res.status(500).send({status:500,Message:error.message || "Something went wrong.Try again"})
    }
}


/*----------------------------Edit_Customer_Report--------------------------------*/
exports.editCustomerReport=async(req,res)=>{

    try{

        if(!req.body.reportId || !req.body.complaint)
        {
            return res.status(400).send({status:400,Message:"Required reportId ,complaint fields cannot be empty"})
        }

        const updatedReportData=await CustomerReports.findOne({reportId:req.body.reportId,customerId:req.customerId});

        if(!updatedReportData)
        {
            return res.status(400).send({status:400,Message:"your entered reportId is invalid"})
        }

        else if(updatedReportData && updatedReportData.isEditable==false )
        {
             
            return res.status(400).send({status:400,Message:"You cannot edit this reportId"})
        }

        else if(updatedReportData && updatedReportData.isEditable == true)
        {
           
            await CustomerReports.findOneAndUpdate({reportId:req.body.reportId},{$set:{complaint:req.body.complaint}},{new:true}).then(newData=>{

                return res.status(200).send({status:200,Message:"Report editted successfully",Data:newData})
            })
        }
    }

    catch(error)
    {
        console.log("error",error)
        res.status(500).send({status:500,Message:error.message || "Something went wrong.Try again"})
    }
}


/*----------------------------Delete_Customer_Report--------------------------------*/
exports.deleteCustomerReport=async(req,res)=>{

    try{
          
        if(!req.body.reportId)
        {
            return res.status(400).send({status:400,Message:"Required reportId fields cannot be empty"})
        }

        const checkReportId=await CustomerReports.findOne({reportId:req.body.reportId,customerId:req.customerId});

     
            await CustomerReports.findOneAndDelete({reportId:req.body.reportId});

            return res.status(200).send({status:200,Message:"Report deleted successfully"})
    }
    catch(error)
    {
        res.status(500).send({status:500,Message:error.message || "Something went wrong.Try again"})
    }
}

/*-------------------Get_All_Reports_Api----------------------*/
exports.getAllCustomerReports=async(req,res)=>{
    try{
      
        const paginationData=await paginationUtility(req,res);
        const totalCount=await CustomerReports.find({customerId:req.customerId}).countDocuments();
        const totalPages=totalCount/paginationData.limit;
        console.log("totalCount",totalCount)

        const reportsData=await CustomerReports.find({customerId:req.customerId}).sort('-createdAt').limit(paginationData.limit).skip(paginationData.skip);

        return res.status(200).send({status:200,
            Message:`Total ${totalCount} reports found`,
            totalReportsCount:totalCount,
            totalPagesCount:Math.ceil(totalPages),
            currentPage:paginationData.page,
            currentPageReportsCount:reportsData.length,
            Data:reportsData})


    }
    catch(error)
    {
        res.status(500).send({status:500,Message:error.message || "Something went wrong.Try again"})
    }
}


/*-----------------Get_Report_By_Id-------------------------*/
exports.getReportByReportId=async(req,res)=>{

    try{
    if(!req.params.reportId)
    {
        return res.status(400).send({status:400,Message:"Required reportId fields cannot be empty"})
    }

    const checkReportId=await CustomerReports.findOne({reportId:req.params.reportId,customerId:req.customerId});

    if(!checkReportId)
    {
        return res.status(400).send({status:400,Message:"your entered reportId is invalid"})
    }

    else if(checkReportId)
    {
         return res.status(200).send({status:200,Messaged:"Fetched report successfully",Data:checkReportId})
    }
}
  catch(error)
  {
    res.status(500).send({status:500,Message:error.message || "Something went wrong.Try again"})
  }
}