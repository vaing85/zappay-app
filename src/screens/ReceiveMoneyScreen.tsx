import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';

const ReceiveMoneyScreen = ({ navigation }: any) => {
  const [amount, setAmount] = useState('');

  const generateQRData = () => {
    return JSON.stringify({
      type: 'payment_request',
      userId: 'user123',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      amount: amount ? parseFloat(amount) : null,
      timestamp: new Date().toISOString(),
    });
  };

  const shareQRCode = async () => {
    try {
      const qrData = generateQRData();
      await Share.share({
        message: `ZapPay Payment Request\nAmount: ${amount ? `$${amount}` : 'Any amount'}\nScan with ZapPay to pay`,
        url: qrData,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share QR code');
    }
  };

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
    content: {
      flex: 1,
      paddingHorizontal: 20,
      alignItems: 'center',
    },
    qrContainer: {
      backgroundColor: '#FFFFFF',
      padding: 30,
      borderRadius: 20,
      alignItems: 'center',
      marginBottom: 30,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    qrPlaceholder: {
      width: 200,
      height: 200,
      backgroundColor: '#F3F4F6',
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    qrText: {
      fontSize: 16,
      color: '#6B7280',
      textAlign: 'center',
    },
    amountText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: 10,
    },
    userInfo: {
      alignItems: 'center',
    },
    userName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1F2937',
      marginBottom: 5,
    },
    userEmail: {
      fontSize: 14,
      color: '#6B7280',
    },
    amountInput: {
      backgroundColor: '#F8FAFC',
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: 15,
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1F2937',
      textAlign: 'center',
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      width: '100%',
    },
    quickAmounts: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 30,
      width: '100%',
    },
    quickAmountButton: {
      backgroundColor: '#F8FAFC',
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    quickAmountText: {
      color: '#1F2937',
      fontWeight: '600',
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
    },
    actionButton: {
      flex: 1,
      marginHorizontal: 10,
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: 'center',
    },
    shareButton: {
      backgroundColor: '#3B82F6',
    },
    saveButton: {
      backgroundColor: '#10B981',
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    instructions: {
      marginTop: 30,
      paddingHorizontal: 20,
    },
    instructionsText: {
      fontSize: 16,
      color: '#6B7280',
      textAlign: 'center',
      lineHeight: 24,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={{ color: '#FFFFFF', fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Receive Money</Text>
      </View>

      <View style={styles.content}>
        {/* QR Code Placeholder */}
        <View style={styles.qrContainer}>
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrText}>
              QR Code{'\n'}
              (Mock Display)
            </Text>
          </View>
          
          {amount && (
            <Text style={styles.amountText}>${amount}</Text>
          )}
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>John Doe</Text>
            <Text style={styles.userEmail}>john@example.com</Text>
          </View>
        </View>

        {/* Amount Input */}
        <Text style={[styles.amountText, { marginBottom: 10 }]}>
          Set Amount (Optional)
        </Text>
        <TextInput
          style={styles.amountInput}
          placeholder="Enter amount"
          placeholderTextColor="#6B7280"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        {/* Quick Amounts */}
        <View style={styles.quickAmounts}>
          {[10, 25, 50, 100].map((quickAmount) => (
            <TouchableOpacity
              key={quickAmount}
              style={styles.quickAmountButton}
              onPress={() => setAmount(quickAmount.toString())}
            >
              <Text style={styles.quickAmountText}>${quickAmount}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, styles.shareButton]} onPress={shareQRCode}>
            <Text style={styles.actionButtonText}>📤 Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.saveButton]}>
            <Text style={styles.actionButtonText}>💾 Save</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            Share this QR code with others to receive payments instantly. 
            They can scan it with the ZapPay app to send you money.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ReceiveMoneyScreen;