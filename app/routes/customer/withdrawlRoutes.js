const express=require('express');
const router = new express.Router();

const withdrawlController=require('../../controllers/customer/withdrawlController');

const customerAuthorization=require('../../config/customerAuthorization');

router.post('/customerBankWithdrawlRequest',customerAuthorization.verifyToken,customerAuthorization.isCustomer,withdrawlController.customerBankWithdrawlRequest);
router.post('/getAllCustomerWithdrawlStatements',customerAuthorization.verifyToken,customerAuthorization.isCustomer,withdrawlController.getAllCustomerWithdrawlStatements);


module.exports=router;