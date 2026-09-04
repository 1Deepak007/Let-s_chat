const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const redisClient = require('../utils/redis');

exports.register = async (req, res) => {
    const { firstname, lastname, username, password } = req.body;
    try {
        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ message: 'Username already exists.' });

        // Create a new User instance
        const newUser = new User({
            firstname,              
            lastname,              
            username,
            password
        });

        // Imp. : triggers tpre('save') middleware and hashes the password
        await newUser.save();
        res.status(201).json({ message: 'User created.', user: newUser }); // Send back the newly created user (excluding password)

    } catch (err) {
        console.error(err); // Improved error logging
        res.status(500).json({ message: 'Server error', error: err.message }); // Send more specific error message
    }
};
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'User not found.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const data = { id: user._id };

        const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '1d' });

        const notifications = user.notifications;
        user.notifications = []; // Clear notifications after showing once
        await user.save();


        user.password = undefined; // remove password when sending user in json
        // console.log("user : ", user);

        // set jwt token in cookies
        res.cookie('token', token, {
            httpOnly: true, // Cookie is only accessible via HTTP requests
            secure: process.env.NODE_ENV === 'production', // Cookie is only sent over HTTPS
            sameSite: 'strict' // Cookie is only sent with same-site requests (not cross-site)
        })

        res.json({ user, token, notifications });
    } catch (err) {
        res.status(500).json({ message: `Server error : ${err}` });
    }
}

// Logout API clears the client cookie and invalidates the token when Redis is available.
exports.logout = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };

    res.clearCookie('token', cookieOptions);

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const ttl = Math.max(1, decoded.exp - Math.floor(Date.now() / 1000));

            if (redisClient.status === 'ready') {
                await redisClient.setex(`blacklist:${token}`, ttl, 'logged out');
            } else {
                console.error('Logout blacklist skipped: Redis connection not ready');
            }
        } catch (err) {
            if (err.name !== 'TokenExpiredError' && err.name !== 'JsonWebTokenError') {
                console.error('Logout blacklist error:', err);
            }
        }
    }

    res.status(200).json({ message: 'User logged out successfully' });
};
