const express=require('express');
const router = new express.Router();

const profileController=require('../../controllers/customer/profileController');


const customerAuthorization=require('../../config/customerAuthorization');


router.post('/customerLogin',profileController.customerLogin);
router.get('/getCustomerProfile',customerAuthorization.verifyToken,customerAuthorization.isCustomer,profileController.getCustomerProfile);


module.exports=router;