-- Create users table for Nutonium app
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(10) NOT NULL UNIQUE,
    shop_address TEXT NOT NULL,
    gst_number VARCHAR(15) NOT NULL UNIQUE,
    upi_id VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    otp_code VARCHAR(6) NULL,
    otp_expires DATETIME NULL,
    firebase_uid VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_phone_number (phone_number),
    INDEX idx_gst_number (gst_number),
    INDEX idx_is_verified (is_verified)
);

-- Sample data (remove in production)
-- INSERT INTO users (full_name, phone_number, shop_address, gst_number, upi_id, password, is_verified) 
-- VALUES ('Test User', '9876543210', 'Test Shop Address', '29ABCDE1234F1Z5', 'test@paytm', SHA2('password123', 256), TRUE);