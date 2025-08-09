import { getConnection } from '../config/database.js';
import crypto from 'crypto';


class AuthService {
  async checkUserExists(phoneNumber) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, full_name, phone_number, is_verified FROM users WHERE phone_number = ?',
        [phoneNumber]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error checking user exists:', error);
      throw error;
    }
  }




  async validateLogin(phoneNumber, password) {
    try {
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      const [rows] = await pool.execute(
        'SELECT id, full_name, phone_number, shop_address, gst_number, upi_id, is_verified FROM users WHERE phone_number = ? AND password = ?',
        [phoneNumber, hashedPassword]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error validating login:', error);
      throw error;
    }
  }

  async generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async storeOTP(phoneNumber, otp) {
    try {
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      await pool.execute(
        'UPDATE users SET otp_code = ?, otp_expires = ? WHERE phone_number = ?',
        [otp, expiresAt, phoneNumber]
      );
    } catch (error) {
      console.error('Error storing OTP:', error);
      throw error;
    }
  }

  async verifyOTP(phoneNumber, otp) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, otp_code, otp_expires FROM users WHERE phone_number = ?',
        [phoneNumber]
      );

      if (rows.length === 0) return false;

      const user = rows[0];
      const now = new Date();
      const expiresAt = new Date(user.otp_expires);

      if (user.otp_code !== otp || now > expiresAt) {
        return false;
      }

      // Mark user as verified and clear OTP
      await pool.execute(
        'UPDATE users SET is_verified = TRUE, otp_code = NULL, otp_expires = NULL WHERE phone_number = ?',
        [phoneNumber]
      );

      return true;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      const { fullName, phoneNumber, shopAddress, gstNumber, upiId, password } = userData;
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      
      const [result] = await pool.execute(
        'INSERT INTO users (full_name, phone_number, shop_address, gst_number, upi_id, password) VALUES (?, ?, ?, ?, ?, ?)',
        [fullName, phoneNumber, shopAddress, gstNumber, upiId, hashedPassword]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async checkGSTExists(gstNumber) {
    try {
      const [rows] = await pool.execute(
        'SELECT id FROM users WHERE gst_number = ?',
        [gstNumber]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking GST exists:', error);
      throw error;
    }
  }

  async markUserAsVerified(phoneNumber) {
    try {
      const [result] = await pool.execute(
        'UPDATE users SET is_verified = TRUE, otp_code = NULL, otp_expires = NULL WHERE phone_number = ?',
        [phoneNumber]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error marking user as verified:', error);
      throw error;
    }
  }
}

// Add this line to export the class as default
export default new AuthService();