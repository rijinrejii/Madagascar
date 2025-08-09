import { getConnection } from '../config/database.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export class User {
  constructor(userData) {
    this.id = userData.id;
    this.full_name = userData.full_name || userData.fullName;
    this.phone_number = userData.phone_number || userData.phoneNumber;
    this.shop_address = userData.shop_address || userData.shopAddress;
    this.gst_number = userData.gst_number || userData.gstNumber;
    this.upi_id = userData.upi_id || userData.upiId;
    this.password = userData.password;
    this.is_verified = userData.is_verified || false;
    this.otp_code = userData.otp_code || null;
    this.otp_expires = userData.otp_expires || null;
    this.firebase_uid = userData.firebase_uid || null; // FIXED: Default to null instead of undefined
  }

  // Convert database format to frontend format
  toJSON() {
    return {
      id: this.id,
      fullName: this.full_name,
      phoneNumber: this.phone_number,
      shopAddress: this.shop_address,
      gstNumber: this.gst_number,
      upiId: this.upi_id,
      isVerified: this.is_verified
    };
  }

  // Hash password
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
  }

  // Compare password
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Generate OTP
  static generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Calculate OTP expiry (1:30 minutes from now)
  static getOTPExpiry() {
    const now = new Date();
    return new Date(now.getTime() + 90000); // 90 seconds = 1:30 minutes
  }

  // Create new user
  async save() {
    const db = getConnection();
    const hashedPassword = await User.hashPassword(this.password);
    
    // FIXED: Ensure all parameters are properly defined or null
    const [result] = await db.execute(
      `INSERT INTO users (full_name, phone_number, shop_address, gst_number, 
       upi_id, password, is_verified, firebase_uid) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        this.full_name || null,
        this.phone_number || null,
        this.shop_address || null,
        this.gst_number || null,
        this.upi_id || null,
        hashedPassword || null,
        this.is_verified || false,
        this.firebase_uid || null  // FIXED: Explicitly handle undefined
      ]
    );
    
    this.id = result.insertId;
    return this;
  }

  // Update user verification status
  async markAsVerified() {
    const db = getConnection();
    await db.execute(
      'UPDATE users SET is_verified = TRUE, otp_code = NULL, otp_expires = NULL WHERE id = ?',
      [this.id]
    );
    
    this.is_verified = true;
    this.otp_code = null;
    this.otp_expires = null;
  }

  // Find user by phone number
  static async findByPhone(phone_number) {
    const db = getConnection();
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE phone_number = ?',
      [phone_number]
    );
    
    return rows.length > 0 ? new User(rows[0]) : null;
  }

  // Find user by ID
  static async findById(id) {
    const db = getConnection();
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    
    return rows.length > 0 ? new User(rows[0]) : null;
  }

  // Update OTP
  async updateOTP(otpCode) {
    const db = getConnection();
    const otpExpires = User.getOTPExpiry();
    
    await db.execute(
      'UPDATE users SET otp_code = ?, otp_expires = ? WHERE id = ?',
      [otpCode, otpExpires, this.id]
    );
    
    this.otp_code = otpCode;
    this.otp_expires = otpExpires;
  }

  // Verify OTP
  async verifyOTP(inputOTP) {
    const now = new Date();
    
    if (this.otp_expires < now) {
      throw new Error('OTP has expired');
    }
    
    if (this.otp_code !== inputOTP) {
      throw new Error('Invalid OTP');
    }
    
    // Clear OTP after successful verification
    const db = getConnection();
    await db.execute(
      'UPDATE users SET otp_code = NULL, otp_expires = NULL, is_verified = TRUE WHERE id = ?',
      [this.id]
    );
    
    this.otp_code = null;
    this.otp_expires = null;
    this.is_verified = true;
  }

  // Check if OTP is expired
  isOTPExpired() {
    if (!this.otp_expires) return true;
    return new Date() > new Date(this.otp_expires);
  }
}