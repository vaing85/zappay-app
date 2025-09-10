import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';

const WorkingDashboardScreen: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleSendMoney = () => {
    Alert.alert('Send Money', `Sending $${amount || '0.00'}`);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#111827' : '#FFFFFF',
    },
    header: {
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 20,
      backgroundColor: '#F97316',
    },
    greeting: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 5,
    },
    balanceCard: {
      margin: 20,
      padding: 30,
      borderRadius: 20,
      backgroundColor: '#F97316',
    },
    balanceText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: 5,
    },
    balanceLabel: {
      fontSize: 16,
      color: '#FFFFFF',
      textAlign: 'center',
      opacity: 0.9,
    },
    quickActions: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    quickActionsTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDarkMode ? '#F9FAFB' : '#1F2937',
      marginBottom: 15,
    },
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    quickActionItem: {
      width: '48%',
      backgroundColor: isDarkMode ? '#1F2937' : '#F8FAFC',
      borderRadius: 15,
      padding: 20,
      alignItems: 'center',
      marginBottom: 15,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    quickActionText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? '#F9FAFB' : '#1F2937',
      textAlign: 'center',
      marginTop: 10,
    },
    inputContainer: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: isDarkMode ? '#F9FAFB' : '#1F2937',
      marginBottom: 8,
    },
    input: {
      backgroundColor: isDarkMode ? '#1F2937' : '#F8FAFC',
      borderRadius: 12,
      paddingHorizontal: 15,
      paddingVertical: 15,
      fontSize: 16,
      color: isDarkMode ? '#F9FAFB' : '#1F2937',
      borderWidth: 1,
      borderColor: isDarkMode ? '#374151' : '#E5E7EB',
    },
    button: {
      backgroundColor: '#F97316',
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    themeButton: {
      backgroundColor: isDarkMode ? '#374151' : '#E5E7EB',
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
      alignSelf: 'flex-end',
      marginBottom: 10,
    },
    themeButtonText: {
      color: isDarkMode ? '#F9FAFB' : '#1F2937',
      fontSize: 14,
      fontWeight: '600',
    },
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
          <Text style={styles.themeButtonText}>
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.greeting}>
          Hello, User! 👋
        </Text>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceText}>$1,234.56</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionItem}>
            <Text style={styles.quickActionText}>💸 Send Money</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem}>
            <Text style={styles.quickActionText}>📱 Receive Money</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem}>
            <Text style={styles.quickActionText}>📊 History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem}>
            <Text style={styles.quickActionText}>⚙️ Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Test Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Test Amount Input</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={handleSendMoney}>
          <Text style={styles.buttonText}>Send ${amount || '0.00'}</Text>
        </TouchableOpacity>
      </View>

      {/* Status */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>App Status</Text>
        <Text style={[styles.input, { textAlign: 'center' }]}>
          ✅ React Native App Working!{'\n'}
          ✅ TypeScript Compiling{'\n'}
          ✅ Dark/Light Theme{'\n'}
          ✅ Input Handling{'\n'}
          ✅ Alert System
        </Text>
      </View>
    </ScrollView>
  );
};

export default WorkingDashboardScreen;

