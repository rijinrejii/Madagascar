import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeApiCall, getCurrentApiUrl } from '../../Nutonium/app/config/apiConfig';
import API_CONFIG from '../../Nutonium/app/config/apiConfig';

interface UserData {
  id: number;
  fullName: string;
  phoneNumber: string;
  shopAddress: string;
  gstNumber: string;
  upiId: string;
}

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  // Debug function to show current API URL
  const showApiUrl = () => {
    Alert.alert('Debug Info', `Current API URL: ${getCurrentApiUrl()}`);
  };

  // Helper function to safely store user data
  const storeUserData = async (userData: any) => {
    try {
      if (!userData) {
        console.error('❌ User data is null or undefined:', userData);
        throw new Error('User data is missing');
      }
      
      console.log('💾 Storing user data:', userData);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      console.log('✅ User data stored successfully');
    } catch (error) {
      console.error('❌ Error storing user data:', error);
      throw error;
    }
  };

  const handleLogin = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Attempting login for:', phoneNumber);
      const result = await makeApiCall(API_CONFIG.ENDPOINTS.LOGIN, 'POST', {
        phoneNumber,
        password,
      });

      console.log('📥 Login response:', result);

      if (result.success && result.data) {
        // Handle nested response structure from makeApiCall
        const responseData = result.data.data || result.data;
        
        // Check if user data exists in the response
        if (responseData && responseData.user) {
          await storeUserData(responseData.user);
          Alert.alert('Success', 'Login successful!', [
            { text: 'OK', onPress: () => router.replace('../home') }
          ]);
        } else {
          console.error('❌ User data missing from login response:', result.data);
          Alert.alert('Error', 'Login failed - user data not received');
        }
      } else {
        // Handle various error cases
        if (result.data?.message?.includes('not verified') || result.data?.requiresVerification) {
          setNeedsVerification(true);
          Alert.alert('Verification Required', 'Please verify your account with OTP');
        } else {
          const errorMessage = result.data?.message || 'Login failed';
          console.log('❌ Login failed:', errorMessage);
          Alert.alert('Error', errorMessage);
        }
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      console.log('📱 Sending OTP to:', phoneNumber);
      const result = await makeApiCall(API_CONFIG.ENDPOINTS.SEND_OTP, 'POST', {
        phoneNumber,
      });

      console.log('📥 Send OTP response:', result);

      if (result.success) {
        setOtpSent(true);
        Alert.alert('Success', 'OTP sent successfully to your phone number');
      } else {
        const errorMessage = result.data?.message || 'Failed to send OTP';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('❌ Error sending OTP:', error);
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
      console.log('🔐 Verifying OTP for:', phoneNumber);
      const result = await makeApiCall(API_CONFIG.ENDPOINTS.VERIFY_OTP, 'POST', {
        phoneNumber,
        otp,
      });

      console.log('📥 Verify OTP response:', result);

      if (result.success && result.data) {
        // Handle nested response structure from makeApiCall
        const responseData = result.data.data || result.data;
        
        // Check if user data exists in verification response
        if (responseData && responseData.user) {
          await storeUserData(responseData.user);
          Alert.alert('Success', 'Account verified and login successful!', [
            { text: 'OK', onPress: () => router.replace('../home') }
          ]);
        } else {
          // If no user data in verify response, try to login
          console.log('🔄 No user data in verify response, attempting login...');
          const loginResult = await makeApiCall(API_CONFIG.ENDPOINTS.LOGIN, 'POST', {
            phoneNumber,
            password,
          });

          console.log('📥 Post-verification login response:', loginResult);

          if (loginResult.success && loginResult.data) {
            const loginResponseData = loginResult.data.data || loginResult.data;
            if (loginResponseData && loginResponseData.user) {
              await storeUserData(loginResponseData.user);
              Alert.alert('Success', 'Login successful!', [
                { text: 'OK', onPress: () => router.replace('../home') }
              ]);
            } else {
              const errorMessage = loginResponseData?.message || 'Login failed after verification';
              Alert.alert('Error', errorMessage);
            }
          } else {
            const errorMessage = loginResult.data?.message || 'Login failed after verification';
            Alert.alert('Error', errorMessage);
          }
        }
      } else {
        const errorMessage = result.data?.message || 'Invalid or expired OTP';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('❌ Error verifying OTP:', error);
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp('');
    await handleSendOTP();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your Nutonium account</Text>
        
        {/* Debug button - remove in production */}
        {__DEV__ && (
          <TouchableOpacity style={styles.debugButton} onPress={showApiUrl}>
            <Text style={styles.debugButtonText}>Debug: Show API URL</Text>
          </TouchableOpacity>
        )}
        
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          maxLength={10}
          editable={!loading}
        />
        
        {!needsVerification && (
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
        )}
        
        {needsVerification && !otpSent ? (
          <>
            <Text style={styles.verificationText}>
              Your account needs verification. Please verify with OTP.
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
        ) : needsVerification && otpSent ? (
          <>
            <Text style={styles.verificationText}>
              Enter the 6-digit OTP sent to +91{phoneNumber}
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
        ) : (
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
        )}
        
        <TouchableOpacity onPress={() => router.push('../signup')}>
          <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
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
    marginTop: 20,
    fontSize: 16,
  },
  verificationText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  debugButton: {
    backgroundColor: '#ff6b6b',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  debugButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
  },
});