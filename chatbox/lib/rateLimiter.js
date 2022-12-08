const rateLimit = require('express-rate-limit');

const rateLimiter = (limit, timeFrame) => {
    return rateLimit({
        max: limit, // limit each IP to x request per windowMS
        windowMs: timeFrame * 1000, // per every x seconds,
        message: {
            error: {
                status: 429,
                message: 'TOO_MANY_REQUESTS',
                expiry: timeFrame,
            }
        }
    });
};

module.exports = rateLimiter;