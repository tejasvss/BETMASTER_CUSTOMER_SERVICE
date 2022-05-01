const express=require('express');
const router = new express.Router();
const multer = require("multer");


const depositController=require('../../controllers/customer/depositsController');


const storage = multer.memoryStorage({
    destination: function (req, file, cb) {
        cb(null, '')
    }
})

const upload = multer({ storage: storage }).single('file');

const customerAuthorization=require('../../config/customerAuthorization');

router.post('/customerBankDeposit',customerAuthorization.verifyToken,customerAuthorization.isCustomer,upload,depositController.customerBankDeposit);
router.post('/getAllDepositStatements',customerAuthorization.verifyToken,customerAuthorization.isCustomer,depositController.getAllDepositStatements);
router.get('/getAdminBankDetails',customerAuthorization.verifyToken,customerAuthorization.isCustomer,depositController.getAdminBankDetails)


module.exports=router;