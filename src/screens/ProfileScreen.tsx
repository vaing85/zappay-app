import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth, useAuthActions } from '../store/authStore';
import { showApiError } from '../services/errorHandler';
import { LOADING_KEYS, withLoadingAndError } from '../services/loadingService';

const ProfileScreen = ({ navigation }: any) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const { user } = useAuth();
  const { logout } = useAuthActions();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: async () => {
          try {
            await withLoadingAndError(
              LOADING_KEYS.AUTH_LOGOUT,
              () => logout(),
              'Logging out...',
              'Logout Failed'
            );
          } catch (error) {
            showApiError(error, 'Logout Failed');
          }
        }},
      ]
    );
  };

  const handleEnableBiometric = () => {
    Alert.alert(
      'Enable Biometric',
      'Do you want to enable biometric authentication for faster login?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Enable', onPress: () => {
          Alert.alert('Success', 'Biometric authentication enabled (mock)');
        }},
      ]
    );
  };

  const menuItems = [
    {
      id: 'settings',
      title: 'Settings',
      icon: '⚙️',
      onPress: () => Alert.alert('Settings', 'Settings screen coming soon'),
    },
    {
      id: 'security',
      title: 'Security',
      icon: '🔒',
      onPress: () => Alert.alert('Security', 'Security settings coming soon'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: '🔔',
      onPress: () => Alert.alert('Notifications', 'Notification settings coming soon'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: '❓',
      onPress: () => Alert.alert('Help', 'Help & Support coming soon'),
    },
    {
      id: 'about',
      title: 'About',
      icon: 'ℹ️',
      onPress: () => Alert.alert('About', 'ZapPay v1.0.0\nLightning Fast Payments'),
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#111827' : '#FFFFFF',
    },
    header: {
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 20,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F97316',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginLeft: 15,
    },
    backButton: {
      padding: 5,
    },
    profileCard: {
      margin: 20,
      borderRadius: 20,
      overflow: 'hidden',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    profileContent: {
      padding: 30,
      alignItems: 'center',
      backgroundColor: '#F97316',
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
    },
    avatarText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#F97316',
    },
    userName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 5,
    },
    userEmail: {
      fontSize: 16,
      color: '#FFFFFF',
      opacity: 0.9,
      marginBottom: 20,
    },
    balanceCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 12,
      padding: 15,
      alignItems: 'center',
      marginBottom: 20,
    },
    balanceLabel: {
      fontSize: 14,
      color: '#FFFFFF',
      opacity: 0.9,
      marginBottom: 5,
    },
    balanceAmount: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    biometricCard: {
      backgroundColor: isDarkMode ? '#1F2937' : '#F8FAFC',
      padding: 15,
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    biometricIcon: {
      marginRight: 15,
    },
    biometricContent: {
      flex: 1,
    },
    biometricTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDarkMode ? '#F9FAFB' : '#1F2937',
      marginBottom: 2,
    },
    biometricDescription: {
      fontSize: 12,
      color: isDarkMode ? '#9CA3AF' : '#6B7280',
    },
    menuContainer: {
      paddingHorizontal: 20,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#1F2937' : '#F8FAFC',
      padding: 15,
      marginBottom: 10,
      borderRadius: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    menuIcon: {
      marginRight: 15,
      fontSize: 20,
    },
    menuTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: isDarkMode ? '#F9FAFB' : '#1F2937',
    },
    menuArrow: {
      marginLeft: 10,
      color: isDarkMode ? '#9CA3AF' : '#6B7280',
    },
    logoutButton: {
      margin: 20,
      backgroundColor: '#EF4444',
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: 'center',
    },
    logoutButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    themeButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
      alignSelf: 'flex-end',
      marginBottom: 10,
    },
    themeButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={{ color: '#FFFFFF', fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.themeButton} onPress={() => setIsDarkMode(!isDarkMode)}>
          <Text style={styles.themeButtonText}>
            {isDarkMode ? '☀️' : '🌙'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          
          <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>$1,234.56</Text>
          </View>
        </View>
      </View>

      {/* Biometric Card */}
      <TouchableOpacity style={styles.biometricCard} onPress={handleEnableBiometric}>
        <Text style={styles.biometricIcon}>👆</Text>
        <View style={styles.biometricContent}>
          <Text style={styles.biometricTitle}>Enable Biometric Login</Text>
          <Text style={styles.biometricDescription}>
            Use fingerprint or face recognition for faster, more secure login
          </Text>
        </View>
        <Text style={styles.menuArrow}>→</Text>
      </TouchableOpacity>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfileScreen;