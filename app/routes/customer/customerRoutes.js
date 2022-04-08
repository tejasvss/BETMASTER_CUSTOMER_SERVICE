const express=require('express');
const router = new express.Router();

const customerController=require('../../controllers/customer/customerController');
const referralController=require('../../controllers/customer/referralCode');

const customerAuthorization=require('../../config/customerAuthorization');


router.post('/checkReferralCode',customerController.checkReferralCode);
router.post('/checkUsername',customerController.checkUsername);
router.post('/verifyEmailOtpAndCreateUser',customerController.verifyEmailOtpAndCreateUser);
router.post('/checkEmailAndSendOtp',customerController.checkEmailAndSendOtp);
router.post('/create',referralController.createReferral);
router.post('/checkAndUpdateBankNumber',customerAuthorization.verifyToken,customerAuthorization.isCustomer,customerController.checkAndUpdateBankNumber);


module.exports=router;