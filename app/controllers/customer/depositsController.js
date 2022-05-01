const Customer=require('../../models/customer/customer');
const generateId=require('../../utils/helpers/generateId');
const CustomerDeposits=require('../../models/customer/deposit');
const AWS=require('aws-sdk');
const appsConfig=require('../../constants/appConstants.json');
const getTransactionImageUtility=require('../../utils/appUtils/appUtility');
const paginationUtility=require('../../utils/appUtils/paginationUtility');


/*-----------------------------Customer_Deposits_API-------------------------*/
exports.customerBankDeposit=async(req,res)=>{

    try{
      
        if(!req.file || !req.body.depositAmount || !req.body.depositTransactionType  || !req.body.depositTransactionNumber || !req.body.depositorMobileNumber || !req.body.depositorCountryCode || !req.body.depositorBankAccountHolderName || !req.body.depositorBankAccountNumber || !req.body.depositorEmail)
        {
            res.status(400).send({status:400,Message:"Required fields cannot be empty"})
        }

        const checkTransactionNumber=await CustomerDeposits.findOne({depositTransactionNumber:req.body.depositTransactionNumber});

        if(checkTransactionNumber)
        {
            return res.status(400).send({status:400,Message:"Your entered transactionNumber is already used"})
        }

         //Configurations for the s3-bucket
        const s3 = new AWS.S3({
        accessKeyId     :  appsConfig.AWS_ACCESS_KEY_ID,
        secretAccessKey :  appsConfig.AWS_SECRET_ACCESS_KEY,
        region          :  appsConfig.AWS_REGION
          });


         //Params for the s3-Bucket
      const params={
         Bucket: appsConfig.AWS_CUSTOMER_DOCS_BUCKET_NAME,
         Key: req.role+'/'+req.user.customerId+'/'+Date.now()+req.file.originalname,
         Body: req.file.buffer,
         ContentType: req.file.mimetype,
         ACL:'public-read'
         };   

        //Uploading Image Functionality
        s3.upload(params, async function(s3Err, data) {
         
            if (s3Err) {
   
               return res.status(400).send({
                   status:400,
                   Message:s3Err.message || "Unable to upload File.Try again"
               })
            }
            else{ 
              
             const customerDepositProofUrl=appsConfig.AWS_CUSTOMER_DOCS_CDN_URL+'/'+params.Key;
             console.log("customerDepositProof",customerDepositProofUrl);

             const depositId=await generateId("depositid",8);
             console.log("depositId",depositId);

             const depositTransactionTypeImage=await getTransactionImageUtility((req.body.depositTransactionType).toLowerCase());
             console.log("depositTransactionTypeImage",depositTransactionTypeImage)

             await CustomerDeposits.create({
                                    
                                customerId:req.customerId,
                                depositAmount:req.body.depositAmount,
                                depositTransactionType:req.body.depositTransactionType,
                                depositTransactionTypeImage:depositTransactionTypeImage,
                                depositId:depositId,
                                depositTransactionNumber:req.body.depositTransactionNumber,
                                customerDepositProof:customerDepositProofUrl,
                                depositorMobileNumber:req.body.depositorMobileNumber,
                                depositorCountryCode:req.body.depositorCountryCode,
                                depositorBankAccountHolderName:req.body.depositorBankAccountHolderName,
                                depositorBankAccountNumber:req.body.depositorBankAccountNumber,
                                depositorEmail:req.body.depositorEmail}).then((depositData)=>{
                return res.status(200).send({status:200,Message:"Deposit request submitted successfully",Data:depositData})
                }).catch(error=>{
                return res.status(500).send({status:500,Message:error.message || "Something went wrong"})
                })
            }
        })
    }
    catch(error)
    {
        res.status(500).send({status:500,Message:error.message || "something went wrong.Try again"})
    }
}


/*-----------------------------Get_All_Customer_Deposits_API-------------------------*/
exports.getAllDepositStatements=async(req,res)=>{

    try{
        
        const paginationData=await paginationUtility(req,res);
        const totalCount=await CustomerDeposits.find({customerId:req.customerId}).countDocuments();
        const totalPages=totalCount/paginationData.limit;
        
        const depositsData=await CustomerDeposits.find({customerId:req.customerId}).sort('-createdAt').limit(paginationData.limit).skip(paginationData.skip);
        res.status(200).send({status:200,
                             Message:`Total ${depositsData.length} found`,
                             totalDepositsCount:totalCount,
                             totalPagesCount:Math.ceil(totalPages),
                             currentPage:paginationData.page,
                             currentPageDepositsCount:depositsData.length,
                             Data:depositsData})

    }
    catch(error)
    {
        res.status(500).send({status:500,Message:error.message || "something went wrong.Try again"})
    }
}

/*------------------Get_Admin_Bank_Details----------------------------*/
exports.getAdminBankDetails=async(req,res)=>{

    try{
        res.status(200).send({status:200,
            Message:"Admin bank details fetched succeessfully",
            bankName:"ICICI BANK",
            accountHolderName:"SKystop pvt ltd",
            accountNumber:"887766544",
            swiftCode:"ICIC0007551",
            bankLogo:"https://st.adda247.com/https://wpassets.adda247.com/wp-content/uploads/multisite/sites/5/2020/08/11134300/cancel-icici-bank-credit-card.jpg",
            isBankActive:true})

    }
    catch(error)
    {
        res.status(500).send({status:500,Message:error.message || "something went wrong.Try again"})
    }
}