import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useAuth } from '../store/authStore';
import { useBalance, useTransactions, usePaymentActions } from '../store/paymentStore';
import { useUnreadCount } from '../store/notificationStore';

const DashboardScreen = ({ navigation }: any) => {
  const [amount, setAmount] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const { user } = useAuth();
  const balance = useBalance();
  const transactions = useTransactions();
  const unreadCount = useUnreadCount();
  const { getBalance, getTransactionHistory } = usePaymentActions();

  // Load data on component mount
  useEffect(() => {
    getBalance();
    getTransactionHistory({ limit: 5 }); // Load recent transactions
  }, []);

  const handleSendMoney = () => {
    if (!amount) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }
    navigation.navigate('Send', { amount });
  };

  const handleReceiveMoney = () => {
    navigation.navigate('Receive');
  };

  const handleViewHistory = () => {
    navigation.navigate('History');
  };

  const handleViewProfile = () => {
    navigation.navigate('Profile');
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
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    greeting: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    themeButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    themeButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    balanceCard: {
      margin: 20,
      padding: 30,
      borderRadius: 20,
      backgroundColor: '#F97316',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
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
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#1F2937' : '#F8FAFC',
      borderRadius: 12,
      paddingHorizontal: 15,
      borderWidth: 1,
      borderColor: isDarkMode ? '#374151' : '#E5E7EB',
    },
    input: {
      flex: 1,
      paddingVertical: 15,
      fontSize: 16,
      color: isDarkMode ? '#F9FAFB' : '#1F2937',
    },
    sendButton: {
      backgroundColor: '#F97316',
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: 'center',
      marginTop: 10,
    },
    sendButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    recentTransactions: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    recentTransactionsTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDarkMode ? '#F9FAFB' : '#1F2937',
      marginBottom: 15,
    },
    transactionItem: {
      backgroundColor: isDarkMode ? '#1F2937' : '#F8FAFC',
      borderRadius: 12,
      padding: 15,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    transactionIcon: {
      marginRight: 15,
    },
    transactionDetails: {
      flex: 1,
    },
    transactionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDarkMode ? '#F9FAFB' : '#1F2937',
      marginBottom: 2,
    },
    transactionDate: {
      fontSize: 12,
      color: isDarkMode ? '#9CA3AF' : '#6B7280',
    },
    transactionAmount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#10B981',
    },
  });

  const recentTransactions = [
    {
      id: '1',
      type: 'sent',
      amount: 50.00,
      recipient: 'John Doe',
      date: '2024-01-15',
    },
    {
      id: '2',
      type: 'received',
      amount: 25.00,
      sender: 'Jane Smith',
      date: '2024-01-14',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.greeting}>Hello, {user?.firstName || 'User'}! 👋</Text>
          <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
            <Text style={styles.themeButtonText}>
              {isDarkMode ? '☀️' : '🌙'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceText}>${balance.toFixed(2)}</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionItem} onPress={handleSendMoney}>
            <Text style={styles.quickActionText}>💸 Send Money</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem} onPress={handleReceiveMoney}>
            <Text style={styles.quickActionText}>📱 Receive Money</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem} onPress={handleViewHistory}>
            <Text style={styles.quickActionText}>📊 History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem} onPress={handleViewProfile}>
            <Text style={styles.quickActionText}>👤 Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Send */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Quick Send</Text>
        <View style={styles.inputWrapper}>
          <Text style={{ marginRight: 10, color: '#F97316', fontSize: 18 }}>$</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMoney}>
          <Text style={styles.sendButtonText}>Send ${amount || '0.00'}</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions */}
      <View style={styles.recentTransactions}>
        <Text style={styles.recentTransactionsTitle}>Recent Transactions</Text>
        {transactions.slice(0, 3).map((transaction) => (
          <TouchableOpacity key={transaction.id} style={styles.transactionItem}>
            <Text style={styles.transactionIcon}>
              {transaction.type === 'sent' ? '💸' : '💰'}
            </Text>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionTitle}>
                {transaction.type === 'sent' ? 'Sent to' : 'Received from'}{' '}
                {transaction.recipient || transaction.sender}
              </Text>
              <Text style={styles.transactionDate}>
                {new Date(transaction.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.transactionAmount}>
              {transaction.type === 'sent' ? '-' : '+'}${transaction.amount.toFixed(2)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default DashboardScreen;