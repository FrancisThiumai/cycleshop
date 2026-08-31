const express = require('express');
const salesController = require('../controllers/salesController');

const shopRouter = express.Router();

shopRouter.get('/sales/availableParts', salesController.getPartTypes);
shopRouter.get('/sales/availableModels/:parttype', salesController.getModels);
shopRouter.get('/sales/mySales', salesController.getSales);
shopRouter.get('/sales/allSales', salesController.getAllSales);
shopRouter.get('/sales/:saleId', salesController.getSaleDetail);
shopRouter.post('/sales/estimateBicyclePrice', salesController.estimateBicyclePrice);
shopRouter.post('/createSale', salesController.createSale);
shopRouter.patch('/sales/:saleId/verify', salesController.verifySale);

module.exports = shopRouter;