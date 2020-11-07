const {
    errorMessage,
    successMessage,
    status,
} = require('../_helpers/status.js');


/**
 * isEmpty helper method
 * @param {string, integer} input
 * @returns {Boolean} True or False
 */
const isEmpty = (input) => {
    if (input === undefined || input === '') {
        return true;
    }
};

function errorResponse(message, res) {
    errorMessage.MessageText = message;
    errorMessage.responseCode = status.bad;
    res.status(status.bad).send(errorMessage);
}




const validateUserLogin = (req, res) => {
    if (isEmpty(req.email)) {
        errorResponse("please send email", res)
        return true
    }
    if (isEmpty(req.password)) {
        errorResponse("please send password", res)
        return true
    } else {
        return false
    }
}

const validateRegisterUser = (req, res) => {
    if (isEmpty(req.first_name)) {
        errorResponse("please send first name", res)
        return true
    }
    if (isEmpty(req.last_name)) {
        errorResponse("please send last_name", res)
        return true
    }
    if (isEmpty(req.password)) {
        errorResponse("please send password", res)
        return true
    }
    if (isEmpty(req.email)) {
        errorResponse("please send email", res)
        return true
    }
    if (isEmpty(req.employee_id)) {
        errorResponse("please send employee_id", res)
        return true
    }
    if (isEmpty(req.organization_name)) {
        errorResponse("please send organization_name", res)
        return true
    } else {
        return false
    }
}

const validateGetUser = (req, res) => {
    if (isEmpty(req.first_name)) {
        errorResponse("please send first name", res)
        return true
    }
    if (isEmpty(req.last_name)) {
        errorResponse("please send last_name", res)
        return true
    }
    /*  if (isEmpty(req.employee_id)) {
         errorResponse("please send employee_id", res)
         return true
     } */
    else {
        return false
    }
}






module.exports = {
    isEmpty,
    validateUserLogin,
    validateRegisterUser,
    validateGetUser
}