import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';

const QRCodeScreen = ({ navigation }: any) => {
  const generateQRData = () => {
    return JSON.stringify({
      type: 'user_profile',
      userId: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      timestamp: new Date().toISOString(),
    });
  };

  const shareQRCode = async () => {
    try {
      const qrData = generateQRData();
      await Share.share({
        message: `ZapPay Profile\nName: John Doe\nEmail: john@example.com\nScan with ZapPay to connect`,
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
      justifyContent: 'center',
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
    userInfo: {
      alignItems: 'center',
    },
    userName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: 5,
    },
    userEmail: {
      fontSize: 14,
      color: '#6B7280',
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
        <Text style={styles.headerTitle}>My QR Code</Text>
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
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>John Doe</Text>
            <Text style={styles.userEmail}>john@example.com</Text>
          </View>
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
            Share this QR code with others to let them easily find and connect with you on ZapPay.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default QRCodeScreen;