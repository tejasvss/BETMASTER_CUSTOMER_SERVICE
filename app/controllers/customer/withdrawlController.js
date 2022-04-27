const Customer=require('../../models/customer/customer');
const CustomerWithdrawls=require('../../models/customer/withdrawl');
const generateId=require('../../utils/helpers/generateId');
const getTransactionImageUtility=require('../../utils/appUtils/appUtility');
const paginationUtility=require('../../utils/appUtils/paginationUtility');



/*-----------------------Customer_Bank_Withdrawl_Request_Api------------------------*/
exports.customerBankWithdrawlRequest=async(req,res)=>{

    try{
       
        if( !req.body.withdrawlAmount || !req.body.withdrawlTransactionType || !req.body.withdrawlMobileNumber || !req.body.withdrawlCountryCode || !req.body.withdrawlRequestorBankAccountHolderName || !req.body.withdrawlRequestorBankAccountNumber  || !req.body.withdrawlRequestorEmail  || !req.body.withdrawlRequestorBankSwiftcode)
        {
        return res.status(400).send({status:400,Message:"Required withdrawl request keys are missing in the request"})
        }


        if(req.body.withdrawlAmount > req.user.walletBalance)
        {
        return res.status(400).send({status:400,Message:"Insufficient funds"})
        }
        else if(req.body.withdrawlAmount <=req.user.walletBalance)
        {
            const withdrawlId=await generateId("withdrawlid",8);
            const withdrawlTransactionTypeImage=await getTransactionImageUtility((req.body.withdrawlTransactionType).toLowerCase());

            await CustomerWithdrawls.create({

                customerId:req.customerId,
                withdrawlAmount:req.body.withdrawlAmount,
                withdrawlTransactionType:req.body.withdrawlTransactionType,
                withdrawlMobileNumber:req.body.withdrawlMobileNumber,
                withdrawlCountryCode:req.body.withdrawlCountryCode,
                withdrawlRequestorBankAccountHolderName:req.body.withdrawlRequestorBankAccountHolderName,
                withdrawlRequestorBankAccountNumber:req.body.withdrawlRequestorBankAccountNumber,
                withdrawlRequestorEmail:req.body.withdrawlRequestorEmail,
                withdrawlRequestorBankSwiftcode:req.body.withdrawlRequestorBankSwiftcode,
                withdrawlTransactionTypeImage:withdrawlTransactionTypeImage,
                withdrawlId:withdrawlId
            }).then(async(success)=>{

                const customer=await Customer.findOneAndUpdate({customerId:req.customerId},{$inc:{walletBalance:-(req.body.withdrawlAmount)}},{new:true});
                
                res.status(200).send({status:200,Message:"Withdrawl request submitted successfully",customerWalletBalance:customer.walletBalance,Data:success})
            })
        }
    }
    catch(error)
    {
        res.status(500).send({status:500,Message:error.message || "something went wrong.Try again"})
    }
}


/*--------------Fetching_All_Customer_Withdrawl_Statements------------------*/
exports.getAllCustomerWithdrawlStatements=async(req,res)=>{

    try{

        let dbQuery={};
        if(req.body.fromDate && req.body.toDate)
        {
            dbQuery={customerId:req.customerId};
            dbQuery.createdAt={$gte:new Date(req.body.fromDate).setHours(00,00,00),$lt:new Date(req.body.toDate).setHours(23,59,59)}
        }
        else
        {
            dbQuery={customerId:req.customerId};
        }  
        console.log("DbQuery",dbQuery);

        const pendingWithdrawlsCount=await CustomerWithdrawls.find(dbQuery).where("withdrawlTransactionStatus").equals("pending").countDocuments();
        const ProcessedWithdrawlsCount=await CustomerWithdrawls.find(dbQuery).where("withdrawlTransactionStatus").equals("processed").countDocuments();
          
        const paginationData=await paginationUtility(req,res);
        const totalCount=await CustomerWithdrawls.find(dbQuery).countDocuments();
        const totalPages=totalCount/paginationData.limit;
        const withdrawlsData=await CustomerWithdrawls.find(dbQuery).sort('-createdAt').limit(paginationData.limit).skip(paginationData.skip);
        
        res.status(200).send({status:200,
                              Message:"Withdrawl requests fetched succesfully",
                              totalWithdrawlRequests:totalCount,
                              totalPendingRequests:pendingWithdrawlsCount,
                              totalProcessedRequests:ProcessedWithdrawlsCount,
                              totalPages:Math.ceil(totalPages),
                              currentPage:paginationData.page,
                              currentPageWithdrawlsCount:withdrawlsData.length,
                              Data:withdrawlsData})

        }                     
    
    catch(error)
    {
        res.status(500).send({status:500,Message:error.message || "Something went wrong.Try again"})
    }
}