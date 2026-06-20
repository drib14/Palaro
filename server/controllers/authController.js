const User = require('../models/User');
const Character = require('../models/Character');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateEmailToken,
} = require('../utils/token');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');
const crypto = require('crypto');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { email, username, firstName, lastName, gender, password, province } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.email === email.toLowerCase()
          ? 'Email already registered.'
          : 'Username already taken.',
      });
    }

    // Create email verification token
    const emailToken = generateEmailToken();

    // Create user
    const user = await User.create({
      email,
      username,
      firstName,
      lastName,
      gender,
      password,
      province: province || '',
      emailVerificationToken: crypto.createHash('sha256').update(emailToken).digest('hex'),
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Create default character based on gender
    await Character.create({
      userId: user._id,
      gender: gender === 'female' ? 'female' : 'male',
      unlockedItems: {
        hairstyles: ['default'],
        shirts: ['default-tshirt'],
        pants: ['default-shorts'],
        shoes: ['tsinelas'],
        accessories: [],
        hats: ['none'],
      },
    });

    // Send verification email
    await sendVerificationEmail(user, emailToken);

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    user.refreshTokens.push({ token: refreshToken });
    await user.save({ validateBeforeSave: false });

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          username: user.username,
          gender: user.gender,
          province: user.province,
          level: user.level,
          xp: user.xp,
          nostalgiaTier: user.nostalgiaTier,
          emailVerified: user.emailVerified,
        },
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier },
      ],
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token (limit to 5 devices)
    if (user.refreshTokens.length >= 5) {
      user.refreshTokens.shift();
    }
    user.refreshTokens.push({ token: refreshToken });
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Login successful!',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          username: user.username,
          gender: user.gender,
          province: user.province,
          level: user.level,
          xp: user.xp,
          nostalgiaTier: user.nostalgiaTier,
          emailVerified: user.emailVerified,
          avatar: user.avatar,
          role: user.role,
        },
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Remove refresh token
      await User.findByIdAndUpdate(req.userId, {
        $pull: { refreshTokens: { token: refreshToken } },
        isOnline: false,
        lastSeen: new Date(),
      });
    }

    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided.',
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token.',
      });
    }

    // Check if user has this refresh token
    const user = await User.findOne({
      _id: decoded.userId,
      'refreshTokens.token': refreshToken,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found.',
      });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Replace old refresh token
    user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== refreshToken);
    user.refreshTokens.push({ token: newRefreshToken });
    await user.save({ validateBeforeSave: false });

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token.',
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Email verified successfully! You can now access all features.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if email exists
      return res.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.',
      });
    }

    const resetToken = generateEmailToken();
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    await sendPasswordResetEmail(user, resetToken);

    res.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token.',
      });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful! Please log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
      .populate('achievements')
      .populate('barangayClub', 'name');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const character = await Character.findOne({ userId: user._id });

    res.json({
      success: true,
      data: {
        user,
        character,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
};
