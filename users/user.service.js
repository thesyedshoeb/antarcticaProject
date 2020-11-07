const configJson = require('config.json');
const jwt = require('jsonwebtoken');
const config = require("../config/config.js");
const loggers = config.loggers
const pool = config.pool
const query = require("../queries/userQuery.js");
const {
    errorMessage,
    successMessage,
    status,
} = require('../_helpers/status.js');
const msg = require("../_helpers/constant.js")

module.exports = {
    authenticate,
    getUserData,
    registerUser,
    onBoardUser,
    checkExistingUser,
    getUser,
    searchUser
};
var limitNum;

function getUserData(req, res) {
    pool.connect().then(client => {
        loggers.info.info(msg.CON_DB_SUCCESS)
        client.query('BEGIN')
            .then(data => {
                loggers.info.info("getUserData:" + msg.BEGIN_TXN)
                getData(req, res, client)
            })
            .catch(e => {
                rollBackBlock(e, res, client, "getUserData:")
            })
    }).catch(e => {
        error(e, msg.DB_CONNECT_ERROR);
    })
}


function getData(req, res, client) {
    client.query(query.GET_USER, [req.email, req.password])
        .then(data => {
            if (data.rows.length != 0) {
                authenticate(data, res)
            } else {
                errorMessage.MessageText = 'no users found';
                errorMessage.responseCode = status.bad;
                res.status(status.bad).send(errorMessage);
            }
            commitBlock(res, client, "GET_USER:")
        })
        .catch(e => {
            rollBackBlock(e, res, client, "GET_USER:")
        })
}

async function authenticate(data, res) {
    user = data.rows[0]
    // create a jwt token that is valid for 7 days
    const token = jwt.sign({
        sub: user.email
    }, configJson.secret, {
        expiresIn: '7d'
    });

    successMessage.messageText = 'User verified successfully';
    successMessage.responseCode = status.success;
    successMessage.responseObject = {
        token
    }
    res.status(status.success).send(successMessage)
}



function registerUser(req, res) {
    pool.connect().then(client => {
        loggers.info.info(msg.CON_DB_SUCCESS)
        client.query('BEGIN')
            .then(data => {
                loggers.info.info("registerUser" + msg.BEGIN_TXN)
                checkExistingUser(req, res, client)
            })
            .catch(e => {
                rollBackBlock(e, res, client, "registerUser:")
            })
    }).catch(e => {
        error(e, msg.DB_CONNECT_ERROR);
    })
}

function checkExistingUser(req, res, client) {
    client.query(query.CHECK_USER, [req.email, req.employee_id])
        .then(data => {
            if (data.rows.length != 0) {
                errorMessage.messageText = 'users already exist';
                errorMessage.responseCode = status.bad;
                errorMessage.responseObject = data.rows
                res.status(status.bad).send(errorMessage)
                commitBlock(res, client, "CHECK_USER:")
            } else {
                onBoardUser(req, res, client)
            }
        })
        .catch(e => {
            rollBackBlock(e, res, client, "CHECK_USER:")
        })
}



function onBoardUser(req, res, client) {
    client.query(query.INSERT_USER, [req.email, req.password])
        .then(data => {
            if (data.rows.length != 0) {
                onBoardEmployee(req, res, client, data.rows[0].email)
            }
        })
        .catch(e => {
            rollBackBlock(e, res, client, "INSERT_USER:")
        })
}

function onBoardEmployee(req, res, client, email) {
    client.query(query.INSERT_EMPLOYEE, [req.employee_id, email, req.first_name, req.last_name, req.organization_name])
        .then(data => {
            successMessage.messageText = 'registerd successfully';
            successMessage.responseCode = status.success;
            successMessage.responseObject = data.rows
            res.status(status.success).send(successMessage)
            commitBlock(res, client, "INSERT_EMPLOYEE:")
        })
        .catch(e => {
            rollBackBlock(e, res, client, "INSERT_EMPLOYEE:")
        })
}



function getUser(req, res) {
    pool.connect().then(client => {
        loggers.info.info(msg.CON_DB_SUCCESS)
        client.query('BEGIN')
            .then(data => {
                loggers.info.info("getUser" + msg.BEGIN_TXN)
                startLimit(req, res, client)
            })
            .catch(e => {
                rollBackBlock(e, res, client, "getUser:")
            })
    }).catch(e => {
        error(e, msg.DB_CONNECT_ERROR);
    })
}


function searchUser(req, res, client) {
    client.query("select first_name,last_name,email,employee_id,organization_name from employee_table where first_name=$1 and last_name=$2 ORDER BY employee_id ASC limit $3", [req.first_name, req.last_name, limitNum])
        .then(data => {
            if (data.rows.length != 0) {
                successMessage.messageText = 'user recieved successfully';
                successMessage.responseCode = status.success;
                successMessage.responseObject = data.rows
                res.status(status.success).send(successMessage)
            } else {
                errorMessage.MessageText = 'no users found';
                errorMessage.responseCode = status.bad;
                res.status(status.bad).send(errorMessage);
            }
            commitBlock(res, client, "searchUser:")
        })
        .catch(e => {
            rollBackBlock(e, res, client, "searchUser:")
        })
}


function startLimit(req, res, client) {
    if (req.limit == '' || req.limit == null) {
        limitNum = 5;
    } else {
        limitNum = parseInt(req.limit)
    }
    searchUser(req, res, client)
}


/**
 * Log Erros in lof file
 * @param {*} e 
 * @param {*} message 
 */
function error(e, message, res) {
    loggers.error.error(message + e.message + e.stack);
    console.error(message, e.message, e.stack);
    errorMessage.messageText = e.message;
    errorMessage.responseCode = status.bad;
    res.status(status.bad).send(errorMessage);
}


/**
 * Log Erros in lof file
 * @param {*} e 
 * @param {*} message 
 */
function rollBackError(e, message) {
    loggers.error.error(message + e.message + e.stack);
    console.error(message, e.message, e.stack);
}


function rollBackBlock(e, res, client, queryName) {
    client.query('ROLLBACK')
        .then(data => {
            loggers.error.error(queryName + msg.ROLLBCK_TXN)
            client.release()
        })
        .catch(e => {
            rollBackError(e, queryName + msg.ERROR_ROLLBCK_TXN)
        })
    error(e, queryName, res)
}

function commitBlock(res, client, queryName) {
    client.query('COMMIT')
        .then(data => {
            loggers.info.info(queryName + msg.TXN_COMMITED)
            client.release()
        })
        .catch(e => {
            error(e, queryName + msg.ERROR_COMMIT_TXN, res);
        })
}