import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { makeApiCall } from '../../Nutonium/app/config/apiConfig';
import API_CONFIG from '../../Nutonium/app/config/apiConfig';

interface FormData {
  fullName: string;
  phoneNumber: string;
  shopAddress: string;
  gstNumber: string;
  upiId: string;
  password: string;
  confirmPassword: string;
}

export default function SignupScreen() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phoneNumber: '',
    shopAddress: '',
    gstNumber: '',
    upiId: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [signupComplete, setSignupComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const { fullName, phoneNumber, shopAddress, gstNumber, upiId, password, confirmPassword } = formData;

    const cleanedGST = gstNumber.trim().toUpperCase();
    const cleanedUPI = upiId.trim();

    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }

    if (!phoneNumber || phoneNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return false;
    }

    if (!shopAddress.trim()) {
      Alert.alert('Error', 'Please enter your shop address');
      return false;
    }

    if (!cleanedGST || !isValidGST(cleanedGST)) {
      Alert.alert('Error', 'Please enter a valid GST number');
      return false;
    }

    if (!cleanedUPI || !isValidUPI(cleanedUPI)) {
      Alert.alert('Error', 'Please enter a valid UPI ID');
      return false;
    }

    if (!password || password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const isValidGST = (gst: string) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  };

  const isValidUPI = (upi: string) => {
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    return upiRegex.test(upi);
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await makeApiCall(API_CONFIG.ENDPOINTS.SIGNUP, 'POST', {
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        shopAddress: formData.shopAddress.trim(),
        gstNumber: formData.gstNumber.trim().toUpperCase(),
        upiId: formData.upiId.trim(),
        password: formData.password,
      });

      if (result.success) {
        setSignupComplete(true);
        Alert.alert('Success', 'Account created successfully! Please verify your phone number.');
      } else {
        Alert.alert('Error', result.data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!formData.phoneNumber) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    setLoading(true);
    try {
      const result = await makeApiCall(API_CONFIG.ENDPOINTS.SEND_OTP, 'POST', {
        phoneNumber: formData.phoneNumber,
      });

      if (result.success) {
        setOtpSent(true);
        Alert.alert('Success', 'OTP sent successfully to your phone number');
      } else {
        Alert.alert('Error', result.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const result = await makeApiCall(API_CONFIG.ENDPOINTS.VERIFY_OTP, 'POST', {
        phoneNumber: formData.phoneNumber,
        otp,
      });

      if (result.success) {
        Alert.alert('Success', 'Phone number verified successfully!', [
          { text: 'OK', onPress: () => router.replace('../login') }
        ]);
      } else {
        Alert.alert('Error', result.data.message || 'Failed to verify OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp('');
    await handleSendOTP();
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Nutonium today</Text>
        
        {!signupComplete ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Full Name *"
              value={formData.fullName}
              onChangeText={(text) => updateFormData('fullName', text)}
              editable={!loading}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Phone Number *"
              value={formData.phoneNumber}
              onChangeText={(text) => updateFormData('phoneNumber', text)}
              keyboardType="phone-pad"
              maxLength={10}
              editable={!loading}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Shop Address *"
              value={formData.shopAddress}
              onChangeText={(text) => updateFormData('shopAddress', text)}
              multiline
              editable={!loading}
            />
            
            <TextInput
              style={styles.input}
              placeholder="GST Number * (e.g., 29ABCDE1234F1Z5)"
              value={formData.gstNumber}
              onChangeText={(text) => updateFormData('gstNumber', text.toUpperCase())}
              autoCapitalize="characters"
              editable={!loading}
            />
            
            <TextInput
              style={styles.input}
              placeholder="UPI ID * (e.g., name@paytm)"
              value={formData.upiId}
              onChangeText={(text) => updateFormData('upiId', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password * (min 6 characters)"
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
              secureTextEntry
              editable={!loading}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Confirm Password *"
              value={formData.confirmPassword}
              onChangeText={(text) => updateFormData('confirmPassword', text)}
              secureTextEntry
              editable={!loading}
            />
            
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </>
        ) : !otpSent ? (
          <>
            <Text style={styles.verificationText}>
              Account created successfully! Please verify your phone number to complete registration.
            </Text>
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleSendOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.verificationText}>
              Enter the 6-digit OTP sent to +91{formData.phoneNumber}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              editable={!loading}
            />
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleVerifyOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
              <Text style={styles.linkText}>Resend OTP</Text>
            </TouchableOpacity>
          </>
        )}
        
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    marginTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    color: '#4A90E2',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
  verificationText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
});