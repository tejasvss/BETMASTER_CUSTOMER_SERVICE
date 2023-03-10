const express=require('express');
const router = new express.Router();

const customerController=require('../../controllers/customer/customerController');
const referralController=require('../../controllers/customer/referralCode');

const customerAuthorization=require('../../config/customerAuthorization');


router.post('/checkReferralCode',customerController.checkReferralCode);
router.post('/checkUsername',customerController.checkUsername);
router.get('/updateAll',customerController.updateAll)
router.post('/verifyEmailOtpAndCreateUser',customerController.verifyEmailOtpAndCreateUser);
router.post('/checkEmailAndSendOtp',customerController.checkEmailAndSendOtp);
router.post('/create',referralController.createReferral);
router.post('/checkAndUpdateBankNumber',customerAuthorization.verifyToken,customerAuthorization.isCustomer,customerController.checkAndUpdateBankNumber);
router.post('/checkMobileNumberAndSendOtp',customerAuthorization.verifyToken,customerAuthorization.isCustomer,customerController.checkMobileNumber);
router.post('/verifyMobileOtp',customerAuthorization.verifyToken,customerAuthorization.isCustomer,customerController.verifyMobileOtp);
router.post('/forgotPassword',customerController.forgotPassword);
router.post('/verifyForgotOtpAndUpdatePassword',customerController.verifyForgotOtpAndUpdatePassword);
module.exports=router;