
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

const auth = async (req, res, next) => {
    // verify user is authenticated
    const { authorization } = req.headers
    if (!authorization) {
        return res.status(401).json({ error: 'Authorization token required' })
    }
    //bearer token => bearer eqyffdknfkgngkpdng35tjdvdnfkg
    const token = authorization.split(' ')[1]
    try {
        const { id } = jwt.verify(token, process.env.SECRET)
        req.user = await User.findOne({ email: id }).select('_id')
        next()

    } catch (error) {
        res.status(401).json({ error: 'Request is not authorized' })
    }
};

const logger = (req, res, next) => {
    console.log(req.path, req.method);
    next();
};


module.exports = {
    auth, logger
}