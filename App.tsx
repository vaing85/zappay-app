import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [balance] = useState(1250.50);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogin = () => {
    Alert.alert('Success', 'Welcome to ZapPay!');
    setCurrentScreen('dashboard');
  };

  const handleSendMoney = () => {
    Alert.alert('Send Money', 'Send money functionality will be implemented!');
  };

  const handleReceiveMoney = () => {
    Alert.alert('Receive Money', 'Receive money functionality will be implemented!');
  };

  const handleLogout = () => {
    setCurrentScreen('login');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (currentScreen === 'login') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#111827' : '#F9FAFB' }]}>
        <StatusBar style="auto" />
        <View style={styles.content}>
          <Text style={[styles.title, { color: isDarkMode ? '#F97316' : '#F97316' }]}>⚡ ZapPay</Text>
          <Text style={[styles.subtitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Lightning Fast Payments</Text>
          
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkButton}>
            <Text style={[styles.linkText, { color: isDarkMode ? '#F97316' : '#F97316' }]}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#111827' : '#F9FAFB' }]}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: isDarkMode ? '#1F2937' : '#F97316' }]}>
          <TouchableOpacity style={[styles.themeButton, { backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }]} onPress={toggleTheme}>
            <Text style={[styles.themeButtonText, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
              {isDarkMode ? '☀️ Light' : '🌙 Dark'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.greeting}>Hello, User! 👋</Text>
          <Text style={styles.welcomeText}>Welcome to ZapPay</Text>
        </View>

        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
          <Text style={[styles.balanceLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Available Balance</Text>
          <Text style={[styles.balanceAmount, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>${balance.toFixed(2)}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]} onPress={handleSendMoney}>
            <Text style={styles.actionIcon}>💸</Text>
            <Text style={[styles.actionText, { color: isDarkMode ? '#F9FAFB' : '#374151' }]}>Send Money</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]} onPress={handleReceiveMoney}>
            <Text style={styles.actionIcon}>📱</Text>
            <Text style={[styles.actionText, { color: isDarkMode ? '#F9FAFB' : '#374151' }]}>Receive</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={[styles.transactionsCard, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>Recent Transactions</Text>
          <View style={[styles.transactionItem, { borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
            <Text style={[styles.transactionText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>No recent transactions</Text>
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
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
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
    fontSize: 16,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  actionButton: {
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
  },
  transactionsCard: {
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
    marginBottom: 16,
  },
  transactionItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  transactionText: {
    fontSize: 16,
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
  themeButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default App;