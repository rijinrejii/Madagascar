export const validateSignup = (req, res, next) => {
  const { fullName, phoneNumber, shopAddress, gstNumber, upiId, password } = req.body;
  const phoneRegex = /^\+?[0-9]{8,15}$/;
  const errors = [];

  if (!fullName || fullName.trim().length < 3) {
    errors.push('Full name must be at least 3 characters long');
  }

  if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
  errors.push('Phone number must be between 8 and 15 digits, optionally starting with "+"');
}


  if (!shopAddress || shopAddress.trim().length < 5) {
    errors.push('Shop address must be at least 5 characters long');
  }

  if (!gstNumber || !isValidGST(gstNumber.trim().toUpperCase())) {
    errors.push('Invalid GST number format');
  }

  if (!upiId || !isValidUPI(upiId.trim())) {
    errors.push('Invalid UPI ID format');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed', 
      data: { errors }
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
  return res.status(400).json({
    success: false,
    message: 'Phone number must be between 8 and 15 digits, optionally starting with "+"',
    data: { message: 'Phone number must be between 8 and 15 digits, optionally starting with "+"'}
  });
}


  if (!password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Password is required',
      data: { message: 'Password is required' }
    });
  }

  next();
};

export const validateOTP = (req, res, next) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
  return res.status(400).json({
    success: false,
    message: 'Phone number must be between 8 and 15 digits, optionally starting with "+"',
    data: { message: 'Phone number must be between 8 and 15 digits, optionally starting with "+"'}
  });
}


  if (!otp || !/^[0-9]{6}$/.test(otp)) {
    return res.status(400).json({ 
      success: false, 
      message: 'OTP must be exactly 6 digits',
      data: { message: 'OTP must be exactly 6 digits' }
    });
  }

  next();
};

export const validatePhoneNumber = (req, res, next) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
  return res.status(400).json({
    success: false,
    message: 'Phone number must be between 8 and 15 digits, optionally starting with "+"',
    data: { message: 'Phone number must be between 8 and 15 digits, optionally starting with "+"'}
  });
}


  next();
};

// Helper functions
const isValidGST = (gst) => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
};

const isValidUPI = (upi) => {
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  return upiRegex.test(upi);
};