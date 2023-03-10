const express=require('express');
const router = new express.Router();

const reportsController=require('../../controllers/customer/reportsController');


const customerAuthorization=require('../../config/customerAuthorization');


router.post('/createReport',customerAuthorization.verifyToken,customerAuthorization.isCustomer,reportsController.createReport);
router.post('/editCustomerReport',customerAuthorization.verifyToken,customerAuthorization.isCustomer,reportsController.editCustomerReport);
router.post('/deleteCustomerReport',customerAuthorization.verifyToken,customerAuthorization.isCustomer,reportsController.deleteCustomerReport);
router.post('/getAllCustomerReports',customerAuthorization.verifyToken,customerAuthorization.isCustomer,reportsController.getAllCustomerReports);
router.get('/getReport/:reportId',customerAuthorization.verifyToken,customerAuthorization.isCustomer,reportsController.getReportByReportId);


module.exports=router;