import { User } from '../models/user.js';  
import { sendOTPNotification } from '../services/notificationService.js';
import jwt from 'jsonwebtoken';

export const authController = {
  // User signup
  async signup(req, res) {
    console.log('📝 Signup request received:', req.body);
    try {
      const { fullName, phoneNumber, shopAddress, gstNumber, upiId, password } = req.body;

      console.log('🔍 Extracted data:', { 
        fullName, 
        phoneNumber, 
        shopAddress: shopAddress?.substring(0, 50) + '...', 
        gstNumber, 
        upiId 
      });

      // ADDED: Validate required fields to prevent undefined values
      if (!fullName || !phoneNumber || !shopAddress || !gstNumber || !upiId || !password) {
        console.log('❌ Missing required fields');
        return res.status(400).json({ 
          success: false, 
          message: 'All fields are required',
          data: { message: 'All fields are required' }
        });
      }

      // Check if user already exists
      console.log('🔍 Checking if user exists...');
      const existingUser = await User.findByPhone(phoneNumber);
      if (existingUser) {
        console.log('⚠️ User already exists');
        return res.status(400).json({ 
          success: false, 
          message: 'User with this phone number already exists' 
        });
      }

      // Create new user with explicit field mapping
      console.log('👤 Creating new user...');
      const userData = {
        full_name: fullName,
        phone_number: phoneNumber,
        shop_address: shopAddress,
        gst_number: gstNumber,
        upi_id: upiId,
        password: password,
        is_verified: false,
        firebase_uid: null  // ADDED: Explicitly set to null
      };

      console.log('🔍 User data to save:', userData);
      
      const user = new User(userData);

      console.log('💾 Saving user to database...');
      await user.save();
      console.log('✅ User created successfully with ID:', user.id);

      // Generate and send OTP
      console.log('🔐 Generating OTP...');
      const otpCode = User.generateOTP();
      await user.updateOTP(otpCode);
      console.log('📱 OTP generated:', otpCode);
      
      // Send OTP notification
      try {
        await sendOTPNotification(phoneNumber, otpCode);
        console.log('📤 OTP sent successfully');
      } catch (otpError) {
        console.error('⚠️ Failed to send OTP:', otpError.message);
        // Continue even if OTP sending fails
      }

      res.status(201).json({
        success: true,
        message: 'Account created successfully! Please verify your phone number.',
        data: {
          userId: user.id,
          message: 'User created successfully. OTP sent to your phone.'
        }
      });

    } catch (error) {
      console.error('❌ Signup error:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { 
          error: error.message,
          stack: error.stack 
        })
      });
    }
  },

  // Send OTP (separate endpoint for frontend compatibility)
  async sendOTP(req, res) {
    console.log('📱 Send OTP request received:', req.body);
    try {
      const { phoneNumber } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({ 
          success: false, 
          message: 'Phone number is required' 
        });
      }

      const user = await User.findByPhone(phoneNumber);
      if (!user) {
        console.log('❌ User not found for phone:', phoneNumber);
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      // Generate and send OTP
      const otpCode = User.generateOTP();
      await user.updateOTP(otpCode);
      console.log('🔐 OTP generated for existing user:', otpCode);
      
      try {
        await sendOTPNotification(phoneNumber, otpCode);
        console.log('📤 OTP sent successfully');
      } catch (otpError) {
        console.error('⚠️ Failed to send OTP:', otpError.message);
      }

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        data: {
          message: 'OTP sent successfully to your phone number'
        }
      });

    } catch (error) {
      console.error('❌ Send OTP error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send OTP' 
      });
    }
  },

  // User login
  async login(req, res) {
    console.log('🔐 Login request received:', { phoneNumber: req.body.phoneNumber });
    try {
      const { phoneNumber, password } = req.body;

      if (!phoneNumber || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Phone number and password are required' 
        });
      }

      // Find user
      const user = await User.findByPhone(phoneNumber);
      if (!user) {
        console.log('❌ User not found for login:', phoneNumber);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      // Verify password
      const isValidPassword = await User.comparePassword(password, user.password);
      if (!isValidPassword) {
        console.log('❌ Invalid password for user:', phoneNumber);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      // Check if user is verified
      if (!user.is_verified) {
        console.log('⚠️ User not verified:', phoneNumber);
        return res.status(200).json({
          success: false,
          message: 'Account not verified. Please verify your account first.',
          data: {
            message: 'Account not verified. Please verify your account first.',
            requiresVerification: true,
            userId: user.id
          }
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { user_id: user.id, phone_number: user.phone_number },
        process.env.JWT_SECRET || 'madagascar-secret-key-2024',
        { expiresIn: '7d' }
      );

      console.log('✅ Login successful for user:', phoneNumber);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          token
        }
      });

    } catch (error) {
      console.error('❌ Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  },

  // Verify OTP
  async verifyOTP(req, res) {
    console.log('🔐 Verify OTP request received:', { phoneNumber: req.body.phoneNumber, otp: req.body.otp });
    try {
      const { phoneNumber, otp } = req.body;

      if (!phoneNumber || !otp) {
        return res.status(400).json({ 
          success: false, 
          message: 'Phone number and OTP are required' 
        });
      }

      const user = await User.findByPhone(phoneNumber);
      if (!user) {
        console.log('❌ User not found for OTP verification:', phoneNumber);
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      // Verify OTP
      try {
        await user.verifyOTP(otp);
        console.log('✅ OTP verified successfully for:', phoneNumber);
      } catch (otpError) {
        console.log('❌ OTP verification failed:', otpError.message);
        return res.status(400).json({ 
          success: false, 
          message: otpError.message,
          data: { message: otpError.message }
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { user_id: user.id, phone_number: user.phone_number },
        process.env.JWT_SECRET || 'madagascar-secret-key-2024',
        { expiresIn: '7d' }
      );

      res.status(200).json({
        success: true,
        message: 'Phone number verified successfully!',
        data: {
          user: user.toJSON(),
          token,
          message: 'Phone number verified successfully!'
        }
      });

    } catch (error) {
      console.error('❌ OTP verification error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  },

  // Resend OTP
  async resendOTP(req, res) {
    console.log('🔄 Resend OTP request received:', req.body);
    try {
      const { phoneNumber } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({ 
          success: false, 
          message: 'Phone number is required' 
        });
      }

      const user = await User.findByPhone(phoneNumber);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      // Generate and send new OTP
      const otpCode = User.generateOTP();
      await user.updateOTP(otpCode);
      console.log('🔐 New OTP generated:', otpCode);
      
      try {
        await sendOTPNotification(phoneNumber, otpCode);
        console.log('📤 OTP resent successfully');
      } catch (otpError) {
        console.error('⚠️ Failed to resend OTP:', otpError.message);
      }

      res.status(200).json({
        success: true,
        message: 'OTP resent successfully',
        data: {
          message: 'OTP resent successfully'
        }
      });

    } catch (error) {
      console.error('❌ Resend OTP error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }
};