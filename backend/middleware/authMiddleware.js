const jwt = require('jsonwebtoken');
const redisClient = require('../utils/redis');

// Middleware function to authenticate incoming requests
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;       // Extract authorization header from request

    if (!authHeader) return res.sendStatus(401);        // If no authorization header is provided, return 401 status code

    const [scheme, token] = authHeader.split(' ');     // Split authorization header into scheme (e.g., 'Bearer') and token

    if (scheme !== 'Bearer' || !token) return res.sendStatus(401); // If scheme is not 'Bearer' or the token is missing, return 401 status code

    // 1. Verify token signature and expiration first
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        // If the token is invalid or expired, return 401 status code with a message
        return res.status(401).json({ message: 'Token expired or invalid' });
    }

    // 2. Safely check Redis blacklist without failing request if Redis is down
    try {
        // Check if the token is blacklisted
        const isBlacklisted = await redisClient.get(`blacklist:${token}`);
        if (isBlacklisted) {
            // If the token is blacklisted, return 401 status code with a message
            return res.status(401).json({ message: 'Token has been blacklisted' });
        }
    } catch (redisErr) {
        console.error('Redis blacklist lookup error:', redisErr);
        // Continue request processing even if Redis temporarily fails
    }

    // 3. Continue with the request
    // If the token is not blacklisted, verify it using the JWT secret
    next();
};

module.exports = authenticate;


