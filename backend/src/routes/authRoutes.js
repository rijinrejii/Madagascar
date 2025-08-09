import express from 'express';
import { authController } from '../controllers/authController.js';
import { validateSignup, validateLogin, validateOTP, validatePhoneNumber } from '../middleware/validation.js';

const router = express.Router();

// Signup route
router.post('/signup', validateSignup, authController.signup);

// Login route
router.post('/login', validateLogin, authController.login);

// Send OTP route (separate endpoint for frontend compatibility)
router.post('/send-otp', validatePhoneNumber, authController.sendOTP);

// Verify OTP route
router.post('/verify-otp', validateOTP, authController.verifyOTP);

// Resend OTP route
router.post('/resend-otp', validatePhoneNumber, authController.resendOTP);

export default router;