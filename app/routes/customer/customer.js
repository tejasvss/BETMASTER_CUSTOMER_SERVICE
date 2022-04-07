const express=require('express');
const router = new express.Router();

const customerController=require('../../controllers/customer/customer');
const referralController=require('../../controllers/customer/referralCode');


router.post('/checkReferralCode',customerController.checkReferralCode);
router.post('/checkUsername',customerController.checkUsername);
router.post('/verifyEmailOtpAndCreateUser',customerController.verifyEmailOtpAndCreateUser);
router.post('/checkEmailAndSendOtp',customerController.checkEmailAndSendOtp);
router.post('/create',referralController.createReferral);


module.exports=router;