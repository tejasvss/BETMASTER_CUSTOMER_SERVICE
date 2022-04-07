const express=require('express');
const router=new express.Router();
const baseURL="/customerService"

//Customer_Routes
router.use(baseURL,require('./customer'));

  
module.exports = router;
  