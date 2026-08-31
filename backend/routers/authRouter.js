const express = require('express');
const authController = require('../controllers/authController');

const authRouter = express.Router();

authRouter.post('/login', authController.postLogin);
authRouter.post('/logout', authController.postLogout);
authRouter.post('/signup', authController.postSignUp);

module.exports = authRouter;