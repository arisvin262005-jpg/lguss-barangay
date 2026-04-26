const { body, validationResult } = require('express-validator');

// Validation rules for resident
const residentValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required').escape(),
  body('lastName').trim().notEmpty().withMessage('Last name is required').escape(),
  body('middleName').optional().trim().escape(),
  body('birthDate').isISO8601().withMessage('Valid birth date required'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
  body('civilStatus').isIn(['Single', 'Married', 'Widowed', 'Separated', 'Annulled']),
  body('address').trim().notEmpty().escape(),
  body('barangay').trim().notEmpty().escape(),
  body('contactNumber').optional().trim().isMobilePhone(),
  body('email').optional().normalizeEmail().isEmail(),
];

// Validation rules for certification request
const certificationValidation = [
  body('residentId').notEmpty().withMessage('Resident ID required'),
  body('certType').notEmpty().withMessage('Certification type required'),
  body('purpose').trim().notEmpty().withMessage('Purpose is required').escape(),
];

// Validation rules for case filing
const caseValidation = [
  body('complainantId').notEmpty().withMessage('Complainant ID required'),
  body('respondentId').notEmpty().withMessage('Respondent ID required'),
  body('caseType').trim().notEmpty().escape(),
  body('description').trim().notEmpty().escape(),
  body('hearingDate').optional().isISO8601(),
];

// Middleware to check validation results
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  residentValidation,
  certificationValidation,
  caseValidation,
  handleValidation,
};
