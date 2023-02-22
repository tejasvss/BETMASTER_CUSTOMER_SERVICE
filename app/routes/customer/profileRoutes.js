const express = require('express');
const router = new express.Router();

const profileController = require('../../controllers/customer/profileController');


const customerAuthorization = require('../../config/customerAuthorization');


router.post('/customerLogin', profileController.customerLogin);
router.get('/getCustomerProfile', customerAuthorization.verifyToken, customerAuthorization.customerAuthorization.checkIpAddress, isCustomer, profileController.getCustomerProfile);
router.post('/changeEmail', customerAuthorization.verifyToken, customerAuthorization.isCustomer, profileController.changeEmail);
router.post('/verifyEmailOtp', customerAuthorization.verifyToken, customerAuthorization.isCustomer, profileController.verifyEmailOtp);
router.get('/customerLogout', customerAuthorization.verifyToken, customerAuthorization.isCustomer, profileController.customerLogout);


module.exports = router;