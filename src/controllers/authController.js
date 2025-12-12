const User = require('../models/User');
const JWTUtils = require('../utils/jwt');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { asyncHandler } = require('../middlewares/errorHandler');

class AuthController {
    /**
     * Register new user
     */
    register = asyncHandler(async (req, res) => {
        const { username, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            if (existingUser.email === email) {
                throw ApiError.conflict('Email already registered');
            }
            if (existingUser.username === username) {
                throw ApiError.conflict('Username already taken');
            }
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password,
            role: role === 'admin' ? 'admin' : 'user', // Only allow admin if explicitly set
        });

        // Generate tokens
        const tokens = JWTUtils.generateTokenPair(user);

        ApiResponse.created(
            {
                user: user.toAuthJSON(),
                tokens,
            },
            'User registered successfully'
        ).send(res);
    });

    /**
     * Login user
     */
    login = asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        // Find user and include password for comparison
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            throw ApiError.unauthorized('Invalid email or password');
        }

        if (!user.isActive) {
            throw ApiError.unauthorized('Account is deactivated');
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw ApiError.unauthorized('Invalid email or password');
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate tokens
        const tokens = JWTUtils.generateTokenPair(user);

        ApiResponse.success(
            {
                user: user.toAuthJSON(),
                tokens,
            },
            'Login successful'
        ).send(res);
    });

    /**
     * Get current user profile
     */
    getProfile = asyncHandler(async (req, res) => {
        ApiResponse.success(
            req.user.toAuthJSON(),
            'Profile retrieved successfully'
        ).send(res);
    });

    /**
     * Update current user profile
     */
    updateProfile = asyncHandler(async (req, res) => {
        const { username, email } = req.body;
        const userId = req.user._id;

        // Check if new username/email already exists (excluding current user)
        if (username || email) {
            const query = { _id: { $ne: userId } };
            if (username && email) {
                query.$or = [{ username }, { email }];
            } else if (username) {
                query.username = username;
            } else if (email) {
                query.email = email;
            }

            const existingUser = await User.findOne(query);
            if (existingUser) {
                if (existingUser.username === username) {
                    throw ApiError.conflict('Username already taken');
                }
                if (existingUser.email === email) {
                    throw ApiError.conflict('Email already registered');
                }
            }
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { username, email },
            { new: true, runValidators: true }
        );

        ApiResponse.updated(
            updatedUser.toAuthJSON(),
            'Profile updated successfully'
        ).send(res);
    });

    /**
     * Change password
     */
    changePassword = asyncHandler(async (req, res) => {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        // Get user with password
        const user = await User.findById(userId).select('+password');

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            throw ApiError.unauthorized('Current password is incorrect');
        }

        // Update password
        user.password = newPassword;
        await user.save();

        ApiResponse.success(
            null,
            'Password changed successfully'
        ).send(res);
    });

    /**
     * Refresh access token
     */
    refreshToken = asyncHandler(async (req, res) => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw ApiError.badRequest('Refresh token is required');
        }

        try {
            // Verify refresh token
            const decoded = JWTUtils.verifyToken(refreshToken);

            // Get user
            const user = await User.findById(decoded.id);
            if (!user || !user.isActive) {
                throw ApiError.unauthorized('Invalid refresh token');
            }

            // Generate new tokens
            const tokens = JWTUtils.generateTokenPair(user);

            ApiResponse.success(
                tokens,
                'Tokens refreshed successfully'
            ).send(res);

        } catch (error) {
            throw ApiError.unauthorized('Invalid refresh token');
        }
    });

    /**
     * Admin: Get all users
     */
    getAllUsers = asyncHandler(async (req, res) => {
        const { page = 1, limit = 10, role, isActive } = req.query;

        const filter = {};
        if (role) filter.role = role;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const users = await User.find(filter)
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(filter);

        ApiResponse.success(
            users,
            'Users retrieved successfully'
        ).withPagination({
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: parseInt(limit),
        }).send(res);
    });
}

module.exports = new AuthController();