// Create this file at: src/services/notificationService.js

export const sendOTPNotification = async (phoneNumber, otpCode) => {
  try {
    // For now, just log the OTP since you don't have SMS service configured
    console.log(`📱 OTP for ${phoneNumber}: ${otpCode}`);
    
    // TODO: Implement actual SMS sending logic here
    // This could be via Firebase, Twilio, or any other SMS service
    
    return true;
  } catch (error) {
    console.error('Failed to send OTP notification:', error);
    throw error;
  }
};