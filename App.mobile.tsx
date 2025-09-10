import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Import mobile screens
import WorkingDashboardScreen from './src/screens/WorkingDashboardScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [balance] = useState(1250.50);

  const handleLogin = () => {
    Alert.alert('Success', 'Welcome to ZapPay!');
    setCurrentScreen('dashboard');
  };

  const handleSendMoney = () => {
    setCurrentScreen('send');
  };

  const handleReceiveMoney = () => {
    setCurrentScreen('qr');
  };

  const handleProfile = () => {
    setCurrentScreen('profile');
  };

  const handleHistory = () => {
    setCurrentScreen('history');
  };

  const handleLogout = () => {
    setCurrentScreen('login');
  };

  if (currentScreen === 'login') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.content}>
          <Text style={styles.title}>⚡ ZapPay</Text>
          <Text style={styles.subtitle}>Lightning Fast Payments</Text>
          
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'dashboard') {
    return <WorkingDashboardScreen />;
  }

  if (currentScreen === 'send') {
    Alert.alert('Send Money', 'Send money functionality will be implemented!');
    setCurrentScreen('dashboard');
    return null;
  }

  if (currentScreen === 'qr') {
    Alert.alert('QR Code', 'QR code functionality will be implemented!');
    setCurrentScreen('dashboard');
    return null;
  }

  if (currentScreen === 'profile') {
    Alert.alert('Profile', 'Profile functionality will be implemented!');
    setCurrentScreen('dashboard');
    return null;
  }

  if (currentScreen === 'history') {
    Alert.alert('Transaction History', 'Transaction history will be implemented!');
    setCurrentScreen('dashboard');
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, User! 👋</Text>
          <Text style={styles.welcomeText}>Welcome to ZapPay</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSendMoney}>
            <Text style={styles.actionIcon}>💸</Text>
            <Text style={styles.actionText}>Send Money</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleReceiveMoney}>
            <Text style={styles.actionIcon}>📱</Text>
            <Text style={styles.actionText}>Receive</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsCard}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <View style={styles.transactionItem}>
            <Text style={styles.transactionText}>No recent transactions</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6B7280',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F97316',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#F97316',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
  },
  linkText: {
    color: '#F97316',
    fontSize: 16,
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  transactionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  transactionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  transactionText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;
