import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { usePaymentActions } from '../store/paymentStore';
import { showApiError } from '../services/errorHandler';
import { LOADING_KEYS, withLoadingAndError } from '../services/loadingService';

const SendMoneyScreen = ({ navigation, route }: any) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState(route?.params?.amount || '');
  const [note, setNote] = useState('');
  
  const { sendMoney } = usePaymentActions();

  const handleSend = async () => {
    if (!recipient || !amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      const success = await withLoadingAndError(
        LOADING_KEYS.PAYMENT_SEND,
        () => sendMoney(recipient, amountNum, note),
        'Sending money...',
        'Send Money Failed'
      );

      if (success) {
        Alert.alert('Success', `$${amount} sent to ${recipient}`, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      showApiError(error, 'Send Money Failed');
    }
  };

  const quickAmounts = [10, 25, 50, 100];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
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
    formContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1F2937',
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F8FAFC',
      borderRadius: 12,
      paddingHorizontal: 15,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    input: {
      flex: 1,
      paddingVertical: 15,
      fontSize: 16,
      color: '#1F2937',
    },
    amountInput: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    quickAmounts: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 20,
    },
    quickAmountButton: {
      backgroundColor: '#F8FAFC',
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    quickAmountText: {
      color: '#1F2937',
      fontWeight: '600',
    },
    sendButton: {
      marginTop: 30,
      backgroundColor: '#F97316',
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: 'center',
    },
    sendButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      color: '#FFFFFF',
      marginLeft: 10,
      fontSize: 16,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={{ color: '#FFFFFF', fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Money</Text>
      </View>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        {/* Amount Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Amount</Text>
          <View style={styles.inputWrapper}>
            <Text style={[styles.input, { fontSize: 24, fontWeight: 'bold' }]}>$</Text>
            <TextInput
              style={[styles.input, styles.amountInput]}
              placeholder="0.00"
              placeholderTextColor="#6B7280"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              autoFocus
            />
          </View>
        </View>

        {/* Quick Amounts */}
        <View style={styles.quickAmounts}>
          {quickAmounts.map((quickAmount) => (
            <TouchableOpacity
              key={quickAmount}
              style={styles.quickAmountButton}
              onPress={() => setAmount(quickAmount.toString())}
            >
              <Text style={styles.quickAmountText}>${quickAmount}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recipient Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>To</Text>
          <View style={styles.inputWrapper}>
            <Text style={{ marginRight: 10, color: '#F97316' }}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="Email, phone, or @username"
              placeholderTextColor="#6B7280"
              value={recipient}
              onChangeText={setRecipient}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Note Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Note (Optional)</Text>
          <View style={styles.inputWrapper}>
            <Text style={{ marginRight: 10, color: '#F97316' }}>📝</Text>
            <TextInput
              style={styles.input}
              placeholder="What's this for?"
              placeholderTextColor="#6B7280"
              value={note}
              onChangeText={setNote}
              multiline
            />
          </View>
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Sending...</Text>
            </View>
          ) : (
            <Text style={styles.sendButtonText}>Send ${amount || '0.00'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SendMoneyScreen;