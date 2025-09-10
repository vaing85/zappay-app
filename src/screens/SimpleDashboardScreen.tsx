import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const SimpleDashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode, colors } = useTheme();
  const [amount, setAmount] = useState('');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? colors.dark.background : colors.light.background,
    },
    header: {
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    greeting: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDarkMode ? colors.dark.text : colors.light.text,
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
      color: isDarkMode ? colors.dark.text : colors.light.text,
      marginBottom: 15,
    },
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    quickActionItem: {
      width: '48%',
      backgroundColor: isDarkMode ? colors.dark.card : colors.light.card,
      borderRadius: 15,
      padding: 20,
      alignItems: 'center',
      marginBottom: 15,
    },
    quickActionText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? colors.dark.text : colors.light.text,
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
      color: isDarkMode ? colors.dark.text : colors.light.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: isDarkMode ? colors.dark.card : colors.light.card,
      borderRadius: 12,
      paddingHorizontal: 15,
      paddingVertical: 15,
      fontSize: 16,
      color: isDarkMode ? colors.dark.text : colors.light.text,
      borderWidth: 1,
      borderColor: isDarkMode ? colors.dark.border : colors.light.border,
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
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hello, {user?.firstName || 'User'}! 👋
        </Text>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceText}>${user?.balance?.toFixed(2) || '0.00'}</Text>
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
          placeholderTextColor={isDarkMode ? colors.dark.textSecondary : colors.light.textSecondary}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Test Button</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SimpleDashboardScreen;

