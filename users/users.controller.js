const express = require('express');
const router = express.Router();
const userService = require('./user.service');
module.exports = router;
const {
    validateUserLogin,
    validateRegisterUser,
    validateGetUser
} = require('../_helpers/validation.js');

// routes
router.post('/register', register);
router.post('/authenticate', authenticate);
router.post('/getUser', getUser);

function register(req, res) {
    if (validateRegisterUser(req.body, res)) {
        return
    } else {
        userService.registerUser(req.body, res)
    }
}


function authenticate(req, res, next) {
    if (validateUserLogin(req.body, res)) {
        return
    } else {
        userService.getUserData(req.body, res)
    }

}

function getUser(req, res, next) {
    if (validateGetUser(req.body, res)) {
        return
    } else {
        userService.getUser(req.body,res)    
    }


}

