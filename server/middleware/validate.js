const { validationResult, body } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

// Registration validation rules
const registerRules = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required'),
  body('gender')
    .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
    .withMessage('Please select a valid gender option'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
];

// Login validation rules
const loginRules = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Email or username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Memory validation rules
const memoryRules = [
  body('content')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Memory must be between 10 and 1000 characters'),
  body('gameId')
    .notEmpty()
    .withMessage('Game ID is required'),
];

// Chat message validation
const chatRules = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters'),
];

// Club validation rules
const clubRules = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Club name must be between 3 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be at most 500 characters'),
  body('type')
    .optional()
    .isIn(['barangay', 'school', 'community'])
    .withMessage('Invalid club type'),
];

// Tournament validation rules
const tournamentRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tournament name is required'),
  body('gameId')
    .notEmpty()
    .withMessage('Game ID is required'),
  body('startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  body('endDate')
    .isISO8601()
    .withMessage('Please provide a valid end date'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  memoryRules,
  chatRules,
  clubRules,
  tournamentRules,
};
