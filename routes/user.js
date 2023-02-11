const mongoose = require('mongoose')
const UserController = require('../controllers/userController')

const express = require('express');

const Router = express.Router();


Router.post('/login', async (req, res) => {
  UserController.signin(req, res)
})


Router.post('/Signup', async (req, res) => {
  UserController.signup(req, res)
})


Router.get('/activate/:confirmationCode', async (req, res) => {
  UserController.verifyUser(req, res)
})

// Router.post('/resendemail', async (req, res) => {
//   UserController.resendEmail(req, res);
//   //incomplete
// })


Router.post('/forgotPassword', async (req, res) => {
  UserController.forgotPassword(req, res);
})

Router.post('/ResetPassword/:id/:token', async (req, res) => {
  UserController.resetPassword(req, res);
})
module.exports = Router
