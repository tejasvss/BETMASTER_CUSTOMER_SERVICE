const express=require('express');
const router=new express.Router();
const baseURL="/customerService"

//Customer_Routes
router.use(baseURL,require('./customerRoutes'));
router.use(baseURL,require('./profileRoutes'));
router.use(baseURL,require('./reportsRoutes'));
router.use(baseURL,require('./depositRoutes'));
router.use(baseURL,require('./withdrawlRoutes'));

  
module.exports = router;
  