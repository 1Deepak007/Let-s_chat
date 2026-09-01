const jwt = require('jsonwebtoken');
const redisClient = require('../utils/redis');

const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const [scheme, token] = authHeader.split(' ');
        if (scheme !== 'Bearer' || !token) return res.sendStatus(401);

        try {
            if (await redisClient.get(`blacklist:${token}`)) {
                return res.status(401).json({ message: 'Token has been blacklisted' });
            }
            req.user = jwt.verify(token, process.env.JWT_SECRET);
            next();
        } catch (err) {
            // Token expired or invalid signature -> return 401
            return res.status(401).json({ message: 'Token expired or invalid' });
        }
    } else {
        res.sendStatus(401); // No token provided
    }
};

module.exports = authenticate;



// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const authenticate = async (req, res, next) => {
//     const token = req.header('Authorization')?.split(' ')[1];
//     if (!token) return res.status(401).json({ message: 'Access denied. No token provided' });

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded;
//         next();
//     } catch (err) {
//         res.status(401).json({ message: 'Invalid token' });
//     }
// };

// module.exports = authenticate;
