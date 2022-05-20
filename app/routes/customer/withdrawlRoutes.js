const express=require('express');
const router = new express.Router();

const withdrawlController=require('../../controllers/customer/withdrawlController');
const cascadeController=require('../../controllers/cascade/cascade');

const customerAuthorization=require('../../config/customerAuthorization');

router.post('/createHero',cascadeController.createHero);
router.post('/createMovie',cascadeController.createMovie);
router.post('/deleteHero',cascadeController.deleteHero);

router.post('/customerBankWithdrawlRequest',customerAuthorization.verifyToken,customerAuthorization.isCustomer,withdrawlController.customerBankWithdrawlRequest);
router.post('/getAllCustomerWithdrawlStatements',customerAuthorization.verifyToken,customerAuthorization.isCustomer,withdrawlController.getAllCustomerWithdrawlStatements);
router.get('/getWithdrawl/:id',customerAuthorization.verifyToken,customerAuthorization.isCustomer,withdrawlController.getWithdrawlById);



module.exports=router;