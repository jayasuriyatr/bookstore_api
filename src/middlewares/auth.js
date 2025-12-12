const JWTUtils = require('../utils/jwt');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Authentication middleware - verifies JWT token
 */
const authenticate = async (req, res, next) => {
    try {
        let token;

        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // Remove 'Bearer ' prefix
        }

        // Check if token exists
        if (!token) {
            return next(ApiError.unauthorized('Access token is required'));
        }

        try {
            // Verify token
            const decoded = JWTUtils.verifyToken(token);

            // Get user from database
            const user = await User.findById(decoded.id).select('+isActive');

            if (!user) {
                return next(ApiError.unauthorized('Token is invalid - user not found'));
            }

            if (!user.isActive) {
                return next(ApiError.unauthorized('Account is deactivated'));
            }

            // Add user to request object
            req.user = user;
            next();

        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return next(ApiError.unauthorized('Token has expired'));
            } else if (jwtError.name === 'JsonWebTokenError') {
                return next(ApiError.unauthorized('Token is invalid'));
            } else {
                return next(ApiError.unauthorized('Token verification failed'));
            }
        }

    } catch (error) {
        next(ApiError.internal('Authentication error'));
    }
};

/**
 * Authorization middleware - checks user roles
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(ApiError.unauthorized('Authentication required'));
        }

        if (!roles.includes(req.user.role)) {
            return next(ApiError.forbidden('Insufficient permissions'));
        }

        next();
    };
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
const optionalAuthenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(); // No token provided, continue without user
        }

        const token = authHeader.substring(7);

        try {
            const decoded = JWTUtils.verifyToken(token);
            const user = await User.findById(decoded.id).select('+isActive');

            if (user && user.isActive) {
                req.user = user;
            }
        } catch (jwtError) {
            // Token invalid, but that's okay for optional auth
        }

        next();
    } catch (error) {
        next(); // Continue without authentication on error
    }
};

module.exports = {
    authenticate,
    authorize,
    optionalAuthenticate,
};