import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserData {
  id: number;
  fullName: string;
  phoneNumber: string;
  shopAddress: string;
  gstNumber: string;
  upiId: string;
}

export default function HomeScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('userData');
      if (storedData) {
        setUserData(JSON.parse(storedData));
      } else {
        router.replace('../login');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      router.replace('../login');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userData');
              router.replace('../login');
            } catch (error) {
              console.error('Error during logout:', error);
              router.replace('../login');
            }
          },
        },
      ]
    );
  };

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nutonium</Text>
        <Text style={styles.subtitle}>Welcome to your Network platform</Text>
      </View>

      <View style={styles.userCard}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{userData.fullName}</Text>
        
        <View style={styles.userInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{userData.phoneNumber}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Shop:</Text>
            <Text style={styles.infoValue}>{userData.shopAddress}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>GST:</Text>
            <Text style={styles.infoValue}>{userData.gstNumber}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>UPI:</Text>
            <Text style={styles.infoValue}>{userData.upiId}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>View Network</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Add Connection</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Profile Settings</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A90E2',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  userInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  actionButtons: {
    gap: 15,
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    paddingHorizontal: 30,
    paddingVertical: 15,
    alignSelf: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});