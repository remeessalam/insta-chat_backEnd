const jwt = require('jsonwebtoken');
require('dotenv').config()
const maxAge = 60 * 60 * 24;
let signJwt = function (payload) {
    return jwt.sign(
        payload,
        process.env.SECRET_TOKEN,
        {
            expiresIn: maxAge,
        }
    )
}

module.exports = signJwt