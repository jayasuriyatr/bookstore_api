const jwt = require('jsonwebtoken');
const config = require('../config/config');

class JWTUtils {
    /**
     * Generate JWT access token
     * @param {Object} payload - User data to encode in token
     * @returns {String} JWT token
     */
    static generateToken(payload) {
        return jwt.sign(payload, config.JWT.secret, {
            expiresIn: config.JWT.expiresIn,
            issuer: 'bookstore-api',
            audience: 'bookstore-users',
        });
    }

    /**
     * Generate JWT refresh token
     * @param {Object} payload - User data to encode in token
     * @returns {String} JWT refresh token
     */
    static generateRefreshToken(payload) {
        return jwt.sign(payload, config.JWT.secret, {
            expiresIn: config.JWT.refreshExpiresIn,
            issuer: 'bookstore-api',
            audience: 'bookstore-users',
        });
    }

    /**
     * Verify JWT token
     * @param {String} token - JWT token to verify
     * @returns {Object} Decoded token payload
     */
    static verifyToken(token) {
        return jwt.verify(token, config.JWT.secret, {
            issuer: 'bookstore-api',
            audience: 'bookstore-users',
        });
    }

    /**
     * Decode JWT token without verification (for expired token info)
     * @param {String} token - JWT token to decode
     * @returns {Object} Decoded token payload
     */
    static decodeToken(token) {
        return jwt.decode(token);
    }

    /**
     * Generate token pair (access + refresh)
     * @param {Object} user - User object
     * @returns {Object} Object containing access and refresh tokens
     */
    static generateTokenPair(user) {
        const payload = {
            id: user._id || user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        };

        return {
            accessToken: this.generateToken(payload),
            refreshToken: this.generateRefreshToken(payload),
            expiresIn: config.JWT.expiresIn,
            tokenType: 'Bearer',
        };
    }
}

module.exports = JWTUtils;